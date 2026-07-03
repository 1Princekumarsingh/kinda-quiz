from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class QuestionStatus(enum.Enum):
    """Question status enumeration"""
    NEW = "NEW"
    MASTERED = "MASTERED"
    REVIEW = "REVIEW"
    ALMOST_FORGOT = "ALMOST_FORGOT"
    ERROR = "ERROR"


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(Integer, nullable=False)
    question_text = Column(String, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_answer = Column(String(1), nullable=False)  # A, B, C, or D
    status = Column(SQLEnum(QuestionStatus), default=QuestionStatus.NEW, nullable=False)
    times_attempted = Column(Integer, default=0)
    times_correct = Column(Integer, default=0)
    times_wrong = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    chapter = relationship("Chapter", back_populates="questions")
    
    def to_dict(self):
        return {
            "id": self.id,
            "chapter_id": self.chapter_id,
            "question_number": self.question_number,
            "question_text": self.question_text,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "option_d": self.option_d,
            "correct_answer": self.correct_answer,
            "status": self.status.value if self.status else "NEW",
            "times_attempted": self.times_attempted,
            "times_correct": self.times_correct,
            "times_wrong": self.times_wrong,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
