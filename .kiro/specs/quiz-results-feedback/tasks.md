# Implementation Plan: Quiz Results & Feedback

## Overview

This feature provides comprehensive post-quiz analysis and performance tracking. The implementation is organized into small, safe batches that each produce a working, compilable application. Each batch modifies 4-10 files and generates ~300-800 lines of code maximum.

## Implementation Batches

### Batch 1: Backend - Database Schema & Models

**Goal:** Add database schema for extended quiz attempts.

**Files Modified (~6 files):**
- `backend/alembic/versions/006_extend_quiz_attempts.py` (new)
- `backend/app/models/quiz_attempt.py`
- `backend/app/models/__init__.py`

**Implementation Steps:**
1. Create Alembic migration adding columns: timer_mode, timer_value, question_range_start, question_range_end, batch_size, unanswered_questions, responses (JSON)
2. Run migration to update database schema
3. Update QuizAttempt model with new Column definitions
4. Verify model imports in __init__.py

**Testing & Acceptance:**
- Migration runs without errors
- Backend compiles and starts
- Database schema matches model definitions
- _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

---

### Batch 2: Backend - Attempt Schemas & API

**Goal:** Update schemas and API endpoint to accept extended attempt data.

**Files Modified (~3 files):**
- `backend/app/schemas/quiz_attempt.py`
- `backend/app/api/quiz_attempts.py`
- `backend/app/schemas/__init__.py`

**Implementation Steps:**
1. Create QuestionResponseSchema and AttemptConfigSchema
2. Update QuizAttemptCreate with new fields
3. Update QuizAttemptResponse with new fields
4. Add validation rules (enums, patterns)
5. Update POST endpoint to map new schema to database columns
6. Add metrics consistency validation

**Testing & Acceptance:**
- Backend compiles and starts
- Can POST extended attempt data
- Validation works (400 for invalid data)
- Attempt saves with all new fields
- Test with curl/Postman
- _Requirements: 3.1, 3.7, 3.8_

---

### Batch 3: Backend - Question Status Batch Update

**Goal:** Create batch update endpoint for question statuses.

**Files Modified (~2 files):**
- `backend/app/api/questions.py`
- `backend/app/schemas/question.py` (create if needed)

**Implementation Steps:**
1. Define QuestionStatusUpdate, BatchStatusUpdateRequest, BatchStatusUpdateResponse schemas
2. Add PATCH /api/questions/batch/status endpoint
3. Implement ownership verification
4. Validate status enum values
5. Update status and counter fields in transaction

**Testing & Acceptance:**
- Backend compiles and starts
- PATCH request updates multiple questions
- Invalid status returns 400
- Non-owned questions return 404
- Counters increment correctly
- Test with curl/Postman
- _Requirements: 4.5, 4.6, 4.7, 4.8, 5.4, 5.5, 5.6_

---

### Batch 4: Frontend - Types & Time Formatting

**Goal:** Create TypeScript types and time formatting utilities.

**Files Modified (~2 files):**
- `frontend/src/types/attempt.ts` (new)
- `frontend/src/utils/timeFormatting.ts` (new)

**Implementation Steps:**
1. Define QuestionResponse, AttemptConfig, AttemptCreate, AttemptResponse interfaces
2. Match backend schemas exactly
3. Create formatTime function (MM:SS and HH:MM:SS)
4. Create formatAccuracy function
5. Handle edge cases (negative, zero, NaN)

**Testing & Acceptance:**
- Frontend compiles without TypeScript errors
- Time formats correctly for various durations
- Accuracy formats correctly with edge cases
- _Requirements: 3.2, 3.3, 3.4, 3.5, 6.5, 6.6, 6.7_

---

### Batch 5: Frontend - Calculation Utilities

**Goal:** Create result calculation and status update logic utilities.

**Files Modified (~2 files):**
- `frontend/src/utils/resultCalculations.ts` (new)
- `frontend/src/utils/statusUpdateLogic.ts` (new)

**Implementation Steps:**
1. Create calculateResultMetrics function
2. Implement correct/wrong/unanswered counting
3. Implement accuracy percentage calculation
4. Generate QuestionResponse array from quiz state
5. Create determineStatusUpdates function
6. Implement Practice Mode confidence mapping
7. Implement Exam Mode correctness logic

