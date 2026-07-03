# SPEC.md

## Application Overview

### Application Name
**RecallX** (working title, can be changed)

### Purpose
RecallX is a personal MCQ practice and active recall learning platform designed for students preparing for competitive exams, college exams, certifications, or interviews. Unlike flashcard-focused apps (Anki) or generic quiz platforms (Quizlet), RecallX provides a specialized workflow for large MCQ banks with mistake tracking, structured chapter-wise revision, and comprehensive analytics.

### Problem Statement
Students often practice MCQs from books or PDFs but lack:
- Organized question banks by subject and chapter
- Automatic mistake tracking and status management
- Structured revision based on performance
- Progress analytics and study insights
- Flexible quiz modes (practice vs exam simulation)

### Core Value Proposition
RecallX is NOT a generic quiz application. It is a **personal study and revision platform** that helps students:
- Efficiently organize and practice large MCQ banks
- Track mistakes automatically (no manual tagging)
- Focus revision on weak areas (Review, Almost Forgot, Error questions)
- Continuously improve through active recall
- Analyze progress with detailed statistics

---

## Target Users

### Primary Users

1. **College Students**: Preparing for semester exams across multiple subjects
2. **Competitive Exam Aspirants**: Practicing for entrance exams (GATE, CAT, GRE, etc.)
3. **Interview Preparation Students**: Practicing technical interview questions
4. **Self-Learners**: Building knowledge through structured practice

### User Characteristics
- Tech-savvy students comfortable with web applications
- Motivated to track and improve their performance
- Managing large question banks (100-10,000+ questions per subject)
- Need flexible study sessions (10-100 questions at a time)
- Want data-driven insights into their learning

### User Roles
**Version 1**: Single role only - **Student**
- No admin users
- Each user manages only their own data
- Complete data isolation between users

---

## Application Hierarchy

```
User
  ├── Subject 1 (e.g., Data Structures & Algorithms)
  │     ├── Chapter 1 (e.g., Arrays)
  │     │     └── Questions (1-N)
  │     ├── Chapter 2 (e.g., Linked Lists)
  │     │     └── Questions (1-N)
  │     └── Chapter N
  │           └── Questions (1-N)
  ├── Subject 2 (e.g., Operating Systems)
  │     └── Chapters...
  └── Subject N
        └── Chapters...
```

### Hierarchy Rules

- **User** owns multiple **Subjects**
- **Subject** contains multiple **Chapters**
- **Chapter** contains multiple **Questions**
- **Questions** belong to exactly one **Chapter**
- **Deleting Subject** cascades to all Chapters and Questions
- **Deleting Chapter** cascades to all Questions
- **No orphaned data** - referential integrity enforced

---

## Feature Specifications

### 1. Authentication

#### Overview
Username-only authentication with automatic account creation. No email, no password reset, no OAuth.

#### User Flow
1. User visits application
2. If not authenticated → redirect to Login page
3. User enters username
4. If username exists → login
5. If username doesn't exist → create account automatically and login
6. Issue JWT token (7-day expiry)
7. Redirect to Dashboard
8. Token stored in localStorage
9. Token sent in Authorization header for all protected requests

#### Technical Requirements
- Username validation: alphanumeric and underscores only
- Username length: 1-50 characters
- JWT payload: `{"sub": "username", "exp": timestamp}`
- Token refresh: Manual re-login after expiry
- Logout: Clear token from localStorage
- Protected routes: Verify token on backend, redirect on frontend

#### Acceptance Criteria

- [x] User can log in with username only
- [x] Account automatically created if username doesn't exist
- [x] JWT token issued on successful authentication
- [x] Token stored securely in localStorage
- [x] Token validated on every protected API request
- [x] User redirected to login if token invalid/expired
- [x] Logout clears token and redirects to login

#### Edge Cases
- Username contains special characters → Show validation error
- Token expires during session → Redirect to login on next API call
- Multiple tabs → Token shared via localStorage
- User manually clears localStorage → Treated as logged out

---

### 2. Subject Management

#### Overview
Users organize their study materials into subjects (e.g., DSA, Operating Systems, DBMS, Machine Learning).

#### CRUD Operations
**Create Subject**
- User clicks "Add Subject"
- Modal opens with form
- User enters subject name
- System validates (not empty)
- System creates subject associated with user
- System redirects to subject detail or subjects list

**Read Subjects**
- Display all subjects for authenticated user
- Show subject name, chapter count, question count, completion %

- Sortable and searchable
- Grid or list view

**Update Subject**
- User clicks edit icon
- Modal opens pre-filled with current name
- User updates name
- System validates and saves
- UI updates immediately

**Delete Subject**
- User clicks delete icon
- Confirmation modal appears (warning about cascade)
- User confirms
- System deletes subject and all associated chapters/questions
- UI updates immediately

#### Acceptance Criteria
- [x] User can create unlimited subjects
- [x] Subject names can be duplicated (per user)
- [x] Subject list shows only authenticated user's subjects
- [x] Deleting subject deletes all chapters and questions (cascade)
- [x] Subject displays aggregate statistics (chapter count, question count)

#### Edge Cases
- Empty subject name → Validation error
- Delete subject with 1000+ questions → Confirm cascade warning
- Create subject while another is loading → Queue requests

---

### 3. Chapter Management

#### Overview

Each subject contains multiple chapters. Chapters are independent question banks.

#### CRUD Operations
Similar to subjects, but scoped within a subject.

