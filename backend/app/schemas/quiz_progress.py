from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime


class QuizProgressConfig(BaseModel):
    model_config = ConfigDict(extra="allow")

    chapter_id: int
    mode: str
    timer_mode: str
    timer_value: Optional[int] = None
    question_range: Optional[Dict[str, int]] = None
    batch_size: Optional[int] = None


class QuizProgressState(BaseModel):
    model_config = ConfigDict(extra="allow")

    config: Dict[str, Any]
    questions: list[Dict[str, Any]]
    answers: Dict[str, Dict[str, Any]]
    current_question_index: int
    start_time: int
    elapsed_time: int
    is_paused: bool
    is_completed: bool


class QuizProgressCreate(BaseModel):
    chapter_id: int
    session_key: str
    config: QuizProgressConfig
    state: QuizProgressState
    is_completed: bool = False


class QuizProgressUpdate(BaseModel):
    config: Optional[QuizProgressConfig] = None
    state: Optional[QuizProgressState] = None
    is_completed: Optional[bool] = None


class QuizProgressResponse(BaseModel):
    id: int
    user_id: int
    chapter_id: int
    session_key: str
    config: Dict[str, Any]
    state: Dict[str, Any]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuizProgressListResponse(BaseModel):
    data: list[QuizProgressResponse]
    total: int
    message: str = "Quiz progress retrieved successfully"