**Testing & Acceptance:**
- Frontend compiles without errors
- Functions handle edge cases (null, empty, zero)
- Calculations are accurate
- Status mapping works for both modes
- _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

---

### Batch 6: Frontend - API Clients

**Goal:** Update API clients for attempts and question status updates.

**Files Modified (~2 files):**
- `frontend/src/api/quiz-attempts.ts`
- `frontend/src/api/questions.ts` (create or update)

**Implementation Steps:**
1. Update quiz-attempts.ts to use new AttemptCreate type
2. Ensure nested config and responses array handled
3. Create/update questions.ts with batchUpdateStatus function
4. Add proper error handling

**Testing & Acceptance:**
- Frontend compiles without errors
- API clients format requests correctly
- Error handling works
- _Requirements: 3.1, 3.2, 4.5, 5.4_

---

### Batch 7: Frontend - Atomic Components (Part 1)

**Goal:** Build MetricCard and StatusBadge components with accessibility.

**Files Modified (~2 files):**
- `frontend/src/components/results/MetricCard.tsx` (new)
- `frontend/src/components/results/StatusBadge.tsx` (new)

**Implementation Steps:**
1. Create MetricCard with label, value, variant props
2. Implement variant styling (success, error, warning, neutral)
3. Add ARIA labels and aria-describedby
4. Create StatusBadge with isCorrect prop
5. Render checkmark/X icons
6. Add ARIA labels for screen readers
7. Ensure color contrast meets WCAG AA

**Testing & Acceptance:**
- Frontend compiles without errors
- Components render correctly
- Variants display correct colors
- ARIA attributes present
- Keyboard accessible
- Color contrast validated
- _Requirements: 1.2, 1.3, 8.3, 8.4, 15.1, 15.4_

---

### Batch 8: Frontend - Atomic Components (Part 2)

**Goal:** Build OptionItem and ConfidenceBadge components with accessibility.

**Files Modified (~2 files):**
- `frontend/src/components/results/OptionItem.tsx` (new)
- `frontend/src/components/results/ConfidenceBadge.tsx` (new)

**Implementation Steps:**
1. Create OptionItem with answer display props
2. Implement 4-state styling logic
3. Display "Your Answer" and "Correct" indicators
4. Add ARIA labels for each state
5. Create ConfidenceBadge for Practice Mode
6. Render badge with appropriate text and color
7. Add ARIA labels

**Testing & Acceptance:**
- Frontend compiles without errors
- OptionItem displays all 4 states correctly
- ConfidenceBadge renders with proper styling
- ARIA attributes present
- Screen reader announces states correctly
- _Requirements: 2.4, 2.5, 2.6, 8.5, 8.6, 8.7, 10.1, 10.2, 10.3, 15.1, 15.4_

---

### Batch 9: Frontend - Navigation & Summary Components

**Goal:** Build NavigationActions and ScoreSummary with keyboard support.

**Files Modified (~2 files):**
- `frontend/src/components/results/NavigationActions.tsx` (new)
- `frontend/src/components/results/ScoreSummary.tsx` (new)

**Implementation Steps:**
1. Create NavigationActions with callback props
2. Render three buttons with labels
3. Add keyboard support (Tab, Enter, Space)
4. Add ARIA labels for navigation
5. Create ScoreSummary using MetricCard
6. Display score, accuracy, time
7. Conditionally show timer info
8. Integrate NavigationActions
9. Apply responsive layout

**Testing & Acceptance:**
- Frontend compiles without errors
- Buttons trigger callbacks correctly
- Tab navigation works
- Enter/Space activates buttons
- ARIA labels present
- Layout responsive on mobile
- _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 7.1, 7.2, 7.3, 15.1, 15.2_

---

### Batch 10: Frontend - Question Review Components

**Goal:** Build QuestionReviewCard and QuestionReviewList with ARIA.

**Files Modified (~2 files):**
- `frontend/src/components/results/QuestionReviewCard.tsx` (new)
- `frontend/src/components/results/QuestionReviewList.tsx` (new)

**Implementation Steps:**
1. Create QuestionReviewCard using atomic components
2. Display question number, time, text, options
3. Apply border styling based on correctness
4. Handle unanswered questions ("Not Answered")
5. Conditionally show ConfidenceBadge for Practice Mode
6. Add ARIA roles and labels
7. Create QuestionReviewList container
8. Map and render QuestionReviewCard for each question
9. Ensure sequential ordering

