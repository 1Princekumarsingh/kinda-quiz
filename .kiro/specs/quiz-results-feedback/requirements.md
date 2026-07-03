# Requirements Document

## Introduction

The Quiz Results & Feedback feature provides users with comprehensive performance feedback after completing a quiz session. This feature displays quiz performance metrics, question-by-question review with correct/incorrect indicators, saves attempt data to the database, and updates question statuses based on user performance. The feature supports both Practice Mode (with immediate feedback) and Exam Mode (with feedback after completion), ensuring users can analyze their performance and track progress over time.

## Glossary

- **Results_Page**: The UI component that displays quiz completion summary including score, accuracy, time metrics, and navigation options
- **Question_Review_List**: The UI component that displays all questions from the completed quiz with user answers and correct answers
- **Attempt_Record**: A database record storing complete quiz session data including configuration, questions, answers, and performance metrics
- **Question_Status**: An enumeration field on a question indicating its learning state (NEW, MASTERED, REVIEW, ALMOST_FORGOT, ERROR)
- **Practice_Mode**: Quiz mode providing immediate feedback after each question with confidence classification
- **Exam_Mode**: Quiz mode withholding feedback until quiz completion, simulating exam conditions
- **Score_Summary**: The top section of the results page displaying overall performance metrics
- **User_Answer**: The option (A, B, C, or D) selected by the user for a specific question
- **Correct_Answer**: The option (A, B, C, or D) designated as correct for a specific question
- **Accuracy_Percentage**: The ratio of correct answers to total questions, expressed as a percentage
- **Time_Per_Question**: The duration in seconds spent on an individual question
- **Overall_Time**: The total duration in seconds for the entire quiz session
- **Timer_Configuration**: Settings specifying the timer mode (Unlimited, Per Question, Whole Test) and time limits
- **Chapter**: A collection of questions belonging to a specific subject
- **Database**: The persistent storage system for user data, questions, and quiz attempts

## Requirements

### Requirement 1: Results Page Display

**User Story:** As a user, I want to see a comprehensive summary of my quiz performance immediately after completion, so that I can quickly understand how well I performed.

#### Acceptance Criteria

1. WHEN a quiz session is completed, THE Results_Page SHALL display the score summary at the top of the page
2. THE Score_Summary SHALL display the total correct answers, total questions, and Accuracy_Percentage
3. THE Score_Summary SHALL display the Overall_Time spent on the quiz in minutes and seconds format
4. WHEN the quiz used a timer, THE Score_Summary SHALL display the Timer_Configuration used during the session
5. THE Results_Page SHALL display the Question_Review_List below the Score_Summary
6. THE Results_Page SHALL provide navigation buttons for retry, return to chapter, and view history actions

### Requirement 2: Question Review Display

**User Story:** As a user, I want to review each question with my answer and the correct answer side-by-side, so that I can understand where I made mistakes.

#### Acceptance Criteria

1. THE Question_Review_List SHALL display all questions from the completed quiz in sequential order
2. WHEN a question was answered correctly, THE Question_Review_List SHALL display a visual indicator highlighting the question as correct
3. WHEN a question was answered incorrectly, THE Question_Review_List SHALL display a visual indicator highlighting the question as incorrect
4. THE Question_Review_List SHALL display the User_Answer for each question with visual highlighting
5. THE Question_Review_List SHALL display the Correct_Answer for each question with visual highlighting
6. WHEN the User_Answer differs from the Correct_Answer, THE Question_Review_List SHALL display both answers with distinct visual styles
7. THE Question_Review_List SHALL display the question text and all four options (A, B, C, D) for each question
8. THE Question_Review_List SHALL display the Time_Per_Question for each question in seconds

### Requirement 3: Attempt Data Persistence

**User Story:** As a user, I want my quiz attempts saved automatically, so that I can review my performance history and track progress over time.

#### Acceptance Criteria

