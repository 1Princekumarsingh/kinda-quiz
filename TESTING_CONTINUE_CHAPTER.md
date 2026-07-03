# Testing Guide: Continue Chapter Feature

## Quick Test Scenario

### Setup
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Login to application
4. Navigate to a chapter with at least 50 questions

---

## Test 1: First Session ✅

**Goal:** Verify progress is saved after completing first quiz

1. Navigate to chapter page
2. ✅ **Verify:** No "Continue Chapter" button shows (fresh start)
3. Click "Start Quiz"
4. Configure quiz:
   - Mode: Practice
   - Timer: Unlimited
   - Selection: All Questions
   - Batch Size: 25
5. Complete quiz (answer all 25 questions)
6. ✅ **Verify:** Results page shows
7. ✅ **Verify:** "Next Batch" button appears (if more questions exist)
8. Click "Back to Chapter"
9. ✅ **Verify:** "Continue from Question 26" button now shows (purple)

---

## Test 2: Continue Chapter Button ✅

**Goal:** Verify Continue button works and bypasses config modal

1. On chapter page with saved progress
2. ✅ **Verify:** "Continue from Question 26" button shows
3. Click "Continue from Question 26" button
4. ✅ **Verify:** Quiz starts **immediately** (no config modal)
5. ✅ **Verify:** Quiz starts from Question 26
6. ✅ **Verify:** Same configuration used (Practice mode, Unlimited timer)
7. ✅ **Verify:** Batch size is same as last time (25 questions)
8. ✅ **Verify:** Questions 26-50 loaded

---

## Test 3: Next Batch Button ✅

**Goal:** Verify Next Batch button on results page

1. Complete quiz (Questions 26-50)
2. On results page:
3. ✅ **Verify:** "Next Batch" button shows (green)
4. Click "Next Batch"
5. ✅ **Verify:** Quiz starts immediately
6. ✅ **Verify:** Questions 51-75 loaded
7. ✅ **Verify:** Same configuration used

---

## Test 4: Completion ✅

**Goal:** Verify button hides when chapter complete

1. Continue practicing until all questions done
2. Complete final batch (e.g., Questions 476-500 of 500)
3. View results page
4. ✅ **Verify:** "Next Batch" button does NOT show
5. Click "Back to Chapter"
6. ✅ **Verify:** "Continue Chapter" button does NOT show
7. ✅ **Verify:** Only "Start Quiz" button shows
8. User can restart from beginning

---

## Test 5: localStorage Persistence ✅

**Goal:** Verify progress persists across browser sessions

1. Complete quiz (save progress)
2. Close browser completely
3. Open browser again
4. Login and navigate to chapter
5. ✅ **Verify:** "Continue from Question X" still shows
6. ✅ **Verify:** Progress persisted

---

## Test 6: Multiple Chapters ✅

**Goal:** Verify each chapter tracks independently

1. Navigate to Chapter 1
2. Complete quiz (save progress to Q25)
3. ✅ **Verify:** "Continue from Question 26" shows
4. Navigate to Chapter 2
5. Complete quiz (save progress to Q50)
6. ✅ **Verify:** "Continue from Question 51" shows
7. Go back to Chapter 1
8. ✅ **Verify:** Still shows "Continue from Question 26" (not affected by Chapter 2)

---

## Test 7: Changing Batch Size ✅

**Goal:** Verify batch size changes are remembered

1. Complete quiz with batch size 25
2. Return to chapter
3. Click "Start Quiz" (not Continue Chapter)
4. Config modal opens
5. ✅ **Verify:** "Continue Chapter" is pre-selected
6. Change batch size to 50
7. Start quiz
8. ✅ **Verify:** Questions 26-75 loaded (50 questions)
9. Complete quiz
10. Return to chapter
11. ✅ **Verify:** "Continue from Question 76" shows
12. Click Continue
13. ✅ **Verify:** Next batch is 50 questions (76-125), not 25

---

## Test 8: Changing Quiz Mode ✅

**Goal:** Verify mode changes are remembered

