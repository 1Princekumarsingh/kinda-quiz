# Requirements Document

## Introduction

This feature extends the existing question import system to optionally support explanation text. The system will support two formats that users can choose between:

- **Format A (Existing)**: Question + Answer only - the current format with no explanations
- **Format B (New)**: Question + Answer + Explanation - enhanced format with optional explanation text

Explanations provide additional context, reasoning, or teaching content that helps users understand why an answer is correct or incorrect. The feature maintains full backward compatibility - existing question imports without explanations continue to work exactly as before. The implementation reuses and extends the existing parsing infrastructure rather than creating new parsers. Explanations will be displayed during practice mode after answer submission and in the review page after quiz completion, but only when present.

## Glossary

- **System**: The Kinda Quiz application (backend and frontend components)
- **Parser**: The backend text and DOCX parsing utility that extracts questions from input files
- **Question**: A quiz question entity containing question text, four options (A, B, C, D), correct answer, and optional explanation
- **Explanation**: Optional text that provides context, reasoning, or teaching content for why an answer is correct
- **Practice_Mode**: The interactive quiz-taking interface where users answer questions one at a time
- **Review_Page**: The post-quiz interface displaying all questions, correct answers, user responses, and correctness status
- **Import_Page**: The interface where users can paste text or upload DOCX files to import questions
- **Database**: The SQLAlchemy-based PostgreSQL database storing question data
- **Format_Guide**: Documentation displayed on the Import_Page showing users how to structure their question files

## Requirements

### Requirement 1: Database Schema Extension

**User Story:** As a developer, I want to add an explanation field to the Question model, so that questions can optionally store explanation text.

#### Acceptance Criteria

1. THE Database SHALL add an `explanation` column to the `questions` table with type String
2. THE Database SHALL allow the `explanation` column to be nullable (optional field)
3. THE Database SHALL preserve all existing question data during schema migration
4. WHEN the Question model's `to_dict()` method is called, THE Question SHALL include the `explanation` field in the returned dictionary
5. FOR ALL Question objects, the `explanation` field SHALL default to None when not provided

### Requirement 2: Parser Format Auto-Detection

**User Story:** As a user, I want to import questions with or without explanations using the same parser, so that I can choose either format without changing my workflow.

#### Acceptance Criteria

1. THE Parser SHALL extend the existing question parsing logic to detect the presence of "Explanation:" lines
2. WHEN a question block contains an "Explanation:" line after the "Answer:" line, THE Parser SHALL extract the explanation text
3. WHEN a question block does not contain an "Explanation:" line, THE Parser SHALL set the explanation field to None and continue processing normally
4. THE Parser SHALL recognize "Explanation:" as case-insensitive (Explanation:, explanation:, EXPLANATION:)
5. WHEN explanation text spans multiple lines, THE Parser SHALL concatenate all lines until the next question number or end of text
6. THE Parser SHALL trim leading and trailing whitespace from explanation text
7. FOR ALL valid questions parsed without explanations, parsing SHALL produce identical results to the current parsing behavior (complete backward compatibility)
8. THE Parser SHALL reuse existing question number detection, answer extraction, and validation logic

### Requirement 3: Parser Validation for Optional Explanations

**User Story:** As a user, I want the parser to validate explanation formatting when present, so that I receive feedback on malformed explanation entries while maintaining backward compatibility.

#### Acceptance Criteria

1. WHEN an "Explanation:" line is present but contains no text after the colon, THE Parser SHALL add a warning with type `empty_explanation`
2. WHEN explanation text exceeds 1000 characters, THE Parser SHALL add a warning with type `explanation_too_long`
3. THE Parser SHALL NOT treat missing explanations as errors or warnings (they are completely optional)
4. THE Parser SHALL maintain 100% backward compatibility with existing question format (Question + Answer only)
5. THE Parser SHALL NOT modify any existing validation rules for questions without explanations

### Requirement 4: ParsedQuestion Schema Update

**User Story:** As a developer, I want the ParsedQuestion dataclass to include explanation field, so that parsed questions can carry explanation data.

#### Acceptance Criteria

1. THE ParsedQuestion SHALL include an `explanation` field of type Optional[str]
2. WHEN the ParsedQuestion's `to_dict()` method is called, THE ParsedQuestion SHALL include the `explanation` field in the returned dictionary
3. THE ParsedQuestion SHALL default the `explanation` field to None when not provided

### Requirement 5: API Response Schema Update

**User Story:** As a frontend developer, I want the parse API to return explanation data, so that I can display explanations in the UI.

#### Acceptance Criteria

1. WHEN the POST /api/parse/text endpoint returns parsed questions, THE System SHALL include the `explanation` field for each question
2. WHEN the POST /api/parse/docx endpoint returns parsed questions, THE System SHALL include the `explanation` field for each question
3. THE API SHALL return `explanation: null` for questions without explanations
4. THE API SHALL return `explanation: <text>` for questions with explanations

### Requirement 6: Practice Mode Conditional Explanation Display

