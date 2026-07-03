from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.user import User
from app.utils.question_parser import parse_questions_from_text
from app.utils.docx_parser import parse_questions_from_docx, DocxParseError
from typing import Dict, Any

router = APIRouter(prefix="/parse", tags=["parse"])


class ParseTextRequest(BaseModel):
    """Request model for parsing text"""
    text: str


class ParseResponse(BaseModel):
    """Response model for parsing results"""
    total_questions: int
    valid_questions: int
    invalid_questions: int
    questions: list


@router.post("/text", response_model=ParseResponse)
def parse_text(
    request: ParseTextRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Parse questions from text in standardized format.
    Does NOT save to database - only validates and returns parsed questions.
    
    Returns:
        - total_questions: Total number of questions parsed
        - valid_questions: Number of questions without errors
        - invalid_questions: Number of questions with errors
        - questions: List of parsed questions with validation info
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text content cannot be empty"
        )
    
    try:
        result = parse_questions_from_text(request.text)
        return ParseResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse text: {str(e)}"
        )


@router.post("/docx", response_model=ParseResponse)
async def parse_docx(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Parse questions from DOCX file in standardized format.
    Does NOT save to database - only validates and returns parsed questions.
    
    Args:
        file: DOCX file upload
        
    Returns:
        - total_questions: Total number of questions parsed
        - valid_questions: Number of questions without errors
        - invalid_questions: Number of questions with errors
        - questions: List of parsed questions with validation info
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not file.filename.lower().endswith('.docx'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a .docx file"
        )
    
    # Read file content
    try:
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(content) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Parse DOCX
    try:
        result = parse_questions_from_docx(content)
        return ParseResponse(**result)
    except DocxParseError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse DOCX: {str(e)}"
        )
