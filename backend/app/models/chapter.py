from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    subject = relationship("Subject", back_populates="chapters")
    questions = relationship("Question", back_populates="chapter", cascade="all, delete-orphan")
    
    def to_dict(self):
        question_count = len(self.questions) if hasattr(self, 'questions') and self.questions else 0
        completed_count = 0
        total_attempted = 0
        total_correct = 0

        if hasattr(self, 'questions') and self.questions:
            for question in self.questions:
                if question.status.value != 'NEW':
                    completed_count += 1
                total_attempted += question.times_attempted or 0
                total_correct += question.times_correct or 0

        accuracy = (total_correct / total_attempted * 100) if total_attempted > 0 else 0.0

        return {
            "id": self.id,
            "name": self.name,
            "subject_id": self.subject_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "question_count": question_count,
            "completed_count": completed_count,
            "accuracy": round(accuracy, 1)
        }
