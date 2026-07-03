from pydantic import BaseModel
from typing import Optional


class DashboardStats(BaseModel):
    overall_accuracy: float
    total_questions: int
    completed_questions: int
    review_questions: int
    errors: int
    last_chapter_id: Optional[int] = None
    last_subject_id: Optional[int] = None
    last_chapter_name: Optional[str] = None


class ChapterStats(BaseModel):
    accuracy: float
    completed_questions: int
    remaining_questions: int
    review_count: int
    error_count: int
    almost_forgot_count: int
