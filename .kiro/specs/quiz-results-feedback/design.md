# Design Document: Quiz Results & Feedback

## 1. Overview

The Quiz Results & Feedback feature provides comprehensive post-quiz analysis and performance tracking. After completing a quiz session (Practice or Exam mode), users view their score, accuracy metrics, time spent, and a detailed question-by-question review. The system automatically saves attempt records to the database and updates question statuses based on performance and confidence levels (in Practice Mode) or correctness alone (in Exam Mode).

### Key Capabilities

- **Results Display**: Score summary with accuracy percentage, correct/incorrect counts, and time metrics
- **Question Review**: Side-by-side comparison of user answers and correct answers with visual indicators
- **Attempt Persistence**: Automatic saving of complete quiz session data for historical tracking
- **Status Updates**: Intelligent question status management based on performance (NEW → MASTERED/REVIEW/ALMOST_FORGOT/ERROR)
- **Navigation**: Quick access to retry quiz, return to chapter, or view attempt history
- **Mode-Specific Behavior**: Different feedback styles for Practice Mode (confidence-based) vs Exam Mode (correctness-based)

### Integration Points

- **Frontend**: React components consuming quiz state from `useQuizState` hook
- **Backend**: FastAPI endpoints for saving attempts and updating question statuses
- **Database**: PostgreSQL with Attempts table and Question status fields
- **Existing Features**: Quiz state management, authentication, chapter/question models

## 2. System Architecture

### 2.1 Component Architecture (Frontend)

```typescript
// Component Hierarchy
<ResultsPage>
  ├─ <ScoreSummary>
  │   ├─ <MetricsCard> (Score, Accuracy, Time)
  │   ├─ <TimerInfo> (if timer was used)
  │   └─ <NavigationActions> (Retry, Back, History)
  └─ <QuestionReviewList>
      └─ <QuestionReviewCard>[] (one per question)
          ├─ <QuestionHeader> (Number, Status Badge, Time)
          ├─ <QuestionText>
          ├─ <OptionsList>
          │   └─ <OptionItem>[] (A, B, C, D with highlighting)
          └─ <ConfidenceIndicator> (Practice Mode only)
```


### 2.2 Data Flow Architecture

```
Quiz Completion → QuizState → ResultsPage
                                    ↓
                              Calculate Metrics
                              (score, accuracy, time)
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            Save Attempt (API)              Update Question Status (API)
                    ↓                               ↓
              PostgreSQL                       PostgreSQL
           (attempts table)                (questions table)
                    ↓                               ↓
            Return Success/Error          Return Success/Error
                    ↓                               ↓
                Display Results + Handle Errors (with retry)
                    ↓
            User Navigation Action
          (Retry / Back / History)
```

### 2.3 Module Structure

**Frontend:**
- `src/pages/QuizResults.tsx` - Main results page component
- `src/components/results/ScoreSummary.tsx` - Score and metrics display
- `src/components/results/QuestionReviewList.tsx` - Question list container
- `src/components/results/QuestionReviewCard.tsx` - Individual question review
- `src/components/results/NavigationActions.tsx` - Action buttons
- `src/api/attempts.ts` - API client for attempt operations
- `src/types/attempt.ts` - TypeScript types for attempt data
- `src/utils/resultCalculations.ts` - Metrics calculation utilities
- `src/utils/timeFormatting.ts` - Time formatting utilities

**Backend:**
- `app/api/attempts.py` - Attempt CRUD endpoints
- `app/models/attempt.py` - Attempt SQLAlchemy model
- `app/schemas/attempt.py` - Attempt Pydantic schemas
- `app/api/questions.py` - Add PATCH `/questions/batch/status` endpoint


## 3. Data Models

### 3.1 Database Schema (Backend)

#### Attempt Model (New)

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Quiz Configuration
    quiz_mode = Column(String, nullable=False)  # "practice" or "exam"
    timer_mode = Column(String, nullable=False)  # "unlimited", "per_question", "whole_test"
    timer_value = Column(Integer, nullable=True)  # seconds per question or minutes for whole test
    question_range_start = Column(Integer, nullable=True)
    question_range_end = Column(Integer, nullable=True)
    batch_size = Column(Integer, nullable=True)
    
    # Timing Data
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    total_time_seconds = Column(Integer, nullable=False)
    
    # Performance Metrics
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    wrong_answers = Column(Integer, nullable=False)
    unanswered_questions = Column(Integer, nullable=False, default=0)
    accuracy_percentage = Column(Float, nullable=False)
    
    # Detailed Responses (JSON array)
    # Structure: [{question_id, user_answer, correct_answer, is_correct, time_spent, confidence}]
    responses = Column(JSON, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="attempts")
    chapter = relationship("Chapter", back_populates="attempts")