1. WHEN a quiz session is completed, THE Database SHALL save an Attempt_Record immediately
2. THE Attempt_Record SHALL store the chapter_id, quiz mode (Practice_Mode or Exam_Mode), and Timer_Configuration
3. THE Attempt_Record SHALL store the start timestamp, end timestamp, and Overall_Time in seconds
4. THE Attempt_Record SHALL store the total questions count, correct answers count, wrong answers count, and Accuracy_Percentage
5. THE Attempt_Record SHALL store an array of individual question responses including question_id, User_Answer, Correct_Answer, Time_Per_Question, and correctness boolean
6. THE Attempt_Record SHALL store the question range (start and end question numbers) and batch size used
7. THE Attempt_Record SHALL be associated with the authenticated user ID
8. IF the attempt save operation fails, THEN THE Results_Page SHALL display an error message and provide a retry option

### Requirement 4: Question Status Updates in Practice Mode

**User Story:** As a user in Practice Mode, I want question statuses updated based on my performance and confidence level, so that the system accurately reflects my mastery of each topic.

#### Acceptance Criteria

1. WHEN a question is answered correctly in Practice_Mode AND the user selected "Mastered" confidence, THE Database SHALL update the Question_Status to MASTERED
2. WHEN a question is answered correctly in Practice_Mode AND the user selected "Review" confidence, THE Database SHALL update the Question_Status to REVIEW
3. WHEN a question is answered correctly in Practice_Mode AND the user selected "Almost Forgot" confidence, THE Database SHALL update the Question_Status to ALMOST_FORGOT
4. WHEN a question is answered incorrectly in Practice_Mode, THE Database SHALL update the Question_Status to ERROR regardless of any confidence selection
5. THE Database SHALL increment the times_attempted counter for each question answered
6. WHEN a question is answered correctly, THE Database SHALL increment the times_correct counter
7. WHEN a question is answered incorrectly, THE Database SHALL increment the times_wrong counter
8. THE Database SHALL update the last_attempt timestamp for each question to the current time

### Requirement 5: Question Status Updates in Exam Mode

**User Story:** As a user in Exam Mode, I want question statuses updated based solely on correctness, so that my mistakes are tracked for future review without manual classification.

#### Acceptance Criteria

1. WHEN a question is answered incorrectly in Exam_Mode, THE Database SHALL update the Question_Status to ERROR
2. WHEN a question is answered correctly in Exam_Mode AND the current Question_Status is ERROR, THE Database SHALL update the Question_Status to REVIEW
3. WHEN a question is answered correctly in Exam_Mode AND the current Question_Status is not ERROR, THE Database SHALL maintain the existing Question_Status
4. THE Database SHALL increment the times_attempted counter for each question answered
5. WHEN a question is answered correctly, THE Database SHALL increment the times_correct counter
6. WHEN a question is answered incorrectly, THE Database SHALL increment the times_wrong counter
7. THE Database SHALL update the last_attempt timestamp for each question to the current time

### Requirement 6: Performance Metrics Calculation

**User Story:** As a user, I want accurate performance metrics calculated and displayed, so that I can objectively assess my quiz performance.

#### Acceptance Criteria

1. THE Results_Page SHALL calculate Accuracy_Percentage as (correct answers / total questions) × 100
2. THE Results_Page SHALL calculate Overall_Time as (end timestamp - start timestamp) in seconds
3. THE Results_Page SHALL calculate Time_Per_Question for each question as (question end time - question start time) in seconds
4. WHEN total questions is zero, THE Results_Page SHALL display "N/A" for Accuracy_Percentage
5. THE Results_Page SHALL display Accuracy_Percentage rounded to one decimal place
6. THE Results_Page SHALL format Overall_Time as "MM:SS" when less than 60 minutes or "HH:MM:SS" when 60 minutes or greater
7. THE Results_Page SHALL format Time_Per_Question as whole seconds

### Requirement 7: Navigation Actions

**User Story:** As a user, I want multiple navigation options from the results page, so that I can choose my next action based on my learning goals.

#### Acceptance Criteria