1. Complete Practice Mode quiz
2. Click "Start Quiz"
3. Change mode to Exam Mode
4. Change timer to "Per Question (60 seconds)"
5. Continue from saved position
6. ✅ **Verify:** Exam Mode active (no immediate feedback)
7. Complete quiz
8. Return and click "Continue Chapter"
9. ✅ **Verify:** Exam Mode used
10. ✅ **Verify:** Timer still "Per Question (60 seconds)"

---

## Test 9: Last Batch Handling ✅

**Goal:** Verify last batch can be smaller than batch size

1. Navigate to chapter with 105 questions
2. Complete sessions with batch size 50:
   - Session 1: Questions 1-50
   - Session 2: Questions 51-100
3. Return to chapter
4. ✅ **Verify:** "Continue from Question 101" shows
5. Click Continue
6. ✅ **Verify:** Only 5 questions loaded (101-105)
7. Complete quiz
8. ✅ **Verify:** Chapter marked complete
9. ✅ **Verify:** "Continue Chapter" button no longer shows

---

## Test 10: Visual Verification ✅

**Goal:** Verify UI elements and styling

1. Navigate to chapter with progress
2. ✅ **Verify:** Continue button is purple (`bg-purple-600`)
3. ✅ **Verify:** Start Quiz button is green (`bg-green-600`)
4. ✅ **Verify:** Import button is blue/primary (`bg-primary-600`)
5. ✅ **Verify:** Continue button is full width
6. ✅ **Verify:** Continue button is above Start Quiz and Import
7. ✅ **Verify:** Fast-forward icon (>>) shows on Continue button
8. ✅ **Verify:** Text shows correct question number

---

## Test 11: Config Modal Integration ✅

**Goal:** Verify Continue Chapter option in modal

1. Chapter with saved progress
2. Click "Start Quiz" (not Continue Chapter)
3. Config modal opens
4. ✅ **Verify:** "Continue Chapter (Resume from Question X)" option shows
5. ✅ **Verify:** Option is pre-selected by default
6. ✅ **Verify:** Last mode pre-selected
7. ✅ **Verify:** Last timer mode pre-selected
8. ✅ **Verify:** Last batch size pre-selected
9. Change any settings and start
10. ✅ **Verify:** New settings are saved

---

## Test 12: Error Handling ✅

**Goal:** Verify graceful degradation on errors

1. **Corrupt localStorage:**
   ```javascript
   localStorage.setItem('recallx_chapter_progress', '{invalid json')
   ```
2. Refresh page
3. ✅ **Verify:** No crash
4. ✅ **Verify:** Continue button doesn't show
5. ✅ **Verify:** Start Quiz works normally

6. **Clear progress:**
   ```javascript
   localStorage.removeItem('recallx_chapter_progress')
   ```
7. Refresh page
8. ✅ **Verify:** Continue button doesn't show
9. Complete new quiz
10. ✅ **Verify:** Progress saved again

---

## Browser Console Checks

### Check Saved Progress

```javascript
// View all chapter progress
const progress = JSON.parse(localStorage.getItem('recallx_chapter_progress'))
console.log(progress)

// Expected output:
{
  "1": {
    "last_question_index": 25,
    "last_batch_size": 25,
    "last_config": {
      "mode": "practice",
      "timer_mode": "unlimited"
    }
  }
}
```

### Verify Next Batch Calculation

```javascript
// After completing quiz, check nextBatchConfig state
// In QuizResults component
const nextStart = 26  // last_question_index + 1
const batchSize = 25
const totalQuestions = 100
const nextEnd = Math.min(nextStart + batchSize - 1, totalQuestions)
console.log(`Next batch: ${nextStart}-${nextEnd}`)
// Expected: "Next batch: 26-50"
```

---

## Mobile Testing

### Responsive Design

1. Open DevTools → Toggle device toolbar
2. Select iPhone 12 Pro
3. Navigate to chapter page
4. ✅ **Verify:** Continue button stacks properly
5. ✅ **Verify:** Button text doesn't overflow
6. ✅ **Verify:** Icon and text aligned
7. ✅ **Verify:** Touch target is adequate (44px minimum)

