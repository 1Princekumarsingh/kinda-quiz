from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class QuestionBase(BaseModel):
    question_number: int
    question_text: str = Field(..., min_length=1)
    option_a: str = Field(..., min_length=1)
    option_b: str = Field(..., min_length=1)
    option_c: str = Field(..., min_length=1)
    option_d: str = Field(..., min_length=1)
    correct_answer: str = Field(..., pattern="^[A-D]$")
    explanation: Optional[str] = None

    @field_validator('question_text', 'option_a', 'option_b', 'option_c', 'option_d')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Field cannot be empty or whitespace only')
        return v

    @field_validator('correct_answer')
    @classmethod
    def validate_answer(cls, v: str) -> str:
        v = v.upper().strip()
        if v not in ['A', 'B', 'C', 'D']:
            raise ValueError('Correct answer must be A, B, C, or D')
        return v


class QuestionCreate(QuestionBase):
    chapter_id: int


class QuestionBulkCreate(BaseModel):
    """Schema for bulk creating questions"""
    chapter_id: int
    questions: List[QuestionBase]


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: Optional[str] = None


class QuestionStatusUpdate(BaseModel):
    """Schema for updating question status"""
    status: str = Field(..., pattern="^(NEW|MASTERED|REVIEW|ALMOST_FORGOT|ERROR)$")
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        v = v.upper().strip()
        valid_statuses = ['NEW', 'MASTERED', 'REVIEW', 'ALMOST_FORGOT', 'ERROR']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v


class QuestionBulkStatusUpdate(BaseModel):
    """Schema for bulk updating question statuses"""
    updates: List[dict] = Field(..., description="List of {question_id, status} objects")
    
    @field_validator('updates')
    @classmethod
    def validate_updates(cls, v: List[dict]) -> List[dict]:
        if not v:
            raise ValueError('Updates list cannot be empty')
        
        valid_statuses = ['NEW', 'MASTERED', 'REVIEW', 'ALMOST_FORGOT', 'ERROR']
        
        for update in v:
            if 'question_id' not in update or 'status' not in update:
                raise ValueError('Each update must have question_id and status')
            
            if not isinstance(update['question_id'], int):
                raise ValueError('question_id must be an integer')
            
            status = update['status'].upper().strip()
            if status not in valid_statuses:
                raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
            
            update['status'] = status
        
        return v


class QuestionResponse(QuestionBase):
    id: int
    chapter_id: int
    status: str
    times_attempted: int
    times_correct: int
    times_wrong: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    data: List[QuestionResponse]
    total: int
    page: int
    page_size: int
    message: str = "Questions retrieved successfully"


class BulkSaveResponse(BaseModel):
    """Response for bulk save operation"""
    saved_count: int
    failed_count: int
    questions: List[QuestionResponse]
    message: str


class StatusUpdateResponse(BaseModel):
    """Response for status update operation"""
    question_id: int
    status: str
    message: str


class BulkStatusUpdateResponse(BaseModel):
    """Response for bulk status update operation"""
    updated_count: int
    failed_count: int
    updates: List[StatusUpdateResponse]
    message: str
