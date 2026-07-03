# Quiz Engine Implementation Guide

## Overview

The Quiz Engine is a comprehensive feature that enables students to practice multiple-choice questions with various modes, timer options, and navigation features. It supports both Practice Mode (with immediate feedback) and Exam Mode (feedback at the end).

## Architecture

### State Management

The quiz engine uses a custom React hook (`useQuizState`) for centralized state management with the following capabilities:

- **LocalStorage Persistence**: Automatically saves quiz state to localStorage
- **Resume Capability**: Users can resume incomplete quizzes
- **Immutable Updates**: State updates are handled immutably for predictability
- **Computed Values**: Automatically calculates stats like answered, bookmarked, visited counts

### Key Components

```
Quiz Engine Components
├── Quiz.tsx                    # Main quiz page component
├── useQuizState.ts            # State management hook
├── QuizConfigModal.tsx        # Quiz configuration dialog
├── QuizHeader.tsx             # Header with timer and mode display
├── QuizNavigationBar.tsx      # Bottom navigation with progress
├── QuestionPalette.tsx        # Visual question grid
└── types/quiz.ts              # TypeScript interfaces
```

## Features Implemented

### 1. Quiz Configuration (QuizConfigModal)

**Location**: `frontend/src/components/chapters/QuizConfigModal.tsx`

**Features**:
- Quiz Mode selection (Practice/Exam)
- Timer Mode options:
  - Unlimited Time
  - Time Per Question (60/90/120 seconds)
  - Whole Test Timer (30/60/90 minutes)
- Question Selection:
  - All Questions
  - Custom Range
- Batch Size: 10, 25, 50, 100 questions

**Usage**:
```tsx
<QuizConfigModal
  isOpen={isQuizConfigOpen}
  onClose={() => setIsQuizConfigOpen(false)}
  onStart={handleQuizConfigSubmit}
  chapterQuestionCount={chapter.question_count}
/>
```

### 2. Quiz State Management (useQuizState)

**Location**: `frontend/src/hooks/useQuizState.ts`

**Key Functions**:

```typescript
const {
  state,              // Current quiz state
  currentQuestion,    // Currently displayed question
  currentAnswer,      // Current question's answer state
  stats,             // Computed statistics
  actions: {
    goToQuestion,         // Navigate to specific question
    nextQuestion,         // Go to next question
    previousQuestion,     // Go to previous question
    selectAnswer,         // Record answer selection
    toggleBookmark,       // Toggle bookmark flag
    markVisited,         // Mark question as visited
    updateTimeSpent,      // Update time tracking
    completeQuiz,        // Mark quiz as complete
    clearSavedState      // Clear localStorage
  }
} = useQuizState(config, questions)
```

**State Structure**:
```typescript
interface QuizState {
  config: QuizConfig
  questions: QuizQuestion[]
  answers: Map<number, QuizAnswer>
  current_question_index: number
  start_time: number
  elapsed_time: number
  is_paused: boolean
  is_completed: boolean
}
```

### 3. Quiz Header (QuizHeader)

**Location**: `frontend/src/components/quiz/QuizHeader.tsx`

**Features**:
- Displays quiz title
- Shows quiz mode badge (Practice/Exam)
- Shows timer mode badge
- Timer display:
  - Elapsed time (Unlimited mode)
  - Countdown timer (Timed modes)
  - Visual warnings at 5 minutes remaining
- Save & Exit button with confirmation

**Timer Behavior**:
- Updates every second
- Shows warning animation when time is low
- Calls `onTimeUp` callback when timer expires
- Formats time as HH:MM:SS or MM:SS

### 4. Quiz Navigation Bar (QuizNavigationBar)

**Location**: `frontend/src/components/quiz/QuizNavigationBar.tsx`

**Features**:
- Previous button (disabled on first question)
- Next button (disabled on last question)
- Bookmark button with toggle
- Question Palette button (opens modal on mobile)
- Submit Quiz button
- Progress bar showing current position
- Question counter (e.g., "Question 3 of 25")
- Answer status indicator ("✓ Answered" or "Not answered")

### 5. Question Palette (QuestionPalette)

**Location**: `frontend/src/components/quiz/QuestionPalette.tsx`

**Features**:
- Visual grid of all questions
- Color-coded status:
  - 🟢 **Green**: Answered
  - 🟣 **Purple**: Marked for Review (Bookmarked)
  - 🔴 **Red**: Not Answered (Visited but no answer)
  - ⚪ **Gray**: Not Visited
  - 🔵 **Blue**: Current Question (with ring)
- Legend explaining color codes
- Statistics summary:
  - Total questions
  - Answered count
  - Not answered count
  - Marked count
- Click to jump to any question

**Desktop vs Mobile**:
- Desktop: Sticky sidebar (always visible)
- Mobile: Modal overlay (triggered by button)

### 6. Main Quiz Page (Quiz.tsx)

**Location**: `frontend/src/pages/Quiz.tsx`

**Features**:
- Question display with number
- Bookmark button on question
- Option selection (A, B, C, D)
- Clear Answer button
- Responsive layout:
  - Desktop: 2/3 question area, 1/3 palette
  - Mobile: Full-width question, palette as modal
