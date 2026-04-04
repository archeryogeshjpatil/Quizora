# Quizora

**Online Examination Platform — Powered by Archer Infotech**

Quizora is a full-stack web application for conducting objective-type online examinations with AI-based question generation, rich math and code support, student performance analytics, leaderboard, practice mode, test series, certificate generation, multi-language support, proctoring, plagiarism detection, and result distribution.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 17 (Prisma ORM) |
| Cache/Queue | Redis, BullMQ |
| AI | Groq (Llama 3.3 70B) — supports Claude, ChatGPT, Gemini, Grok |
| Rich Editor | TipTap with formula toolbar |
| Charts | Recharts |
| Real-time | Socket.IO |
| PDF | PDFKit |
| Excel | xlsx |
| OCR | Tesseract.js |
| i18n | react-i18next (English, Hindi, Marathi) |

---

## Features

### Authentication (SRS 3)
- Student registration with full name, email, mobile, password
- OTP verification provision (ready to plug in when email configured)
- Student sign-in via email or mobile + password
- Admin login via dedicated URL (`/admin/login`)
- Forgot password / reset password provision
- JWT-based session management
- Rate limiting (5 failed attempts)

### Admin Panel

#### Subject & Topic Management (SRS 4.1 + Extra)
- Create, edit, delete subjects
- Topics within subjects (sub-categorization)
- Expandable subject rows showing topics with question/test counts

#### Question Bank Management (SRS 4.2)
- Manual question CRUD with rich text editor
- 5 question types: MCQ, MSQ, True/False, Matching, Assertion & Reasoning
- 4 difficulty levels: Simple, Moderate, Hard, Very Hard
- Topic assignment for each question
- Filter by subject, topic, type, difficulty
- Pagination

#### AI-Based Question Generation (SRS 4.3)
- Two input modes:
  - **Upload File** — PDF, DOCX, TXT, PPTX, JPG, PNG (OCR for images)
  - **Enter Topic** — type topic name and subtopics directly
- Configurable parameters: subject, count, difficulty (including Mixed), question type (including Mixed), language
- Powered by Groq (Llama 3.3 70B) — free tier
- Per-question admin review actions (SRS 4.3.4):
  - Accept / Edit / Reject / Regenerate / Accept All
- Destination choice (SRS 4.3.5):
  - Save to Question Bank
  - Add directly to an active test

#### Rich Question Editor (SRS 4.4)
- TipTap-based editor with visible toolbar
- Formula toolbar with one-click symbol insertion:
  - Arithmetic, Algebra, Calculus, Greek letters, Set Theory, Logic, Chemistry, Fractions
- LaTeX input mode — type LaTeX formula with live preview
- Copy-paste formula handling — auto-detects LaTeX, Unicode math, MathML
- Code block insertion with syntax highlighting
- Image insertion
- Bold, italic, underline, lists, headings

#### Bulk Question Import (SRS 4.5)
- Downloadable Excel template (`.xlsx`) with sample rows and instructions
- Upload filled Excel/CSV file with subject and topic selection
- Row-by-row validation with error reporting
- Import summary: total rows, imported count, failed count with reasons
- Template download without authentication

#### Question Versioning (SRS 4.6)
- Version history preserved on every edit
- View all previous versions
- Restore any previous version

#### Test Configuration (SRS 4.7, 4.8)
- **Create Test** — manual question selection with all config options:
  - Title, subject, topic, type (Official/Practice)
  - Timing: time-based toggle, duration, auto-submit on timeout
  - Scheduling: start/end date window
  - Attempts: max attempts (unlimited for practice)
  - Marking: marks per question, negative marking with configurable deduction
  - Display: questions per page, allow review/revisit
  - Integrity: tab-switch prevention (warn/auto-submit), webcam proctoring toggle
  - Result: show immediately or hold for admin
  - Certificate: enable with passing percentage
- **Auto Create Test** — select parameters, system auto-picks questions:
  - Subject, topic, count, difficulty, question type (specific or Mixed)
  - Option to exclude questions already used in other tests
- **Question usage warning** — shows which tests a question is already in
- **Test detail/edit view** — click any test to view, modify settings, add/remove questions, change status

#### Test Series / Batches (SRS 4.9)
- Create named series with description
- Add multiple official tests in order
- Scoring method: Sum, Average, Weighted Average
- Series-level passing percentage
- Series-level certificate (optional)
- Student view with progress tracking

