# Confidence Buttons Implementation

**Date**: 2024-07-03  
**Feature**: Confidence classification buttons in Practice Mode

---

## Overview

Implemented three confidence buttons (Mastered, Review, Almost Forgot) that appear after answering a question in Practice Mode. The buttons update frontend state only - no backend API calls yet.

---

## Implementation Details

### 1. Updated Type Definitions (`types/quiz.ts`)

#### Added ConfidenceLevel Type
```typescript
export type ConfidenceLevel = 'mastered' | 'review' | 'almost_forgot' | null
```

#### Updated QuizAnswer Interface
```typescript
export interface QuizAnswer {
  question_id: number
  selected_answer: string | null
  time_spent: number
  is_bookmarked: boolean
  is_visited: boolean
  confidence_level?: ConfidenceLevel  // NEW
}
```

---

### 2. Updated Quiz State Hook (`hooks/useQuizState.ts`)

#### Added setConfidence Action
```typescript
const setConfidence = useCallback((questionId: number, confidence: ConfidenceLevel) => {
  setState(prev => {
    const newAnswers = new Map(prev.answers)
    const current = newAnswers.get(questionId)
    if (current) {
      newAnswers.set(questionId, {
        ...current,
        confidence_level: confidence
      })
    }
    return { ...prev, answers: newAnswers }
  })
}, [])
```

#### Exported in Actions
- Added `setConfidence` to the returned actions object

---

### 3. Added Confidence Buttons UI (`pages/Quiz.tsx`)

#### Visual Design

Three buttons displayed horizontally (stacked on mobile):

**1. Mastered Button**
- ✅ Green color scheme
- Checkmark icon
- Selected state: `border-green-600 bg-green-50 text-green-700`
- Hover state: `hover:border-green-500 hover:bg-green-50`

**2. Review Button**
- ℹ️ Blue color scheme
- Info icon
- Selected state: `border-blue-600 bg-blue-50 text-blue-700`
- Hover state: `hover:border-blue-500 hover:bg-blue-50`

**3. Almost Forgot Button**
- ⚠️ Yellow color scheme
- Warning icon
- Selected state: `border-yellow-600 bg-yellow-50 text-yellow-700`
- Hover state: `hover:border-yellow-500 hover:bg-yellow-50`

#### Display Conditions
Buttons only appear when:
- ✅ `config.mode === 'practice'` (Practice Mode only)
- ✅ `showFeedback === true` (After feedback is shown)
- ✅ `currentAnswer.selected_answer !== null` (Answer selected)

#### Visual States
- **Unselected**: Gray border, no background, gray text
- **Selected**: Colored border, colored background, colored ring
- **Hover**: Colored border, colored background

---

## User Experience

### Flow

1. **User selects answer** in Practice Mode
2. **Feedback appears** (green/red highlighting)
3. **Confidence buttons appear** below options
4. **User clicks confidence button** (Mastered/Review/Almost Forgot)
5. **Button highlights** to show selection
6. **State saved** in frontend (localStorage)
7. User navigates to next question

### Visual Layout

```
┌─────────────────────────────────────────┐
│ Question and Options (with feedback)    │
├─────────────────────────────────────────┤
│ How confident are you with this answer? │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │✅Mastered│ │ℹ️ Review │ │⚠️Almost │ │
│ │          │ │          │ │  Forgot  │ │
│ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

---

## Responsive Design

### Desktop (sm and above)
- Buttons displayed in a row
- Equal width distribution (`flex-1`)
- 12px gap between buttons

### Mobile
- Buttons stack vertically (`flex-col`)
- Full width buttons
- 12px gap between buttons

---

## State Management

### Frontend State Only
- Confidence level stored in `QuizAnswer.confidence_level`
- Persisted in localStorage (via `useQuizState`)
- Survives page refresh
- Cleared when quiz completed

### No Backend Calls
- ❌ No API calls when clicking buttons
- ❌ No database updates
- ❌ Question status NOT updated in DB
- ⏳ Backend integration pending

---

## Data Structure

### In QuizState
```typescript
answers: Map<number, QuizAnswer>

// Example answer with confidence
{
  question_id: 1,
  selected_answer: "B",
  time_spent: 45,
  is_bookmarked: false,
  is_visited: true,
  confidence_level: "mastered"  // or "review" or "almost_forgot" or null
}
```

### In localStorage
```json
{
  "config": {...},
  "questions": [...],
  "answers": {
    "1": {
      "question_id": 1,
      "selected_answer": "B",
      "confidence_level": "mastered",
      ...
    }
  }
}
```

---

## Behavior Notes

### Selection Behavior
- Clicking a button sets that confidence level
- Only one confidence level per question
- Clicking the same button again keeps it selected
- Can change confidence by clicking different button
- Confidence resets when navigating away and back

### Exam Mode
- ❌ Confidence buttons NOT shown in Exam Mode
- Only Practice Mode displays confidence buttons

### Navigation
- User can navigate to next question after selecting confidence
- User can navigate without selecting confidence (optional)
- Confidence selection is optional, not required

---

## Files Modified

1. **`frontend/src/types/quiz.ts`**
   - Added `ConfidenceLevel` type
   - Updated `QuizAnswer` interface

2. **`frontend/src/hooks/useQuizState.ts`**
   - Imported `ConfidenceLevel` type
   - Added `setConfidence` action
   - Exported `setConfidence` in actions

3. **`frontend/src/pages/Quiz.tsx`**
   - Added confidence buttons UI
   - Integrated with feedback display
   - Responsive design implementation

---

## Testing Checklist

- [x] Buttons only appear in Practice Mode
- [x] Buttons only appear after feedback is shown
- [x] Buttons only appear when answer is selected
- [x] Mastered button shows green styling when selected
- [x] Review button shows blue styling when selected
- [x] Almost Forgot button shows yellow styling when selected
- [x] Clicking button updates frontend state
- [x] Confidence level persists in localStorage
- [x] No API calls made when clicking buttons
- [x] Buttons responsive on mobile
- [x] Icons display correctly
- [x] No TypeScript errors
- [x] State resets when navigating away

---

## Future Enhancements (Not Implemented)

### Backend Integration
- POST confidence level to backend API
- Update question status in database based on:
  - Correct + Mastered → Status = MASTERED
  - Correct + Review → Status = REVIEW
  - Correct + Almost Forgot → Status = ALMOST_FORGOT
  - Incorrect → Status = ERROR (override confidence)

### Status Tracking
- Save status history with timestamps
- Track status transitions
- Display status in question palette

### Analytics
- Aggregate confidence data
- Show confidence distribution
- Track improvement over time

---

**Status**: Implementation complete ✅  
**Backend Integration**: Pending ⏳
