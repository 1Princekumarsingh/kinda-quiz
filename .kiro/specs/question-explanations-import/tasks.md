# Implementation Plan: Question Explanations Import

## Overview

This feature extends the existing question import system to support optional explanation text. The implementation follows a minimal-change approach: extend existing parsers, add a nullable database column, and conditionally render explanations in the UI. The system maintains 100% backward compatibility—questions without explanations continue to work exactly as before.

## Tasks

- [ ] 1. Database schema and model changes
  - [ ] 1.1 Create Alembic migration to add explanation column
    - Generate migration file with `alembic revision --autogenerate -m "Add explanation column to questions"`
    - Add nullable `explanation` column of type String to `questions` table
    - Test migration on development database
    - Verify all existing records preserved
    - Test rollback functionality
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 1.2 Update Question model to include explanation field
    - Add `explanation = Column(String, nullable=True)` to Question model in `backend/app/models/question.py`
    - Update `to_dict()` method to include `explanation` field
    - Set default value to None
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [ ]* 1.3 Write property test for explanation field serialization
    - **Property 1: Explanation Field Serialization**
    - **Validates: Requirements 1.4, 4.2**
    - Test that `to_dict()` always includes `explanation` field with correct value (text or None)
  
  - [ ]* 1.4 Write property test for default value initialization
    - **Property 2: Default Value Initialization**
    - **Validates: Requirements 1.5, 4.3**
    - Test that Question/ParsedQuestion objects default `explanation` to None when not provided
  
  - [ ]* 1.5 Write unit tests for Question model changes
    - Test `to_dict()` includes explanation field
    - Test default None value
    - Test database CRUD operations with explanation

- [ ] 2. Extend parser to detect and extract explanations
  - [ ] 2.1 Add explanation pattern and parsing logic to QuestionParser
    - Add `EXPLANATION_PATTERN = re.compile(r'^Explanation:\s*(.*)$', re.IGNORECASE)` to `backend/app/utils/question_parser.py`
    - Extend `_parse_single_question()` method after answer parsing (around line 180-190)
    - Implement explanation detection: check for "Explanation:" line after answer
    - Extract explanation text (everything after "Explanation:")
    - Handle multi-line explanations: continue reading until next question or EOF
    - Concatenate multi-line explanations with spaces
    - Trim leading/trailing whitespace
    - Set `explanation = None` when no "Explanation:" line found
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.8_
  
  - [ ] 2.2 Add validation logic for explanations
    - Check if "Explanation:" line exists but is empty (no text after colon)
    - Add warning with type `empty_explanation` if empty
    - Check if explanation exceeds 1000 characters
    - Add warning with type `explanation_too_long` if too long (include character count)
    - Ensure missing explanations do not generate warnings
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 2.3 Update ParsedQuestion dataclass to include explanation
    - Add `explanation: Optional[str] = None` field to ParsedQuestion in `backend/app/utils/question_parser.py`
    - Update `to_dict()` method to include `explanation` field
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 2.4 Write property test for backward compatibility preservation
    - **Property 3: Backward Compatibility Preservation**
    - **Validates: Requirements 2.3, 2.7, 3.3, 3.4, 11.1-11.6**
    - Test that Format A questions (without explanation) parse identically to current behavior
    - Verify `explanation = None` and no errors/warnings for missing explanations
  
  - [ ]* 2.5 Write property test for explanation detection and extraction
    - **Property 4: Explanation Detection and Extraction**
    - **Validates: Requirements 2.1, 2.2, 2.5**
    - Test that parser detects "Explanation:" line and extracts text correctly
    - Test multi-line explanation concatenation
  
  - [ ]* 2.6 Write property test for case-insensitive explanation recognition
    - **Property 5: Case-Insensitive Explanation Recognition**
    - **Validates: Requirements 2.4**
    - Test that parser recognizes all case variations (Explanation:, explanation:, EXPLANATION:)
  
  - [ ]* 2.7 Write property test for multi-line explanation concatenation
    - **Property 6: Multi-Line Explanation Concatenation**
    - **Validates: Requirements 2.5**
    - Test that multi-line explanations are concatenated with spaces correctly
  
  - [ ]* 2.8 Write property test for whitespace trimming
    - **Property 7: Whitespace Trimming**
    - **Validates: Requirements 2.6**
    - Test that leading/trailing whitespace is removed from explanation text
  
  - [ ]* 2.9 Write property test for existing validation preservation
    - **Property 8: Existing Validation Preservation**
    - **Validates: Requirements 3.5**
    - Test that existing validation errors remain identical for Format A questions
  
  - [ ]* 2.10 Write unit tests for parser edge cases
    - Test empty explanation detection
    - Test explanation length validation at boundaries (999, 1000, 1001 chars)
    - Test Format A parsing (specific examples)
    - Test Format B parsing (specific examples)
    - Test case variations (specific cases)