**Create Chapter**
- User navigates to subject detail
- Clicks "Add Chapter"
- Enters chapter name
- System creates chapter under current subject

**Read Chapters**
- Display all chapters for a subject
- Show chapter name, question count, completion %, accuracy

**Update Chapter**
- Edit chapter name
- Edit metadata (future: difficulty, priority)

**Delete Chapter**
- Confirmation required
- Cascades to all questions in chapter

#### Chapter Detail View
- Question count
- Statistics (NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR counts)
- Accuracy percentage
- Last practiced date
- "Start Practice" button
- "Continue Chapter" button (if partially completed)
- "Import Questions" button

#### Acceptance Criteria
- [x] User can create unlimited chapters per subject
- [x] Chapter names can be duplicated (within same subject)
- [x] Chapter list shows aggregate statistics
- [x] Deleting chapter deletes all questions (cascade)
- [ ] Chapter tracks last practiced date and current position

---

### 4. Question Import - Method 1: Paste Text

#### Overview
Users paste questions in a standardized text format for quick import.

#### Standardized Format
```
Question 1
What is Binary Search?
A. O(n)
B. O(log n)
C. O(n²)
D. O(1)
Answer: B

Question 2
What is the time complexity of merge sort?
A. O(n)
B. O(log n)
C. O(n log n)
D. O(n²)
Answer: C
```

#### Import Flow
1. User navigates to chapter
2. Clicks "Import Questions" → "Paste Text"
3. Text area appears
4. User pastes formatted questions
5. User clicks "Parse"
6. System validates and parses questions
7. System displays Preview Screen (see Feature 6)

#### Parser Requirements

- Detect question numbers (Question 1, Question 2, etc.)
- Extract question text (multi-line support)
- Extract options (A, B, C, D with text)
- Extract correct answer (Answer: X format)
- Normalize whitespace
- Support various numbering formats (1, 1., Question 1, Q1)

#### Validation Rules
- **Missing answer**: Flag as error
- **Missing options**: Flag as error (must have A, B, C, D)
- **Duplicate question numbers**: Flag as warning
- **Invalid formatting**: Flag as error with line number
- **Malformed numbering**: Flag as warning

#### Acceptance Criteria
- [x] Parser extracts questions from standardized format
- [x] Parser detects and reports validation errors
- [x] Parser supports multi-line questions and options
- [x] Parser normalizes whitespace
- [x] Validation errors displayed clearly to user
- [x] Partial success: Valid questions shown, invalid questions flagged

#### Edge Cases
- Empty paste → Show error "No content to parse"
- Only 1 question → Process normally
- 1000+ questions → Process in chunks, show progress
- Malformed answer (Answer: XY) → Flag as error
- Missing question number → Auto-assign sequential numbers


---

### 5. Question Import - Method 2: Upload DOCX

#### Overview
Users upload DOCX files containing questions in the same standardized format.

#### Why DOCX Only?
- DOCX parsing is significantly more reliable than PDF
- Students often have questions in Word format
- Preserves formatting and structure
- Future: Add PDF via OCR (not in V1)

#### Import Flow
1. User clicks "Import Questions" → "Upload DOCX"
2. File picker opens
3. User selects DOCX file
4. System validates file type
5. System reads DOCX content
6. System parses content (same parser as text method)
7. System displays Preview Screen

#### DOCX Parsing Requirements
- Extract plain text from DOCX
- Handle bold, italic, underline formatting
- Support tables (if questions in table format)
- Support lists (if options in list format)
- Ignore headers, footers, page numbers
- Maintain line breaks for question structure

#### Acceptance Criteria
- [x] System accepts .docx files only
- [x] System rejects invalid file types with clear error
- [x] Parser handles DOCX formatting variations

- [x] Parser applies same validation rules as text import
- [x] System processes files up to 500 questions in < 3 seconds
- [x] Preview screen shows parsed questions for review

#### Edge Cases
- Non-DOCX file → Reject with error message
- Corrupted DOCX → Show parsing error
- DOCX with images → Ignore images (V1), extract text only
- DOCX with tables → Extract text from cells
- Empty DOCX → Show "No questions found"
- DOCX > 10MB → Warn about large file, allow processing

---

### 6. Question Preview and Editing

#### Overview
After parsing (text or DOCX), users review and edit questions before saving to chapter.

#### Preview Screen Layout
- Header: "Preview Imported Questions"
- Stats: X questions parsed, Y valid, Z errors
- Filter buttons: All | Valid | Errors
- Question cards (one per question)
- Bottom action bar: Cancel | Save Valid Questions | Save All

#### Question Card
Each card displays:
- Question number
- Question text (editable)
- Options A, B, C, D (editable)
- Correct answer dropdown (A/B/C/D)
- Error/warning badges (if any)
- Delete button

#### Editing Capabilities
- Edit question text inline

- Edit option text inline
- Change correct answer via dropdown
- Delete invalid/unwanted questions
- Add explanation field (optional)

#### Save Behavior
- "Save Valid Questions": Only saves questions without errors
- "Save All": Attempts to save all questions (shows confirmation if errors exist)
- On save success: Redirect to chapter detail
- On save failure: Show error, keep preview open

#### Acceptance Criteria
- [x] Preview screen displays all parsed questions
- [x] Questions are editable before saving
- [x] Validation errors clearly indicated
- [x] User can delete unwanted questions
- [x] User can change correct answers
- [x] System doesn't save until user confirms
- [x] After save, questions assigned status NEW

