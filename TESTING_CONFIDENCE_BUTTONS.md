# Testing Guide: Confidence Buttons Backend Integration

## Quick Start Testing

### 1. Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:5173`
- Database with at least one chapter containing questions
- Valid user account

### 2. Start Servers

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## Test Scenarios

### Scenario 1: Correct Answer + Mastered ✅

**Steps:**
1. Log in to the application
2. Navigate to a chapter
3. Click "Start Practice" (Practice Mode)
4. Answer a question **correctly**
5. Click **"Mastered"** button
6. Observe:
   - ✅ Button shows loading spinner briefly
   - ✅ Green success banner appears: "Status saved successfully"
   - ✅ Button remains highlighted in green
7. Open browser DevTools → Network tab
   - ✅ See `PATCH /api/questions/{id}/status` request
   - ✅ Request body: `{"status": "MASTERED"}`
   - ✅ Response: 200 OK
8. Check database:
   ```sql
   SELECT id, question_text, status FROM questions WHERE id = ?;
   ```
   - ✅ Status should be `MASTERED`

**Expected Result:** Backend status = `MASTERED`

---

### Scenario 2: Correct Answer + Review ✅

**Steps:**
1. Answer a question **correctly**
2. Click **"Review"** button
3. Observe:
   - ✅ Button shows loading spinner
   - ✅ Success banner appears
   - ✅ Button highlighted in blue

**Expected Result:** Backend status = `REVIEW`

---

### Scenario 3: Correct Answer + Almost Forgot ✅

**Steps:**
1. Answer a question **correctly**
2. Click **"Almost Forgot"** button
3. Observe:
   - ✅ Button shows loading spinner
   - ✅ Success banner appears
   - ✅ Button highlighted in yellow

**Expected Result:** Backend status = `ALMOST_FORGOT`

---

### Scenario 4: Incorrect Answer + Any Confidence ⚠️

**Steps:**
1. Answer a question **incorrectly**
2. Notice: Your wrong answer is highlighted in red
3. Click **"Mastered"** button (or any confidence)
4. Observe:
   - ✅ Button shows loading spinner
   - ✅ Success banner appears
   - ✅ "Mastered" button highlighted (frontend)
5. Check database:
   ```sql
   SELECT id, question_text, status FROM questions WHERE id = ?;
   ```
   - ✅ Status should be `ERROR` (NOT "MASTERED")

**Expected Result:** Backend status = `ERROR` (incorrect always overrides confidence)

**Why?** Per SPEC.md: "User answers incorrectly → Status = ERROR (overrides confidence)"

---

### Scenario 5: Network Error Handling ❌

**Steps:**
1. Open DevTools → Network tab
2. Enable "Offline" mode (or throttle to offline)
3. Answer a question correctly
4. Click any confidence button
5. Observe:
   - ✅ Button shows loading spinner
   - ✅ Red error banner appears: "Failed to save"
   - ✅ Error message: "Failed to update question status"
   - ✅ Error auto-dismisses after 5 seconds
6. Disable offline mode
7. Click the confidence button again
8. Observe:
   - ✅ Request succeeds
   - ✅ Green success banner appears

**Expected Result:** Graceful error handling with retry capability

---

### Scenario 6: Multiple Button Clicks

**Steps:**
1. Answer a question correctly
2. Quickly click "Mastered" → "Review" → "Almost Forgot"
3. Observe:
   - ✅ Only last button remains highlighted
   - ✅ Only one API call completes (last one)
   - ✅ Database reflects last selection

**Expected Result:** No race conditions, last click wins

---

### Scenario 7: Navigate Before Save Completes

**Steps:**
1. Answer a question correctly
2. Click "Mastered" button
3. **Immediately** click "Next Question" (before spinner disappears)
4. Observe:
   - ✅ Navigation happens immediately
   - ✅ No error on next question
   - ✅ No stale success banner
5. Check database for previous question
   - ✅ Status should still be updated (API call completed in background)

**Expected Result:** Navigation doesn't break pending API calls

---

### Scenario 8: Exam Mode (No Confidence Buttons)

**Steps:**
1. Start a quiz in **Exam Mode**
2. Answer questions
3. Submit quiz
4. Observe:
   - ✅ No confidence buttons appear during quiz
   - ✅ Feedback only shown after submission
   - ❌ Status NOT updated during quiz (feature not yet implemented)

**Expected Result:** Confidence buttons only in Practice Mode

---

## Browser Console Checks

### Success Case Console Output:
```
Status updated successfully: {
  question_id: 123,
  status: "MASTERED",
  message: "Status updated to MASTERED"
}
```

### Error Case Console Output:
```
Failed to update status: Error: Network Error
```

---

## Database Verification Queries

