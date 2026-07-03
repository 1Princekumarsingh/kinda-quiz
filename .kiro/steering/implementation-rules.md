---
inclusion: auto
---

# Implementation Rules

## Batch Size Limits

When implementing any batch or task:

- **Never modify more than 10 files in a single response**
- **Never generate more than approximately 800 lines of code in one response**
- If the implementation exceeds either limit, **stop immediately and ask to split the batch**
- Prefer multiple small commits over one large implementation
- Every batch must leave the project in a **compilable and runnable state**
- Never leave partially implemented features that break the application

## Safe Implementation Practices

- **Test after every batch** - Run the application and verify it works before proceeding
- **Fix bugs immediately** - Don't defer bug fixes to a "testing batch"
- **Incremental changes** - Add features piece by piece, not all at once
- **Rollback plan** - Ensure you can undo changes if something goes wrong

## When to Stop and Split

Stop and ask the user to split the batch if:
- File count approaching 10 files
- Code generation approaching 800 lines
- Implementation feels too complex for single step
- Multiple unrelated concerns being addressed
- Risk of breaking existing functionality

## AI Implementation Workflow

### Before Implementing Any Batch

1. **Estimate the scope:**
   - Number of files to be modified
   - Approximate lines of code to generate
   - Risk level (low/medium/high)

2. **If any of the following are true, STOP and propose splitting:**
   - More than 10 files to modify
   - More than 800 lines of code to generate
   - Implementation touches both frontend and backend extensively
   - Multiple unrelated concerns being addressed
   - High complexity or risk level

3. **Propose the split:**
   - Explain why the batch is too large
   - Suggest how to split it (e.g., "Split into Batch 7A and 7B")
   - Wait for user confirmation before proceeding

### After Implementation

1. **Verify compilation:**
   - Ensure the project compiles without errors
   - Check for TypeScript/linting errors

2. **Run existing tests:**
   - Ensure existing tests still pass (if any exist)
   - Report any test failures immediately

3. **Document changes:**
   - List all modified files
   - Summarize what was changed in each file

4. **Provide testing instructions:**
   - Explain how to manually test the batch
   - List specific features/behaviors to verify
   - Provide example commands or steps

5. **Stop and wait:**
   - Do NOT continue to the next batch automatically
   - Wait for user to verify the batch works
   - Wait for user to explicitly request the next batch

### Example Batch Completion Message

```
✅ Batch X Complete

Files Modified (3):
- backend/app/models/quiz_attempt.py (added 45 lines)
- backend/app/schemas/quiz_attempt.py (added 67 lines)
- backend/alembic/versions/006_extend_quiz_attempts.py (new file, 89 lines)

Compilation Status: ✅ Success

Testing Instructions:
1. Run backend: cd backend && uvicorn app.main:app --reload
2. Verify no startup errors
3. Test migration: alembic upgrade head
4. Test API endpoint: curl -X POST http://localhost:8000/api/quiz-attempts ...

Ready for next batch? (Please verify the above works first)
```

## Why These Limits

- **Context management** - Keeps AI responses focused and manageable
- **Error prevention** - Smaller changes = easier debugging
- **Review quality** - User can review changes more effectively
- **Credit efficiency** - Prevents wasted tokens on large failed attempts
- **Project stability** - Maintains working state throughout development
- **User control** - User verifies each step before proceeding