#### Edge Cases
- User edits then closes without saving → Confirm "Discard changes?"
- Save 0 questions → Show error "No questions to save"
- Save duplicate question text → Allow (no uniqueness check)
- Network error during save → Show error, retry option

---

### 7. Quiz System - Practice Mode

#### Overview

Interactive quiz mode with immediate feedback after each question. Focus: Learning and revision.

#### Practice Mode Workflow
```
1. Display Question
   ↓
2. User Selects Answer
   ↓
3. Show Correct/Incorrect Feedback Immediately
   ↓
4. Show Correct Answer (if wrong)
   ↓
5. Show Explanation (if available)
   ↓
6. Prompt User to Classify Confidence
   - Mastered
   - Review
   - Almost Forgot
   ↓
7. Update Question Status Based on Confidence/Correctness
   ↓
8. User Clicks "Next Question"
   ↓
9. Repeat or Show Results (if batch complete)
```

#### Status Update Rules (Practice Mode)
- User answers **correctly** + selects **Mastered** → Status = MASTERED
- User answers **correctly** + selects **Review** → Status = REVIEW
- User answers **correctly** + selects **Almost Forgot** → Status = ALMOST_FORGOT
- User answers **incorrectly** → Status = ERROR (overrides confidence)

#### Screen Layout
- Progress bar: Question X of Y
- Question text
- Options (A, B, C, D) as selectable cards
- Submit button
- Timer (if applicable)


#### Feedback Screen (After Answer)
- Correct/Incorrect badge
- Correct answer highlighted
- User's answer highlighted (if different)
- Explanation (if available)
- Confidence buttons: Mastered | Review | Almost Forgot
- Next button

#### Acceptance Criteria
- [x] Questions displayed one at a time
- [x] Immediate feedback after answer submission
- [x] Correct answer always shown after submission
- [ ] User classifies confidence after each question
- [ ] Question status updated based on answer + confidence
- [x] Progress tracked throughout session
- [x] Results summary shown at end

#### Edge Cases
- User doesn't select answer → Disable submit button
- User clicks back during quiz → Confirm "Exit quiz?"
- Timer expires (if applicable) → Auto-submit, treat as incorrect
- Last question in batch → Show "Complete" instead of "Next"

---

### 8. Quiz System - Exam Mode

#### Overview
Simulation mode with no feedback until completion. Focus: Testing readiness.

#### Exam Mode Workflow
```
1. Display Question
   ↓
2. User Selects Answer
   ↓
3. Move to Next Question (NO FEEDBACK)
   ↓
4. Repeat Until All Questions Answered
   ↓
5. User Clicks "Submit Exam"

   ↓
6. Show Results Page
   ↓
7. Show Detailed Analysis
```

#### Status Update Rules (Exam Mode)
- User answers **correctly** → If status is ERROR, update to REVIEW; else maintain status
- User answers **incorrectly** → Status = ERROR
- **No confidence classification** in Exam Mode

#### Results Page Layout
- Score: X/Y (percentage)
- Time taken
- Accuracy graph/chart
- Summary stats: Correct, Wrong, Unanswered
- "Review Answers" button → Detailed analysis
- "Retake Exam" button
- "Back to Dashboard" button

#### Detailed Analysis View
- List of all questions
- Each question shows:
  - Question text
  - Options
  - User's answer (highlighted)
  - Correct answer (highlighted)
  - Correct/Incorrect badge
- Filter: All | Correct | Incorrect

#### Acceptance Criteria
- [x] No feedback during exam
- [x] User can navigate between questions
- [x] Timer countdown visible (if applicable)
- [x] Exam auto-submits when timer expires
- [x] Results page shows score and accuracy
- [x] Detailed analysis shows all questions with answers
- [ ] Question status updated based on correctness only

#### Edge Cases
- User closes tab during exam → Save progress (future), for now lost
- User doesn't answer all questions → Allow submission, treat unanswered as wrong
- Timer expires → Auto-submit exam immediately
- Network error during submission → Save locally, retry

---

### 9. Timer Modes

#### Mode 1: Unlimited Time
- **Purpose**: Focus on understanding, no pressure
- **Behavior**: No time limit on questions or quiz
- **Display**: Show elapsed time (optional)
- **Tracking**: Record total time for statistics

#### Mode 2: Fixed Time Per Question
- **Purpose**: Practice answering quickly
- **Options**: 60 seconds, 90 seconds, 120 seconds per question
- **Behavior**: 
  - Countdown timer starts when question displayed
  - Visual warning at 10 seconds remaining (color change)
  - Auto-submit when timer reaches 0
  - Move to next question automatically
- **Treatment**: Timed-out questions treated as incorrect

#### Mode 3: Whole Test Timer
- **Purpose**: Simulate timed exams
- **Options**: 30 minutes, 60 minutes, 90 minutes for entire quiz
- **Behavior**:
  - Countdown timer displayed prominently
  - Visual warning at 5 minutes remaining

  - User can navigate between questions freely
  - Quiz auto-submits when timer reaches 0
  - User can finish early

#### Acceptance Criteria
- [x] User can select timer mode before starting quiz
- [x] Timer displays correctly based on mode
- [x] Visual warnings at critical time thresholds
- [x] Auto-submit functionality works correctly
- [x] Time spent tracked for statistics

#### Edge Cases
- User changes tab during timed quiz → Timer continues
- User pauses (not supported in V1) → Timer continues
- System clock changed → Prevent by using server time
- Timer expires during answer submission → Accept submission if in progress