1. THE Results_Page SHALL provide a "Retry Quiz" button that restarts the same quiz with identical configuration
2. WHEN the user clicks "Retry Quiz", THE Results_Page SHALL navigate to the quiz page with the same chapter, mode, timer settings, question range, and batch size
3. THE Results_Page SHALL provide a "Back to Chapter" button that returns the user to the chapter detail page
4. WHEN the user clicks "Back to Chapter", THE Results_Page SHALL navigate to the chapter detail page and display updated statistics
5. THE Results_Page SHALL provide a "View History" button that navigates to the attempt history page
6. WHEN the user clicks "View History", THE Results_Page SHALL navigate to the attempt history page filtered to the current chapter

### Requirement 8: Visual Feedback Design

**User Story:** As a user, I want clear visual distinction between correct and incorrect answers, so that I can quickly scan my performance without reading all details.

#### Acceptance Criteria

1. WHEN a question was answered correctly, THE Question_Review_List SHALL apply a success color (green) to the question card border or background
2. WHEN a question was answered incorrectly, THE Question_Review_List SHALL apply an error color (red) to the question card border or background
3. THE Question_Review_List SHALL display a checkmark icon or "Correct" badge for correctly answered questions
4. THE Question_Review_List SHALL display an X icon or "Incorrect" badge for incorrectly answered questions
5. THE Question_Review_List SHALL highlight the Correct_Answer with a success color background or border
6. WHEN the User_Answer is incorrect, THE Question_Review_List SHALL highlight the User_Answer with an error color background or border
7. THE Question_Review_List SHALL use distinct visual styles ensuring correct and incorrect answers are not confused

### Requirement 9: Single Page Layout

**User Story:** As a user, I want all results information on a single scrollable page, so that I can access all details without additional navigation or clicks.

#### Acceptance Criteria

1. THE Results_Page SHALL display the Score_Summary and Question_Review_List on a single page without pagination
2. THE Results_Page SHALL enable vertical scrolling when the Question_Review_List exceeds viewport height
3. THE Score_Summary SHALL remain at the top of the page and scroll with the content
4. THE Results_Page SHALL not require separate navigation to view question details
5. THE Results_Page SHALL load all question data on initial page load

### Requirement 10: Practice Mode Immediate Feedback Integration

**User Story:** As a user in Practice Mode, I want the results page to reflect the immediate feedback I received during the quiz, so that the final summary is consistent with my quiz experience.

#### Acceptance Criteria

1. WHEN displaying results for a Practice_Mode quiz, THE Results_Page SHALL reflect the confidence classifications made during the quiz session
2. THE Question_Review_List SHALL display the confidence level (Mastered, Review, Almost Forgot) selected for each correctly answered question in Practice_Mode
3. WHEN a question was answered incorrectly in Practice_Mode, THE Question_Review_List SHALL indicate that confidence was not classified due to incorrect answer
4. THE Results_Page SHALL maintain consistency between the immediate feedback shown during quiz and the final results display

### Requirement 11: Exam Mode Results Page Specialization

**User Story:** As a user in Exam Mode, I want the results page to emphasize overall performance without confidence classifications, so that the experience matches exam simulation standards.

#### Acceptance Criteria

1. WHEN displaying results for an Exam_Mode quiz, THE Results_Page SHALL not display confidence classifications
2. THE Results_Page SHALL emphasize the Score_Summary with prominent display of score, Accuracy_Percentage, and time metrics
3. THE Question_Review_List SHALL display only correctness indicators without confidence levels for Exam_Mode quizzes
4. THE Results_Page SHALL provide detailed analysis of all questions to support post-exam review

### Requirement 12: Empty or Incomplete Quiz Handling

**User Story:** As a user, I want appropriate messaging when I complete a quiz with unanswered questions, so that I understand how unanswered questions affect my results.

#### Acceptance Criteria

