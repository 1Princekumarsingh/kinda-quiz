from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class ChapterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Chapter name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Chapter name cannot be empty or whitespace only')
        return v


class ChapterCreate(ChapterBase):
    subject_id: int = Field(..., description="Subject ID this chapter belongs to")


class ChapterUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Chapter name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Chapter name cannot be empty or whitespace only')
        return v


class ChapterResponse(ChapterBase):
    id: int
    subject_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    question_count: int = 0
    completed_count: int = 0
    remaining_count: int = 0
    accuracy: float = 0.0
    review_count: int = 0
    error_count: int = 0
    almost_forgot_count: int = 0

    class Config:
        from_attributes = True


class ChapterListResponse(BaseModel):
    data: list[ChapterResponse]
    total: int
    message: str = "Chapters retrieved successfully"