---

### 9A. Quiz Results and Answer Review ✅ COMPLETED

#### Overview
Display quiz performance with detailed metrics and answer review functionality. Available after completing any quiz (Practice or Exam mode).

#### Results Summary Screen

**Score Display**
- Large score display: X/Y format
- Accuracy percentage (calculated)
- Visual color-coded performance indicator

**Metrics Grid**
- Total Questions (count)
- Correct Answers (count with green styling)
- Wrong Answers (count with red styling)
- Unanswered Questions (count with yellow styling)

**Time Display**
- Total time taken formatted as HH:MM:SS or MM:SS
- Displayed with clock icon

**Performance Messages**
- ≥80% accuracy → "Excellent Performance!" (green badge)
- 60-79% accuracy → "Good Job! Keep Practicing" (blue badge)
- <60% accuracy → "Keep Practicing to Improve" (yellow badge)

**Action Buttons**
- Back to Chapter (returns to chapter view)
- Review Answers (opens detailed review)
- Retry Quiz (restarts with same configuration)

#### Answer Review Interface

**Review Mode Features**
- Question-by-question navigation
- Current question indicator (X of Y)
- Close review button (returns to summary)

**Question Display**
- Question number and text
- Status badge (Correct/Wrong/Not Answered) with color coding
- Time spent per question
- All four options displayed

**Answer Highlighting**
- Correct answer: Green border and background
- User's correct answer: Green with ring highlight
- User's wrong answer: Red border, background, and ring highlight
- Visual badges: "Your Answer", "Correct Answer"

**Explanation Section**
- Shows correct answer letter
- Feedback about user's selection
- Placeholder for detailed explanation (future enhancement)
- Blue-bordered information box

**Navigation Controls**
- Previous button (disabled on first question)
- Next button (disabled on last question)
- Progress indicator (current / total)
- Back to Summary link

#### Data Flow
1. Quiz completion triggers navigation to results
2. QuizState passed via navigation state
3. Metrics calculated from answers and questions
4. Results rendered with all performance data
5. Review mode accessed on demand

#### Acceptance Criteria
- [x] Results page displays after quiz completion
- [x] Score and accuracy calculated correctly
- [x] All metrics (correct/wrong/unanswered) displayed
- [x] Time formatting works for all durations
- [x] Performance messages match accuracy thresholds
- [x] Review mode shows all questions
- [x] Correct/incorrect highlighting works properly
- [x] Navigation between questions functional
- [x] Retry quiz maintains original configuration
- [x] Mobile responsive design

#### Implementation Status
**Completed**: Frontend quiz results and answer review UI
**Pending**: Backend API to save quiz attempts to database for history tracking

#### Edge Cases
- No quiz state provided → Redirect back to chapter
- Zero questions answered → Still calculate metrics (0% accuracy)
- All questions unanswered → Treat as wrong for metrics
- Time < 60 seconds → Format as MM:SS without hours
- Review first question → Previous button disabled
- Review last question → Next button disabled

---

### 10. Question Selection

#### Option 1: All Questions
- Include all questions from chapter
- Respect batch size setting
- Present in sequential order

#### Option 2: Custom Range
- **UI**: Two inputs - Start Question, End Question
- **Validation**:
  - Start ≤ End
  - Both within valid range (1 to total questions)
  - Not empty
- **Behavior**: Include only questions within specified range

#### Option 3: Continue Chapter
- **Purpose**: Progressive practice through large chapters
- **Logic**:

  - Track last completed position per chapter
  - Calculate next batch based on batch size
  - Example: Last session ended at Q50, batch size 25 → Next session starts at Q51
  - If all questions visited → Reset to beginning
- **Display**: "Continue from Question X"

#### Acceptance Criteria
- [x] User can select All Questions option
- [x] User can specify custom range with validation
- [x] Continue Chapter remembers last position
- [x] Continue Chapter respects batch size
- [x] Continue Chapter resets after completion

#### Edge Cases
- Custom range: Start > End → Validation error
- Custom range: End > Total questions → Validation error
- Continue Chapter: First attempt → Start from Q1
- Continue Chapter: All completed → Show "Restart from beginning"

---

### 11. Batch Size Configuration

#### Overview
Control how many questions appear in one quiz session.

#### Supported Sizes
- 10 questions
- 25 questions
- 50 questions
- 100 questions

#### Behavior
- User selects batch size before starting quiz
- System divides question set into batches
- Example: 1000 questions, batch size 25 → 40 sessions
- If not evenly divisible → Last batch contains remainder

- Example: 105 questions, batch size 25 → Sessions of 25, 25, 25, 25, 5

#### Integration with Continue Chapter
- Batch size determines next range
- Changing batch size recalculates boundaries
- Example: Was using 25 (completed Q1-75), change to 50 → Next session Q76-125

#### Acceptance Criteria
- [x] User can select from 4 batch sizes
- [x] System divides questions into appropriate batches
- [x] Last batch includes remaining questions
- [x] Batch size can be changed between sessions
- [x] Continue Chapter respects current batch size

---

### 12. Question Status System

#### Overview
**Critical Architecture Constraint**: Each question exists **exactly once** in database. Status determines which practice sets it appears in.

#### Five Status Types

**NEW**
- Initial status when question imported
- Indicates never attempted or not yet mastered
- Appears in: All Questions, Custom Range, Continue Chapter

