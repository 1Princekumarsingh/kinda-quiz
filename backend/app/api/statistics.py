from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.question import Question, QuestionStatus
from app.models.quiz_attempt import QuizAttempt
from app.schemas.statistics import DashboardStats, ChapterStats

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Overall Accuracy
    # Compute accuracy from question completion status rather than legacy attempt counters.
    correct_questions = db.query(Question).join(Chapter).join(Subject).filter(
        Subject.user_id == current_user.id,
        Question.status.in_([
            QuestionStatus.MASTERED,
            QuestionStatus.REVIEW,
            QuestionStatus.ALMOST_FORGOT
        ])
    ).count()

    attempted_questions = db.query(Question).join(Chapter).join(Subject).filter(
        Subject.user_id == current_user.id,
        Question.status != QuestionStatus.NEW
    ).count()

    overall_accuracy = (correct_questions / attempted_questions) * 100 if attempted_questions > 0 else 0.0

    # Total Questions
    total_questions = db.query(Question).join(Chapter).join(Subject).filter(
        Subject.user_id == current_user.id
    ).count()
    
    # Completed Questions (status != NEW)
    completed_questions = db.query(Question).join(Chapter).join(Subject).filter(
        Subject.user_id == current_user.id,
        Question.status != QuestionStatus.NEW
    ).count()
    
    # Review Questions (status == REVIEW)
    review_questions = db.query(Question).join(Chapter).join(Subject).filter(
        Subject.user_id == current_user.id,
        Question.status == QuestionStatus.REVIEW
    ).count()
    
    # Errors (status == ERROR)
    errors = db.query(Question).join(Chapter).join(Subject).filter(
        Subject.user_id == current_user.id,
        Question.status == QuestionStatus.ERROR
    ).count()
    
    # Last Chapter / Subject for Continue Chapter shortcut
    last_attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.quiz_date.desc()).first()
    
    last_chapter_id = None
    last_subject_id = None
    last_chapter_name = None
    
    if last_attempt:
        last_chapter_id = last_attempt.chapter_id
        chapter = db.query(Chapter).filter(Chapter.id == last_chapter_id).first()
        if chapter:
            last_subject_id = chapter.subject_id
            last_chapter_name = chapter.name
            
    return {
        "overall_accuracy": overall_accuracy,
        "total_questions": total_questions,
        "completed_questions": completed_questions,
        "review_questions": review_questions,
        "errors": errors,
        "last_chapter_id": last_chapter_id,
        "last_subject_id": last_subject_id,
        "last_chapter_name": last_chapter_name
    }


@router.get("/chapters/{chapter_id}", response_model=ChapterStats)
def get_chapter_statistics(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership of chapter
    chapter = db.query(Chapter).join(Subject).filter(
        Chapter.id == chapter_id,
        Subject.user_id == current_user.id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
        
    # Chapter Accuracy
    correct_questions = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status.in_([
            QuestionStatus.MASTERED,
            QuestionStatus.REVIEW,
            QuestionStatus.ALMOST_FORGOT
        ])
    ).count()

    attempted_questions = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status != QuestionStatus.NEW
    ).count()

    accuracy = (correct_questions / attempted_questions) * 100 if attempted_questions > 0 else 0.0
    
    # Completed Questions
    completed_questions = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status != QuestionStatus.NEW
    ).count()
    
    # Remaining Questions
    remaining_questions = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status == QuestionStatus.NEW
    ).count()
    
    # Review Count
    review_count = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status == QuestionStatus.REVIEW
    ).count()
    
    # Error Count
    error_count = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status == QuestionStatus.ERROR
    ).count()
    
    # Almost Forgot Count
    almost_forgot_count = db.query(Question).filter(
        Question.chapter_id == chapter_id,
        Question.status == QuestionStatus.ALMOST_FORGOT
    ).count()
    
    return {
        "accuracy": accuracy,
        "completed_questions": completed_questions,
        "remaining_questions": remaining_questions,
        "review_count": review_count,
        "error_count": error_count,
        "almost_forgot_count": almost_forgot_count
    }
