from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
import re

router = APIRouter(prefix="/auth", tags=["authentication"])


def validate_username(username: str) -> bool:
    """Validate username contains only alphanumeric characters and underscores"""
    if not username:
        return False
    if len(username) < 1 or len(username) > 50:
        return False
    return bool(re.match(r'^[a-zA-Z0-9_]+$', username))


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db), response: Response = None):
    """
    Login or create account with username only.
    If username exists: login
    If username doesn't exist: automatically create account and login
    """
    username = request.username.strip()
    
    if not validate_username(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must contain only alphanumeric characters and underscores"
        )
    
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.username})

    # Set httpOnly cookie for session persistence (use the injected Response)
    from app.core.config import get_settings
    settings = get_settings()
    if response is not None:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE
        )

    # Return token in body for backward compatibility but cookie will be used by the client
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user.to_dict()
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user


@router.post("/logout")
def logout(response: Response):
    """
    Logout endpoint. Clears the auth cookie.
    """
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