**MASTERED**
- User answered correctly + selected "Mastered" in Practice Mode
- Indicates solid understanding
- Appears in: All Questions (can be filtered out in future)

**REVIEW**
- User answered correctly + selected "Review" in Practice Mode
- OR User answered correctly in Exam Mode after previous ERROR status
- Indicates needs periodic revision

- Appears in: Review practice set

**ALMOST_FORGOT**
- User answered correctly + selected "Almost Forgot" in Practice Mode
- Indicates weak retention, needs frequent revision
- Appears in: Almost Forgot practice set

**ERROR**
- User answered incorrectly in any mode
- Indicates misunderstanding or gap
- Appears in: Error practice set

#### Status Transition Rules
```
NEW → MASTERED (correct + "Mastered")
NEW → REVIEW (correct + "Review")
NEW → ALMOST_FORGOT (correct + "Almost Forgot")
NEW → ERROR (incorrect)

MASTERED → ERROR (incorrect)
REVIEW → ERROR (incorrect)
ALMOST_FORGOT → ERROR (incorrect)

ERROR → REVIEW (correct in Exam Mode)
ERROR → MASTERED/REVIEW/ALMOST_FORGOT (correct + confidence in Practice Mode)
```

#### Status-Based Practice Sets
- **Practice Review**: Filter questions WHERE status = REVIEW
- **Practice Almost Forgot**: Filter questions WHERE status = ALMOST_FORGOT
- **Practice Errors**: Filter questions WHERE status = ERROR

#### Acceptance Criteria
- [x] Each question has exactly one status
- [ ] Status updates based on user performance and confidence
- [ ] Status-based filtering creates dynamic practice sets
- [ ] Status history tracked with timestamps
- [ ] No duplicate questions in database

---

### 13. Dashboard

#### Overview
Main landing page after login showing overview and quick actions.

#### Dashboard Sections

**Statistics Cards (Top Row)**
- Total Subjects (count)
- Total Chapters (count across all subjects)
- Total Questions (count across all chapters)
- Completed Questions (non-NEW status count)
- Remaining Questions (NEW status count)
- Review Questions (REVIEW status count)
- Almost Forgot Questions (ALMOST_FORGOT status count)
- Error Questions (ERROR status count)
- Overall Accuracy (% correct across all attempts)
- Average Time per Question (seconds)

**Quick Actions**
- Continue Chapter button (resumes most recently active chapter)
- Create Subject button
- Import Questions button (if chapter selected)

**Recent Activity**
- Last 10 quiz attempts with:
  - Chapter name
  - Date/time
  - Mode (Practice/Exam)
  - Score (X/Y)
  - Accuracy %
- Click to view detailed results

**Progress Charts (Future)**
- Daily/weekly study time
- Questions solved trend

- Accuracy trend

#### Acceptance Criteria
- [x] Dashboard displays aggregate statistics
- [ ] Statistics update in real-time after quiz completion
- [ ] Continue Chapter button navigates to last active chapter
- [ ] Recent activity shows last 10 attempts
- [ ] All statistics calculated accurately

---

### 14. Statistics System

#### Question-Level Statistics
**Tracked Metrics**:
- Times attempted (count)
- Correct attempts (count)
- Wrong attempts (count)
- Last attempt date (timestamp)
- Average time spent (seconds)
- Current status (enum)
- Status history (array with timestamps)

#### Chapter-Level Statistics
**Calculated Metrics**:
- Total questions (count)
- Completed questions (non-NEW count)
- Remaining questions (NEW count)
- Accuracy % (correct/total attempts)
- Review count (REVIEW status)
- Error count (ERROR status)
- Almost Forgot count (ALMOST_FORGOT status)
- Mastered count (MASTERED status)

#### Subject-Level Statistics
**Calculated Metrics**:
- Total chapters (count)
- Completion % (based on question status distribution)
- Overall accuracy % (aggregated from all chapters)


#### Global Statistics
**Tracked Metrics**:
- Daily study time (seconds per day)
- Weekly study time (seconds per week)
- Total study time (lifetime seconds)
- Total questions solved (lifetime count)
- Daily questions attempted (count per day)
- Weekly questions attempted (count per week)

#### Performance Requirements
- Statistics calculated in < 1 second for datasets up to 50,000 attempts
- Use database aggregations, not in-memory calculations
- Cache frequently accessed statistics (future)

#### Acceptance Criteria
- [ ] Question-level stats tracked accurately
- [ ] Chapter-level stats calculated from questions
- [ ] Subject-level stats calculated from chapters
- [ ] Global stats aggregated from all attempts
- [ ] Statistics update immediately after quiz completion

---

### 15. Attempt History

#### Overview
Store every quiz attempt for performance tracking and analysis.

#### Stored Data Per Attempt
- Attempt ID (unique)
- User ID (foreign key)
- Chapter ID (foreign key)
- Quiz mode (Practice/Exam)
- Timer type (Unlimited/Per Question/Whole Test)
- Timer configuration (e.g., "60 seconds per question")
- Question range (start, end)

- Batch size used
- Start timestamp
- End timestamp
- Duration (seconds)
- Total questions
- Correct answers (count)
- Wrong answers (count)
- Unanswered (count)
- Accuracy %
- Individual question responses (array):
  - Question ID
  - User answer
  - Correct answer
  - Time spent (seconds)
  - Was correct (boolean)

#### History View Features
- **List View**: All attempts sorted by date (newest first)
- **Filters**:
  - By chapter
  - By mode (Practice/Exam)
  - By date range