1. WHEN a quiz is completed with unanswered questions, THE Results_Page SHALL treat unanswered questions as incorrect
2. THE Results_Page SHALL display the count of unanswered questions in the Score_Summary
3. WHEN a question was not answered, THE Question_Review_List SHALL display "Not Answered" instead of a User_Answer
4. THE Question_Review_List SHALL still display the Correct_Answer for unanswered questions
5. THE Database SHALL record unanswered questions with User_Answer as null or empty string in the Attempt_Record

### Requirement 13: Performance Under Load

**User Story:** As a user completing a large quiz, I want the results page to load quickly regardless of quiz size, so that I receive immediate feedback without delays.

#### Acceptance Criteria

1. WHEN a quiz contains 100 or fewer questions, THE Results_Page SHALL load and display all data within 1 second
2. WHEN a quiz contains more than 100 questions, THE Results_Page SHALL load and display all data within 3 seconds
3. THE Database SHALL save the Attempt_Record within 2 seconds regardless of quiz size
4. THE Database SHALL update all Question_Status values within 3 seconds for quizzes up to 100 questions
5. IF the results page load time exceeds 3 seconds, THEN THE Results_Page SHALL display a loading indicator with progress information

### Requirement 14: Error Recovery

**User Story:** As a user, I want clear error messages and recovery options when saving attempt data fails, so that I can preserve my quiz results without losing progress.

#### Acceptance Criteria

1. IF the Attempt_Record save operation fails, THEN THE Results_Page SHALL display an error message specifying the failure
2. THE Results_Page SHALL provide a "Retry Save" button that attempts to save the Attempt_Record again
3. THE Results_Page SHALL cache the quiz results in browser storage to prevent data loss during save failures
4. IF Question_Status updates fail, THEN THE Results_Page SHALL display a warning message indicating status updates were not applied
5. THE Results_Page SHALL allow the user to view results and navigate away even if save operations fail

### Requirement 15: Accessibility and Keyboard Navigation

**User Story:** As a user relying on keyboard navigation, I want full access to the results page functionality using only keyboard inputs, so that I can review results and navigate without a mouse.

#### Acceptance Criteria

1. THE Results_Page SHALL support Tab key navigation through all interactive elements in logical order
2. THE Results_Page SHALL support Enter or Space key activation for all buttons (Retry, Back to Chapter, View History)
3. THE Question_Review_List SHALL support keyboard scrolling using arrow keys or Page Up/Page Down
4. THE Results_Page SHALL provide visible focus indicators on all interactive elements
5. THE Results_Page SHALL support Escape key to navigate back to the chapter detail page

## Additional Considerations

### Integration with Existing Features

This feature integrates with:
- **Feature 7 (Practice Mode)**: Receives quiz session data including confidence classifications
- **Feature 8 (Exam Mode)**: Receives quiz session data without confidence classifications
- **Feature 12 (Question Status System)**: Updates question statuses based on performance
- **Feature 15 (Attempt History)**: Stores complete attempt records for historical tracking
- **Feature 14 (Statistics System)**: Provides data for chapter-level and global statistics calculations

### Data Flow

1. Quiz completion triggers Results_Page rendering
2. Results_Page receives session data from quiz component (questions, answers, timestamps, mode, configuration)
3. Results_Page calculates performance metrics (score, accuracy, time)
4. Results_Page initiates Attempt_Record save to Database
5. Results_Page initiates Question_Status updates to Database
6. Results_Page displays Score_Summary and Question_Review_List
7. User interacts with navigation buttons or reviews questions
8. User navigates to next action (retry, chapter, history)

### Security Considerations

- All attempt data MUST be associated with authenticated user ID
- Users MUST only access their own quiz results
- Database operations MUST validate user ownership before saving or updating
- SQL injection protection MUST be applied to all database queries

### Performance Optimization

- Batch database updates for Question_Status changes
- Use database transactions to ensure data consistency
- Implement optimistic UI updates for immediate feedback
- Cache calculated metrics to avoid redundant calculations
- Use efficient database queries with proper indexing on user_id, chapter_id, and timestamps
