"""
DOCX Parser Utility
Extracts text from DOCX files and parses questions.
"""

from docx import Document
from typing import Dict, Any
from io import BytesIO
from app.utils.question_parser import parse_questions_from_text


class DocxParseError(Exception):
    """Exception raised for DOCX parsing errors"""
    pass


def extract_text_from_docx(file_content: bytes) -> str:
    """
    Extract plain text from DOCX file content.
    
    Args:
        file_content: Raw bytes of DOCX file
        
    Returns:
        Extracted text content
        
    Raises:
        DocxParseError: If file is invalid or cannot be parsed
    """
    try:
        # Create a BytesIO object from the file content
        docx_file = BytesIO(file_content)
        
        # Load the document
        doc = Document(docx_file)
        
        # Extract text from all paragraphs
        text_lines = []
        
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:  # Only add non-empty lines
                text_lines.append(text)
        
        # Join lines with newlines
        extracted_text = '\n'.join(text_lines)
        
        if not extracted_text.strip():
            raise DocxParseError("DOCX file appears to be empty")
        
        return extracted_text
        
    except Exception as e:
        if isinstance(e, DocxParseError):
            raise
        raise DocxParseError(f"Failed to parse DOCX file: {str(e)}")


def parse_questions_from_docx(file_content: bytes) -> Dict[str, Any]:
    """
    Parse questions from DOCX file.
    
    Args:
        file_content: Raw bytes of DOCX file
        
    Returns:
        Dictionary with parsing summary and list of parsed questions
        
    Raises:
        DocxParseError: If file is invalid or cannot be parsed
    """
    # Extract text from DOCX
    text = extract_text_from_docx(file_content)
    
    # Parse questions using the text parser
    return parse_questions_from_text(text)
