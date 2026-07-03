from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    mode = Column(String, nullable=False)  # practice or exam
    time_taken = Column(Integer, nullable=False)  # in seconds
    correct = Column(Integer, nullable=False)
    wrong = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    
    # Extended tracking fields for detailed quiz results
    timer_mode = Column(String, nullable=True)  # unlimited, per_question, whole_test
    timer_value = Column(Integer, nullable=True)  # seconds per question or minutes for whole test
    question_range_start = Column(Integer, nullable=True)  # starting question number
    question_range_end = Column(Integer, nullable=True)  # ending question number
    batch_size = Column(Integer, nullable=True)  # number of questions in batch
    unanswered_questions = Column(Integer, nullable=True, default=0)  # count of unanswered
    responses = Column(JSON, nullable=True)  # detailed question-by-question responses

    # Relationships
    user = relationship("User")
    chapter = relationship("Chapter")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "chapter_id": self.chapter_id,
            "quiz_date": self.quiz_date.isoformat() if self.quiz_date else None,
            "mode": self.mode,
            "time_taken": self.time_taken,
            "correct": self.correct,
            "wrong": self.wrong,
            "accuracy": self.accuracy
        }