- [ ] 3. Checkpoint - Ensure backend parsing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Update API schemas and verify responses
  - [ ] 4.1 Update API response schemas to include explanation
    - Update schema definitions in `backend/app/schemas/question.py` (if exists)
    - Add optional `explanation` field to question schemas
    - Verify parse endpoints automatically include explanation in responses
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 4.2 Write API integration tests for explanation support
    - Test POST /api/parse/text with Format A questions (explanation null)
    - Test POST /api/parse/text with Format B questions (explanation present)
    - Test POST /api/parse/docx with both formats
    - Verify API response structure includes explanation field

- [ ] 5. Frontend TypeScript types and interfaces
  - [ ] 5.1 Update TypeScript type definitions
    - Add `explanation?: string | null` to ParsedQuestion interface in `frontend/src/types/parse.ts`
    - Add `explanation?: string | null` to Question interface in `frontend/src/types/question.ts`
    - Update ValidationError interface to support `empty_explanation` and `explanation_too_long` types
    - Verify TypeScript compilation succeeds
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 6. Import page conditional explanation display
  - [ ] 6.1 Update import preview cards to conditionally show explanations
    - Add conditional rendering for explanation section in preview cards
    - Display explanation text only when `explanation` field is present
    - Ensure questions without explanations maintain current preview appearance
    - Add visual distinction for explanation section (styling)
    - Display validation warnings for explanation issues
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 6.2 Update format guide to show both Format A and Format B
    - Add side-by-side or clearly labeled sections for both formats
    - Show Format A example: "Basic Format" (without explanation)
    - Show Format B example: "Enhanced Format with Explanations" (with explanation)
    - Explain that explanations are completely optional
    - Explain delimiters and structure for both formats
    - Emphasize backward compatibility (existing files continue to work)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_
  
  - [ ]* 6.3 Write unit tests for import page components
    - Test preview card with explanation
    - Test preview card without explanation
    - Test format guide displays both formats

- [ ] 7. Practice mode conditional explanation display
  - [ ] 7.1 Update practice mode feedback to conditionally show explanations
    - Add conditional rendering for explanation section after answer submission
    - Display explanation text only when `question.explanation` is present
    - Ensure questions without explanations maintain current feedback UI
    - Add visual distinction for explanation section (styling)
    - Maintain layout consistency between Format A and Format B questions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 7.2 Write unit tests for practice mode feedback
    - Test feedback display with explanation
    - Test feedback display without explanation
    - Verify no layout changes for Format A questions

- [ ] 8. Review page conditional explanation display
  - [ ] 8.1 Update review page question cards to conditionally show explanations
    - Add conditional rendering for explanation section in question cards
    - Display explanation text only when `question.explanation` is present
    - Ensure questions without explanations maintain current review page UI
    - Add visual distinction for explanation section (styling)
    - Maintain layout consistency between Format A and Format B questions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 8.2 Write unit tests for review page components
    - Test question card with explanation
    - Test question card without explanation
    - Verify no layout changes for Format A questions

- [ ] 9. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. End-to-end integration testing
  - [ ]* 10.1 Write end-to-end test for import flow
    - Upload text file with mixed Format A and Format B questions
    - Verify preview shows explanations correctly
    - Verify database stores questions with correct explanation values
    - Verify questions without explanations have NULL in database
  
  - [ ]* 10.2 Write end-to-end test for practice mode flow
    - Start practice session with mixed format questions
    - Answer question with explanation, verify explanation displays
    - Answer question without explanation, verify no explanation section
    - Verify layout consistency
  
  - [ ]* 10.3 Write end-to-end test for review page flow
    - Complete quiz with mixed format questions
    - View review page
    - Verify explanations display for Format B questions only
    - Verify layout consistency

- [x] 11. Final checkpoint and backward compatibility verification
  - Run all relevant backend and frontend verification suites
  - Verify database migration preserves existing data
  - Test import of existing question files (Format A)
  - Verify questions without explanations display identically to the current UI
  - Test API responses with legacy questions (explanation should be null)
  - Verify no new errors/warnings for Format A questions
  - Test rollback scenario
  - Confirmed via backend pytest and targeted frontend Vitest coverage

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation extends existing code rather than rewriting
- Property tests validate universal correctness properties (8 properties total)
- Unit tests validate specific examples and edge cases
- Backward compatibility is critical: Format A questions must work identically to current behavior
- The design uses Python (SQLAlchemy, Alembic) for backend and TypeScript/React for frontend

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"] },
    { "id": 5, "tasks": ["4.1"] },
    { "id": 6, "tasks": ["4.2", "5.1"] },
    { "id": 7, "tasks": ["6.1", "6.2"] },
    { "id": 8, "tasks": ["6.3", "7.1"] },
    { "id": 9, "tasks": ["7.2", "8.1"] },
    { "id": 10, "tasks": ["8.2"] },
    { "id": 11, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
