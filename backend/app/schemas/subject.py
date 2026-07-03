from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Subject name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Subject name cannot be empty or whitespace only')
        return v


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Subject name")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Subject name cannot be empty or whitespace only')
        return v


class SubjectResponse(SubjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    data: list[SubjectResponse]
    total: int
    message: str = "Subjects retrieved successfully"
