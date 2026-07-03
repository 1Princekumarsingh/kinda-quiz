from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
