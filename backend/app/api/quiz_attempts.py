from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chapter import Chapter
from app.models.quiz_attempt import QuizAttempt
from app.schemas.quiz_attempt import QuizAttemptCreate, QuizAttemptResponse, QuizAttemptListResponse
from typing import List

router = APIRouter(prefix="/quiz-attempts", tags=["quiz-attempts"])


@router.post("", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def create_quiz_attempt(
    data: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify chapter exists and user has access to it
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Basic validation
    if data.time_taken < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time taken must be non-negative"
        )

    if data.correct < 0 or data.wrong < 0 or (data.unanswered_questions or 0) < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correct, wrong, and unanswered counts must be non-negative"
        )

    if data.accuracy < 0 or data.accuracy > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Accuracy must be between 0 and 100"
        )

    # If detailed responses are provided, derive authoritative metrics from them
    derived_correct = None
    derived_wrong = None
    derived_unanswered = None
    if data.responses:
        try:
            derived_correct = sum(1 for r in data.responses if getattr(r, 'is_correct', False))
            derived_unanswered = sum(1 for r in data.responses if getattr(r, 'user_answer', None) is None)
            derived_wrong = len(data.responses) - derived_correct - derived_unanswered
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed responses payload"
            )

        # Overwrite provided counts with derived values to ensure consistency
        data.correct = derived_correct
        data.wrong = derived_wrong
        data.unanswered_questions = derived_unanswered
        # Recompute accuracy
        total = derived_correct + derived_wrong + derived_unanswered
        data.accuracy = (derived_correct / total * 100) if total > 0 else 0.0
    
    # Prepare attempt data
    attempt_data = {
        "user_id": current_user.id,
        "chapter_id": data.chapter_id,
        "mode": data.mode,
        "time_taken": data.time_taken,
        "correct": data.correct,
        "wrong": data.wrong,
        "accuracy": data.accuracy,
        "unanswered_questions": data.unanswered_questions or 0
    }
    
    # Map config fields to individual columns if provided
    if data.config:
        attempt_data["timer_mode"] = data.config.timer_mode
        attempt_data["timer_value"] = data.config.timer_value
        attempt_data["question_range_start"] = data.config.question_range_start
        attempt_data["question_range_end"] = data.config.question_range_end
        attempt_data["batch_size"] = data.config.batch_size
    
    # Store responses as JSON if provided
    if data.responses:
        attempt_data["responses"] = [r.dict() for r in data.responses]
    
    # Store attempt
    attempt = QuizAttempt(**attempt_data)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Convert to response
    res = QuizAttemptResponse.model_validate(attempt)
    res.chapter_name = chapter.name
    return res


@router.get("", response_model=QuizAttemptListResponse)
def list_quiz_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.quiz_date.desc()).all()
    
    res_list = []
    for a in attempts:
        chapter = db.query(Chapter).filter(Chapter.id == a.chapter_id).first()
        res = QuizAttemptResponse.model_validate(a)
        if chapter:
            res.chapter_name = chapter.name
        res_list.append(res)
        
    return QuizAttemptListResponse(
        data=res_list,
        total=len(res_list),
        message="Quiz attempts retrieved successfully"
    )
