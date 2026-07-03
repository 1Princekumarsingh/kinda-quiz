from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class QuestionResponseSchema(BaseModel):
    """Schema for individual question response in a quiz attempt"""
    question_id: int
    user_answer: Optional[str] = Field(None, pattern="^[A-D]$")
    correct_answer: str = Field(..., pattern="^[A-D]$")
    is_correct: bool
    time_spent: int = Field(..., ge=0)
    confidence: Optional[str] = Field(None, pattern="^(mastered|review|almost_forgot)$")


class AttemptConfigSchema(BaseModel):
    """Schema for quiz configuration settings"""
    timer_mode: str = Field(..., pattern="^(unlimited|per_question|whole_test)$")
    timer_value: Optional[int] = Field(None, ge=1)
    question_range_start: Optional[int] = None
    question_range_end: Optional[int] = None
    batch_size: Optional[int] = None


class QuizAttemptCreate(BaseModel):
    chapter_id: int
    mode: str
    time_taken: int
    correct: int
    wrong: int
    accuracy: float
    # Extended fields for detailed tracking
    config: Optional[AttemptConfigSchema] = None
    unanswered_questions: Optional[int] = 0
    responses: Optional[List[QuestionResponseSchema]] = None


class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    chapter_id: int
    quiz_date: datetime
    mode: str
    time_taken: int
    correct: int
    wrong: int
    accuracy: float
    # Extended fields
    timer_mode: Optional[str] = None
    timer_value: Optional[int] = None
    question_range_start: Optional[int] = None
    question_range_end: Optional[int] = None
    batch_size: Optional[int] = None
    unanswered_questions: Optional[int] = None
    responses: Optional[List[dict]] = None
    chapter_name: Optional[str] = None

    class Config:
        from_attributes = True


class QuizAttemptListResponse(BaseModel):
    data: List[QuizAttemptResponse]
    total: int
    message: str
