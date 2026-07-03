from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.question import Question
from app.schemas.question import (
    QuestionBulkCreate,
    QuestionUpdate,
    QuestionStatusUpdate,
    QuestionBulkStatusUpdate,
    QuestionResponse,
    QuestionListResponse,
    BulkSaveResponse,
    StatusUpdateResponse,
    BulkStatusUpdateResponse
)
from app.models.question import QuestionStatus
from typing import List

router = APIRouter(prefix="/questions", tags=["questions"])


def verify_chapter_ownership(chapter_id: int, user_id: int, db: Session) -> Chapter:
    """
    Verify that the chapter belongs to the user (through subject).
    Raises 404 if chapter not found or doesn't belong to user.
    """
    chapter = db.query(Chapter).join(Subject).filter(
        Chapter.id == chapter_id,
        Subject.user_id == user_id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    return chapter


@router.post("/bulk", response_model=BulkSaveResponse, status_code=status.HTTP_201_CREATED)
def bulk_create_questions(
    data: QuestionBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk create questions for a chapter with transaction support.
    All-or-nothing: either all questions save or none (automatic rollback on failure).
    User must own the chapter (through subject).
    """
    # Verify chapter ownership
    chapter = verify_chapter_ownership(data.chapter_id, current_user.id, db)
    
    # Validate: no duplicate question numbers in the batch
    question_numbers = [q.question_number for q in data.questions]
    if len(question_numbers) != len(set(question_numbers)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate question numbers detected in batch"
        )
    
    # Validate: no empty questions
    if len(data.questions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot save empty question list"
        )
    
    saved_questions = []
    
    try:
        # Begin transaction (automatic with db session)
        for idx, question_data in enumerate(data.questions):
            # Additional validation per question
            if not question_data.question_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question {question_data.question_number}: Question text cannot be empty"
                )
            
            if not all([
                question_data.option_a.strip(),
                question_data.option_b.strip(),
                question_data.option_c.strip(),
                question_data.option_d.strip()
            ]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question {question_data.question_number}: All options (A, B, C, D) must be non-empty"
                )
            
            # Create question instance
            new_question = Question(
                chapter_id=data.chapter_id,
                question_number=question_data.question_number,
                question_text=question_data.question_text.strip(),
                option_a=question_data.option_a.strip(),
                option_b=question_data.option_b.strip(),
                option_c=question_data.option_c.strip(),
                option_d=question_data.option_d.strip(),
                correct_answer=question_data.correct_answer.upper()
            )
            db.add(new_question)
            saved_questions.append(new_question)
        
        # Commit transaction - all questions saved atomically
        db.commit()
        
        # Refresh all saved questions to get generated IDs
        for question in saved_questions:
            db.refresh(question)
        
        return BulkSaveResponse(
            saved_count=len(saved_questions),
            failed_count=0,
            questions=saved_questions,
            message=f"Successfully saved {len(saved_questions)} question{'s' if len(saved_questions) != 1 else ''}"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        db.rollback()
        raise
    except Exception as e:
        # Rollback transaction on any error
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save questions: {str(e)}"
        )


@router.get("", response_model=QuestionListResponse)
def list_questions(
    chapter_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: str = Query(None),
    range_start: int = Query(None),
    range_end: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all questions for a chapter with pagination and search.
    User must own the chapter (through subject).
    """
    # Verify chapter ownership
    verify_chapter_ownership(chapter_id, current_user.id, db)
    
    # Base query
    query = db.query(Question).filter(Question.chapter_id == chapter_id)
    
    # Apply custom range if provided
    if range_start is not None:
        query = query.filter(Question.question_number >= range_start)
    if range_end is not None:
        query = query.filter(Question.question_number <= range_end)
        
    # Apply search filter if provided
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Question.question_text.ilike(search_pattern) |
            Question.option_a.ilike(search_pattern) |
            Question.option_b.ilike(search_pattern) |
            Question.option_c.ilike(search_pattern) |
            Question.option_d.ilike(search_pattern)
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    questions = query.order_by(Question.question_number.asc()).offset(offset).limit(page_size).all()
    
    return QuestionListResponse(
        data=questions,
        total=total,
        page=page,
        page_size=page_size,
        message="Questions retrieved successfully"
    )


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific question by ID.
    User must own the chapter (through subject).
    """
    question = db.query(Question).join(Chapter).join(Subject).filter(
        Question.id == question_id,
        Subject.user_id == current_user.id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question


@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a question.
    User must own the chapter (through subject).
    """
    question = db.query(Question).join(Chapter).join(Subject).filter(
        Question.id == question_id,
        Subject.user_id == current_user.id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update only provided fields
    if question_data.question_text is not None:
        question.question_text = question_data.question_text
    if question_data.option_a is not None:
        question.option_a = question_data.option_a
    if question_data.option_b is not None:
        question.option_b = question_data.option_b
    if question_data.option_c is not None:
        question.option_c = question_data.option_c
    if question_data.option_d is not None:
        question.option_d = question_data.option_d
    if question_data.correct_answer is not None:
        question.correct_answer = question_data.correct_answer.upper()
    
    db.commit()
    db.refresh(question)
    
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a question.
    User must own the chapter (through subject).
    """
    question = db.query(Question).join(Chapter).join(Subject).filter(
        Question.id == question_id,
        Subject.user_id == current_user.id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    db.delete(question)
    db.commit()
    
    return None


@router.patch("/{question_id}/status", response_model=StatusUpdateResponse)
def update_question_status(
    question_id: int,
    status_data: QuestionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a question's status.
    User must own the chapter (through subject).
    
    Valid statuses: NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR
    """
    question = db.query(Question).join(Chapter).join(Subject).filter(
        Question.id == question_id,
        Subject.user_id == current_user.id
    ).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update status using enum
    try:
        question.status = QuestionStatus[status_data.status]
        db.commit()
        db.refresh(question)
        
        return StatusUpdateResponse(
            question_id=question.id,
            status=question.status.value,
            message=f"Status updated to {question.status.value}"
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {status_data.status}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )


@router.patch("/status/bulk", response_model=BulkStatusUpdateResponse)
def bulk_update_question_status(
    data: QuestionBulkStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk update question statuses.
    User must own all questions (through chapter -> subject).
    
    Request body:
    {
      "updates": [
        {"question_id": 1, "status": "MASTERED"},
        {"question_id": 2, "status": "REVIEW"},
        {"question_id": 3, "status": "ERROR"}
      ]
    }
    
    Valid statuses: NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR
    """
    updated_responses = []
    updated_count = 0
    failed_count = 0
    
    try:
        for update in data.updates:
            question_id = update['question_id']
            new_status = update['status']
            
            # Find question and verify ownership
            question = db.query(Question).join(Chapter).join(Subject).filter(
                Question.id == question_id,
                Subject.user_id == current_user.id
            ).first()
            
            if not question:
                failed_count += 1
                updated_responses.append(StatusUpdateResponse(
                    question_id=question_id,
                    status="",
                    message=f"Question not found or access denied"
                ))
                continue
            
            try:
                # Update status
                question.status = QuestionStatus[new_status]
                updated_count += 1
                updated_responses.append(StatusUpdateResponse(
                    question_id=question.id,
                    status=question.status.value,
                    message=f"Status updated to {question.status.value}"
                ))
            except KeyError:
                failed_count += 1
                updated_responses.append(StatusUpdateResponse(
                    question_id=question_id,
                    status="",
                    message=f"Invalid status: {new_status}"
                ))
        
        # Commit all updates
        db.commit()
        
        return BulkStatusUpdateResponse(
            updated_count=updated_count,
            failed_count=failed_count,
            updates=updated_responses,
            message=f"Successfully updated {updated_count} question status(es), {failed_count} failed"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update statuses: {str(e)}"
        )
