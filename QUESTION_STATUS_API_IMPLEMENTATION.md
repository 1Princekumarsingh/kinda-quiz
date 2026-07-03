# Question Status API Implementation

**Date**: 2024-07-03  
**Feature**: Backend APIs for question status management

---

## Overview

Implemented backend API endpoints for updating question statuses. Supports all five status types: NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR.

---

## API Endpoints

### 1. Update Single Question Status

**Endpoint**: `PATCH /api/questions/{question_id}/status`

**Description**: Update the status of a single question

**Authentication**: Required (JWT token)

**Authorization**: User must own the question (through chapter → subject)

**Request Body**:
```json
{
  "status": "MASTERED"
}
```

**Valid Status Values**:
- `NEW`
- `MASTERED`
- `REVIEW`
- `ALMOST_FORGOT`
- `ERROR`

**Response** (200 OK):
```json
{
  "question_id": 1,
  "status": "MASTERED",
  "message": "Status updated to MASTERED"
}
```

**Error Responses**:
- `400 Bad Request` - Invalid status value
- `404 Not Found` - Question not found or user doesn't own it
- `500 Internal Server Error` - Database error

---

### 2. Bulk Update Question Statuses

**Endpoint**: `PATCH /api/questions/status/bulk`

**Description**: Update statuses for multiple questions in a single request

**Authentication**: Required (JWT token)

**Authorization**: User must own all questions (through chapter → subject)

**Request Body**:
```json
{
  "updates": [
    {"question_id": 1, "status": "MASTERED"},
    {"question_id": 2, "status": "REVIEW"},
    {"question_id": 3, "status": "ERROR"},
    {"question_id": 4, "status": "ALMOST_FORGOT"}
  ]
}
```

**Response** (200 OK):
```json
{
  "updated_count": 3,
  "failed_count": 1,
  "updates": [
    {
      "question_id": 1,
      "status": "MASTERED",
      "message": "Status updated to MASTERED"
    },
    {
      "question_id": 2,
      "status": "REVIEW",
      "message": "Status updated to REVIEW"
    },
    {
      "question_id": 3,
      "status": "ERROR",
      "message": "Status updated to ERROR"
    },
    {
      "question_id": 4,
      "status": "",
      "message": "Question not found or access denied"
    }
  ],
  "message": "Successfully updated 3 question status(es), 1 failed"
}
```

**Behavior**:
- Processes all updates in a single database transaction
- Partial success supported: continues processing even if some updates fail
- Returns detailed status for each update attempt
- Commits all successful updates at once
- Rolls back on critical errors

**Error Responses**:
- `400 Bad Request` - Invalid request format or empty updates list
- `500 Internal Server Error` - Database error

---

## Schema Updates

### New Request Schemas

#### QuestionStatusUpdate
```python
class QuestionStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(NEW|MASTERED|REVIEW|ALMOST_FORGOT|ERROR)$")
```

**Validation**:
- Status must match one of the five valid values
- Case-insensitive (automatically converted to uppercase)
- Whitespace trimmed

#### QuestionBulkStatusUpdate
```python
class QuestionBulkStatusUpdate(BaseModel):
    updates: List[dict] = Field(..., description="List of {question_id, status} objects")
```

**Validation**:
- Updates list cannot be empty
- Each update must have `question_id` (int) and `status` (string)
- All statuses validated against allowed values
- question_id must be an integer

---

### New Response Schemas

#### StatusUpdateResponse
```python
class StatusUpdateResponse(BaseModel):
    question_id: int
    status: str
    message: str
```

#### BulkStatusUpdateResponse
```python
class BulkStatusUpdateResponse(BaseModel):
    updated_count: int
    failed_count: int
    updates: List[StatusUpdateResponse]
    message: str
```

---

## Status Enum

Using existing `QuestionStatus` enum from the Question model:

```python
class QuestionStatus(enum.Enum):
    NEW = "NEW"
    MASTERED = "MASTERED"
    REVIEW = "REVIEW"
    ALMOST_FORGOT = "ALMOST_FORGOT"
    ERROR = "ERROR"
```

---

## Security & Authorization

### Ownership Verification
- All endpoints verify user owns the question
- Ownership chain: User → Subject → Chapter → Question
- SQL joins ensure data isolation
- 404 returned if question not found OR user doesn't own it (prevents information leakage)

### Authentication
- JWT token required in Authorization header
- Token validated via `get_current_user` dependency
- Expired/invalid tokens rejected

---

## Database Operations

### Single Update
1. Query question with ownership verification (JOIN through chapter → subject)
2. Update status using enum value
3. Commit transaction
4. Refresh question object
5. Return updated status

### Bulk Update
1. Iterate through all updates
2. For each: verify ownership, update status
3. Track success/failure counts
4. Commit all updates in single transaction
5. Rollback on critical error
6. Return detailed results for each update