### Check Individual Question Status
```sql
SELECT 
  id,
  question_number,
  question_text,
  correct_answer,
  status,
  times_attempted,
  times_correct,
  times_wrong,
  updated_at
FROM questions
WHERE id = 123;
```

### Check Status Distribution for Chapter
```sql
SELECT 
  status,
  COUNT(*) as count
FROM questions
WHERE chapter_id = 1
GROUP BY status
ORDER BY status;
```

Expected output after testing:
```
| status        | count |
|---------------|-------|
| NEW           | 45    |
| MASTERED      | 5     |
| REVIEW        | 3     |
| ALMOST_FORGOT | 2     |
| ERROR         | 5     |
```

### Check Recently Updated Questions
```sql
SELECT 
  id,
  question_number,
  status,
  updated_at
FROM questions
WHERE chapter_id = 1
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

## API Testing with cURL

### Test Single Status Update
```bash
# Get JWT token first (from login)
TOKEN="your_jwt_token_here"

# Update question status
curl -X PATCH http://localhost:8000/api/questions/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "MASTERED"}'
```

**Expected Response:**
```json
{
  "question_id": 1,
  "status": "MASTERED",
  "message": "Status updated to MASTERED"
}
```

### Test Invalid Status
```bash
curl -X PATCH http://localhost:8000/api/questions/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "INVALID"}'
```

**Expected Response:**
```json
{
  "detail": [
    {
      "loc": ["body", "status"],
      "msg": "Status must be one of: NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR",
      "type": "value_error"
    }
  ]
}
```

---

## Mobile Testing

### Responsive Design Check
1. Open DevTools → Toggle device toolbar
2. Select iPhone 12 Pro (or similar)
3. Navigate through quiz
4. Answer questions and click confidence buttons
5. Verify:
   - ✅ Buttons stack vertically on mobile
   - ✅ Touch targets are adequate (44x44px minimum)
   - ✅ Loading spinners visible
   - ✅ Success/error banners readable
   - ✅ Text doesn't overflow

---

## Performance Testing

### Measure API Response Time
1. Open DevTools → Network tab
2. Click confidence button
3. Check the `PATCH` request timing
4. Verify:
   - ✅ Response time < 500ms (typically ~50-200ms)
   - ✅ No unnecessary requests
   - ✅ Proper caching headers

### Check for Memory Leaks
1. Complete 10+ questions in one quiz session
2. Open DevTools → Performance Monitor
3. Verify:
   - ✅ No continuous memory growth
   - ✅ Event listeners properly cleaned up
   - ✅ No console warnings

---

## Accessibility Testing

### Keyboard Navigation
1. Use Tab key to navigate to confidence buttons
2. Press Enter/Space to activate
3. Verify:
   - ✅ Buttons are keyboard accessible
   - ✅ Focus visible on all interactive elements
   - ✅ Loading state announced to screen readers

### Screen Reader Testing (Optional)
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate through quiz
3. Verify:
   - ✅ Confidence buttons have descriptive labels
   - ✅ Success/error messages announced
   - ✅ Loading state announced

---

## Troubleshooting

### Issue: "Failed to save" error appears

**Possible Causes:**
1. Backend server not running
2. JWT token expired
3. Question doesn't exist
4. User doesn't own the question

**Debug Steps:**
1. Check backend logs
2. Verify token in localStorage
3. Check question ownership in database
4. Test API endpoint directly with cURL

### Issue: Spinner doesn't disappear

**Possible Causes:**
1. API request hanging
2. Network timeout
3. Backend not responding

**Debug Steps:**
1. Check Network tab for pending requests
2. Check backend logs for errors
3. Restart backend server
4. Clear browser cache

### Issue: Wrong status saved

**Possible Causes:**
1. Logic error in `handleConfidenceSelect`
2. Race condition with multiple clicks

**Debug Steps:**
1. Add console.log before API call
2. Verify status mapping logic
3. Check database directly
4. Review Network tab request payload

---

## Test Checklist Summary

- [ ] Correct + Mastered → Backend: MASTERED
- [ ] Correct + Review → Backend: REVIEW
- [ ] Correct + Almost Forgot → Backend: ALMOST_FORGOT
- [ ] Incorrect + Any → Backend: ERROR
- [ ] Loading spinner shows during API call
- [ ] Success banner appears on success
- [ ] Error banner appears on failure
- [ ] Error auto-dismisses after 5 seconds
- [ ] Can retry after error
- [ ] Multiple clicks handled correctly
- [ ] Navigation during save works
- [ ] Exam mode has no confidence buttons
- [ ] Mobile responsive design works
- [ ] Keyboard navigation works
- [ ] Database updates verified

---

## Success Criteria

✅ **All tests passing = Feature is working correctly**

If all scenarios above work as expected, the confidence buttons backend integration is functioning properly and ready for production use.