---

## Performance Testing

### localStorage Read Performance

1. Create 10 chapters with progress
2. Navigate to chapters page
3. Open Performance tab in DevTools
4. Refresh page
5. ✅ **Verify:** localStorage reads < 10ms total
6. ✅ **Verify:** No layout shift when Continue buttons appear

---

## Edge Case Testing

### Edge Case 1: Single Question Remaining

1. Chapter with 26 questions
2. Complete Questions 1-25 (batch 25)
3. ✅ **Verify:** "Continue from Question 26" shows
4. Click Continue
5. ✅ **Verify:** Only 1 question loads
6. Complete question
7. ✅ **Verify:** Chapter complete

### Edge Case 2: Exact Batch Multiple

1. Chapter with 100 questions
2. Batch size 25
3. Complete all 4 sessions
4. ✅ **Verify:** After session 4, chapter complete
5. ✅ **Verify:** No partial batch at end

### Edge Case 3: Chapter with 1 Question

1. Chapter with only 1 question
2. Complete quiz
3. ✅ **Verify:** Chapter complete immediately
4. ✅ **Verify:** Continue button never appears

---

## Integration Testing

### Full Workflow Test

1. **Create Chapter**
   - Add chapter "Data Structures"
   - Import 100 questions

2. **First Session**
   - Start quiz (batch 25, Practice mode)
   - Complete Questions 1-25
   - ✅ Progress saved

3. **Continue Session**
   - Click "Continue from Question 26"
   - Complete Questions 26-50
   - ✅ Progress updated

4. **Change Settings**
   - Click "Start Quiz"
   - Change batch to 50
   - Continue from Q51
   - Complete Questions 51-100
   - ✅ New settings saved

5. **Completion**
   - ✅ Chapter complete
   - ✅ Continue button gone
   - ✅ Can restart from beginning

---

## Acceptance Checklist

- [ ] Continue button shows when progress exists
- [ ] Continue button bypasses config modal
- [ ] Continue button uses saved configuration
- [ ] Continue button starts from correct question
- [ ] Next Batch button works on results page
- [ ] Progress persists across browser sessions
- [ ] Multiple chapters tracked independently
- [ ] Batch size changes remembered
- [ ] Quiz mode changes remembered
- [ ] Timer settings remembered
- [ ] Last batch can be smaller than batch size
- [ ] Continue button hides when complete
- [ ] localStorage errors handled gracefully
- [ ] Mobile responsive design works
- [ ] No performance issues with multiple chapters

---

## Success Criteria

✅ **All tests passing = Feature working correctly**

If all scenarios above work as expected, the Continue Chapter feature is functioning properly and ready for production use.

---

## Troubleshooting

### Issue: Continue button doesn't show

**Check:**
1. localStorage contains chapter progress
2. `last_question_index < chapter.question_count`
3. Chapter has questions
4. No localStorage parse errors in console

**Debug:**
```javascript
const progress = localStorage.getItem('recallx_chapter_progress')
console.log('Raw:', progress)
console.log('Parsed:', JSON.parse(progress))
```

### Issue: Wrong question number

**Check:**
1. Verify `last_question_index` value
2. Calculate: `nextStart = last_question_index + 1`
3. Check `last_batch_size`
4. Verify calculation: `nextEnd = Math.min(nextStart + batchSize - 1, total)`

**Debug:**
```javascript
const progress = JSON.parse(localStorage.getItem('recallx_chapter_progress'))
const chapterProgress = progress[chapterId]
console.log('Last index:', chapterProgress.last_question_index)
console.log('Next start:', chapterProgress.last_question_index + 1)
```

### Issue: Config not remembered

**Check:**
1. Verify `last_config` saved in localStorage
2. Check `mode`, `timer_mode`, `timer_value` values
3. Verify handleContinueChapter reads config correctly

**Debug:**
```javascript
const progress = JSON.parse(localStorage.getItem('recallx_chapter_progress'))
console.log('Saved config:', progress[chapterId].last_config)
```