**Testing & Acceptance:**
- Frontend compiles without errors
- Cards display all information correctly
- Green/red styling applied correctly
- Unanswered shows "Not Answered"
- Confidence badges only in Practice Mode
- ARIA attributes present
- List scrolls properly
- _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8, 8.1, 8.2, 10.1, 11.3, 12.1, 12.2, 12.3, 12.4, 15.1, 15.4_

---

### Batch 11: Frontend - Results Page Layout (No API)

**Goal:** Create Results page that displays components without API calls.

**Files Modified (~2 files):**
- `frontend/src/pages/QuizResults.tsx` (new)
- `frontend/src/App.tsx` (add route)

**Implementation Steps:**
1. Create QuizResults.tsx page
2. Accept quizResults from router state
3. Calculate metrics using resultCalculations utility
4. Set up basic state (calculatedMetrics)
5. Render ScoreSummary with metrics
6. Render QuestionReviewList with questions/responses
7. Add Escape key handler for navigation
8. Add visible focus indicators
9. Register /quiz/results route in App.tsx
10. Ensure route is protected

**Testing & Acceptance:**
- Frontend compiles without errors
- Page displays when navigating to /quiz/results
- Metrics calculate correctly
- All components render properly
- No API calls made yet
- Escape key navigation works
- Focus indicators visible
- _Requirements: 1.1, 1.5, 9.1, 15.3, 15.4_

---

### Batch 12: Frontend - Attempt Persistence

**Goal:** Add attempt saving with error handling and retry.

**Files Modified (~2 files):**
- `frontend/src/pages/QuizResults.tsx`
- Quiz completion page (to navigate with state)

**Implementation Steps:**
1. Add attemptSaveStatus state
2. Add errorMessage state
3. Implement saveAttempt async function
4. Transform metrics to AttemptCreate format
5. Call quiz-attempts API client
6. Update status during lifecycle
7. Cache results in localStorage before save
8. Implement error handling
9. Add "Retry Save" button in UI
10. Implement retryAttemptSave function
11. Display error messages with ARIA live region
12. Update quiz completion to navigate with state

**Testing & Acceptance:**
- Frontend compiles without errors
- Attempt saves to backend on page load
- Error displays on failure
- Retry button works
- localStorage caches data
- ARIA live announces errors
- Quiz navigates to results correctly
- _Requirements: 3.1, 3.7, 3.8, 14.1, 14.2, 14.3, 14.5, 15.4_

---

### Batch 13: Frontend - Question Status Updates

**Goal:** Add question status batch updates with error handling.

**Files Modified (~1 file):**
- `frontend/src/pages/QuizResults.tsx`

**Implementation Steps:**
1. Add statusUpdateStatus state
2. Implement updateQuestionStatuses async function
3. Call statusUpdateLogic utility to determine updates
4. Call questions batchUpdateStatus API client
5. Update status during lifecycle
6. Handle errors with warning messages
7. Add ARIA live region for status update messages
8. Allow viewing results even if updates fail

**Testing & Acceptance:**
- Frontend compiles without errors
- Question statuses update after attempt save
- Errors display as warnings
- Page usable even if update fails
- ARIA announces status messages
- Database shows updated statuses
- _Requirements: 4.5, 4.6, 4.7, 5.4, 5.5, 5.6, 14.4, 15.4_

---

### Batch 14: Frontend - Navigation Handlers

**Goal:** Implement navigation button handlers and routing integration.

**Files Modified (~1 file):**
- `frontend/src/pages/QuizResults.tsx`

**Implementation Steps:**
1. Implement handleRetryQuiz function
2. Navigate to quiz with same configuration via state
3. Implement handleBackToChapter function
4. Navigate to chapter detail page
5. Implement handleViewHistory function
6. Navigate to history page (if exists)
7. Pass navigation handlers to NavigationActions
8. Test all navigation paths

**Testing & Acceptance:**
- Frontend compiles without errors
- Retry Quiz loads with identical config
- Back to Chapter navigates correctly
- View History navigates correctly
- All buttons functional
- _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

---

### Batch 15: Frontend - Loading States

**Goal:** Add loading indicators for async operations.

**Files Modified (~3 files):**
- `frontend/src/pages/QuizResults.tsx`
- `frontend/src/components/results/ScoreSummary.tsx`
- `frontend/src/components/results/QuestionReviewList.tsx`