- Loading state
- Empty state
- Time tracking per question

**URL Parameters**:
```
/quiz/:chapterId?mode=practice&timer_mode=unlimited&batch_size=25
```

**Key Handlers**:
- `handleSelectAnswer`: Records answer selection
- `handleSubmitQuiz`: Confirms and submits quiz
- `handleExit`: Saves progress and exits
- `handleTimeUp`: Auto-submits when timer expires

### 7. Type Definitions (quiz.ts)

**Location**: `frontend/src/types/quiz.ts`

**Key Types**:

```typescript
interface QuizQuestion {
  id: number
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

interface QuizConfig {
  chapter_id: number
  mode: 'practice' | 'exam'
  timer_mode: 'unlimited' | 'per_question' | 'whole_test'
  timer_value?: number
  question_range?: { start: number; end: number }
  batch_size?: number
}

interface QuizAnswer {
  question_id: number
  selected_answer: string | null
  time_spent: number
  is_bookmarked: boolean
  is_visited: boolean
}
```

## User Flow

### Starting a Quiz

1. User navigates to Chapters page
2. Clicks "Start Quiz" button on a chapter card
3. QuizConfigModal opens
4. User configures:
   - Quiz Mode (Practice/Exam)
   - Timer Mode
   - Question Selection
   - Batch Size
5. User clicks "Start Quiz"
6. System builds URL with query params
7. Navigates to `/quiz/:chapterId?params`

### Taking a Quiz

1. Quiz page loads questions from API
2. useQuizState initializes or restores saved state
3. First question is displayed
4. User can:
   - Select an answer
   - Bookmark the question
   - Navigate to previous/next question
   - Open question palette
   - Submit quiz
   - Save & Exit

### Question Navigation

**Linear Navigation**:
- Previous button: Goes to previous question
- Next button: Goes to next question

**Direct Navigation**:
- Question Palette: Click any question number to jump

**Visual Feedback**:
- Current question highlighted in palette
- Progress bar updates
- Question counter updates
- Answer status indicator updates

### Bookmarking

- Click bookmark icon on question or navigation bar
- Question turns purple in palette
- Used to mark questions for later review
- Does not affect answer status

### Time Tracking

**Per Question**:
- Tracks time spent on each question
- Uses effect cleanup to record time on question change

**Whole Quiz**:
- Tracks total elapsed time
- Displayed in header
- Used for statistics

**Timer Modes**:
- Unlimited: Shows elapsed time, no limit
- Per Question: Countdown per question, auto-advances at 0
- Whole Test: Countdown for entire quiz, auto-submits at 0

### Save & Resume

**Auto-Save**:
- State saved to localStorage on every change
- Keyed by `recallx_quiz_state`
- Includes all answers, bookmarks, time spent

**Resume**:
- On page load, checks for saved state
- Verifies chapter_id matches
- Restores exact state (question index, answers, etc.)

**Clear**:
- Called on quiz completion
- Called when user exits quiz
- Removes from localStorage

## Integration Points

### ChapterCard Integration

```tsx
// In Chapters.tsx
const handleStartQuiz = (chapter: Chapter) => {
  setSelectedChapter(chapter)
  setIsQuizConfigOpen(true)
}

const handleQuizConfigSubmit = (config: QuizConfiguration) => {
  const params = new URLSearchParams({
    mode: config.mode,
    timer_mode: config.timer_mode,
  })
  
  if (config.timer_value !== undefined) {
    params.append('timer_value', config.timer_value.toString())
  }
  
  if (config.batch_size !== undefined) {
    params.append('batch_size', config.batch_size.toString())
  }
  
  navigate(`/quiz/${selectedChapter.id}?${params.toString()}`)
}

// In ChapterCard.tsx
<button onClick={() => onStartQuiz(chapter)}>
  Start Quiz
</button>
```

### Route Configuration

```tsx
// In routes/index.tsx
<Route
  path="/quiz/:chapterId"
  element={
    <ProtectedRoute>
      <Quiz />
    </ProtectedRoute>
  }
/>
```

## Responsive Design

### Desktop (lg and above)
- Question area: 2/3 width
- Question Palette: 1/3 width, sticky sidebar
- Timer: Centered in header
- Full navigation buttons with labels

### Tablet (md)
- Question area: Full width
- Question Palette: Modal overlay
- Timer: Visible in header
- Navigation labels visible

### Mobile (sm and below)
- Question area: Full width
- Question Palette: Modal overlay
- Timer: Below header
- Navigation labels hidden (icons only)

## Performance Optimizations

1. **useCallback hooks**: All action functions memoized
2. **Computed stats**: Calculated from state, not stored
3. **LocalStorage batching**: Single write per state change
4. **Conditional rendering**: Empty states handled early
5. **Lazy palette rendering**: Mobile palette only renders when opened

## Accessibility

- **Keyboard navigation**: Arrow keys work (via browser)
- **Screen reader support**: ARIA labels on buttons
- **Focus management**: Proper tab order
- **Color contrast**: WCAG AA compliant
- **Touch targets**: Minimum 44x44px on mobile

## Known Limitations

