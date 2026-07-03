from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.question import Question, QuestionStatus
from app.schemas.chapter import (
    ChapterCreate,
    ChapterUpdate,
    ChapterResponse,
    ChapterListResponse
)

router = APIRouter(prefix="/chapters", tags=["chapters"])


def verify_subject_ownership(subject_id: int, user_id: int, db: Session) -> Subject:
    """
    Verify that the subject belongs to the user.
    Raises 404 if subject not found or doesn't belong to user.
    """
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == user_id
    ).first()
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    return subject


def calculate_chapter_statistics(chapter: Chapter, db: Session) -> dict:
    """
    Calculate statistics for a chapter based on question statuses and attempts.
    Returns dict with calculated statistics.
    """
    # Get all questions for this chapter
    questions = db.query(Question).filter(Question.chapter_id == chapter.id).all()
    
    total_questions = len(questions)
    
    if total_questions == 0:
        return {
            "question_count": 0,
            "completed_count": 0,
            "remaining_count": 0,
            "accuracy": 0.0,
            "review_count": 0,
            "error_count": 0,
            "almost_forgot_count": 0
        }
    
    # Count questions by status
    status_counts = {
        "NEW": 0,
        "MASTERED": 0,
        "REVIEW": 0,
        "ALMOST_FORGOT": 0,
        "ERROR": 0
    }
    
    total_attempted = 0
    total_correct = 0
    
    for question in questions:
        status_counts[question.status.value] += 1
        if question.times_attempted > 0:
            total_attempted += question.times_attempted
            total_correct += question.times_correct
    
    # Calculate metrics
    completed_count = sum([
        status_counts["MASTERED"],
        status_counts["REVIEW"],
        status_counts["ALMOST_FORGOT"],
        status_counts["ERROR"]
    ])
    
    remaining_count = status_counts["NEW"]
    
    # Calculate accuracy from all attempts
    accuracy = (total_correct / total_attempted * 100) if total_attempted > 0 else 0.0
    
    return {
        "question_count": total_questions,
        "completed_count": completed_count,
        "remaining_count": remaining_count,
        "accuracy": round(accuracy, 1),
        "review_count": status_counts["REVIEW"],
        "error_count": status_counts["ERROR"],
        "almost_forgot_count": status_counts["ALMOST_FORGOT"]
    }


@router.post("", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
def create_chapter(
    chapter_data: ChapterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new chapter within a subject.
    User must own the subject.
    Chapter names can be duplicated within the same subject.
    """
    # Verify subject ownership
    verify_subject_ownership(chapter_data.subject_id, current_user.id, db)
    
    new_chapter = Chapter(
        name=chapter_data.name,
        subject_id=chapter_data.subject_id
    )
    
    db.add(new_chapter)
    db.commit()
    db.refresh(new_chapter)
    
    return new_chapter


@router.get("", response_model=ChapterListResponse)
def list_chapters(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all chapters for a specific subject with calculated statistics.
    User must own the subject.
    """
    # Verify subject ownership
    verify_subject_ownership(subject_id, current_user.id, db)
    
    chapters = db.query(Chapter).filter(
        Chapter.subject_id == subject_id
    ).order_by(Chapter.created_at.asc()).all()
    
    # Calculate statistics for each chapter
    chapter_responses = []
    for chapter in chapters:
        stats = calculate_chapter_statistics(chapter, db)
        
        # Create response with calculated statistics
        chapter_dict = {
            "id": chapter.id,
            "name": chapter.name,
            "subject_id": chapter.subject_id,
            "created_at": chapter.created_at,
            "updated_at": chapter.updated_at,
            **stats  # Merge statistics
        }
        chapter_responses.append(ChapterResponse(**chapter_dict))
    
    return ChapterListResponse(
        data=chapter_responses,
        total=len(chapter_responses),
        message="Chapters retrieved successfully"
    )


@router.get("/{chapter_id}", response_model=ChapterResponse)
def get_chapter(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific chapter by ID.
    User must own the subject that the chapter belongs to.
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Verify subject ownership
    verify_subject_ownership(chapter.subject_id, current_user.id, db)
    
    return chapter


@router.put("/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    chapter_id: int,
    chapter_data: ChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a chapter's name.
    User must own the subject that the chapter belongs to.
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Verify subject ownership
    verify_subject_ownership(chapter.subject_id, current_user.id, db)
    
    chapter.name = chapter_data.name
    db.commit()
    db.refresh(chapter)
    
    return chapter


@router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(
    chapter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a chapter.
    User must own the subject that the chapter belongs to.
    Cascades to all associated questions and attempt records (when implemented).
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Verify subject ownership
    verify_subject_ownership(chapter.subject_id, current_user.id, db)
    
    db.delete(chapter)
    db.commit()
    
    return None