#### User Management (SRS 4.10)
- Student list with search, status filter, pagination
- Student detail view: profile, stats, attempt history, certificates
- Activate / deactivate accounts

#### Proctoring via Webcam (SRS 4.11)
- Enable per test
- Webcam snapshot capture during test
- Snapshot storage with timestamps
- Admin review of snapshots per student
- Face detection service (provision for no-face/multiple-face alerts)
- Proctoring flag in results

#### Plagiarism & Copy Detection (SRS 4.12)
- Answer pattern similarity analysis (flags >80% match)
- Time-based analysis (unusually fast completion)
- Tab-switch correlation with performance spikes
- Similarity score display
- Admin review: accept or disqualify

#### Question Difficulty Auto-Calibration (SRS 4.13)
- Triggers after 30+ student attempts
- Calculates correct-answer rate per question
- Suggests revised difficulty (Simple/Moderate/Hard/Very Hard)
- Admin can accept or reject suggestions

#### Admin Analytics Dashboard (SRS 4.14)
- Platform-wide stats: total students, tests, attempts, avg score
- Per-test analytics with charts (Recharts):
  - Score distribution bar chart (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
  - Pass/fail pie chart
  - Top 10 scorers table
- Test selector dropdown

#### Result Management & Export (SRS 4.15)
- View results per test: name, email, mobile, score, percentage, rank, time, date
- **PDF export** — formatted result sheet with ranked table (PDFKit)
- **Excel export** — tabular `.xlsx` download (xlsx library)

#### Certificate Generation (SRS 4.16)
- Enable per test with passing percentage
- Auto-generate PDF certificates for passing students
- Certificate includes: student name, test name, subject, score, percentage, date, unique ID
- Student download from dashboard
- Admin view and download
- **Series-level certificate** — generated when student passes all tests in a series

#### Result Dispatch (SRS 4.17)
- Channel selection: Email, Telegram, WhatsApp (provision)
- Recipient selection: all students or selected
- Email: Nodemailer with SMTP/SendGrid
- Telegram: Bot API integration (free)
- WhatsApp: architecture ready with Twilio/Meta Cloud API code (commented, plug-in when ready)
- Fallback: email sent when other channels unavailable

#### Scheduled Result Auto-Dispatch (SRS 4.18)
- Set future date/time for automatic dispatch
- Status tracking: Pending, Scheduled, Sent, Failed
- Cancel or reschedule
- **Background job runner** — checks every 60 seconds, executes due dispatches

### Exam Engine — Student Side

#### Student Dashboard (SRS 5.1)
- Available official tests (within scheduling window)
- Available practice tests
- Test series with progress
- Language selector (English, Hindi, Marathi)
- Navigation to leaderboard, analytics, certificates, results

#### Leaderboard (SRS 5.2)
- **Test-level leaderboard** — rank, name, score, percentage, time
- **Series-level leaderboard** — cumulative rankings across series tests
- Tabs to switch between test and series leaderboard
- **Current student's rank highlighted** (blue background + "(You)" label)
- Gold, silver, bronze badges for top 3

#### Performance Analytics Dashboard (SRS 5.3)
- Summary cards: tests attempted, avg score, best score, subjects covered
- **Score trend line chart** (Recharts) over time
- **Subject-wise bar chart** with avg percentages
- **Strength/Weakness analysis** — top 3 strong, bottom 3 weak subjects
- **Practice vs Official comparison** — side-by-side stats
- **Time management** — avg time taken vs allowed with progress bars

#### Test History & Answer Review with AI Assist (SRS 5.4)
- Detailed review: every question, student answer, correct answer, marks, explanation
- Color-coded options: green = correct, red = student's wrong choice
- **4 AI assist icons**: Claude, ChatGPT, Gemini, Grok (all powered by Groq)
- In-app modal with AI explanation
- **Bookmark** toggle on each question in review
- **Bookmark filter** — show bookmarked only with quick-jump

#### Bookmark / Flag a Question (SRS 5.5)
- Bookmark icon on each question during test
- Bookmarked questions highlighted in navigator sidebar
- Bookmarks persist in review page

#### Practice Mode (SRS 5.6)
- Clearly labelled "Practice" in dashboard
- Unlimited attempts
- No certificate, no leaderboard
- Answer review with correct answers shown after full submission

#### Pre-Test Screen (SRS 5.7)
- Test name, subject, type, question count, total marks, duration
- Attempt number
- Instructions (rich text)
- Webcam permission prompt (if proctoring enabled)
- Start Test button

#### During the Test (SRS 5.8)
- Questions displayed per admin config (questions per page)
- Countdown timer with color warnings (<5 min orange, <1 min red pulsing)
- Auto-submit on timer expiry (if enabled)
- Tab-switch detection and action (warn or auto-submit)
- Bookmark/flag icon on each question
- Review/revisit answered questions (if enabled)
- Auto-save every 30 seconds
- Question navigator sidebar with color-coded status
- Submit confirmation modal with answered/unanswered/bookmarked counts

#### Submission (SRS 5.9)
- Submit button with confirmation prompt
- Score calculation with full marking rules:
  - Correct: full marks
  - Wrong: negative marks (if enabled)
  - Unattempted: zero
  - MSQ partial marking (if enabled)
  - Matching: all-or-nothing

#### Post-Test Result Screen (SRS 5.10)
- Immediate result (if enabled): score, percentage, pass/fail, correct/incorrect/unattempted, time taken
- Held result: "Your result will be published by admin shortly"
- Certificate download button (if passed)
- Review answers button

### Question Types (SRS 6)
- MCQ — one correct answer from 4 options
- MSQ — multiple correct answers, partial marking configurable
- True/False — two options
- Matching — column A matched to column B
- Assertion & Reasoning — A+R with 4 standard options

### Scoring & Marking Rules (SRS 7)
- Full marks for correct answer
- Configurable negative marking for wrong answers
- Zero for unattempted
- MSQ partial marking option
- Matching: all-or-nothing scoring

### Multi-Language Support (SRS 8)
- UI in English (default), Hindi, Marathi
- 130+ translation keys per language
- Language selector on login page and dashboard
- Question content supports any language

### Result Distribution Channels (SRS 9)
- Email (Nodemailer/SendGrid)
- Telegram Bot API (free)
- WhatsApp Business API (provision, ready to plug in)
- Fallback: email mandatory when other channels unavailable

### Notifications & Alerts (SRS 10)
- Notification bell in header with unread count badge
- Notification dropdown with mark-read
- Auto-polls every 30 seconds
- Auto-triggered events:
  - New student registration
  - AI question generation complete
  - Bulk import complete
  - Result dispatch executed
  - Proctoring anomaly detected
  - Plagiarism flag raised

### Non-Functional Requirements (SRS 11)
- Responsive design (Tailwind CSS)
- Secure: bcrypt password hashing, JWT with expiry, HTTPS ready
- Auto-save every 30 seconds during test
- Formula rendering (KaTeX/MathJax ready)
- Code syntax highlighting
- Certificate uniqueness (unique ID per certificate)
- Concurrent test-taking support (Prisma handles concurrency)
- Audit log model for event tracking
- Data retention: versioning, logs, dispatch records

---

## Extra Features (Beyond SRS)

| Feature | Description |
|---------|-------------|
| Topics within Subjects | Sub-categorization: Subject > Topic > Questions/Tests |
| Auto Create Test | Admin selects parameters, system auto-picks questions |
| AI Generate from Text | Type topic/subtopics directly instead of file upload |
| Mixed Difficulty & Type | AI generates questions across all difficulties/types |
| Question Usage Warning | Shows which tests a question is already used in |
| Groq Free AI Provider | Free LLM fallback when paid API keys unavailable |
| Notification System | Full inbox with unread count, mark-read, auto-polling |
| Scheduled Dispatch Runner | Background job checks every 60s, auto-executes dispatches |
| Student Detail View | Admin sees full student profile, stats, history, certificates |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 17
- Redis

### Installation

```bash
git clone https://github.com/archeryogeshjpatil/Quizora.git
cd Quizora
npm run install:all
```

### Configuration

Copy `.env.example` to `server/.env` and configure:

```bash
cp .env.example server/.env
```

Key variables:
```
DATABASE_URL=postgresql://username@localhost:5432/quizora
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
GROQ_API_KEY=your-groq-api-key
```

### Database Setup

```bash
createdb quizora
npm run db:migrate
npm run db:seed
```

### Run

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5001

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@quizora.com | admin@123 |
| Student | rahul@test.com | student@123 |
| Student | priya@test.com | student@123 |

---

## Project Structure

```
Quizora/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── common/         # Layout, RichTextEditor, NotificationBell, etc.
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages (Dashboard, Subjects, Questions, Tests, etc.)
│   │   │   ├── auth/           # Login, Register, Admin Login
│   │   │   └── student/        # Student pages (Dashboard, Exam, Review, Analytics, etc.)
│   │   ├── context/            # AuthContext, LanguageContext
│   │   ├── services/           # API service layer
│   │   ├── i18n/               # Translation files (en, hi, mr)
│   │   └── types/              # TypeScript types
│   └── vite.config.ts
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── controllers/        # Route handlers (17 controllers)
│   │   ├── routes/             # API routes (15 route files)
│   │   ├── middlewares/        # Auth, rate limiting, file upload
│   │   ├── services/           # Business logic
│   │   │   ├── ai/             # Claude, ChatGPT, Gemini, Grok, Groq, Question Generator
│   │   │   ├── messaging/      # Email, Telegram, WhatsApp
│   │   │   ├── certificates/   # PDF certificate generator
│   │   │   ├── ocr/            # Tesseract.js
│   │   │   ├── parsers/        # PDF, DOCX, PPTX, TXT parsers
│   │   │   └── proctoring/     # Face detection
│   │   ├── jobs/               # Background jobs (dispatch runner, calibration)
│   │   ├── config/             # Environment, Redis, Socket.IO
│   │   └── utils/              # OTP, notifications
│   ├── prisma/                 # Database schema & migrations
│   └── uploads/                # Local file storage
│
└── documents/                  # Planning docs
    └── Application Planning/
        └── exam_application_requirements_FINAL.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Student registration |
| POST | /api/auth/login | Student login |
| POST | /api/auth/admin/login | Admin login |
| GET | /api/subjects | List subjects |
| GET | /api/topics/subject/:id | List topics by subject |
| GET | /api/questions | List questions (filtered) |
| POST | /api/questions | Create question |
| POST | /api/questions/ai-generate | AI generate from file |
| POST | /api/questions/ai-generate-from-text | AI generate from text |
| POST | /api/questions/batch-save | Batch save to question bank |
| POST | /api/questions/bulk-import | Import from Excel/CSV |
| GET | /api/questions/bulk-import/template | Download Excel template |
| GET | /api/tests | List all tests |
| POST | /api/tests | Create test |
| POST | /api/tests/auto-create | Auto-create test |
| GET | /api/tests/available | Available tests for student |
| POST | /api/tests/:id/start | Start test attempt |
| POST | /api/tests/:id/submit | Submit test with scoring |
| GET | /api/tests/:id/review | Get answer review |
| GET | /api/series | List test series |
| GET | /api/series/student | Student series with progress |
| GET | /api/analytics/admin/dashboard | Admin platform stats |
| GET | /api/analytics/admin/test/:id | Per-test analytics |
| GET | /api/analytics/student/dashboard | Student stats |
| GET | /api/analytics/leaderboard/test/:id | Test leaderboard |
| GET | /api/results/test/:id | Test results |
| GET | /api/results/export/:id/pdf | Export results as PDF |
| GET | /api/results/export/:id/excel | Export results as Excel |
| POST | /api/results/dispatch | Dispatch results |
| POST | /api/results/schedule-dispatch | Schedule dispatch |
| POST | /api/plagiarism/analyze/:id | Analyze plagiarism |
| POST | /api/calibration/test/:id | Run difficulty calibration |
| POST | /api/certificates/generate/:id | Generate certificates |
| GET | /api/notifications | Get notifications |
| POST | /api/ai/ask/claude | AI assist (Claude) |
| POST | /api/ai/ask/chatgpt | AI assist (ChatGPT) |
| POST | /api/ai/ask/gemini | AI assist (Gemini) |
| POST | /api/ai/ask/grok | AI assist (Grok) |

---

## Database Schema

17 models across the application:

- **User** — admin and student accounts
- **Subject** — exam subject categories
- **Topic** — sub-categories within subjects
- **Question** — question bank with rich text, options, versioning
- **QuestionOption** — answer options (A, B, C, D, E)
- **QuestionVersion** — version history for questions
- **Test** — test configuration (official/practice)
- **TestQuestion** — junction: test-to-question mapping
- **TestSeries** — grouped test series
- **SeriesTest** — junction: series-to-test mapping
- **TestAttempt** — student test attempts with scores
- **ProctoringSnapshot** — webcam snapshots during tests
- **ProctoringFlag** — proctoring anomaly flags
- **PlagiarismFlag** — plagiarism detection flags
- **Bookmark** — student question bookmarks
- **Certificate** — generated PDF certificates
- **Notification** — system notifications
- **DispatchLog** — result dispatch tracking
- **AuditLog** — system audit trail

---

**Quizora** — Powered by Archer Infotech