- **Sorting**: Date, Accuracy, Duration
- **Detail View**: Click attempt → See all questions and answers
- **Retry**: Button to retry same quiz configuration

#### Acceptance Criteria
- [ ] Every quiz attempt saved to database
- [ ] All metrics stored accurately
- [ ] Individual question responses tracked
- [ ] History view displays all attempts
- [ ] Filters and sorting work correctly
- [ ] Detail view shows complete attempt data
- [ ] Retry functionality works

---

### 16. Export System

#### Overview
Export questions for offline review or sharing.

#### Export Scopes

1. **Entire Chapter**: All questions in chapter
2. **Review Questions**: Only questions with REVIEW status
3. **Almost Forgot Questions**: Only questions with ALMOST_FORGOT status
4. **Error Questions**: Only questions with ERROR status

#### Export Formats

**DOCX Format**
- Formatted document with:
  - Question numbering
  - Question text
  - Options (A, B, C, D)
  - Correct answer highlighted or marked
  - Explanation (if available)
- Professional formatting for printing

**CSV Format**
- Columns: Question Number, Question Text, Option A, Option B, Option C, Option D, Correct Answer, Status, Times Attempted, Accuracy
- Easy for spreadsheet analysis

**JSON Format**
- Complete question data including:
  - All fields
  - Statistics
  - Metadata
- For programmatic use or backup

#### Export Flow
1. User navigates to chapter
2. Clicks "Export" button
3. Modal opens with:
   - Scope selection (radio buttons)
   - Format selection (radio buttons)
4. User selects and confirms
5. System generates file
6. Browser downloads file

#### Acceptance Criteria
- [ ] Export supports all three formats
- [ ] Export supports all four scopes
- [ ] DOCX exports are well-formatted
- [ ] CSV exports are valid and parseable
- [ ] JSON exports include all data
- [ ] Empty exports show appropriate message

#### Edge Cases
- Export scope with 0 questions → Show message "No questions to export"
- Export 10,000+ questions → Show progress indicator
- Export fails → Show error, allow retry

---

## Future Features (Not in Version 1)

### PDF Import
- OCR-based question extraction
- More complex than DOCX parsing
- Deferred to V2 after DOCX workflow proven

### Spaced Repetition Algorithm
- Implement SM-2 or FSRS algorithm
- Schedule questions based on performance
- Replace simple status system with SRS intervals

### AI-Generated MCQs
- Generate questions from uploaded notes/textbooks
- Use LLM to create practice questions
- Quality validation required

### Cloud Synchronization
- Sync data across devices
- Real-time updates
- Conflict resolution

### Multi-Device Support
- Native mobile apps
- Progressive Web App
- Offline support

### Rich Text Questions

- Support bold, italic, code formatting
- Mathematical equations (LaTeX)
- Syntax highlighting for code

### Image Support
- Images in question text
- Images in options
- Diagrams and charts

### Tags and Metadata
- Custom tags per question
- Difficulty levels
- Topics/subtopics
- Source attribution

### Advanced Analytics
- Learning curves
- Time-of-day performance
- Question difficulty analysis
- Predictive success modeling

### Study Streaks and Achievements
- Daily streak tracking
- Badges and milestones
- Leaderboards (optional, per user preference)

### Collaborative Features
- Share question banks
- Study groups
- Compete with friends

---

## Architecture Constraints

### Data Integrity Rules

**Rule 1: Single Question Instance**
- Each question stored **exactly once** in database
- Never duplicate questions
- Use status field to categorize, not separate tables/copies
- Rationale: Prevents data inconsistency, simplifies updates, reduces storage

**Rule 2: Cascade Deletes**
- Deleting subject → Delete all chapters → Delete all questions
- Deleting chapter → Delete all questions

- Use database foreign key constraints
- Rationale: Prevent orphaned data, maintain referential integrity

**Rule 3: User Data Isolation**
- Every query filtered by authenticated user ID
- Database-level row security (future)
- No cross-user data access
- Rationale: Security, privacy, data protection

### Scalability Requirements

**Question Volume**
- Support 1,000,000+ questions per user
- Efficient queries with proper indexing
- Pagination for large result sets

**Concurrent Users**
- Support 10,000+ concurrent users (future)
- Connection pooling
- Caching strategy

**Query Performance**
- Question listing: < 500ms
- Quiz loading: < 1 second
- Statistics calculation: < 1 second
- Search: < 1 second

### Performance Optimization

**Database**
- Index all foreign keys
- Index frequently queried columns (user_id, status, created_at)
- Use database aggregations, not in-memory
- Implement query result caching (future)

**Frontend**
- Code splitting by route
- Lazy load heavy components
- Virtualize long lists
- Optimize bundle size

**API**
- Paginate all list endpoints

- Implement rate limiting (future)
- Use async operations
- Optimize N+1 queries

---

## UI/UX Philosophy

### Design Principles

**Minimal**
- No unnecessary elements
- Clean, uncluttered interfaces
- Focus on content (questions)
- Remove distractions during study

**Fast**
- Instant feedback on interactions
- Optimistic UI updates
- Minimal loading states
- Smooth transitions (< 300ms)

**Keyboard Friendly**
- All actions accessible via keyboard
- Shortcuts for common actions:
  - `Space` or `Enter`: Submit answer
  - `N`: Next question
  - `1-4`: Select options A-D
  - `Esc`: Exit quiz (with confirmation)