**Implementation Steps:**
1. Add loading spinner during attempt save
2. Add loading spinner during status update
3. Show progress for large quizzes (>100 questions)
4. Add ARIA live region for loading announcements
5. Display loading states in UI
6. Ensure content appears after loading completes

**Testing & Acceptance:**
- Frontend compiles without errors
- Loading indicators show during async operations
- Progress shown for large quizzes
- Screen readers announce loading states
- UI transitions smoothly after loading
- _Requirements: 13.5, 15.4_

---

### Batch 16: Frontend - Mode-Specific Behavior

**Goal:** Ensure Practice and Exam modes display correctly.

**Files Modified (~3 files):**
- `frontend/src/pages/QuizResults.tsx`
- `frontend/src/components/results/QuestionReviewCard.tsx`
- `frontend/src/components/results/ScoreSummary.tsx`

**Implementation Steps:**
1. Pass mode prop to QuestionReviewCard
2. Conditionally show confidence badges in Practice Mode
3. Hide confidence UI in Exam Mode
4. Test status updates use correct logic per mode
5. Verify immediate feedback consistency
6. Emphasize score display in Exam Mode
7. Test with both modes

**Testing & Acceptance:**
- Frontend compiles without errors
- Practice Mode shows confidence badges
- Exam Mode hides all confidence UI
- Status updates follow correct logic
- Both modes tested and working
- _Requirements: 4.1, 4.2, 4.3, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 11.4_

---

### Batch 17: Frontend - Edge Cases & Validation

**Goal:** Handle edge cases and validate all scenarios.

**Files Modified (~3 files):**
- `frontend/src/utils/resultCalculations.ts`
- `frontend/src/components/results/ScoreSummary.tsx`
- `frontend/src/components/results/QuestionReviewCard.tsx`

**Implementation Steps:**
1. Enhance unanswered count in ScoreSummary
2. Update resultCalculations to count unanswered separately
3. Verify zero-division handling in accuracy
4. Test with 0 questions
5. Test with all correct
6. Test with all wrong
7. Test with all unanswered
8. Test with mixed results
9. Verify all edge cases handled

**Testing & Acceptance:**
- Frontend compiles without errors
- Unanswered count displays in summary
- No NaN or Infinity values
- All edge cases work without crashes
- Graceful handling of empty/null data
- _Requirements: 6.4, 12.1, 12.2, 12.3, 12.4, 12.5_

---

### Batch 18: Frontend - Responsive Design

**Goal:** Make results page fully responsive for all screen sizes.

**Files Modified (~7 files):**
- `frontend/src/pages/QuizResults.tsx`
- `frontend/src/components/results/ScoreSummary.tsx`
- `frontend/src/components/results/QuestionReviewList.tsx`
- `frontend/src/components/results/QuestionReviewCard.tsx`
- `frontend/src/components/results/MetricCard.tsx`
- `frontend/src/components/results/NavigationActions.tsx`
- `frontend/src/components/results/OptionItem.tsx`

**Implementation Steps:**
1. Add responsive Tailwind classes to all components
2. Test on mobile (< 768px) - single column
3. Test on tablet (768-1024px) - adjusted grids
4. Ensure touch targets min 44x44px
5. Stack MetricCard on mobile
6. Stack NavigationActions vertically on mobile
7. Ensure question cards readable on small screens
8. Verify no horizontal scrolling
9. Test all breakpoints

**Testing & Acceptance:**
- Frontend compiles without errors
- Mobile layout works (< 768px)
- Tablet layout works (768-1024px)
- Desktop layout works (>1024px)
- Touch targets adequate
- No horizontal scroll
- Text readable at all sizes
- _Requirements: 13.1_

---

### Batch 19: Frontend - Performance Optimization

**Goal:** Optimize performance for large quizzes.

**Files Modified (~4 files):**
- `frontend/src/components/results/QuestionReviewCard.tsx`
- `frontend/src/components/results/OptionItem.tsx`
- `frontend/src/components/results/QuestionReviewList.tsx`
- `frontend/src/utils/resultCalculations.ts`

**Implementation Steps:**
1. Wrap QuestionReviewCard in React.memo
2. Wrap OptionItem in React.memo
3. Memoize expensive calculations
4. Test with 100+ question quiz
5. Profile with React DevTools
6. Verify load time < 3 seconds
7. Optimize any bottlenecks
8. Ensure smooth scrolling