```


#### Question Model Updates (Existing)

No schema changes needed - already has status, times_attempted, times_correct, times_wrong fields.

#### Database Migration

```python
# alembic/versions/005_create_attempts_table.py
def upgrade():
    op.create_table(
        'attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('chapter_id', sa.Integer(), nullable=False),
        sa.Column('quiz_mode', sa.String(), nullable=False),
        sa.Column('timer_mode', sa.String(), nullable=False),
        sa.Column('timer_value', sa.Integer(), nullable=True),
        sa.Column('question_range_start', sa.Integer(), nullable=True),
        sa.Column('question_range_end', sa.Integer(), nullable=True),
        sa.Column('batch_size', sa.Integer(), nullable=True),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('total_time_seconds', sa.Integer(), nullable=False),
        sa.Column('total_questions', sa.Integer(), nullable=False),
        sa.Column('correct_answers', sa.Integer(), nullable=False),
        sa.Column('wrong_answers', sa.Integer(), nullable=False),
        sa.Column('unanswered_questions', sa.Integer(), nullable=False, default=0),
        sa.Column('accuracy_percentage', sa.Float(), nullable=False),
        sa.Column('responses', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['chapter_id'], ['chapters.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_attempts_id'), 'attempts', ['id'])
    op.create_index(op.f('ix_attempts_user_id'), 'attempts', ['user_id'])
    op.create_index(op.f('ix_attempts_chapter_id'), 'attempts', ['chapter_id'])
    op.create_index(op.f('ix_attempts_created_at'), 'attempts', ['created_at'])
```


### 3.2 TypeScript Types (Frontend)

```typescript
// src/types/attempt.ts
export interface QuestionResponse {
  question_id: number
  user_answer: string | null  // "A", "B", "C", "D", or null
  correct_answer: string       // "A", "B", "C", "D"
  is_correct: boolean
  time_spent: number           // seconds
  confidence?: 'mastered' | 'review' | 'almost_forgot'  // Practice Mode only
}

export interface AttemptConfig {
  quiz_mode: 'practice' | 'exam'
  timer_mode: 'unlimited' | 'per_question' | 'whole_test'
  timer_value?: number
  question_range_start?: number
  question_range_end?: number
  batch_size?: number
}

export interface AttemptCreate {
  chapter_id: number
  config: AttemptConfig
  start_time: string           // ISO 8601
  end_time: string             // ISO 8601
  total_time_seconds: number
  total_questions: number
  correct_answers: number
  wrong_answers: number
  unanswered_questions: number
  accuracy_percentage: number
  responses: QuestionResponse[]
}

export interface AttemptResponse extends AttemptCreate {
  id: number
  user_id: number
  created_at: string           // ISO 8601
}

export interface QuizResults {
  config: AttemptConfig
  questions: QuizQuestion[]    // from existing types
  answers: Map<number, QuizAnswer>  // from existing types
  start_time: number           // timestamp
  end_time: number             // timestamp
  elapsed_time: number         // seconds
}
```


### 3.3 Pydantic Schemas (Backend)

```python
# app/schemas/attempt.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class QuestionResponseSchema(BaseModel):
    question_id: int
    user_answer: Optional[str] = Field(None, pattern="^[A-D]$")
    correct_answer: str = Field(..., pattern="^[A-D]$")
    is_correct: bool
    time_spent: int = Field(..., ge=0)
    confidence: Optional[str] = Field(None, pattern="^(mastered|review|almost_forgot)$")

class AttemptConfigSchema(BaseModel):
    quiz_mode: str = Field(..., pattern="^(practice|exam)$")
    timer_mode: str = Field(..., pattern="^(unlimited|per_question|whole_test)$")
    timer_value: Optional[int] = Field(None, ge=1)
    question_range_start: Optional[int] = None
    question_range_end: Optional[int] = None
    batch_size: Optional[int] = None

class AttemptCreate(BaseModel):
    chapter_id: int = Field(..., gt=0)
    config: AttemptConfigSchema
    start_time: datetime
    end_time: datetime
    total_time_seconds: int = Field(..., ge=0)
    total_questions: int = Field(..., gt=0)
    correct_answers: int = Field(..., ge=0)
    wrong_answers: int = Field(..., ge=0)
    unanswered_questions: int = Field(..., ge=0)
    accuracy_percentage: float = Field(..., ge=0, le=100)
    responses: List[QuestionResponseSchema]

class AttemptResponse(BaseModel):
    id: int
    user_id: int
    chapter_id: int
    quiz_mode: str
    timer_mode: str
    timer_value: Optional[int]
    question_range_start: Optional[int]
    question_range_end: Optional[int]
    batch_size: Optional[int]
    start_time: datetime
    end_time: datetime
    total_time_seconds: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    unanswered_questions: int
    accuracy_percentage: float
    responses: List[dict]
    created_at: datetime

    class Config:
        from_attributes = True
```


## 4. API Contracts

### 4.1 Attempts Endpoints

#### POST /api/attempts

Create a new attempt record.

**Request:**
```json
{
  "chapter_id": 1,
  "config": {
    "quiz_mode": "practice",
    "timer_mode": "per_question",
    "timer_value": 60,
    "question_range_start": 1,
    "question_range_end": 10,
    "batch_size": 10
  },
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T10:15:30Z",
  "total_time_seconds": 930,
  "total_questions": 10,
  "correct_answers": 8,
  "wrong_answers": 2,
  "unanswered_questions": 0,
  "accuracy_percentage": 80.0,
  "responses": [
    {
      "question_id": 101,
      "user_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "time_spent": 45,
      "confidence": "mastered"
    },
    {
      "question_id": 102,
      "user_answer": "B",
      "correct_answer": "C",
      "is_correct": false,
      "time_spent": 60
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "user_id": 5,
  "chapter_id": 1,
  "quiz_mode": "practice",
  "timer_mode": "per_question",
  "timer_value": 60,
  "question_range_start": 1,
  "question_range_end": 10,
  "batch_size": 10,
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T10:15:30Z",
  "total_time_seconds": 930,
  "total_questions": 10,
  "correct_answers": 8,
  "wrong_answers": 2,
  "unanswered_questions": 0,
  "accuracy_percentage": 80.0,
  "responses": [...],
  "created_at": "2024-01-15T10:15:31Z"
}
```


**Error Responses:**
```json
// 400 Bad Request - Validation Error
{
  "detail": "Validation error: accuracy_percentage must be between 0 and 100"
}

// 404 Not Found - Chapter doesn't belong to user
{
  "detail": "Chapter not found"
}

// 500 Internal Server Error - Database failure
{
  "detail": "Failed to save attempt: connection timeout"
}
```

#### GET /api/attempts?chapter_id={id}&page={n}&page_size={n}

Retrieve attempts for a chapter with pagination (for future history feature).

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 123,
      "chapter_id": 1,
      "quiz_mode": "practice",
      "accuracy_percentage": 80.0,
      "total_questions": 10,
      "correct_answers": 8,
      "created_at": "2024-01-15T10:15:31Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 10
}
```


### 4.2 Question Status Update Endpoint

#### PATCH /api/questions/batch/status

Batch update question statuses and statistics.

**Request:**
```json
{
  "updates": [
    {
      "question_id": 101,
      "status": "MASTERED",
      "increment_attempted": true,
      "increment_correct": true
    },
    {
      "question_id": 102,
      "status": "ERROR",
      "increment_attempted": true,
      "increment_wrong": true
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "updated_count": 2,
  "message": "Successfully updated 2 question statuses"
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid status value
{
  "detail": "Invalid status: INVALID_STATUS. Must be one of: NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR"
}

// 404 Not Found - Question doesn't belong to user
{
  "detail": "Question not found: 102"
}
```


## 5. Component Design (Frontend)

### 5.1 ResultsPage Component

**Responsibility:** Main container orchestrating results display and data persistence.

**Props:**
```typescript
interface ResultsPageProps {
  quizResults: QuizResults  // Passed from Quiz page via router state
}
```

**State:**
```typescript
const [attemptSaveStatus, setAttemptSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
const [statusUpdateStatus, setStatusUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle')
const [errorMessage, setErrorMessage] = useState<string | null>(null)
const [calculatedMetrics, setCalculatedMetrics] = useState<ResultMetrics | null>(null)
```

**Lifecycle:**
```typescript
useEffect(() => {
  // On mount: Calculate metrics
  const metrics = calculateResultMetrics(quizResults)
  setCalculatedMetrics(metrics)
  
  // Save attempt to database
  saveAttempt(metrics)
  
  // Update question statuses
  updateQuestionStatuses(quizResults)
}, [])
```

**Key Functions:**
```typescript
async function saveAttempt(metrics: ResultMetrics): Promise<void>
async function updateQuestionStatuses(results: QuizResults): Promise<void>
async function retryAttemptSave(): Promise<void>
function handleRetryQuiz(): void
function handleBackToChapter(): void
function handleViewHistory(): void
```


### 5.2 ScoreSummary Component

**Responsibility:** Display overall performance metrics at the top of results page.

**Props:**
```typescript
interface ScoreSummaryProps {
  metrics: {
    totalQuestions: number
    correctAnswers: number
    wrongAnswers: number
    unansweredQuestions: number
    accuracyPercentage: number
    totalTimeSeconds: number
  }
  config: AttemptConfig
}
```

**Layout:**
```tsx
<div className="score-summary">
  <div className="score-display">
    <h1>{correctAnswers} / {totalQuestions}</h1>
    <p className="accuracy">{accuracyPercentage.toFixed(1)}% Accuracy</p>
  </div>
  
  <div className="metrics-grid">
    <MetricCard label="Correct" value={correctAnswers} variant="success" />
    <MetricCard label="Wrong" value={wrongAnswers} variant="error" />
    <MetricCard label="Unanswered" value={unansweredQuestions} variant="warning" />
    <MetricCard label="Time Spent" value={formatTime(totalTimeSeconds)} />
  </div>
  
  {config.timer_mode !== 'unlimited' && (
    <TimerInfo mode={config.timer_mode} value={config.timer_value} />
  )}
  
  <NavigationActions 
    onRetry={handleRetry}
    onBackToChapter={handleBack}
    onViewHistory={handleHistory}
  />
</div>
```


### 5.3 QuestionReviewCard Component

**Responsibility:** Display individual question with answer comparison and visual feedback.

**Props:**
```typescript
interface QuestionReviewCardProps {
  question: QuizQuestion
  response: QuestionResponse
  mode: 'practice' | 'exam'
}
```

**Layout:**
```tsx
<div className={`question-card ${response.is_correct ? 'correct' : 'incorrect'}`}>
  <div className="card-header">
    <span className="question-number">Question {question.question_number}</span>
    <StatusBadge isCorrect={response.is_correct} />
    <span className="time-spent">{response.time_spent}s</span>
  </div>
  
  <div className="question-text">{question.question_text}</div>
  
  <div className="options-list">
    {['A', 'B', 'C', 'D'].map(option => (
      <OptionItem
        key={option}
        option={option}
        text={question[`option_${option.toLowerCase()}`]}
        isUserAnswer={response.user_answer === option}
        isCorrectAnswer={response.correct_answer === option}
        isAnswered={response.user_answer !== null}
      />
    ))}
  </div>
  
  {mode === 'practice' && response.is_correct && response.confidence && (
    <ConfidenceBadge level={response.confidence} />
  )}
</div>
```


### 5.4 OptionItem Component

**Responsibility:** Display individual answer option with conditional highlighting.

**Props:**
```typescript
interface OptionItemProps {
  option: 'A' | 'B' | 'C' | 'D'
  text: string
  isUserAnswer: boolean
  isCorrectAnswer: boolean
  isAnswered: boolean
}
```

**Styling Logic:**
```typescript
function getOptionClassName(): string {
  if (isCorrectAnswer && isUserAnswer) {
    return 'option correct-and-selected'  // Green - correct choice
  }
  if (isCorrectAnswer && !isUserAnswer) {
    return 'option correct-not-selected'  // Green outline - correct answer
  }
  if (isUserAnswer && !isCorrectAnswer) {
    return 'option incorrect-selected'    // Red - wrong choice
  }
  return 'option neutral'                 // Gray - not selected
}
```

**Layout:**
```tsx
<div className={getOptionClassName()}>
  <span className="option-letter">{option}</span>
  <span className="option-text">{text}</span>
  {isUserAnswer && <span className="indicator">Your Answer</span>}
  {isCorrectAnswer && <span className="indicator">Correct</span>}
</div>
```


## 6. Business Logic

### 6.1 Result Metrics Calculation

```typescript
// src/utils/resultCalculations.ts

export interface ResultMetrics {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unansweredQuestions: number
  accuracyPercentage: number
  totalTimeSeconds: number
  responses: QuestionResponse[]
}

export function calculateResultMetrics(quizResults: QuizResults): ResultMetrics {
  const responses: QuestionResponse[] = []
  let correctCount = 0
  let wrongCount = 0
  let unansweredCount = 0
  
  quizResults.questions.forEach(question => {
    const answer = quizResults.answers.get(question.id)
    if (!answer) return
    
    const isCorrect = answer.selected_answer === question.correct_answer
    const isAnswered = answer.selected_answer !== null
    
    if (isAnswered) {
      if (isCorrect) {
        correctCount++
      } else {
        wrongCount++
      }
    } else {
      unansweredCount++
      wrongCount++  // Unanswered counts as wrong
    }
    
    responses.push({
      question_id: question.id,
      user_answer: answer.selected_answer,
      correct_answer: question.correct_answer,
      is_correct: isCorrect && isAnswered,
      time_spent: answer.time_spent,
      confidence: answer.confidence  // Only present in Practice Mode
    })
  })
  
  const totalQuestions = quizResults.questions.length
  const accuracyPercentage = totalQuestions > 0 
    ? (correctCount / totalQuestions) * 100 
    : 0
  
  return {
    totalQuestions,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    unansweredQuestions: unansweredCount,
    accuracyPercentage,
    totalTimeSeconds: quizResults.elapsed_time,
    responses
  }
}
```


### 6.2 Question Status Update Logic

```typescript
// src/utils/statusUpdateLogic.ts

export interface StatusUpdate {
  question_id: number
  status: 'NEW' | 'MASTERED' | 'REVIEW' | 'ALMOST_FORGOT' | 'ERROR'
  increment_attempted: boolean
  increment_correct: boolean
  increment_wrong: boolean
}

export function determineStatusUpdates(
  quizResults: QuizResults,
  responses: QuestionResponse[]
): StatusUpdate[] {
  const updates: StatusUpdate[] = []
  const mode = quizResults.config.mode
  
  responses.forEach(response => {
    const question = quizResults.questions.find(q => q.id === response.question_id)
    if (!question) return
    
    const update: StatusUpdate = {
      question_id: response.question_id,
      status: question.status as any,  // Default to current
      increment_attempted: true,
      increment_correct: response.is_correct,
      increment_wrong: !response.is_correct
    }
    
    if (mode === 'practice') {
      // Practice Mode: Use confidence for correct, ERROR for incorrect
      if (response.is_correct && response.confidence) {
        update.status = confidenceToStatus(response.confidence)
      } else if (!response.is_correct) {
        update.status = 'ERROR'
      }
    } else if (mode === 'exam') {
      // Exam Mode: ERROR for incorrect, REVIEW if recovering from ERROR, else preserve
      if (!response.is_correct) {
        update.status = 'ERROR'
      } else if (response.is_correct && question.status === 'ERROR') {
        update.status = 'REVIEW'
      }
      // Otherwise keep existing status
    }
    
    updates.push(update)
  })
  
  return updates
}

function confidenceToStatus(confidence: string): 'MASTERED' | 'REVIEW' | 'ALMOST_FORGOT' {
  switch (confidence) {
    case 'mastered': return 'MASTERED'
    case 'review': return 'REVIEW'
    case 'almost_forgot': return 'ALMOST_FORGOT'
    default: return 'REVIEW'
  }
}
```


### 6.3 Time Formatting

```typescript
// src/utils/timeFormatting.ts

export function formatTime(seconds: number): string {
  if (seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

export function formatAccuracy(percentage: number): string {
  if (isNaN(percentage) || !isFinite(percentage)) {
    return 'N/A'
  }
  return percentage.toFixed(1) + '%'
}
```


## 7. Backend Implementation

### 7.1 Attempts API Router

```python
# app/api/attempts.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chapter import Chapter
from app.models.subject import Subject
from app.models.attempt import Attempt
from app.schemas.attempt import AttemptCreate, AttemptResponse
from typing import List

router = APIRouter(prefix="/attempts", tags=["attempts"])

@router.post("", response_model=AttemptResponse, status_code=status.HTTP_201_CREATED)
def create_attempt(
    data: AttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new attempt record. User must own the chapter."""
    
    # Verify chapter ownership
    chapter = db.query(Chapter).join(Subject).filter(
        Chapter.id == data.chapter_id,
        Subject.user_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Validate metrics consistency
    if data.correct_answers + data.wrong_answers != data.total_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sum of correct and wrong answers must equal total questions"
        )
    
    # Create attempt
    attempt = Attempt(
        user_id=current_user.id,
        chapter_id=data.chapter_id,
        quiz_mode=data.config.quiz_mode,
        timer_mode=data.config.timer_mode,
        timer_value=data.config.timer_value,
        question_range_start=data.config.question_range_start,
        question_range_end=data.config.question_range_end,
        batch_size=data.config.batch_size,
        start_time=data.start_time,
        end_time=data.end_time,
        total_time_seconds=data.total_time_seconds,
        total_questions=data.total_questions,
        correct_answers=data.correct_answers,
        wrong_answers=data.wrong_answers,
        unanswered_questions=data.unanswered_questions,
        accuracy_percentage=data.accuracy_percentage,
        responses=[r.dict() for r in data.responses]
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    return attempt
```


### 7.2 Question Status Batch Update Endpoint

```python
# app/api/questions.py (add to existing router)
from app.models.question import Question, QuestionStatus
from pydantic import BaseModel

class QuestionStatusUpdate(BaseModel):
    question_id: int
    status: str
    increment_attempted: bool = False
    increment_correct: bool = False
    increment_wrong: bool = False

class BatchStatusUpdateRequest(BaseModel):
    updates: List[QuestionStatusUpdate]

class BatchStatusUpdateResponse(BaseModel):
    updated_count: int
    message: str

@router.patch("/batch/status", response_model=BatchStatusUpdateResponse)
def batch_update_question_status(
    data: BatchStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Batch update question statuses and statistics."""
    
    updated_count = 0
    
    for update in data.updates:
        # Verify question ownership
        question = db.query(Question).join(Chapter).join(Subject).filter(
            Question.id == update.question_id,
            Subject.user_id == current_user.id
        ).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question not found: {update.question_id}"
            )
        
        # Validate status
        try:
            new_status = QuestionStatus[update.status]
        except KeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {update.status}"
            )
        
        # Update fields
        question.status = new_status
        if update.increment_attempted:
            question.times_attempted += 1
        if update.increment_correct:
            question.times_correct += 1
        if update.increment_wrong:
            question.times_wrong += 1
        
        updated_count += 1
    
    db.commit()
    
    return BatchStatusUpdateResponse(
        updated_count=updated_count,
        message=f"Successfully updated {updated_count} question statuses"
    )
```


## 8. Error Handling

### 8.1 Frontend Error Handling

```typescript
// src/pages/QuizResults.tsx

async function saveAttempt(metrics: ResultMetrics): Promise<void> {
  setAttemptSaveStatus('saving')
  setErrorMessage(null)
  
  try {
    const attemptData: AttemptCreate = {
      chapter_id: quizResults.config.chapter_id,
      config: quizResults.config,
      start_time: new Date(quizResults.start_time).toISOString(),
      end_time: new Date(quizResults.end_time).toISOString(),
      total_time_seconds: metrics.totalTimeSeconds,
      total_questions: metrics.totalQuestions,
      correct_answers: metrics.correctAnswers,
      wrong_answers: metrics.wrongAnswers,
      unanswered_questions: metrics.unansweredQuestions,
      accuracy_percentage: metrics.accuracyPercentage,
      responses: metrics.responses
    }
    
    await attemptsApi.create(attemptData)
    setAttemptSaveStatus('success')
    
    // Cache to localStorage for recovery
    localStorage.removeItem('quiz_results_cache')
    
  } catch (error) {
    console.error('Failed to save attempt:', error)
    setAttemptSaveStatus('error')
    setErrorMessage(error.response?.data?.detail || 'Failed to save quiz results')
    
    // Cache results for recovery
    localStorage.setItem('quiz_results_cache', JSON.stringify({
      metrics,
      config: quizResults.config,
      timestamp: Date.now()
    }))
  }
}

async function retryAttemptSave(): Promise<void> {
  const cached = localStorage.getItem('quiz_results_cache')
  if (!cached) {
    setErrorMessage('No cached results found')
    return
  }
  
  const { metrics } = JSON.parse(cached)
  await saveAttempt(metrics)
}
```


### 8.2 Backend Error Handling

- **Validation Errors (400)**: Return detailed Pydantic validation errors
- **Not Found Errors (404)**: When chapter/questions don't belong to user
- **Database Errors (500)**: Wrap in try-catch, rollback transaction, return generic error
- **Transaction Integrity**: Use database transactions for batch status updates

```python
try:
    # Database operations
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
except SQLAlchemyError as e:
    db.rollback()
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Failed to save attempt: {str(e)}"
    )
```


## 9. User Interaction Flows

### 9.1 Quiz Completion → Results Display Flow

```
1. User completes quiz (clicks "Submit Quiz" button)
   ↓
2. Quiz component calls useQuizState.completeQuiz()
   ↓
3. Navigate to /results with quizResults in router state
   ↓
4. ResultsPage mounts
   ↓
5. Calculate metrics (score, accuracy, time)
   ↓
6. Render ScoreSummary immediately (optimistic UI)
   ↓
7. Parallel async operations:
   - Save attempt to database (POST /api/attempts)
   - Update question statuses (PATCH /api/questions/batch/status)
   ↓
8. If save succeeds: Show success indicator (optional)
   If save fails: Show error message + retry button
   ↓
9. User reviews questions, scrolls through list
   ↓
10. User clicks navigation action (Retry / Back / History)
```

### 9.2 Practice Mode Results Flow

```
1. Quiz completes with confidence classifications per question
   ↓
2. Results page displays:
   - Correct answers with confidence badges (Mastered/Review/Almost Forgot)
   - Incorrect answers with ERROR indication
   ↓
3. Status update logic:
   - Correct + Mastered → status = MASTERED
   - Correct + Review → status = REVIEW
   - Correct + Almost Forgot → status = ALMOST_FORGOT
   - Incorrect → status = ERROR (regardless of confidence)
   ↓
4. Database updates applied in batch
```


### 9.3 Exam Mode Results Flow

```
1. Quiz completes without confidence classifications
   ↓
2. Results page displays:
   - Correct/Incorrect indicators without confidence
   - Emphasis on overall score and accuracy
   ↓
3. Status update logic:
   - Incorrect → status = ERROR
   - Correct + previous status was ERROR → status = REVIEW
   - Correct + previous status was not ERROR → status unchanged
   ↓
4. Database updates applied in batch
```

### 9.4 Error Recovery Flow

```
1. Attempt save fails (network error, server error, validation error)
   ↓
2. Cache results in localStorage
   ↓
3. Display error message with details
   ↓
4. Show "Retry Save" button
   ↓
5. User clicks "Retry Save"
   ↓
6. Retrieve cached data from localStorage
   ↓
7. Retry POST /api/attempts
   ↓
8. If success: Clear cache, show success
   If failure: Keep cache, show error again
```


## 10. Visual Design Specifications

### 10.1 Color Scheme

**Success/Correct:**
- Primary: `bg-green-50` border `border-green-500`
- Text: `text-green-700`
- Badge: `bg-green-100` with checkmark icon

**Error/Incorrect:**
- Primary: `bg-red-50` border `border-red-500`
- Text: `text-red-700`
- Badge: `bg-red-100` with X icon

**Warning/Unanswered:**
- Primary: `bg-yellow-50` border `border-yellow-500`
- Text: `text-yellow-700`

**Neutral/Not Selected:**
- Primary: `bg-gray-50` border `border-gray-300`
- Text: `text-gray-700`

### 10.2 Typography

- **Page Title:** text-3xl font-bold
- **Score Display:** text-5xl font-extrabold
- **Accuracy:** text-2xl font-semibold
- **Question Number:** text-sm font-medium uppercase
- **Question Text:** text-lg font-medium
- **Options:** text-base
- **Time/Stats:** text-sm text-gray-600

### 10.3 Spacing & Layout

- Container: `max-w-4xl mx-auto px-4 py-8`
- Card spacing: `space-y-4`
- Score summary padding: `p-6`
- Question card padding: `p-4`
- Option spacing: `space-y-2`


### 10.4 Component Examples

**Score Summary:**
```tsx
<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
  <div className="text-center mb-4">
    <h1 className="text-5xl font-extrabold text-gray-900">
      {correctAnswers} / {totalQuestions}
    </h1>
    <p className="text-2xl font-semibold text-gray-700 mt-2">
      {accuracyPercentage.toFixed(1)}% Accuracy
    </p>
  </div>
  
  <div className="grid grid-cols-4 gap-4">
    {/* Metric cards */}
  </div>
</div>
```

**Correct Answer Option:**
```tsx
<div className="flex items-center p-3 bg-green-50 border-2 border-green-500 rounded-lg">
  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 rounded-full font-semibold text-green-700">
    A
  </span>
  <span className="ml-3 flex-1 text-gray-900">{optionText}</span>
  <span className="ml-2 text-sm font-medium text-green-700">
    ✓ Correct
  </span>
</div>
```

**Incorrect Answer Option (User Selected):**
```tsx
<div className="flex items-center p-3 bg-red-50 border-2 border-red-500 rounded-lg">
  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-100 rounded-full font-semibold text-red-700">
    B
  </span>
  <span className="ml-3 flex-1 text-gray-900">{optionText}</span>
  <span className="ml-2 text-sm font-medium text-red-700">
    ✗ Your Answer
  </span>
</div>
```


## 11. Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following universal properties while eliminating redundancy:

**Consolidated Properties:**
- Requirements 4.1, 4.2, 4.3 → Combined into Property 7 (confidence-based status updates)
- Requirements 4.5-4.8, 5.4-5.7 → Combined into Properties 8-10 (counter increments are mode-independent)
- Requirements 2.2, 2.3, 8.1, 8.2 → Combined into Property 2 (visual correctness indicators)
- Requirements 8.3-8.7 → Already covered by Property 2 and 3
- Requirements 2.4, 2.5, 2.6 → Combined into Property 3 (answer highlighting)

**Excluded from Properties:**
- UI layout/structure requirements (1.1, 1.5, 1.6, 9.1-9.5) → Example-based tests
- Navigation behavior (7.1, 7.3-7.6) → Example-based tests
- Performance requirements (13.1-13.5) → Integration/load tests
- Error recovery scenarios (14.1-14.5) → Example-based tests
- Accessibility requirements (15.1-15.5) → Integration tests


### Property 1: Score Summary Content Completeness

*For any* quiz result data, the rendered score summary SHALL contain all required fields: total correct answers, total questions, and accuracy percentage.

**Validates: Requirements 1.2**

### Property 2: Question Review Correctness Indicators

*For any* question in the review list, the rendered card SHALL display a visual correctness indicator (success indicator for correct answers, error indicator for incorrect answers) that matches the actual correctness of the answer.

**Validates: Requirements 2.2, 2.3, 8.1, 8.2**

### Property 3: Answer Highlighting Consistency

*For any* question with user and correct answers, both answers SHALL be visually highlighted in the rendered output, with distinct visual styles when the user answer differs from the correct answer.

**Validates: Requirements 2.4, 2.5, 2.6**

### Property 4: Question Content Preservation

*For any* question, the rendered question review card SHALL contain the question text and all four options (A, B, C, D).

**Validates: Requirements 2.7**

### Property 5: Sequential Question Order Preservation

*For any* list of quiz questions, the rendered question review list SHALL display all questions in the same sequential order as the original quiz.

**Validates: Requirements 2.1**


### Property 6: Attempt Data Preservation

*For any* quiz completion, the saved attempt record SHALL preserve all submitted fields: chapter_id, quiz mode, timer configuration, timestamps, performance metrics, question responses array, question range, and batch size.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

### Property 7: Practice Mode Status Updates with Confidence

*For any* question answered correctly in Practice Mode with a confidence classification (mastered, review, or almost_forgot), the question status SHALL be updated to match that classification (MASTERED, REVIEW, or ALMOST_FORGOT respectively).

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 8: Incorrect Answer Produces ERROR Status in Practice Mode

*For any* question answered incorrectly in Practice Mode, the question status SHALL be updated to ERROR regardless of any confidence selection.

**Validates: Requirements 4.4**

### Property 9: Question Counter Increments

*For any* question answered in a quiz, the times_attempted counter SHALL increment by 1, the times_correct counter SHALL increment by 1 if the answer is correct, and the times_wrong counter SHALL increment by 1 if the answer is incorrect.

**Validates: Requirements 4.5, 4.6, 4.7, 5.4, 5.5, 5.6**

### Property 10: Timestamp Updates on Answer

*For any* question answered in a quiz, the last_attempt timestamp SHALL be updated to the current time.

**Validates: Requirements 4.8, 5.7**


### Property 11: Incorrect Answer Produces ERROR Status in Exam Mode

*For any* question answered incorrectly in Exam Mode, the question status SHALL be updated to ERROR.

**Validates: Requirements 5.1**

### Property 12: Exam Mode Recovery from ERROR to REVIEW

*For any* question with current status ERROR that is answered correctly in Exam Mode, the question status SHALL be updated to REVIEW.

**Validates: Requirements 5.2**

### Property 13: Exam Mode Status Preservation for Non-ERROR States

*For any* question with a status other than ERROR that is answered correctly in Exam Mode, the question status SHALL remain unchanged.

**Validates: Requirements 5.3**

### Property 14: Accuracy Calculation Formula

*For any* quiz result with correct answers and total questions, the accuracy percentage SHALL equal (correct answers ÷ total questions) × 100.

**Validates: Requirements 6.1**

### Property 15: Duration Calculation

*For any* quiz with start and end timestamps, the total time in seconds SHALL equal (end timestamp - start timestamp).

**Validates: Requirements 6.2, 6.3**


### Property 16: Accuracy Decimal Rounding

*For any* calculated accuracy percentage, the displayed value SHALL be rounded to exactly one decimal place.

**Validates: Requirements 6.5**

### Property 17: Time Format Selection

*For any* time value in seconds, the formatted output SHALL use "MM:SS" format when the value is less than 3600 seconds, and "HH:MM:SS" format when the value is 3600 seconds or greater.

**Validates: Requirements 1.3, 6.6**

### Property 18: Integer Time Formatting for Questions

*For any* question time value including fractional seconds, the displayed time SHALL be formatted as an integer number of seconds.

**Validates: Requirements 6.7**

### Property 19: Quiz Configuration Preservation for Retry

*For any* quiz configuration (chapter_id, mode, timer settings, question range, batch size), triggering the retry action SHALL pass all configuration fields unmodified to the navigation target.

**Validates: Requirements 7.2**

### Property 20: Timer Configuration Display Conditional

*For any* quiz result where the timer_mode is not "unlimited", the rendered score summary SHALL display the timer configuration; for timer_mode "unlimited", the timer configuration SHALL not be displayed.

**Validates: Requirements 1.4**


### Property 21: Practice Mode Confidence Preservation

*For any* Practice Mode quiz result with confidence data for correctly answered questions, the rendered question review SHALL display the confidence classification for each correct answer.

**Validates: Requirements 10.1, 10.2**

### Property 22: Exam Mode Confidence Exclusion

*For any* Exam Mode quiz result, the rendered question review SHALL not display confidence classifications in any question card.

**Validates: Requirements 11.1**

### Property 23: Unanswered Questions Counted as Incorrect

*For any* quiz result, questions with null or empty user_answer SHALL be counted in the wrong_answers total and SHALL have is_correct = false in the response data.

**Validates: Requirements 12.1**

### Property 24: Unanswered Question Display

*For any* question with null or empty user_answer, the rendered question review card SHALL display "Not Answered" instead of showing a user answer option, while still displaying the correct answer.

**Validates: Requirements 12.3, 12.4**

### Property 25: Null Answer Preservation in Attempt Record

*For any* unanswered question, the saved attempt record's response array SHALL contain user_answer as null or empty string for that question.

**Validates: Requirements 12.5**


## 12. Testing Strategy

### 12.1 Property-Based Tests

Property-based tests validate universal properties across randomly generated inputs using a PBT library (e.g., fast-check for TypeScript, Hypothesis for Python). Each test runs a minimum of 100 iterations.

**Frontend Properties (TypeScript with fast-check):**
- Property 1: Score summary completeness
- Property 2: Correctness indicators
- Property 3: Answer highlighting
- Property 4: Question content preservation
- Property 5: Question order preservation
- Property 14: Accuracy calculation
- Property 15: Duration calculation
- Property 16: Accuracy rounding
- Property 17: Time format selection
- Property 18: Integer time formatting
- Property 19: Config preservation for retry
- Property 20: Timer config display conditional
- Property 21: Practice mode confidence display
- Property 22: Exam mode confidence exclusion
- Property 23-25: Unanswered question handling

**Backend Properties (Python with Hypothesis):**
- Property 6: Attempt data preservation (round-trip test)
- Property 7-13: Question status update logic
- Property 9-10: Counter and timestamp increments

### 12.2 Example-Based Unit Tests

**Frontend:**
- Component rendering (score summary, question cards, navigation buttons)
- Error message display and retry button
- Loading states during API calls
- Keyboard navigation and accessibility

**Backend:**
- Endpoint authentication and authorization
- Validation error responses (400)
- Not found responses (404)
- Database transaction rollback on error


### 12.3 Integration Tests

- End-to-end flow: Quiz completion → Results display → Database persistence
- Attempt save with database verification
- Question status batch update with database verification
- Error recovery flow with localStorage caching
- Performance tests for large quizzes (100+ questions)
- Database transaction isolation and consistency

### 12.4 Test Data Generators

**TypeScript Generators (fast-check):**
```typescript
import * as fc from 'fast-check'

// Quiz question generator
const quizQuestionArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  question_number: fc.integer({ min: 1, max: 100 }),
  question_text: fc.string({ minLength: 10, maxLength: 200 }),
  option_a: fc.string({ minLength: 1, maxLength: 100 }),
  option_b: fc.string({ minLength: 1, maxLength: 100 }),
  option_c: fc.string({ minLength: 1, maxLength: 100 }),
  option_d: fc.string({ minLength: 1, maxLength: 100 }),
  correct_answer: fc.constantFrom('A', 'B', 'C', 'D'),
  status: fc.constantFrom('NEW', 'MASTERED', 'REVIEW', 'ALMOST_FORGOT', 'ERROR')
})

// Quiz answer generator
const quizAnswerArb = (questionId: number) => fc.record({
  question_id: fc.constant(questionId),
  selected_answer: fc.option(fc.constantFrom('A', 'B', 'C', 'D'), { nil: null }),
  time_spent: fc.integer({ min: 0, max: 300 }),
  is_bookmarked: fc.boolean(),
  is_visited: fc.boolean(),
  confidence: fc.option(fc.constantFrom('mastered', 'review', 'almost_forgot'), { nil: undefined })
})

// Quiz results generator
const quizResultsArb = fc.record({
  config: fc.record({
    chapter_id: fc.integer({ min: 1, max: 100 }),
    mode: fc.constantFrom('practice', 'exam'),
    timer_mode: fc.constantFrom('unlimited', 'per_question', 'whole_test'),
    timer_value: fc.option(fc.integer({ min: 10, max: 300 }), { nil: undefined })
  }),
  questions: fc.array(quizQuestionArb, { minLength: 1, maxLength: 50 }),
  start_time: fc.integer({ min: 1600000000000, max: 1700000000000 }),
  elapsed_time: fc.integer({ min: 10, max: 7200 })
}).chain(partial => {
  const answers = new Map(
    partial.questions.map(q => [q.id, quizAnswerArb(q.id)])
  )
  return fc.constant({
    ...partial,
    answers,
    end_time: partial.start_time + (partial.elapsed_time * 1000)
  })
})
```