- Tab navigation works everywhere

**Responsive**
- Mobile-first design
- Adapts to 320px - 2560px screens
- Touch-friendly (44x44px minimum tap targets)
- Works in portrait and landscape

**Dark Mode Ready**
- Design system supports dark mode
- Not implemented in V1
- Color palette chosen for easy dark mode addition

**Simple**
- Intuitive navigation
- No hidden features
- Clear labels and instructions

- Consistent patterns
- Predictable behavior

**Modern**
- Contemporary design aesthetics
- Smooth animations
- Professional appearance
- Trust-inspiring interface

### Color Palette
- **Primary**: Blue (learning, trust, focus)
- **Success**: Green (correct answers)
- **Error**: Red (incorrect answers, errors)
- **Warning**: Yellow/Orange (time warnings)
- **Neutral**: Grays (text, backgrounds, borders)

### Typography
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, 16px minimum
- **Code/Technical**: Monospace when needed
- **Question text**: Large, scannable

---

## Complete User Flows

### Flow 1: New User Onboarding
```
1. User visits application URL
2. Redirect to /login (not authenticated)
3. User enters username "john_doe"
4. System checks: username doesn't exist
5. System creates account automatically
6. System issues JWT token
7. Redirect to /dashboard
8. Dashboard shows empty state:
   - 0 subjects
   - 0 chapters
   - 0 questions
   - "Create your first subject" CTA
9. User clicks "Create Subject"
10. Modal opens
11. User enters "Data Structures & Algorithms"
12. System creates subject
13. Redirect to subject detail
14. Shows empty chapters list
15. "Create your first chapter" CTA
```

### Flow 2: Import Questions and Practice

```
1. User navigates to chapter "Arrays"
2. Clicks "Import Questions"
3. Selects "Paste Text"
4. Pastes 50 formatted questions
5. Clicks "Parse"
6. System validates and parses
7. Preview screen shows 50 questions, 48 valid, 2 errors
8. User reviews and fixes 2 errors
9. User clicks "Save All Questions"
10. System saves 50 questions with status NEW
11. Redirect to chapter detail
12. Shows: 50 questions, 0 attempted
13. User clicks "Start Practice"
14. Quiz configuration screen:
    - Mode: Practice (selected)
    - Timer: Unlimited (selected)
    - Selection: All Questions (selected)
    - Batch Size: 25 (selected)
15. User clicks "Start Quiz"
16. Question 1 displayed
17. User selects answer B
18. Clicks "Submit"
19. Feedback: "Correct! ✓"
20. Shows explanation
21. Prompts confidence: Mastered | Review | Almost Forgot
22. User clicks "Mastered"
23. System updates question status to MASTERED
24. User clicks "Next"
25. Question 2 displayed
26. ... repeat for 25 questions
27. Session complete
28. Results screen:
    - Score: 23/25 (92%)
    - Time: 18 minutes
    - "Review Answers" button
    - "Continue to Next Batch" button
29. User clicks "Continue to Next Batch"
30. Questions 26-50 loaded
```

### Flow 3: Status-Based Revision
```
1. User completes initial practice

2. Dashboard shows:
   - 5 ERROR questions
   - 12 REVIEW questions
   - 8 ALMOST_FORGOT questions
3. User clicks "Practice Errors" from dashboard
4. System filters questions with ERROR status
5. Loads 5 questions
6. User practices and corrects understanding
7. Updates statuses based on performance
8. Next day: User logs in
9. Clicks "Practice Review"
10. System shows 12 REVIEW questions
11. User practices periodically
12. Gradually moves questions from REVIEW → MASTERED
```

### Flow 4: Exam Simulation
```
1. User wants to test readiness
2. Navigates to chapter "Operating Systems"
3. Clicks "Start Practice"
4. Selects:
   - Mode: Exam
   - Timer: Whole Test - 60 minutes
   - Selection: All Questions
   - Batch Size: 50
5. Clicks "Start Exam"
6. Question 1 displayed with timer (60:00)
7. User selects answer
8. Clicks "Next" (no feedback shown)
9. Question 2 displayed
10. ... continues through 50 questions
11. Timer shows 42:15 remaining
12. User clicks "Submit Exam"
13. Confirmation: "Submit with 15 questions unanswered?"
14. User confirms
15. Results screen:
    - Score: 38/50 (76%)
    - Time: 17 minutes 45 seconds
16. User clicks "Detailed Analysis"
17. Sees all 50 questions with answers
18. Filters to "Incorrect Only"
19. Reviews 12 incorrect answers
20. System updated statuses:

    - 12 incorrect → ERROR status
    - 3 previously ERROR, now correct → REVIEW status
```

---

## Feature Dependencies

### Phase 1: Foundation (Must Complete First)
1. Authentication
2. Database schema
3. User model
4. Protected routes (frontend + backend)

### Phase 2: Core Data Structure (Depends on Phase 1)
1. Subject CRUD
2. Chapter CRUD
3. Question model

### Phase 3: Question Import (Depends on Phase 2)
1. Question parser (text format)
2. DOCX reader
3. Preview screen
4. Question editor
5. Save functionality

### Phase 4: Quiz Engine (Depends on Phase 3)
1. Quiz configuration screen
2. Question display component
3. Answer submission
4. Practice Mode feedback
5. Exam Mode (no feedback)
6. Results screen

### Phase 5: Status System (Depends on Phase 4)
1. Question status field
2. Status update logic
3. Status-based filtering
4. Confidence classification UI