### Transaction Safety
- Single updates: Automatic rollback on error
- Bulk updates: All-or-nothing transaction for successful updates
- Partial failures handled gracefully (continue processing)

---

## Usage Examples

### Single Status Update with cURL

```bash
curl -X PATCH http://localhost:8000/api/questions/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "MASTERED"}'
```

### Bulk Status Update with cURL

```bash
curl -X PATCH http://localhost:8000/api/questions/status/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"question_id": 1, "status": "MASTERED"},
      {"question_id": 2, "status": "REVIEW"},
      {"question_id": 3, "status": "ERROR"}
    ]
  }'
```

### Python Requests Example

```python
import requests

# Single update
response = requests.patch(
    "http://localhost:8000/api/questions/1/status",
    headers={"Authorization": f"Bearer {token}"},
    json={"status": "MASTERED"}
)

# Bulk update
response = requests.patch(
    "http://localhost:8000/api/questions/status/bulk",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "updates": [
            {"question_id": 1, "status": "MASTERED"},
            {"question_id": 2, "status": "REVIEW"}
        ]
    }
)
```

---

## Status Transition Logic (Not Implemented Yet)

The API accepts any status transition. Business logic for status transitions should be implemented in the frontend:

**Practice Mode Rules**:
- Correct + Mastered → MASTERED
- Correct + Review → REVIEW
- Correct + Almost Forgot → ALMOST_FORGOT
- Incorrect (any confidence) → ERROR

**Exam Mode Rules**:
- Correct + Previous ERROR → REVIEW
- Correct + Other status → Maintain status
- Incorrect → ERROR

---

## Files Modified

1. **`backend/app/schemas/question.py`**
   - Added `QuestionStatusUpdate` schema
   - Added `QuestionBulkStatusUpdate` schema
   - Added `StatusUpdateResponse` schema
   - Added `BulkStatusUpdateResponse` schema

2. **`backend/app/api/questions.py`**
   - Imported `QuestionStatus` enum
   - Imported new schemas
   - Added `update_question_status` endpoint (PATCH /{question_id}/status)
   - Added `bulk_update_question_status` endpoint (PATCH /status/bulk)

---

## Testing Checklist

### Manual Testing

- [ ] Single status update with valid status
- [ ] Single status update with invalid status (should return 400)
- [ ] Single status update for non-existent question (should return 404)
- [ ] Single status update for question user doesn't own (should return 404)
- [ ] Bulk update with all valid questions
- [ ] Bulk update with mix of valid/invalid questions
- [ ] Bulk update with all invalid question IDs
- [ ] Case insensitivity (lowercase "mastered" → "MASTERED")
- [ ] Whitespace handling in status values
- [ ] Authentication required (no token → 401)
- [ ] Authorization enforced (wrong user → 404)

### Status Values
- [ ] NEW status update works
- [ ] MASTERED status update works
- [ ] REVIEW status update works
- [ ] ALMOST_FORGOT status update works
- [ ] ERROR status update works

---

## API Documentation

Endpoints automatically documented in FastAPI's OpenAPI schema:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Frontend Integration (Not Implemented)

To connect frontend confidence buttons:

1. After user selects confidence in Practice Mode
2. Determine status based on correctness + confidence
3. Call `PATCH /api/questions/{question_id}/status`
4. Handle response/errors
5. Update local state

For quiz completion:

1. Collect all question status updates
2. Call `PATCH /api/questions/status/bulk`
3. Single request for entire quiz
4. More efficient than individual updates

---

## Performance Considerations

### Single Updates
- Direct query with joins
- Minimal overhead
- Suitable for real-time updates

### Bulk Updates
- Single transaction for all updates
- Reduced database roundtrips
- Recommended for quiz completion
- Can handle 100+ updates efficiently

### Indexing
- Question.id (primary key) - indexed
- Chapter.id (foreign key) - indexed
- Subject.user_id - indexed
- Efficient ownership verification queries

---

## Error Handling

### Validation Errors
- Invalid status values caught by schema validation
- Returns 400 with clear error message
- Lists valid status values

### Ownership Errors
- Returns 404 (not 403) to prevent information leakage
- Same response whether question doesn't exist or user doesn't own it

### Database Errors
- Automatic transaction rollback
- Returns 500 with generic error message
- Detailed error logged server-side

---

## Future Enhancements (Not Implemented)

1. **Status History Tracking**
   - Store status transitions with timestamps
   - Track who changed status (already have user context)
   - Enable status rollback

2. **Status Statistics**
   - Aggregate status counts per chapter
   - Track status transition patterns
   - Performance analytics

3. **Batch Size Optimization**
   - Chunk large bulk updates (>1000 questions)
   - Progress tracking for long operations
   - Async processing for very large batches

4. **Webhooks/Events**
   - Emit events on status changes
   - Enable real-time UI updates
   - Integration with analytics systems

---

**Status**: Backend API implementation complete ✅  
**Frontend Integration**: Not implemented ⏳  
**Testing**: Manual testing required ⏳
