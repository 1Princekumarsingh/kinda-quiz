<div align="center">

# RecallX

### Intelligent Exam Preparation Platform

*Transform raw question text into structured practice sessions with zero manual formatting*

[Features](#features) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Workflow](#workflow)

---

</div>

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Architecture](#architecture)
- [System Design](#system-design)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Workflow](#workflow)
- [Key Design Decisions](#key-design-decisions)
- [Performance](#performance)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Problem Statement

Government examination aspirants often collect thousands of important questions over years of preparation. However, existing learning applications present several challenges:

- **Overcomplicated Interfaces**: Most apps are feature-heavy, making simple revision cumbersome
- **Manual Formatting Required**: Questions must be individually entered with structured fields
- **Inflexible Practice Modes**: Limited options for customizing practice sessions
- **Poor Memorization Support**: Lack of focused tools for repeated practice and retention tracking
- **No Export/Import Workflow**: Cannot isolate weak areas for targeted revision

**The Core Problem**: Students need a streamlined way to practice their curated question banks repeatedly until concepts become second nature, without spending time on manual data entry or navigating complex UIs.

---

## 💡 Solution

RecallX is a custom-built exam preparation platform designed specifically for efficient revision rather than content discovery. The application eliminates manual data entry through intelligent text parsing and provides focused practice modes that accelerate memorization.

### Core Innovation

Instead of filling out forms, users simply **paste raw question text**. The application automatically extracts:

- Question text
- Four options (A, B, C, D)
- Correct answer
- Optional explanation

Questions are instantly converted to structured data and ready for practice—no manual formatting required.

---

## ✨ Features

### 1. Intelligent Question Parsing

**The Problem**: Manually entering questions with options, correct answers, and explanations is tedious and time-consuming.

**The Solution**: Paste raw text directly into RecallX. The intelligent parser automatically detects:

```
Question: What is binary search complexity?
A. O(n)
B. O(log n)  
C. O(n²)
D. O(1)
Answer: B
Explanation: Binary search divides the search space in half with each comparison.
```

**Why This Matters**:
- **10x Faster**: Import hundreds of questions in minutes, not hours
- **Error Reduction**: Eliminates manual data entry mistakes
- **Flexible Format**: Supports both plain text and DOCX files
- **Optional Explanations**: Questions with or without explanations are both supported


---

### 2. Practice Mode (Interactive Learning)

**Purpose**: Learn through immediate feedback

**How It Works**:
- Click on any option to answer
- Instantly see if your answer is correct or incorrect
- Visual feedback: ✅ Green for correct, ❌ Red for incorrect
- Correct answer automatically highlighted if you answered incorrectly
- Optional explanation displayed after answering
- Confidence level tracking (Mastered, Review, Almost Forgot)

**Why This Matters**:
- **Active Recall**: Immediate feedback reinforces learning
- **Explanation Integration**: Understand concepts right when you make mistakes
- **Confidence Tracking**: Builds metacognitive awareness of your knowledge
- **Optimized for Memorization**: Designed specifically for retention, not discovery

---

### 3. Exam Mode (Realistic Simulation)

**Purpose**: Simulate actual examination conditions

**How It Works**:
- Answer all questions without immediate feedback
- No hints or correct answer reveals during the quiz
- Submit all answers at once
- View complete scorecard with detailed breakdown
- Review each question with correct answers and explanations

**Why This Matters**:
- **Authentic Testing Environment**: Prepares you for real exam conditions
- **Performance Assessment**: Measure true retention without feedback dependency
- **Confidence Building**: Practice time management and decision-making under pressure
- **Diagnostic Tool**: Identify weak areas across entire question sets

---

### 4. Flexible Timer System

RecallX supports three timer configurations to match different study strategies:

| Timer Mode | Description | Use Case |
|------------|-------------|----------|
| **Unlimited Time** | No time constraints | Deep learning, concept understanding |
| **Time Per Question** | Fixed time for each question (e.g., 90 seconds) | Practice pacing, eliminate overthinking |
| **Total Quiz Time** | Fixed time for entire quiz (e.g., 60 minutes) | Realistic exam simulation with time pressure |

**Why All Three Modes Matter**:
- **Unlimited**: Focus on understanding without pressure during initial learning
- **Per Question**: Train yourself to make decisions quickly, prevent time wasting
- **Total Time**: Simulate real exams where time management across questions is critical


---

### 5. Batch Practice

**The Problem**: Practicing 500 questions at once leads to mental fatigue and reduced retention.

**The Solution**: Break large question sets into manageable batches.

**Example**:
```
Total Questions: 100

Practice in 4 batches:
- Batch 1: Questions 1-25
- Batch 2: Questions 26-50
- Batch 3: Questions 51-75
- Batch 4: Questions 76-100
```

**Why This Matters**:
- **Reduced Cognitive Load**: Smaller batches = better focus
- **Frequent Breaks**: Natural stopping points prevent burnout
- **Better Retention**: Spaced practice is scientifically proven more effective
- **Progress Tracking**: Clear milestones motivate continued practice

---

### 6. Custom Range Practice

**The Problem**: You don't always want to practice from question 1. Maybe you want to focus on a specific chapter or topic range.

**The Solution**: Select exact question ranges.

**Examples**:
```
Practice Questions 120-180 (Chapter 5 only)
Practice Questions 400-500 (Recent additions)
Practice Questions 1-50 (Quick warm-up)
```

**Why This Matters**:
- **Targeted Revision**: Focus on specific topics or chapters
- **Skip Mastered Content**: Don't waste time on questions you've already perfected
- **Progressive Learning**: Move through content in logical sequences
- **Flexible Study Plans**: Adapt to your current learning priorities

---

### 7. Intelligent Review System

After completing any practice session, questions are automatically categorized based on your performance:

| Category | Criteria | Purpose |
|----------|----------|---------|
| **Mastered** | Answered correctly + High confidence | Questions you know well, review infrequently |
| **Review Needed** | Answered correctly + Low confidence | Concepts you understand but haven't internalized |
| **Almost Forgot** | Answered correctly but hesitated | Questions at risk of being forgotten, need reinforcement |
| **Error** | Answered incorrectly | Immediate attention required, fundamental gaps |

**The Workflow**:
1. Complete practice session
2. System automatically categorizes each question
3. Dashboard shows distribution across categories
4. Filter and practice specific categories
5. Track progress over time

**Why This Matters**:
- **Intelligent Prioritization**: Focus on what needs attention
- **Metacognition**: Build awareness of your knowledge state
- **Efficient Revision**: Don't waste time on mastered content
- **Data-Driven Learning**: See exactly where you're weak


---

### 8. Export Feature

Export your questions to standard formats for backup or external analysis.

**Supported Formats**:
- **CSV**: For spreadsheet analysis, data manipulation
- **JSON**: For programmatic access, integration with other tools
- **Filtered Exports**: Export only specific categories (e.g., Error + Review Needed)

**Use Cases**:
- Backup question banks before major updates
- Share question sets with study groups
- Analyze performance data in Excel/Google Sheets
- Create subsets for focused revision

---

### 9. Import Feature (Power User Workflow)

The import feature enables an advanced revision strategy that dramatically improves efficiency:

**The Advanced Workflow**:

```mermaid
graph LR
    A[Practice All<br/>Questions] --> B[Export<br/>Review Needed]
    A --> C[Export<br/>Almost Forgot]
    A --> D[Export<br/>Errors]
    B --> E[Merge Files]
    C --> E
    D --> E
    E --> F[Import<br/>Weak Questions]
    F --> G[Practice<br/>Focused Set]
    G --> H{Mastered?}
    H -->|No| G
    H -->|Yes| I[Move to<br/>Next Batch]
```

**Example Scenario**:
1. Practice all 500 questions
2. Results: 300 Mastered, 150 Review Needed, 50 Errors
3. Export the 200 weak questions
4. Import them as a new chapter
5. Practice only these 200 until mastery
6. Repeat

**Why This Is Revolutionary**:
- **Eliminate Wasted Effort**: Stop practicing what you already know
- **Exponential Efficiency**: Each iteration reduces the practice set
- **Customizable Difficulty**: Create personalized question banks
- **Spaced Repetition**: Re-import after time intervals for long-term retention


---

### 10. Progress Tracking & Analytics

Comprehensive dashboards provide insights into your learning journey:

**Chapter-Level Metrics**:
- Total questions per chapter
- Completed questions count
- Accuracy percentage
- Question status distribution (Mastered, Review, Error, etc.)
- Last practice date

**Question-Level Tracking**:
- Individual question status
- Answer history
- Time spent per question
- Confidence level changes over time

**Why This Matters**:
- **Motivation**: Visual progress creates momentum
- **Pattern Recognition**: Identify recurring weak areas
- **Study Planning**: Allocate time based on objective data
- **Long-term Retention**: Monitor decay and reinforce before forgetting

---

## 🏗 Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph Client
        UI[React Frontend<br/>TypeScript + TailwindCSS]
    end
    
    subgraph Backend
        API[FastAPI REST API<br/>Python]
        Parser[Question Parser<br/>Text + DOCX]
        Auth[JWT Authentication]
    end
    
    subgraph Storage
        DB[(PostgreSQL<br/>Structured Data)]
    end
    
    subgraph Processing
        QEngine[Quiz Engine<br/>State Management]
        REngine[Review Engine<br/>Categorization]
        Export[Export Module<br/>CSV/JSON]
    end
    
    UI -->|HTTP/REST| API
    API -->|Parse| Parser
    API -->|CRUD| DB
    API -->|Generate| QEngine
    QEngine -->|Track| REngine
    REngine -->|Update| DB
    API -->|Format| Export
    Auth -->|Secure| API
```


### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Parser
    participant Database
    participant QuizEngine

    User->>Frontend: Paste Raw Questions
    Frontend->>API: POST /questions/import
    API->>Parser: Parse Text
    Parser->>Parser: Extract Questions<br/>Options<br/>Answers<br/>Explanations
    Parser->>API: Structured Data
    API->>Database: Store Questions
    Database-->>API: Confirmation
    API-->>Frontend: Success Response
    
    User->>Frontend: Start Practice Mode
    Frontend->>API: GET /questions?chapter=X&range=Y
    API->>Database: Query Questions
    Database-->>API: Question Set
    API->>QuizEngine: Initialize Session
    QuizEngine-->>Frontend: Quiz State
    
    User->>Frontend: Submit Answer
    Frontend->>QuizEngine: Record Response
    QuizEngine->>QuizEngine: Calculate Stats<br/>Categorize
    QuizEngine->>Database: Update Status
    Database-->>Frontend: Updated Progress
```

---

## 🔧 System Design

### Component Responsibilities

#### Frontend Layer
- **React Components**: Modular UI components for questions, options, results
- **State Management**: React Query for server state, React Context for local state
- **Routing**: React Router for navigation between subjects, chapters, quiz modes
- **Real-time Updates**: Optimistic UI updates with automatic refetching

#### Backend API Layer
- **RESTful Endpoints**: Standard CRUD operations for all resources
- **Authentication**: JWT-based auth with HTTP-only cookies
- **Validation**: Pydantic schemas for request/response validation
- **Error Handling**: Centralized exception handling with detailed error responses


#### Parser Module
- **Text Parser**: Regex-based extraction of questions from plain text
- **DOCX Parser**: python-docx integration for Word document parsing
- **Format Detection**: Automatically identifies question patterns
- **Validation**: Ensures extracted data meets schema requirements
- **Error Recovery**: Handles malformed input gracefully

#### Quiz Engine
- **Session Management**: Tracks active quiz sessions with state persistence
- **Timer Control**: Manages three timer modes (unlimited, per-question, total)
- **Answer Recording**: Captures responses, timestamps, confidence levels
- **Score Calculation**: Real-time accuracy and performance metrics
- **State Serialization**: Saves progress for session resumption

#### Review Engine
- **Auto-Categorization**: Classifies questions based on performance
- **Confidence Tracking**: Monitors self-reported confidence levels
- **Status Updates**: Manages question state transitions (NEW → REVIEW → MASTERED)
- **Analytics Generation**: Aggregates data for dashboards

#### Export/Import Module
- **CSV Serialization**: Converts questions to comma-separated format
- **JSON Serialization**: Structured export with full metadata
- **Import Validation**: Verifies format compliance before import
- **Duplicate Detection**: Prevents importing existing questions
- **Batch Processing**: Handles large imports efficiently

#### Database Layer
- **PostgreSQL**: Relational database for structured data
- **SQLAlchemy ORM**: Python object-relational mapping
- **Alembic Migrations**: Version-controlled schema evolution
- **Indexes**: Optimized queries on frequently accessed columns
- **Transactions**: ACID compliance for data integrity

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | React 18.2 | Component-based UI architecture |
| **Language** | TypeScript 5.3 | Type-safe JavaScript for reduced errors |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS for rapid UI development |
| **Build Tool** | Vite 5.0 | Fast development server and optimized builds |
| **State Management** | React Query 5.17 | Server state management with caching |
| **Form Handling** | React Hook Form 7.49 | Efficient form validation and submission |
| **Routing** | React Router 6.21 | Client-side routing with nested routes |
| **HTTP Client** | Axios 1.6 | Promise-based HTTP requests |
| **Backend Framework** | FastAPI 0.109+ | Modern Python web framework |
| **Backend Language** | Python 3.12+ | Primary server-side language |
| **Database** | PostgreSQL 16+ | Relational database for structured data |
| **ORM** | SQLAlchemy 2.0+ | Python SQL toolkit and ORM |
| **Migrations** | Alembic 1.18+ | Database version control |
| **Authentication** | JWT (python-jose) | Stateless authentication tokens |
| **Password Hashing** | Passlib + Bcrypt | Secure password storage |
| **Document Parsing** | python-docx 1.1+ | Word document question import |
| **WSGI Server** | Uvicorn | ASGI server for FastAPI |
| **Testing** | Vitest + Testing Library | Unit and integration testing |
| **Linting** | ESLint + TypeScript ESLint | Code quality enforcement |
| **Package Manager** | npm | Frontend dependency management |
| **Deployment** | Docker + Docker Compose | Containerized deployment |


---

## 📁 Project Structure

```
recallx/
│
├── frontend/                      # React TypeScript Frontend
│   ├── src/
│   │   ├── api/                  # API client modules
│   │   │   ├── auth.ts           # Authentication endpoints
│   │   │   ├── subjects.ts       # Subject management
│   │   │   ├── chapters.ts       # Chapter management
│   │   │   ├── questions.ts      # Question CRUD operations
│   │   │   └── quiz-progress.ts  # Quiz session management
│   │   │
│   │   ├── components/           # Reusable React components
│   │   │   ├── common/           # Shared components (Button, Card, etc.)
│   │   │   ├── layout/           # Layout components (Sidebar, Header)
│   │   │   ├── chapters/         # Chapter-specific components
│   │   │   ├── quiz/             # Quiz UI components
│   │   │   ├── dashboard/        # Dashboard widgets
│   │   │   ├── import/           # Question import UI
│   │   │   └── auth/             # Login/Register forms
│   │   │
│   │   ├── pages/                # Route-level page components
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── Subjects.tsx      # Subject list
│   │   │   ├── Chapters.tsx      # Chapter management
│   │   │   ├── Quiz.tsx          # Active quiz interface
│   │   │   ├── QuizResults.tsx   # Results screen
│   │   │   ├── QuizReview.tsx    # Answer review
│   │   │   ├── History.tsx       # Past attempts
│   │   │   └── Statistics.tsx    # Analytics dashboard
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts        # Authentication state
│   │   │   ├── useQuizState.ts   # Quiz session state
│   │   │   ├── useTimer.ts       # Timer management
│   │   │   └── useMutation.ts    # Mutation helpers
│   │   │
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── auth.ts           # Auth types
│   │   │   ├── question.ts       # Question models
│   │   │   ├── quiz.ts           # Quiz state types
│   │   │   └── chapter.ts        # Chapter types
│   │   │
│   │   ├── lib/                  # Utility libraries
│   │   │   ├── quizProgress.ts   # Session serialization
│   │   │   ├── api.ts            # Axios configuration
│   │   │   └── constants.ts      # App constants
│   │   │
│   │   ├── styles/               # Global styles
│   │   └── main.tsx              # Application entry point
│   │
│   ├── public/                   # Static assets
│   ├── index.html                # HTML template
│   ├── package.json              # Dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── vite.config.ts            # Vite configuration
│
├── backend/                       # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                  # API route handlers
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── subjects.py       # Subject routes
│   │   │   ├── chapters.py       # Chapter routes
│   │   │   ├── questions.py      # Question routes
│   │   │   ├── quiz_progress.py  # Quiz session routes
│   │   │   └── statistics.py     # Analytics endpoints
│   │   │
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── user.py           # User model
│   │   │   ├── subject.py        # Subject model
│   │   │   ├── chapter.py        # Chapter model
│   │   │   ├── question.py       # Question model
│   │   │   └── quiz_progress.py  # Session model
│   │   │
│   │   ├── schemas/              # Pydantic validation schemas
│   │   │   ├── auth.py           # Auth DTOs
│   │   │   ├── question.py       # Question DTOs
│   │   │   ├── quiz.py           # Quiz DTOs
│   │   │   └── statistics.py     # Stats DTOs
│   │   │
│   │   ├── core/                 # Core application logic
│   │   │   ├── config.py         # Configuration management
│   │   │   ├── database.py       # Database connection
│   │   │   ├── security.py       # Password hashing, JWT
│   │   │   └── exceptions.py     # Custom exceptions
│   │   │
│   │   ├── utils/                # Utility modules
│   │   │   ├── question_parser.py # Text/DOCX parsing
│   │   │   ├── export.py         # CSV/JSON export
│   │   │   └── validators.py     # Custom validators
│   │   │
│   │   └── main.py               # FastAPI application
│   │
│   ├── alembic/                  # Database migrations
│   │   ├── versions/             # Migration scripts
│   │   └── env.py                # Alembic configuration
│   │
│   ├── requirements.txt          # Python dependencies
│   ├── alembic.ini               # Migration config
│   └── .env.example              # Environment variables template
│
├── docker-compose.yml            # Multi-container orchestration
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

---

## 🔄 Workflow

### Complete User Journey

```mermaid
graph TD
    A[User Collects Questions] --> B[Paste Raw Text]
    B --> C{Parser}
    C -->|Success| D[Questions Stored]
    C -->|Error| E[Validation Feedback]
    E --> B
    
    D --> F[Select Practice Mode]
    F --> G{Mode Type}
    G -->|Practice| H[Immediate Feedback]
    G -->|Exam| I[No Feedback]
    
    H --> J[Answer Questions]
    I --> J
    
    J --> K[Configure Timer]
    K --> L{Timer Type}
    L -->|Unlimited| M[No Pressure]
    L -->|Per Question| N[Fixed Time/Q]
    L -->|Total Time| O[Overall Limit]
    
    M --> P[Choose Batch/Range]
    N --> P
    O --> P
    
    P --> Q[Start Quiz]
    Q --> R[Complete Session]
    R --> S[Auto-Categorize]
    
    S --> T[Review Dashboard]
    T --> U{Weak Areas?}
    U -->|Yes| V[Export Weak Questions]
    U -->|No| W[Continue Learning]
    
    V --> X[Merge Files]
    X --> Y[Import as New Set]
    Y --> Z[Practice Focused Set]
    Z --> U
```


### Step-by-Step Workflow

1. **Question Import**
   - User pastes raw question text or uploads DOCX file
   - Parser extracts structured data
   - Questions automatically stored in database
   - Immediate validation feedback

2. **Practice Configuration**
   - Select chapter or subject
   - Choose practice mode (Practice/Exam)
   - Configure timer (Unlimited/Per Question/Total)
   - Set batch size or custom range
   - Optional: Filter by question status

3. **Active Practice**
   - Questions presented one at a time
   - Timer starts (if configured)
   - User selects answer
   - Immediate feedback (Practice Mode) or deferred (Exam Mode)
   - Confidence level recorded
   - Progress saved automatically

4. **Review & Analysis**
   - Session complete with score and breakdown
   - Questions auto-categorized (Mastered, Review, Error, etc.)
   - Dashboard updated with new stats
   - Identify weak areas visually

5. **Targeted Revision**
   - Export weak questions (Review + Error categories)
   - Merge multiple exports if needed
   - Import as new focused chapter
   - Repeat practice until mastery
   - Archive mastered content

---

## 🎯 Key Design Decisions

### 1. Why Automatic Parsing?

**Decision**: Build intelligent parser instead of structured forms.

**Rationale**:
- Government exam aspirants often have questions in text files or Word documents
- Manual entry of 1000+ questions is prohibitively time-consuming
- Reduces friction to adoption—users can start immediately
- Eliminates data entry errors from fatigue

**Tradeoff**: Parser must handle format variations, requiring robust error handling

---

### 2. Why Two Practice Modes?

**Decision**: Separate "Practice" and "Exam" modes rather than unified approach.

**Rationale**:
- **Practice Mode**: Optimized for learning through immediate feedback
- **Exam Mode**: Optimized for assessment and simulation
- Different cognitive processes require different UI patterns
- Users can choose mode based on their current learning phase

**Tradeoff**: Slightly increased code complexity, but dramatically better UX


---

### 3. Why Batch and Range Practice?

**Decision**: Provide fine-grained control over practice scope.

**Rationale**:
- Mental fatigue from long sessions reduces retention
- Students want to practice specific chapters or topics
- Enables progressive learning (master chapter 1 before moving to chapter 2)
- Supports spaced repetition by revisiting specific ranges

**Tradeoff**: More configuration options increase cognitive load, mitigated by sensible defaults

---

### 4. Why Export/Import Workflow?

**Decision**: Enable question export and re-import rather than just filtering.

**Rationale**:
- Users want to isolate weak areas permanently for repeated practice
- Export creates portable backups
- Allows advanced workflows (merge multiple weak area exports)
- Enables sharing question banks with study groups

**Tradeoff**: Additional feature to maintain, but provides exponential value to power users

---

### 5. Why Confidence-Based Categorization?

**Decision**: Track self-reported confidence in addition to correctness.

**Rationale**:
- Answering correctly by guessing is not mastery
- Confidence correlates with long-term retention
- Enables proactive review before forgetting occurs
- Builds metacognitive skills

**Tradeoff**: Requires user to self-assess, but research shows this improves learning

---

## ⚡ Performance Considerations

### Parser Optimization
- **Regex Compilation**: Pre-compiled patterns for faster matching
- **Streaming**: Process large DOCX files without loading entire document into memory
- **Async Processing**: Non-blocking I/O for file uploads
- **Validation Pipelines**: Early rejection of malformed input

### Database Optimization
- **Indexes**: B-tree indexes on frequently queried columns (chapter_id, user_id, status)
- **Pagination**: Limit result sets to prevent memory overload
- **Connection Pooling**: Reuse database connections for reduced latency
- **Lazy Loading**: Load related entities only when needed

### Frontend Performance
- **Code Splitting**: Lazy load route components to reduce initial bundle size
- **React Query Caching**: Minimize redundant API calls
- **Optimistic Updates**: Instant UI feedback while waiting for server confirmation
- **Virtual Scrolling**: Efficient rendering of large question lists
- **Memoization**: Prevent unnecessary re-renders with useMemo and useCallback

### Scalability
- **Stateless API**: Horizontally scalable backend servers
- **JWT Auth**: No server-side session storage required
- **CDN-Ready**: Static assets can be served from CDN
- **Database Sharding**: Future-ready architecture for multi-tenant scaling


---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ (for frontend)
- **Python**: v3.12+ (for backend)
- **PostgreSQL**: v16+ (database)
- **Docker** (optional, for containerized setup)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/recallx.git
cd recallx

# Start all services with Docker Compose
docker-compose up -d

# Access the application
Frontend: http://localhost:5173
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

#### Option 2: Local Development

**Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secret key

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Start the development server
npm run dev
```

### Environment Variables

**Backend (.env)**

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/recallx

# JWT Authentication
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# CORS Settings
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost

# Cookie Security
COOKIE_SECURE=false  # Set to true in production
COOKIE_SAMESITE=lax
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:8000
```


---

## 📖 Usage

### Creating Your First Subject

1. Log in to the application
2. Navigate to "Subjects" from the sidebar
3. Click "Add Subject" and enter subject name (e.g., "Data Structures")
4. Click "Save"

### Adding a Chapter

1. Click on your newly created subject
2. Click "Add Chapter" and enter chapter name (e.g., "Arrays and Strings")
3. Click "Save"

### Importing Questions

1. Open the chapter
2. Click "Import Questions"
3. Paste your raw question text in this format:

```
Question: What is the time complexity of binary search?
A. O(n)
B. O(log n)
C. O(n²)
D. O(1)
Answer: B
Explanation: Binary search divides the search space in half with each comparison.

Question: Which data structure uses LIFO principle?
A. Queue
B. Stack
C. Heap
D. Tree
Answer: B
```

4. Click "Parse and Import"
5. Review the parsed questions
6. Click "Confirm Import"

### Starting Practice

1. Select a chapter
2. Click "Start Quiz"
3. Configure your quiz:
   - Mode: Practice or Exam
   - Timer: Unlimited, Per Question (90s), or Total Time (60 min)
   - Batch Size: 25, 50, 100, or All
   - Range: All questions or custom range (e.g., 1-50)
4. Click "Start"
5. Answer questions
6. View results and review

### Exporting Weak Areas

1. Complete a practice session
2. Go to Dashboard
3. View your chapter statistics
4. Click "Export" on chapters with errors
5. Choose categories: "Error" and "Review Needed"
6. Download CSV or JSON file

### Importing for Focused Revision

1. Navigate to "Subjects"
2. Create a new subject called "Weak Areas"
3. Create a new chapter
4. Click "Import Questions"
5. Upload your exported file
6. Start practicing

---

## 🔮 Future Enhancements

### Planned Features

#### Cloud Synchronization
- **Multi-device sync**: Access your questions across desktop, tablet, and mobile
- **Real-time updates**: Changes reflected immediately across all devices
- **Conflict resolution**: Intelligent merging of offline changes
- **Backup & restore**: Automated cloud backups with point-in-time recovery

#### Advanced Authentication
- **Social login**: Google, GitHub, Microsoft authentication
- **Multi-factor authentication**: Enhanced security for sensitive data
- **Role-based access**: Share question banks with read-only or edit permissions
- **Team workspaces**: Collaborate with study groups

#### Spaced Repetition Algorithm
- **SM-2 Algorithm**: Scientifically proven spacing intervals
- **Automatic scheduling**: System suggests when to review each question
- **Difficulty adjustment**: Dynamically adjust intervals based on performance
- **Forgetting curve tracking**: Visualize retention over time

#### AI-Powered Features
- **Auto-generated explanations**: AI creates explanations for questions without them
- **Concept extraction**: Automatically tag questions by topic
- **Difficulty prediction**: ML model estimates question difficulty
- **Personalized recommendations**: AI suggests optimal practice sequences

#### OCR Document Import
- **PDF text extraction**: Import questions directly from PDF files
- **Image OCR**: Extract questions from screenshots or photos
- **Handwriting recognition**: Support handwritten question notes
- **Batch processing**: Process multiple documents simultaneously

#### Advanced Analytics
- **Learning curve visualization**: Graph performance improvement over time
- **Weakness heatmaps**: Visual representation of weak topics
- **Session insights**: Analyze patterns in practice sessions
- **Predictive scoring**: Estimate exam performance based on current stats
- **Comparative analytics**: Benchmark against anonymized peer data

#### Enhanced Question Features
- **Multi-level tagging**: Organize by topic, difficulty, importance
- **Question search**: Full-text search across question banks
- **Smart filters**: Complex queries (e.g., "hard questions I got wrong twice")
- **Question notes**: Add personal annotations to questions
- **Favorites system**: Bookmark important questions

#### Mobile Applications
- **Native iOS app**: Optimized experience for iPhone and iPad
- **Native Android app**: Material Design with offline support
- **Progressive Web App**: Install on any device
- **Push notifications**: Reminders for scheduled reviews

#### Collaboration Features
- **Leaderboards**: Compete with friends and study groups
- **Question sharing**: Share individual questions or entire chapters
- **Study groups**: Create private groups with shared progress
- **Discussion threads**: Comment and discuss difficult questions

#### Offline Mode
- **Service Worker**: Full offline functionality
- **Sync queue**: Automatic sync when connection restored
- **Conflict resolution**: Handle simultaneous online/offline changes
- **Storage optimization**: Efficient local caching strategies


---

## 🤝 Contributing

Contributions are welcome! This project follows standard open-source contribution guidelines.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style and conventions
   - Add tests for new features
   - Update documentation as needed

4. **Run tests**
   ```bash
   # Frontend tests
   cd frontend && npm run test

   # Backend tests
   cd backend && pytest
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Code Style

**Frontend**
- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Component names in PascalCase
- Hooks prefix with `use`

**Backend**
- PEP 8 style guide
- Type hints for function signatures
- Docstrings for public APIs
- Snake_case for variables and functions

### Reporting Issues

Found a bug or have a feature request? Please open an issue with:

- **Bug reports**: Steps to reproduce, expected vs actual behavior, screenshots
- **Feature requests**: Use case description, proposed solution, alternatives considered

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

**Note**: This is a client project developed as a freelance engagement. The code is not open-source and is shared here for portfolio and demonstration purposes only.

For licensing inquiries, please contact the project maintainer.

---

## 📸 Screenshots

> *Screenshots coming soon. The application is currently in active development.*

### Dashboard Overview
<!-- ![Dashboard](docs/images/dashboard.png) -->

### Question Import Interface
<!-- ![Import](docs/images/import.png) -->

### Practice Mode
<!-- ![Practice](docs/images/practice.png) -->

### Exam Mode
<!-- ![Exam](docs/images/exam.png) -->

### Results & Analytics
<!-- ![Results](docs/images/results.png) -->

---

## 🎥 Demo

> *Live demo link will be added upon deployment.*

<!-- [View Live Demo](https://recallx-demo.example.com) -->

---

## 📞 Contact

**Project Developer**: [Your Name]
- **Email**: your.email@example.com
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- **GitHub**: [Your GitHub Profile](https://github.com/yourusername)
- **Portfolio**: [Your Portfolio Website](https://yourportfolio.com)

**Client**: Government Exam Preparation Services

---

## 🙏 Acknowledgments

- Client for providing domain expertise and requirements
- FastAPI and React communities for excellent documentation
- Open-source contributors whose libraries power this application
- Beta testers who provided valuable feedback during development

---

## 📊 Project Status

| Milestone | Status | Completion |
|-----------|--------|------------|
| Core Architecture | ✅ Complete | 100% |
| Authentication System | ✅ Complete | 100% |
| Question Parser | ✅ Complete | 100% |
| Practice Mode | ✅ Complete | 100% |
| Exam Mode | ✅ Complete | 100% |
| Timer System | ✅ Complete | 100% |
| Review Engine | ✅ Complete | 100% |
| Export/Import | ✅ Complete | 100% |
| Progress Tracking | ✅ Complete | 100% |
| Responsive Design | ✅ Complete | 100% |
| Mobile Optimization | 🚧 In Progress | 85% |
| Cloud Sync | 📋 Planned | 0% |
| AI Features | 📋 Planned | 0% |

---

<div align="center">

**Built with ❤️ for exam aspirants who refuse to give up**

[⬆ Back to Top](#recallx)

</div>