**Testing & Acceptance:**
- Frontend compiles without errors
- 100+ question quiz loads within 3 seconds
- No unnecessary re-renders in profiler
- Smooth scrolling performance
- Metrics verified with DevTools
- _Requirements: 13.2, 13.3, 13.4_

---

### Batch 20: Integration Testing - Practice Mode

**Goal:** Test complete Practice Mode flow end-to-end.

**Files Modified (~0 files, only testing):**
- Fix bugs in any files as discovered

**Implementation Steps:**
1. Complete full quiz in Practice Mode
2. Verify results page displays
3. Verify metrics calculate correctly
4. Verify attempt saves to database
5. Verify question statuses update with confidence mapping
6. Check confidence badges display
7. Test Retry Quiz with same config
8. Test Back to Chapter navigation
9. Test View History navigation
10. Fix any bugs discovered

**Testing & Acceptance:**
- Practice Mode works end-to-end
- All data saves correctly
- Status updates use confidence mapping
- Confidence badges visible
- Navigation works
- No console errors
- _Requirements: 4.1, 4.2, 4.3, 10.1, 10.2, 10.3_

---

### Batch 21: Integration Testing - Exam Mode

**Goal:** Test complete Exam Mode flow end-to-end.

**Files Modified (~0 files, only testing):**
- Fix bugs in any files as discovered

**Implementation Steps:**
1. Complete full quiz in Exam Mode
2. Verify results page displays
3. Verify confidence UI hidden
4. Verify question statuses update with correctness-only logic
5. Verify score prominently displayed
6. Test all timer modes (unlimited, per-question, whole-test)
7. Test custom question ranges
8. Test various batch sizes
9. Fix any bugs discovered

**Testing & Acceptance:**
- Exam Mode works end-to-end
- No confidence UI visible
- Status updates use correctness logic
- All timer modes work
- Custom ranges work
- No console errors
- _Requirements: 5.1, 5.2, 5.3, 11.1, 11.2, 11.3, 11.4_

---

### Batch 22: Integration Testing - Error Handling

**Goal:** Test error scenarios and recovery mechanisms.

**Files Modified (~0 files, only testing):**
- Fix bugs in any files as discovered

**Implementation Steps:**
1. Simulate API failure for attempt save
2. Verify error message displays
3. Verify Retry Save button appears and works
4. Verify localStorage caching works
5. Simulate API failure for status update
6. Verify warning message displays
7. Verify page remains usable
8. Test recovery after network restored
9. Fix any bugs discovered

**Testing & Acceptance:**
- Error handling works correctly
- Retry mechanisms functional
- localStorage preserves data
- Appropriate messages shown
- Page usable during failures
- Recovery works after errors
- _Requirements: 3.8, 14.1, 14.2, 14.3, 14.4, 14.5_

---

### Batch 23: Final Validation

**Goal:** Validate all requirements and fix remaining issues.

**Files Modified (~varies):**
- Fix any remaining bugs

**Implementation Steps:**
1. Test all requirements from requirements.md
2. Verify all acceptance criteria met
3. Test accessibility with screen reader
4. Verify WCAG AA compliance
5. Test keyboard navigation thoroughly
6. Verify performance requirements met
7. Check all edge cases
8. Fix any remaining bugs
9. Final code review
10. Documentation updates if needed

**Testing & Acceptance:**
- All requirements verified working
- All acceptance criteria met
- Accessibility validated
- Performance requirements met
- No known bugs remaining
- Code review complete
- _Requirements: All_

---

## Implementation Summary

### Total Batches: 23

**Backend (3 batches):**
1. Database schema & models
2. Attempt schemas & API
3. Question status batch update

**Frontend Infrastructure (3 batches):**
4. Types & time formatting
5. Calculation utilities
6. API clients

**Frontend UI (4 batches):**
7. Atomic components part 1 (MetricCard, StatusBadge) + accessibility
8. Atomic components part 2 (OptionItem, ConfidenceBadge) + accessibility
9. Navigation & summary components + keyboard support
10. Question review components + ARIA

**Frontend Integration (4 batches):**
11. Results page layout (no API)
12. Attempt persistence + error handling
13. Question status updates + error handling
14. Navigation handlers

**Frontend Polish (5 batches):**
15. Loading states
16. Mode-specific behavior
17. Edge cases & validation
18. Responsive design
19. Performance optimization

