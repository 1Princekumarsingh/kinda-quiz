from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chapter import Chapter
from app.models.quiz_progress import QuizProgress
from app.schemas.quiz_progress import (
    QuizProgressCreate,
    QuizProgressUpdate,
    QuizProgressResponse,
    QuizProgressListResponse
)

router = APIRouter(prefix="/quiz-progress", tags=["quiz-progress"])


def verify_chapter_access(chapter_id: int, user_id: int, db: Session) -> Chapter:
    chapter = db.query(Chapter).join(Chapter.subject).filter(
        Chapter.id == chapter_id,
        Chapter.subject.has(user_id=user_id)
    ).first()
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found or access denied"
        )
    return chapter


@router.post("", response_model=QuizProgressResponse, status_code=status.HTTP_201_CREATED)
def create_quiz_progress(
    data: QuizProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chapter = verify_chapter_access(data.chapter_id, current_user.id, db)

    existing = db.query(QuizProgress).filter(
        QuizProgress.user_id == current_user.id,
        QuizProgress.chapter_id == data.chapter_id,
        QuizProgress.session_key == data.session_key
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session already exists for this progress record"
        )

    progress = QuizProgress(
        user_id=current_user.id,
        chapter_id=data.chapter_id,
        session_key=data.session_key,
        config=data.config.model_dump() if hasattr(data.config, 'model_dump') else data.config,
        state=data.state.model_dump() if hasattr(data.state, 'model_dump') else data.state,
        is_completed=data.is_completed
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)

    return progress


@router.get("", response_model=QuizProgressListResponse)
def list_quiz_progress(
    chapter_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(QuizProgress).filter(QuizProgress.user_id == current_user.id)
    if chapter_id is not None:
        query = query.filter(QuizProgress.chapter_id == chapter_id)

    progress_records = query.order_by(QuizProgress.updated_at.desc()).all()
    return QuizProgressListResponse(
        data=progress_records,
        total=len(progress_records),
        message="Quiz progress retrieved successfully"
    )


@router.get("/{session_key}", response_model=QuizProgressResponse)
def get_quiz_progress(
    session_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = db.query(QuizProgress).filter(
        QuizProgress.user_id == current_user.id,
        QuizProgress.session_key == session_key
    ).first()

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz progress not found"
        )

    return progress


@router.patch("/{session_key}", response_model=QuizProgressResponse)
def update_quiz_progress(
    session_key: str,
    data: QuizProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = db.query(QuizProgress).filter(
        QuizProgress.user_id == current_user.id,
        QuizProgress.session_key == session_key
    ).first()

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz progress not found"
        )

    if data.config is not None:
        progress.config = data.config.model_dump() if hasattr(data.config, 'model_dump') else data.config
    if data.state is not None:
        progress.state = data.state.model_dump() if hasattr(data.state, 'model_dump') else data.state
    if data.is_completed is not None:
        progress.is_completed = data.is_completed

    db.commit()
    db.refresh(progress)
    return progress


@router.delete("/{session_key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz_progress(
    session_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = db.query(QuizProgress).filter(
        QuizProgress.user_id == current_user.id,
        QuizProgress.session_key == session_key
    ).first()

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz progress not found"
        )

    db.delete(progress)
    db.commit()
    return None