### Phase 6: Timer System (Depends on Phase 4)
1. Unlimited timer
2. Per-question timer
3. Whole test timer
4. Timer UI components

### Phase 7: Selection & Batching (Depends on Phase 4)
1. All questions selection

2. Custom range selection
3. Continue chapter logic
4. Batch size configuration

### Phase 8: Dashboard & Statistics (Depends on Phases 4-7)
1. Statistics calculation
2. Dashboard cards
3. Recent activity
4. Quick actions

### Phase 9: History (Depends on Phase 4)
1. Attempt recording
2. History list view
3. History detail view
4. Filters and sorting

### Phase 10: Export (Depends on Phase 3)
1. DOCX export
2. CSV export
3. JSON export
4. Export UI

---

## Edge Cases

### Authentication Edge Cases
- Username with SQL injection attempt → Sanitized by validation
- Username with XSS attempt → Sanitized by validation
- Token expired mid-session → Redirect to login on next API call
- User clears localStorage → Treated as logged out
- Multiple users on same device → Each login overwrites previous
- User creates account with existing username → Login instead
- Empty username submission → Validation error
- Username > 50 characters → Validation error

### Subject/Chapter Management Edge Cases
- Delete subject with 10,000+ questions → Confirm cascade, show progress
- Create subject while network offline → Show error, queue for retry
- Duplicate subject names → Allowed (no uniqueness constraint)
- Subject name with special characters → Allowed (but sanitized)

- Rapid clicking "Create Subject" → Debounce button, prevent duplicates
- Edit subject name to empty → Validation error

### Question Import Edge Cases
- Paste 10,000 questions at once → Process in chunks, show progress
- DOCX file corrupted → Show parsing error
- DOCX with images → Ignore images (V1), extract text only
- Question without options → Flag as error in preview
- Question with 5 options (A-E) → Accept only first 4 (A-D)
- Duplicate question numbers → Flag as warning, allow save
- Empty paste → Show error "No content to parse"
- Paste during another import → Prevent, show message
- Question text > 1000 characters → Accept but warn about length
- Option text > 500 characters → Accept but warn about length
- Non-DOCX file uploaded → Reject with error message
- DOCX > 10MB → Warn about size, allow processing
- Network timeout during save → Retry mechanism with user notification

### Quiz Engine Edge Cases
- User refreshes page mid-quiz → Show confirmation, lose progress (V1)
- User clicks browser back → Show confirmation, exit quiz
- Timer expires during answer submission → Accept if submission in progress
- Last question in batch → Show "Complete" instead of "Next"
- No questions match filter (e.g., Practice Errors with 0 errors) → Show message
- Question text rendering issue → Log error, show placeholder
- Rapid clicking answer options → Prevent multiple submissions
- Submit without selecting answer → Validation error
- Network error on submission → Save locally, retry

### Status System Edge Cases

- Status update fails → Retry, show error if persistent
- Question answered in multiple sessions → Status reflects most recent
- Concurrent status updates → Last write wins (eventual consistency)
- Status filter returns 0 results → Show empty state message

### Timer Edge Cases
- System clock changed → Use server time for validation
- User changes tab/window → Timer continues (no pause in V1)
- Timer reaches 0 during answer feedback → Allow viewing feedback
- Whole test timer + per question timer → Not allowed, one or the other
- Timer JavaScript blocked → Fallback to server-side timing

### Statistics Edge Cases
- Division by zero (no attempts) → Show "-" or "0%" instead of NaN
- Extremely large numbers → Format with K, M suffixes
- Statistics calculation fails → Show cached or "Calculating..."
- Real-time update lag → Show optimistic update, sync in background

### Export Edge Cases
- Export 0 questions → Show error message
- Export 50,000 questions → Show progress, generate in chunks
- Export fails → Show error, retry option
- Special characters in question text → Properly escape for format
- Browser blocks download → Instruct user to allow

---

## Acceptance Criteria Summary

### Authentication
- [x] Username-only login works
- [x] Account auto-created if doesn't exist
- [x] JWT token issued and validated
- [x] Protected routes enforce authentication
- [x] Logout clears session
- [x] Token expiry handled gracefully

### Subject & Chapter Management

- [x] CRUD operations work for subjects and chapters
- [x] Cascade deletes work correctly
- [x] Data isolation enforced (user sees only their data)
- [x] Statistics displayed accurately

### Question Import
- [x] Text paste parsing works
- [x] DOCX upload parsing works
- [x] Validation catches errors
- [x] Preview screen displays parsed questions
- [x] Editing questions works before save
- [x] Questions saved with NEW status
- [x] Invalid questions can be deleted

### Quiz System
- [x] Practice Mode provides immediate feedback
- [x] Exam Mode withholds feedback until end
- [x] Both modes track answers and time
- [x] Results screen displays accurate stats
- [x] Question status updates correctly
- [x] Confidence classification works in Practice Mode

### Timer System
- [x] Unlimited timer tracks time without limit
- [x] Per-question timer counts down and auto-submits
- [x] Whole test timer counts down and auto-ends quiz
- [x] Visual warnings display at thresholds
- [x] Timer configuration persists in attempt history

### Selection & Batching
- [x] All questions selection works
- [x] Custom range validates and works
- [x] Continue Chapter remembers position
- [x] Batch size divides questions correctly
- [x] Last batch handles remainder

### Status System
- [x] Five status types work correctly
- [x] Status transitions follow rules