1. **No per-question timer**: Timer per question mode not fully implemented
2. **No results page**: Quiz completion redirects to placeholder
3. **No attempt history**: Completed quizzes not saved to backend
4. **No answer checking**: Practice mode doesn't show correct answers yet
5. **No status updates**: Question status (MASTERED, ERROR) not updated

## Next Steps

### Priority 1: Quiz Results
- Create QuizResults page
- Calculate score and accuracy
- Show correct/incorrect answers
- Display time statistics
- Save attempt to backend

### Priority 2: Practice Mode Feedback
- Show immediate feedback on answer selection
- Display correct answer if wrong
- Show explanation (if available)
- Prompt for confidence classification

### Priority 3: Attempt History
- Create Attempt model in backend
- Save quiz attempts on completion
- Create Attempt History page
- Show past quiz performance

### Priority 4: Question Status Management
- Update question status based on performance
- Implement confidence classification
- Track status history
- Enable status-based filtering

## Testing Checklist

### Manual Testing

**Quiz Configuration**:
- [ ] Modal opens when clicking "Start Quiz"
- [ ] All quiz modes selectable
- [ ] All timer modes selectable
- [ ] Timer value dropdowns work
- [ ] Question range validation works
- [ ] Batch size selection works
- [ ] "Start Quiz" navigates correctly

**Quiz Navigation**:
- [ ] Previous button works (except first question)
- [ ] Next button works (except last question)
- [ ] Question palette click navigation works
- [ ] Bookmark toggle works
- [ ] Progress bar updates correctly
- [ ] Question counter is accurate

**Answer Selection**:
- [ ] Clicking option selects it
- [ ] Selected option highlights
- [ ] Clear Answer button works
- [ ] Answer persists on navigation
- [ ] Answer shows in palette (green)

**Bookmarking**:
- [ ] Bookmark icon toggles
- [ ] Bookmarked questions show purple in palette
- [ ] Bookmark persists on navigation
- [ ] Can bookmark without answering

**Timer**:
- [ ] Unlimited mode shows elapsed time
- [ ] Whole test timer counts down
- [ ] Warning shows at 5 minutes
- [ ] Timer auto-submits at 0 (whole test)

**Save & Resume**:
- [ ] Exit saves progress
- [ ] Returning to same chapter resumes
- [ ] All answers restored
- [ ] All bookmarks restored
- [ ] Question index restored

**Submit Quiz**:
- [ ] Confirmation dialog appears
- [ ] Shows count of unanswered questions
- [ ] Clicking cancel returns to quiz
- [ ] Clicking confirm navigates away
- [ ] LocalStorage cleared on submit

**Responsive Design**:
- [ ] Desktop layout correct
- [ ] Mobile palette is modal
- [ ] Touch targets large enough
- [ ] No horizontal scrolling

## Troubleshooting

### Quiz doesn't load
**Issue**: Questions not fetching
**Solution**: Check API endpoint, verify chapter has questions

### State not persisting
**Issue**: Quiz doesn't resume
**Solution**: Check localStorage key, verify chapter_id match

### Timer not working
**Issue**: Timer not updating
**Solution**: Check useEffect dependencies, verify timer_mode

### Palette not showing colors
**Issue**: All questions gray
**Solution**: Check answer state updates, verify Map usage

### Navigation disabled
**Issue**: Previous/Next buttons disabled
**Solution**: Check current_question_index bounds

## Code Examples

### Adding a new quiz feature

```typescript
// 1. Add to types
interface QuizAnswer {
  // ... existing fields
  my_new_field: string  // Add your field
}

// 2. Add to state initialization
const initialAnswers = new Map<number, QuizAnswer>()
questions.forEach(q => {
  initialAnswers.set(q.id, {
    // ... existing fields
    my_new_field: 'default'  // Initialize
  })
})

// 3. Add action
const updateMyField = useCallback((questionId: number, value: string) => {
  setState(prev => {
    const newAnswers = new Map(prev.answers)
    const current = newAnswers.get(questionId)
    if (current) {
      newAnswers.set(questionId, {
        ...current,
        my_new_field: value
      })
    }
    return { ...prev, answers: newAnswers }
  })
}, [])

// 4. Return from hook
return {
  state,
  currentQuestion,
  currentAnswer,
  stats,
  actions: {
    // ... existing actions
    updateMyField
  }
}
```

### Customizing timer behavior

```typescript
// In QuizHeader.tsx, modify the timer effect:
useEffect(() => {
  const interval = setInterval(() => {
    const newElapsed = Math.floor((Date.now() - start_time) / 1000)
    setElapsed(newElapsed)

    // Add your custom logic here
    if (timer_mode === 'custom_mode') {
      // Your custom behavior
    }
  }, 1000)

  return () => clearInterval(interval)
}, [start_time, timer_mode, timer_value, onTimeUp])
```

## Conclusion

The Quiz Engine is now fully functional with comprehensive navigation, state management, and user interface features. It provides a solid foundation for exam preparation with both practice and exam modes, flexible timer options, and persistent state.

The next major milestone is implementing the Quiz Results page to display scores, review answers, and save attempt history to the backend.