**User Story:** As a user, I want to see the explanation after submitting my answer in practice mode only when an explanation exists, so that I can learn from enhanced questions while experiencing no change for basic questions.

#### Acceptance Criteria

1. WHEN a user submits an answer in practice mode, THE System SHALL display whether the answer was correct or incorrect
2. WHEN a user submits an answer in practice mode, THE System SHALL display the correct answer
3. WHEN a question has an explanation (Format B) and the user submits an answer, THE Practice_Mode SHALL display the explanation text
4. WHEN a question does not have an explanation (Format A) and the user submits an answer, THE Practice_Mode SHALL NOT display an explanation section (maintains current UI exactly)
5. THE Practice_Mode SHALL visually distinguish the explanation from other feedback elements when present
6. THE Practice_Mode SHALL NOT modify the layout or appearance of feedback for Format A questions

### Requirement 7: Review Page Conditional Explanation Display

**User Story:** As a user, I want to see explanations on the review page after completing a quiz only when they exist, so that I can review enhanced questions while experiencing no change for basic questions.

#### Acceptance Criteria

1. WHEN a user views the review page after quiz completion, THE Review_Page SHALL display the question text for each question
2. WHEN a user views the review page, THE Review_Page SHALL display the correct answer for each question
3. WHEN a user views the review page, THE Review_Page SHALL display the user's submitted answer for each question
4. WHEN a user views the review page, THE Review_Page SHALL display whether each answer was correct or incorrect
5. WHEN a question has an explanation (Format B), THE Review_Page SHALL display the explanation text
6. WHEN a question does not have an explanation (Format A), THE Review_Page SHALL NOT display an explanation section (maintains current UI exactly)
7. THE Review_Page SHALL NOT modify the layout or appearance of question cards for Format A questions

### Requirement 8: Import Page Format Guide with Both Formats

**User Story:** As a user, I want to see clear documentation showing both format options, so that I can choose the format that works best for my needs.

#### Acceptance Criteria

1. WHEN a user navigates to the Import_Page, THE Format_Guide SHALL display examples of both question formats side-by-side or in clearly labeled sections
2. THE Format_Guide SHALL show Format A: Question + Answer (without explanation) - labeled as "Basic Format" or "Existing Format"
3. THE Format_Guide SHALL show Format B: Question + Answer + Explanation (with explanation) - labeled as "Enhanced Format" or "Format with Explanations"
4. THE Format_Guide SHALL explicitly state that users can choose either format
5. THE Format_Guide SHALL explain that explanations are completely optional
6. THE Format_Guide SHALL explain the delimiters and structure required for each format
7. THE Format_Guide SHALL include at least one complete example for Format A (without explanation)
8. THE Format_Guide SHALL include at least one complete example for Format B (with explanation)
9. THE Format_Guide SHALL emphasize that existing question files without explanations continue to work without any changes

### Requirement 9: Import Page Conditional Explanation Preview

**User Story:** As a user, I want to see parsed explanations in the preview cards only when they exist, so that the preview shows exactly what will be imported.

#### Acceptance Criteria

1. WHEN the parser successfully extracts an explanation, THE Import_Page SHALL display the explanation text in the question preview card
2. WHEN a question does not have an explanation, THE Import_Page SHALL NOT display an explanation section in the preview card (maintains current preview appearance)
3. WHEN an explanation has validation warnings, THE Import_Page SHALL display the warning icon and message
4. THE Import_Page SHALL visually distinguish explanations from other question fields in preview cards
5. THE Import_Page SHALL render preview cards for questions without explanations exactly as they appear currently (no layout changes for backward compatibility)

### Requirement 10: TypeScript Type Definitions

**User Story:** As a frontend developer, I want TypeScript types that include the explanation field, so that I have type safety when working with question data.

#### Acceptance Criteria

1. THE ParsedQuestion TypeScript interface SHALL include an `explanation?: string | null` field
2. THE Question TypeScript interface SHALL include an `explanation?: string | null` field
3. THE ValidationError TypeScript interface SHALL support `empty_explanation` and `explanation_too_long` error types

### Requirement 11: Backward Compatibility Guarantee

**User Story:** As an existing user, I want my current question imports to work exactly as before, so that I don't need to modify my existing question files or workflow.

#### Acceptance Criteria

1. WHEN a user imports questions using the existing Format A (Question + Answer only), THE System SHALL process them identically to the current behavior
2. THE System SHALL NOT require any changes to existing question files to continue working
3. THE System SHALL NOT display any new UI elements for questions without explanations (Practice_Mode and Review_Page remain unchanged for Format A questions)
4. THE System SHALL NOT change the API response structure for questions without explanations (explanation field is null, which TypeScript handles as optional)
5. FOR ALL existing question imports, the parsing success rate SHALL remain identical to current behavior
6. THE Parser SHALL NOT introduce any new errors or warnings for Format A questions
7. THE Database migration SHALL NOT modify any existing question data
8. WHEN a user views questions imported before this feature, THE System SHALL continue to display them exactly as before (no explanation section)