**Testing & Validation (4 batches):**
20. Practice Mode integration testing
21. Exam Mode integration testing
22. Error handling integration testing
23. Final validation

### Key Characteristics

✅ **Small batches** - Each modifies 1-7 files (typically 2-4)  
✅ **~300-800 lines max** - Prevents overwhelming AI context  
✅ **Always compilable** - No broken intermediate states  
✅ **Test as you go** - Every batch includes testing  
✅ **Incremental accessibility** - Built into UI batches, not separate  
✅ **No giant testing batch** - Testing distributed throughout  

### Implementation Rules

**Every batch must:**
- Never modify more than 10 files
- Never generate more than ~800 lines of code
- Leave the project in a compilable and runnable state
- Include testing and bug fixes before moving to next batch
- If batch is too large, stop and split it

**Execution order:**
- Batches 1-3: Backend (can be done first)
- Batches 4-6: Frontend infrastructure (after backend complete)
- Batches 7-10: Frontend UI (after infrastructure)
- Batches 11-14: Frontend integration (after UI complete)
- Batches 15-19: Polish (after integration works)
- Batches 20-23: Testing & validation (throughout and at end)

### Estimated Timeline

- **0.5-1 day per batch** for single developer
- **Total: 12-23 developer days**
- Backend can be done in parallel with frontend planning
- Some UI batches can be done in parallel
- Testing batches must be done sequentially at end

### Notes

- Accessibility built incrementally into UI batches (not separate)
- Testing built into every batch (not giant final batch)
- Batch 11 creates page layout without API calls (safe first step)
- Batch 12-13 add persistence incrementally (save, then status)
- Error handling included with persistence (not deferred)
- Performance optimization after core features work
- Final 4 batches are pure testing and validation


## Tasks

- [ ] 1. Backend - Database Schema & Models
- [ ] 2. Backend - Attempt Schemas & API
- [ ] 3. Backend - Question Status Batch Update
- [ ] 4. Frontend - Types & Time Formatting
- [ ] 5. Frontend - Calculation Utilities
- [ ] 6. Frontend - API Clients
- [ ] 7. Frontend - Atomic Components (Part 1)
- [ ] 8. Frontend - Atomic Components (Part 2)
- [ ] 9. Frontend - Navigation & Summary Components
- [ ] 10. Frontend - Question Review Components
- [ ] 11. Frontend - Results Page Layout (No API)
- [ ] 12. Frontend - Attempt Persistence
- [ ] 13. Frontend - Question Status Updates
- [ ] 14. Frontend - Navigation Handlers
- [ ] 15. Frontend - Loading States
- [ ] 16. Frontend - Mode-Specific Behavior
- [ ] 17. Frontend - Edge Cases & Validation
- [ ] 18. Frontend - Responsive Design
- [ ] 19. Frontend - Performance Optimization
- [ ] 20. Integration Testing - Practice Mode
- [ ] 21. Integration Testing - Exam Mode
- [ ] 22. Integration Testing - Error Handling
- [ ] 23. Final Validation

## Notes

- Each batch modifies 1-7 files (typically 2-4 files)
- Each batch generates ~300-800 lines of code maximum
- Every batch must leave project compilable and runnable
- Testing is built into every batch, not deferred to the end
- Accessibility is built incrementally into UI batches
- If any batch feels too large during implementation, stop and split it
- Backend batches (1-3) can be completed before frontend work
- Frontend infrastructure (4-6) must complete before UI work
- Testing batches (20-23) validate complete flows with bug fixes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2"] },
    { "id": 2, "tasks": ["3"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["5", "6"] },
    { "id": 5, "tasks": ["7", "8"] },
    { "id": 6, "tasks": ["9", "10"] },
    { "id": 7, "tasks": ["11"] },
    { "id": 8, "tasks": ["12"] },
    { "id": 9, "tasks": ["13"] },
    { "id": 10, "tasks": ["14"] },
    { "id": 11, "tasks": ["15", "16", "17"] },
    { "id": 12, "tasks": ["18"] },
    { "id": 13, "tasks": ["19"] },
    { "id": 14, "tasks": ["20"] },
    { "id": 15, "tasks": ["21"] },
    { "id": 16, "tasks": ["22"] },
    { "id": 17, "tasks": ["23"] }
  ]
}
```
