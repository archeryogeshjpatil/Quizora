# Objective Test Exam — Web Application Requirements Document

**Document Type:** Software Requirements Specification (SRS)
**Version:** 3.0 (Final)
**Scope:** Full-stack web application for conducting objective-type online examinations with admin management, AI-based question generation, rich math and code editor, student performance analytics, leaderboard, practice mode, test series, certificate generation, multi-language support, proctoring, plagiarism detection, and result distribution via Email, WhatsApp, and Telegram.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [User Roles](#2-user-roles)
3. [Authentication Module](#3-authentication-module)
4. [Admin Panel](#4-admin-panel)
   - 4.1 [Subject & Category Management](#41-subject--category-management)
   - 4.2 [Question Bank Management](#42-question-bank-management)
   - 4.3 [AI-Based Question Generation from Syllabus / Notes](#43-ai-based-question-generation-from-syllabus--notes)
   - 4.4 [Rich Question Editor — Math, Formulas & Code Support](#44-rich-question-editor--math-formulas--code-support)
   - 4.5 [Bulk Question Import via Excel / CSV](#45-bulk-question-import-via-excel--csv)
   - 4.6 [Question Versioning](#46-question-versioning)
   - 4.7 [Test Configuration — Official Tests](#47-test-configuration--official-tests)
   - 4.8 [Practice Mode Test Configuration](#48-practice-mode-test-configuration)
   - 4.9 [Test Series / Batches](#49-test-series--batches)
   - 4.10 [User Management](#410-user-management)
   - 4.11 [Proctoring via Webcam](#411-proctoring-via-webcam)
   - 4.12 [Plagiarism & Copy Detection](#412-plagiarism--copy-detection)
   - 4.13 [Question Difficulty Auto-Calibration](#413-question-difficulty-auto-calibration)
   - 4.14 [Admin Analytics Dashboard](#414-admin-analytics-dashboard)
   - 4.15 [Result Management & Export](#415-result-management--export)
   - 4.16 [Certificate Generation](#416-certificate-generation)
   - 4.17 [Result Dispatch](#417-result-dispatch)
   - 4.18 [Scheduled Result Auto-Dispatch](#418-scheduled-result-auto-dispatch)
5. [Exam Engine — Student Side](#5-exam-engine--student-side)
   - 5.1 [Student Dashboard](#51-student-dashboard)
   - 5.2 [Leaderboard](#52-leaderboard)
   - 5.3 [Performance Analytics Dashboard](#53-performance-analytics-dashboard)
   - 5.4 [Test History & Answer Review with AI Assist](#54-test-history--answer-review-with-ai-assist)
   - 5.5 [Bookmark / Flag a Question](#55-bookmark--flag-a-question)
   - 5.6 [Practice Mode — Student Experience](#56-practice-mode--student-experience)
   - 5.7 [Pre-Test Screen](#57-pre-test-screen)
   - 5.8 [During the Test](#58-during-the-test)
   - 5.9 [Submission](#59-submission)
   - 5.10 [Post-Test Result Screen](#510-post-test-result-screen)
6. [Question Types](#6-question-types)
7. [Scoring & Marking Rules](#7-scoring--marking-rules)
8. [Multi-Language Support](#8-multi-language-support)
9. [Result Distribution Channels](#9-result-distribution-channels)
10. [Notifications & Alerts](#10-notifications--alerts)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Glossary](#12-glossary)

---

## 1. Application Overview

This is a web-based examination platform that allows an **Admin** to create and manage objective-type tests across multiple subject categories. The admin can manually create questions, import them via Excel/CSV, or **upload syllabus documents and notes for AI-based automatic question generation**. The platform provides a **rich editor** supporting mathematical formulas (LaTeX/MathJax), Greek symbols, and syntax-highlighted code blocks — all rendered correctly for students during the exam.

Students register, log in, appear for official and practice tests, review their performance through an analytics dashboard and leaderboard, and can consult AI assistants (Claude, ChatGPT, Gemini, Grok) during answer review. Results are exported in PDF/Excel and dispatched via Email, WhatsApp, and/or Telegram. Passing students receive auto-generated certificates. The platform supports **multiple languages** for both the UI and question content.

---

## 2. User Roles

| Role    | Description                                                                              |
|---------|------------------------------------------------------------------------------------------|
| Admin   | Full control over subjects, questions, tests, users, proctoring, results, and dispatch   |
| Student | Registers, logs in, takes official and practice tests, reviews performance, gets results  |

- Only **one admin** role in v1 (super admin). Multi-admin is out of scope.
- Students self-register. Admin accounts are pre-created.

---

## 3. Authentication Module

### 3.1 Student Registration (Sign-Up)

| Field            | Type     | Mandatory | Notes                                      |
|------------------|----------|-----------|--------------------------------------------|
| Full Name        | Text     | Yes       |                                            |
| Email Address    | Email    | Yes       | Must be unique                             |
| Mobile Number    | Phone    | Yes       | Must be unique; used for WhatsApp/Telegram |
| Password         | Password | Yes       | Minimum 8 characters                       |
| Confirm Password | Password | Yes       |                                            |

**Verification:** After registration, the student must verify their identity before accessing any test. Verification is done via **Email OTP** or **Mobile OTP** — student chooses. Account remains in *pending* state until verified.

### 3.2 Student Sign-In

- Login via **Email + Password** or **Mobile Number + Password**.
- Sessions managed via secure tokens (JWT).
- Rate-limited after 5 consecutive failed attempts.

### 3.3 Forgot Password / Reset Password

- Available on the login page for both students and admin.
- Enter registered email or mobile number → receive OTP or reset link.
- Reset links/OTPs expire after **15 minutes**.
- On successful OTP verification, user sets a new password.

### 3.4 Admin Login

- Dedicated admin login URL (e.g., `/admin/login`).
- Admin credentials pre-configured; not publicly registrable.
- Admin also has forgot password / reset via email.

---

## 4. Admin Panel

### 4.1 Subject & Category Management

- Admin creates, edits, and deletes subject categories (e.g., Mathematics, Physics, Python Programming, General Knowledge).
- Each test and question is linked to one subject category.
- Categories organise the question bank and allow students to filter available tests.

---

### 4.2 Question Bank Management

Admin manually adds, edits, and deletes questions. Each question includes:

| Field                  | Details                                                        |
|------------------------|----------------------------------------------------------------|
| Subject category       | Linked to one category                                         |
| Question type          | MCQ / MSQ / True-False / Matching / Assertion & Reasoning      |
| Difficulty level       | Simple / Moderate / Hard / Very Hard                           |
| Question text          | Rich text with math, images, and code support                  |
| Answer options         | Rich text (same support as question text)                      |
| Correct answer(s)      | Marked by admin                                                |
| Marks                  | Default marks; can be overridden at test level                 |
| Optional image         | Image attachment per question                                  |

Questions are stored centrally and reused across multiple tests.

---

### 4.3 AI-Based Question Generation from Syllabus / Notes

Admin uploads a document; the system analyses the content and generates objective questions based on admin-defined parameters.

#### 4.3.1 Supported Upload Formats

| Format       | Notes                                             |
|--------------|---------------------------------------------------|
| PDF          | Text-based or scanned (OCR applied for scanned)   |
| DOCX         | Microsoft Word documents                          |
| TXT          | Plain text files                                  |
| PPT / PPTX   | PowerPoint slides                                 |
| JPG / PNG    | Handwritten or printed notes — OCR applied        |

#### 4.3.2 Admin Parameters Before Generation

| Parameter                    | Options / Input                                                         |
|------------------------------|-------------------------------------------------------------------------|
| Subject / category           | Select from existing categories                                         |
| Number of questions          | Numeric input (e.g., 20)                                                |
| Question types to include    | MCQ / MSQ / True-False / Matching / Assertion & Reasoning (multi-select)|
| Difficulty level             | Simple / Moderate / Hard / Very Hard                                    |
| Difficulty distribution      | Admin specifies percentage split (e.g., 30% Simple, 40% Moderate, 20% Hard, 10% Very Hard) |
| Focus area (optional)        | Admin pastes or highlights a specific topic or section                  |
| Language                     | Select from supported languages                                         |

#### 4.3.3 Generation Process

1. Admin uploads document and sets parameters.
2. System extracts and parses text; OCR applied for image-based files.
3. Content passed to AI/LLM engine with admin parameters as instructions.
4. AI generates questions with answer options and correct answers.
5. **Preview screen** shown to admin listing all generated questions.

#### 4.3.4 Admin Review After Generation

| Action       | Description                                                             |
|--------------|-------------------------------------------------------------------------|
| Accept       | Question added to question bank                                         |
| Edit         | Opens rich editor for modification before saving                        |
| Reject       | Question discarded                                                      |
| Regenerate   | System generates a replacement for that specific question               |
| Accept all   | All questions added to question bank in one click                       |

#### 4.3.5 Destination After Review

- **Save to Question Bank** — stored for future reuse
- **Add directly to an active test** — added to a test being configured

#### 4.3.6 Constraints

- Corrupt or password-protected files cannot be parsed; admin is notified.
- If content is insufficient for the requested question count, the system generates as many as possible and notifies admin.
- Math formulas and code found in source documents are preserved in generated questions using the rich editor format.

---

### 4.4 Rich Question Editor — Math, Formulas & Code Support

#### 4.4.1 Rich Text Editor

Supports: bold, italic, underline, subscript, superscript, ordered/unordered lists, image embedding, table insertion.

#### 4.4.2 Mathematical Formula Support (LaTeX / MathJax / KaTeX)

- Admin types or pastes LaTeX formulas (e.g., `\sum_{i=1}^{n} x_i`); rendered as visual expressions.
- A **formula toolbar always visible** during question creation (not hidden in submenus) with one-click insertion of:

| Category        | Symbols / Structures                                                   |
|-----------------|------------------------------------------------------------------------|
| Arithmetic      | ×, ÷, ±, =, ≠, <, >, ≤, ≥                                            |
| Algebra         | √, ∛, xⁿ, subscript, superscript, \|x\|                               |
| Calculus        | ∑ (summation), ∫ (integral), d/dx (derivative), ∂ (partial)           |
| Greek letters   | α β γ δ ε ζ η θ λ μ π σ φ ω Ω Δ Σ Π                                  |
| Set theory      | ∈ ∉ ∪ ∩ ⊂ ⊃ ∅ ∀ ∃                                                    |
| Logic           | ∧ ∨ ¬ ⇒ ⇔                                                             |
| Matrices/Vectors| Matrix templates, vector arrows, dot product, cross product            |
| Limits          | lim, →, ∞                                                              |
| Fractions       | a/b rendered as stacked fraction                                       |
| Chemistry       | Subscript numbers, reaction arrows (→, ⇌), charge symbols             |

#### 4.4.3 Copy-Paste Formula Handling

| Paste Source                         | Expected Behaviour                                               |
|--------------------------------------|------------------------------------------------------------------|
| LaTeX string from another tool       | Recognised and rendered automatically                            |
| Unicode math symbols (∑, ∫, π)      | Preserved exactly; not converted to plain text                   |
| Formula from MS Word / Google Docs   | Converted to equivalent LaTeX and rendered correctly             |
| MathML from a browser                | Parsed and converted to rendered formula                         |
| Plain text formula (e.g., x^2 + y^2)| Auto-detected; admin offered option to convert to rendered form  |

The system must **never silently corrupt or drop** mathematical content. If unparseable, the raw text is preserved and admin is shown a warning.

#### 4.4.4 Code Block Support

- Insert syntax-highlighted code blocks with language selection (Python, Java, C, C++, JavaScript, SQL, HTML, etc.).
- Code pasted from an IDE (VS Code, GitHub) preserves indentation and formatting.
- Renders on student exam screen with syntax highlighting in monospace font.

#### 4.4.5 Student-Side Rendering

- All LaTeX rendered via MathJax/KaTeX — no raw strings shown to students.
- Code blocks rendered with syntax highlighting.
- Subscripts, superscripts, and special characters correct across all browsers and devices.

---

### 4.5 Bulk Question Import via Excel / CSV

- Admin can import many questions at once using a structured spreadsheet.
- A **downloadable template** is provided (Excel and CSV format) from the admin panel.

#### 4.5.1 Template Structure

The downloadable template contains the following columns:

| Column              | Description                                                          |
|---------------------|----------------------------------------------------------------------|
| Question Text       | Full question (plain text or LaTeX string for formulas)              |
| Question Type       | MCQ / MSQ / TF / MATCHING / AR                                       |
| Difficulty Level    | Simple / Moderate / Hard / Very Hard                                 |
| Subject Category    | Must match an existing category in the system                        |
| Option A            | Answer option A                                                      |
| Option B            | Answer option B                                                      |
| Option C            | Answer option C                                                      |
| Option D            | Answer option D                                                      |
| Option E (optional) | For MSQ with more than 4 options                                     |
| Correct Answer(s)   | A / B / C / D / E or combination for MSQ (e.g., A,C)                |
| Marks               | Numeric value                                                        |
| Explanation (opt.)  | Optional explanation shown after test review                         |

- The template includes **sample rows** and **instructions** in the first sheet.
- On import, the system validates each row. Invalid rows are flagged with an error message; valid rows are imported.
- Admin sees an **import summary**: total rows, successfully imported, failed with reasons.

---

### 4.6 Question Versioning

- When a question in the bank is edited, the **original version is preserved** and a new version is created.
- Past test records always reference the version of the question that was used at the time of the test.
- Admin can view the **version history** of any question and see all previous versions.
- Admin can **restore** a previous version if needed.
- Versioning ensures that editing a question never retroactively alters historical test results.

---

### 4.7 Test Configuration — Official Tests

When creating an official test, admin fills in all of the following.

#### Basic Details

| Setting          | Description                                                        |
|------------------|--------------------------------------------------------------------|
| Test Title       | Name of the test                                                   |
| Subject Category | Subject this test belongs to                                       |
| Test Type        | Official (marked clearly; not practice)                            |
| Instructions     | Shown to students before starting; supports rich text              |

#### Question Selection

| Method        | Description                                                             |
|---------------|-------------------------------------------------------------------------|
| Manual        | Admin selects questions from the question bank                          |
| AI-generated  | Admin uploads document and generates questions (Section 4.3)            |
| Bulk imported | Admin uses Excel/CSV import (Section 4.5)                               |
| Mixed         | Combination of any of the above                                         |

#### Timing Settings

| Setting                  | Description                                         |
|--------------------------|-----------------------------------------------------|
| Time-based test?         | Yes / No                                            |
| Duration (if time-based) | Total time in minutes                               |
| Auto-submit on timeout   | Yes / No — set by admin                             |

#### Scheduling Window

| Setting         | Description                                              |
|-----------------|----------------------------------------------------------|
| Start date/time | Test becomes available to students from this point       |
| End date/time   | Test is no longer accessible after this point            |

#### Attempt Settings

| Setting       | Description                                                           |
|---------------|-----------------------------------------------------------------------|
| Attempt limit | Max attempts per student: 1, 2, custom number, or unlimited           |

#### Marking Scheme

| Setting              | Description                                                      |
|----------------------|------------------------------------------------------------------|
| Marks per question   | Default marks per correct answer                                 |
| Negative marking     | Yes / No — set by admin                                          |
| Negative marks value | Marks deducted per wrong answer (e.g., 0.25, 0.5, 1)            |

#### Display & Navigation

| Setting                       | Options                                                   |
|-------------------------------|-----------------------------------------------------------|
| Questions per page            | One per page / Custom number set by admin                 |
| Allow question review/revisit | Yes / No — set by admin                                   |

#### Integrity Settings

| Setting                  | Description                                                             |
|--------------------------|-------------------------------------------------------------------------|
| Tab-switch prevention    | Yes / No — set by admin                                                 |
| Tab-switch action        | Warn only / Auto-submit after N violations (admin defines N)            |
| Webcam proctoring        | Yes / No — set by admin (see Section 4.11)                              |

#### Result & Certificate Settings

| Setting                       | Description                                                        |
|-------------------------------|--------------------------------------------------------------------|
| Show result immediately?      | Yes / No — if No, admin manually publishes later                   |
| Enable certificate generation | Yes / No — set by admin per test                                   |
| Passing percentage            | Minimum % required to receive a certificate (e.g., 60%)            |

#### Series Assignment (optional)

| Setting              | Description                                                        |
|----------------------|--------------------------------------------------------------------|
| Add to test series?  | Yes / No — if Yes, admin selects which series this test belongs to |

---

### 4.8 Practice Mode Test Configuration

Practice tests are a distinct test type created by admin. They are clearly labelled as **"Practice"** in the student dashboard.

| Setting                          | Description                                                           |
|----------------------------------|-----------------------------------------------------------------------|
| Test Type                        | Practice (set by admin at creation; cannot be changed later)          |
| Attempt limit                    | Unlimited — students may attempt as many times as they wish           |
| Timer                            | Optional — admin may set a timer or leave it unlimited                |
| Negative marking                 | Yes / No — set by admin                                               |
| Scheduling window                | Optional — admin may restrict availability dates or leave open        |
| Show correct answer after review | After the student completes the full practice test (not per question) |
| Webcam proctoring                | Not applicable for practice tests                                     |
| Certificate generation           | Not applicable for practice tests                                     |
| Leaderboard                      | Not applicable for practice tests                                     |
| Included in analytics            | Tracked separately from official test performance                     |

---

### 4.9 Test Series / Batches

Admin can group multiple official tests into a named **series** (e.g., "JEE Mock Series — 2025", "Unit Test Series — Physics").

#### Series Configuration

| Setting               | Description                                                             |
|-----------------------|-------------------------------------------------------------------------|
| Series name           | Name of the series                                                      |
| Subject category      | Optional — series can span multiple subjects                            |
| Tests in series       | Admin selects which tests belong to this series (ordered list)          |
| Series description    | Optional description shown to students                                  |
| Scoring method        | Admin defines: Sum of scores / Average percentage / Weighted average / Custom formula |
| Leaderboard           | Series-level leaderboard based on cumulative series score               |
| Certificate           | Optional — series-level certificate for students who pass all tests     |
| Series passing %      | Minimum cumulative score % to be considered a series pass               |

#### Student View of Series

- Students see the series as a grouped set of tests with their progress (e.g., "3 of 5 tests completed").
- Cumulative score shown after each test is completed within the series.
- Final series result and certificate shown after the last test in the series is completed.

---

### 4.10 User Management

Admin views all registered students:

- Full name, email, mobile number, registration date, verification status
- Tests attempted, scores, attempt history, series progress
- Search, filter, deactivate / reactivate accounts

---

### 4.11 Proctoring via Webcam

- Admin enables or disables webcam proctoring **per test** at the time of test configuration.
- If enabled, students are informed before the test starts and must grant camera permission.

| Feature                        | Description                                                            |
|--------------------------------|------------------------------------------------------------------------|
| Periodic snapshots             | System captures webcam snapshots at random intervals during the test   |
| Snapshot storage               | Stored securely; accessible only by admin                              |
| Admin review                   | Admin can view snapshots per student per test from the result panel    |
| No face detected alert         | System flags instances where no face is detected in a snapshot         |
| Multiple faces alert           | System flags snapshots where more than one face is detected            |
| Student notification           | Student sees a small camera indicator; knows they are being monitored  |
| Proctoring flag in result      | Admin result view shows a proctoring alert badge if anomalies detected |

---

### 4.12 Plagiarism & Copy Detection

The system analyses student answer patterns across all attempts for a given test and flags suspicious similarities.

| Detection Method               | Description                                                            |
|--------------------------------|------------------------------------------------------------------------|
| Answer pattern similarity      | If two or more students have identical answer sequences, the system flags them |
| Time-based analysis            | If a student completes the test in an unusually short time relative to average, flagged for review |
| Tab-switch correlation         | Students with frequent tab switches cross-referenced with performance spikes |
| Similarity score               | A percentage similarity score is shown between flagged student pairs   |
| Admin alert                    | Flagged cases highlighted in the result sheet with a warning badge     |
| Admin action                   | Admin can mark a flagged result as reviewed, accepted, or disqualified |

---

### 4.13 Question Difficulty Auto-Calibration

After a test is completed by a significant number of students, the system analyses performance data and automatically suggests a revised difficulty tag for each question.

| Metric Used                   | Description                                                            |
|-------------------------------|------------------------------------------------------------------------|
| Correct answer rate           | % of students who answered the question correctly                      |
| Average time spent            | Average time students spent on the question                            |
| Suggested difficulty          | System suggests Simple / Moderate / Hard / Very Hard based on data     |
| Admin action                  | Admin can accept the suggestion or keep the original difficulty tag     |
| Trigger threshold             | Calibration runs after a minimum of 30 students have attempted the test|

---

### 4.14 Admin Analytics Dashboard

A visual dashboard showing platform-wide and per-test performance data.

#### Platform-Wide Analytics

- Total registered students
- Total tests created (official / practice / series)
- Total attempts across all tests
- Average score across all tests
- Most active subjects / categories

#### Per-Test Analytics

| Metric                       | Description                                                          |
|------------------------------|----------------------------------------------------------------------|
| Total attempts               | Number of students who attempted the test                            |
| Average score                | Mean score across all attempts                                       |
| Highest / lowest score       | Top and bottom performer scores                                      |
| Score distribution           | Bar chart showing score ranges (e.g., 0–20%, 21–40%, etc.)          |
| Question-wise correct rate   | Per question: % of students who got it right                         |
| Average time per question    | How long students spent on each question on average                  |
| Time distribution            | Distribution of test completion times across students                |
| Pass / fail count            | If a passing % is set, how many passed vs failed                     |
| Proctoring anomaly count     | Number of students flagged by webcam proctoring (if enabled)         |
| Plagiarism flag count        | Number of flagged cases for that test                                 |
| Top scorers list             | Top 10 students by score                                             |

---

### 4.15 Result Management & Export

Admin views results per test with columns: Name, Email, Mobile, Score, Total Marks, Percentage, Rank, Time Taken, Date of Attempt, Proctoring Status, Plagiarism Flag.

**Export options:**

| Format       | Scope                                                 |
|--------------|-------------------------------------------------------|
| PDF          | Formatted result sheet for all or selected students   |
| Excel (.xlsx)| Tabular data for all or selected students             |

Both formats available for individual tests and for full test series.

---

### 4.16 Certificate Generation

- Admin enables certificate generation **per test** and sets the **passing percentage threshold**.
- The platform uses a **single default certificate template** with the following auto-populated fields:
  - Student full name
  - Test name and subject
  - Score and percentage
  - Date of completion
  - Platform name / logo
  - A unique certificate ID (for verification)
- Certificates are generated as **PDF files**.
- Students who meet the passing threshold can **download their certificate** from their dashboard.
- Admin can view and download certificates for any student from the result panel.
- For **test series**, a separate series-level certificate is issued when the student passes the full series (if enabled by admin).

---

### 4.17 Result Dispatch

#### Channel Selection (Admin chooses at dispatch time)

| Channel   | Availability Condition                                                      |
|-----------|-----------------------------------------------------------------------------|
| Email     | Always available; sent to registered email                                  |
| WhatsApp  | Sent only if student's mobile number is verified as active on WhatsApp      |
| Telegram  | Sent only if student's mobile number is verified as active on Telegram      |

> **Channel verification:** Before dispatch, the system automatically checks whether the student's registered mobile number is active on WhatsApp and/or Telegram. If not found on a platform, that channel is silently skipped.

> **Fallback rule:** If WhatsApp or Telegram are selected but unavailable for a student, the result is **compulsorily sent via email**. Email delivery is non-optional.

#### Recipient Selection

| Option           | Description                                                        |
|------------------|--------------------------------------------------------------------|
| Send to all      | Dispatches to all students who attempted the selected test         |
| Send to selected | Admin selects specific students from the result list               |

#### Channel Toggle

Admin can independently toggle Email, WhatsApp, and Telegram on or off for each dispatch action.

#### Result Message Content

- Student name, test name, subject, score, total marks, percentage, rank, date of attempt.
- Optional: certificate download link (if student passed).

---

### 4.18 Scheduled Result Auto-Dispatch

Admin can set a **future date and time** for automatic result dispatch instead of triggering it manually.

| Setting              | Description                                                           |
|----------------------|-----------------------------------------------------------------------|
| Dispatch date/time   | Admin sets when the dispatch should automatically execute             |
| Recipients           | All students / selected students — configured at scheduling time      |
| Channels             | Email / WhatsApp / Telegram — toggled at scheduling time              |
| Status tracking      | Admin can see scheduled dispatches: Pending / Sent / Failed           |
| Cancel / reschedule  | Admin can cancel or change the scheduled dispatch before it executes  |

---

## 5. Exam Engine — Student Side

### 5.1 Student Dashboard

After login, student sees:

- Available official tests (within scheduled window) — clearly labelled **Official**
- Available practice tests — clearly labelled **Practice**
- Test series they are enrolled in, with progress indicator
- Tests completed with scores (if result is set to show immediately)
- Leaderboard shortcut
- Performance analytics shortcut
- Certificate download section (for passed tests)
- Language selector (UI language)

---

### 5.2 Leaderboard

- After an official test, a **leaderboard** is published by admin (or automatically if result visibility is immediate).
- Leaderboard shows: Rank, Student Name, Score, Percentage, Time Taken.
- **Test-level leaderboard:** Rankings for a single test.
- **Series-level leaderboard:** Cumulative rankings across all tests in a series.
- Student's own rank is highlighted.
- Leaderboard is **read-only** for students; they cannot see other students' personal details beyond name and score.

---

### 5.3 Performance Analytics Dashboard

Each student has a personal analytics dashboard showing:

| Metric                        | Description                                                          |
|-------------------------------|----------------------------------------------------------------------|
| Overall score trend           | Line chart of scores over time across all tests                      |
| Subject-wise performance      | Bar chart showing average % per subject category                     |
| Strength areas                | Subjects / topics where the student consistently scores above average |
| Weakness areas                | Subjects / topics where the student scores below average             |
| Total tests attempted         | Count of official and practice tests                                 |
| Average percentage            | Across all official tests                                            |
| Best score                    | Highest score achieved across all tests                              |
| Time management               | Average time taken vs allowed time per test                          |
| Practice vs official comparison | How practice test scores compare to official test scores           |
| Certificates earned           | Count and links to downloaded certificates                           |

---

### 5.4 Test History & Answer Review with AI Assist

After a test result is published (or immediately if enabled), the student can open a **detailed review** of their attempt.

#### Review Screen Shows:

- Every question asked in the test
- The student's selected answer
- The correct answer (highlighted)
- Whether the student got it right or wrong
- Marks awarded / deducted per question
- Optional explanation (if admin added one)

#### AI Assist Icons

In front of each question on the review screen, **four AI assistant icons** are displayed:

| Icon     | Tooltip on hover    | Action on click                                               |
|----------|---------------------|---------------------------------------------------------------|
| Claude   | Ask Claude AI       | Opens a popup/modal within the app with Claude's AI response  |
| ChatGPT  | Ask ChatGPT         | Opens a popup/modal within the app with ChatGPT's response    |
| Gemini   | Ask Gemini          | Opens a popup/modal within the app with Gemini's response     |
| Grok     | Ask Grok            | Opens a popup/modal within the app with Grok's response       |

**Popup / Modal Behaviour:**

- The question text is automatically pre-filled in the AI prompt.
- The modal opens within the app — student does not leave the review page.
- The AI response is displayed inside the modal.
- Student can read the explanation, close the modal, and continue reviewing other questions.
- The modal can be resized or scrolled if the AI response is long.
- Math formulas and code in the question are correctly passed to the AI prompt.

---

### 5.5 Bookmark / Flag a Question

- During an official or practice test, the student can **bookmark / flag any question** for personal reference.
- A bookmark icon is visible on each question during the test.
- On the review screen, bookmarked questions are visually highlighted so the student can jump to them quickly.
- Bookmarks persist in the student's test history for future reference.

---

### 5.6 Practice Mode — Student Experience

- Practice tests are clearly labelled **Practice** in the student dashboard.
- Student can attempt a practice test **unlimited times**.
- No certificate is issued for practice tests.
- No leaderboard is shown for practice tests.
- After completing the full practice test and submitting, the student sees the complete **answer review screen** — with correct answers, their selected answers, marks breakdown, and AI assist icons.
- Correct answers are shown **only after full submission** — not question by question during the test.
- Each attempt is logged separately in the student's practice history.

---

### 5.7 Pre-Test Screen

Before starting any test (official or practice):

- Test name, subject, type (Official / Practice), total questions, total marks
- Duration (if time-based)
- Attempt number (e.g., "This is your 1st attempt")
- Instructions set by admin
- Webcam permission prompt (if proctoring is enabled)
- Language confirmation
- **Start Test** button — cannot return to dashboard once started

---

### 5.8 During the Test

- Questions displayed per admin's questions-per-page setting.
- Countdown timer shown if time-based.
- Auto-submit on timer expiry if enabled by admin.
- Tab-switch detection and action as configured by admin.
- Bookmark/flag icon on each question.
- Review/revisit of answered questions if enabled by admin.
- Auto-save of responses every 30 seconds.
- Webcam indicator visible if proctoring is active.
- Math formulas and code rendered correctly throughout.

---

### 5.9 Submission

- Student clicks **Submit Test**.
- Confirmation prompt: "Are you sure you want to submit? This action cannot be undone."
- On confirmation, responses are recorded and the test is closed for that attempt.

---

### 5.10 Post-Test Result Screen

- **Immediate result (if enabled):** Score, total marks, percentage, time taken, rank (if leaderboard is published), pass/fail status, certificate download button (if passed).
- **Held result:** "Your result will be published by the admin shortly."
- For practice tests: answer review screen is always shown immediately after submission.

---

## 6. Question Types

### 6.1 Multiple Choice Question (MCQ)
- One correct answer from 4 options (A, B, C, D).
- Full marks for correct; negative marks (if enabled) for wrong; zero for unattempted.

### 6.2 Multiple Select Question (MSQ)
- More than one correct answer from 4 or more options.
- Full marks only if all correct options selected and no wrong ones.
- Partial marking configurable by admin.
- Negative marking for MSQ configurable by admin.

### 6.3 True / False
- Statement given; student selects True or False.
- Full marks for correct; negative marks if enabled; zero for unattempted.

### 6.4 Matching Type
- Column A (terms) matched to Column B (definitions/answers).
- UI: dropdown per row or drag-and-connect interface.
- Scoring: per correct pair or full marks only for all correct (admin configures).

### 6.5 Assertion & Reasoning
- Assertion (A) and Reason (R) given.
- Four standard options:
  - (A) Both A and R are true, and R is the correct explanation of A.
  - (B) Both A and R are true, but R is not the correct explanation of A.
  - (C) A is true but R is false.
  - (D) A is false but R is true.
- Full marks for correct; negative marks if enabled.

---

## 7. Scoring & Marking Rules

| Rule                          | Details                                                              |
|-------------------------------|----------------------------------------------------------------------|
| Correct answer                | Full marks as defined per question                                   |
| Wrong answer (MCQ/T-F/A&R)    | Negative marks if negative marking is enabled for that test          |
| Unattempted question          | Zero marks; no negative marking applied                              |
| MSQ — all correct selected    | Full marks                                                           |
| MSQ — partial selection       | Configurable: full / partial / zero                                  |
| MSQ — wrong option selected   | Zero or negative based on admin config                               |
| Matching — all correct        | Full marks                                                           |
| Matching — partial            | Marks per correct pair if per-pair marking is enabled by admin       |

---

## 8. Multi-Language Support

The platform supports multiple languages for **both the full UI and question content**.

### 8.1 UI Language

- All menus, buttons, labels, messages, instructions, and system text are available in supported languages.
- Language selector is available on the login page and in the student/admin dashboard.
- Admin and student can independently choose their preferred UI language.
- Default language: English.

### 8.2 Question Content Language

- Admin can write question text, answer options, and explanations in any supported language.
- The rich editor (math, code, formatting) works identically in all supported languages.
- A test can be created in one language; multiple language versions of the same test are out of scope for v1.

### 8.3 Supported Languages (v1)

- English (default)
- Hindi
- Marathi
- Additional languages can be added in future versions by adding translation files.

### 8.4 RTL Language Support

- RTL (right-to-left) language support (e.g., Arabic, Urdu) is noted as a future enhancement and is out of scope for v1.

---

## 9. Result Distribution Channels

### 9.1 Email
- Sent via configured email service (SMTP / SendGrid / similar).
- Always available; acts as fallback if other channels are unavailable.
- Contains: student name, test name, score, percentage, rank, date, certificate download link (if applicable).
- Optional PDF result card attachment.

### 9.2 WhatsApp
- Uses WhatsApp Business API (Twilio / 360dialog / Meta Cloud API).
- System verifies if student's mobile number is active on WhatsApp before dispatch.
- If not active: channel skipped silently; email sent as fallback.
- Message: structured text with result summary.

### 9.3 Telegram
- Uses Telegram Bot API.
- System checks if student's mobile number corresponds to a Telegram account.
- If not found: channel skipped silently; email sent as fallback.
- Message: structured text with optional result card image.

### 9.4 Fallback Rule
> If WhatsApp and/or Telegram dispatch is selected but unavailable for a student, **email delivery is mandatory and non-optional.**

---

## 10. Notifications & Alerts

| Event                              | Recipient | Channel                        |
|------------------------------------|-----------|--------------------------------|
| Registration OTP                   | Student   | Email / SMS                    |
| Password reset OTP / link          | Student   | Email / SMS                    |
| Test available / scheduled         | Student   | Email                          |
| Test reminder (1 hour before end)  | Student   | Email (optional, configurable) |
| Result published                   | Student   | Email / WhatsApp / Telegram    |
| Certificate ready                  | Student   | Email (with download link)     |
| Series completed                   | Student   | Email                          |
| AI question generation complete    | Admin     | Dashboard notification         |
| Bulk import complete               | Admin     | Dashboard notification         |
| Proctoring anomaly detected        | Admin     | Dashboard alert badge          |
| Plagiarism flag raised             | Admin     | Dashboard alert badge          |
| Scheduled dispatch executed        | Admin     | Dashboard notification         |
| New student registered             | Admin     | Dashboard notification         |

---

## 11. Non-Functional Requirements

| Requirement           | Details                                                                       |
|-----------------------|-------------------------------------------------------------------------------|
| Responsiveness        | Works on desktop, tablet, and mobile browsers                                 |
| Security              | Passwords hashed (bcrypt); HTTPS enforced; JWT with expiry                    |
| Session management    | Student session expires on inactivity; active test session kept alive         |
| Auto-save             | Test responses saved every 30 seconds to prevent data loss on disconnection   |
| Formula rendering     | MathJax or KaTeX on all question pages; no raw LaTeX strings shown to students|
| Paste integrity       | Pasted formulas (LaTeX, Unicode, MathML, Word) must never be silently corrupted |
| Code rendering        | Syntax-highlighted code blocks preserved from editor to student screen        |
| AI generation time    | Question generation completes within 60 seconds for up to 50 questions        |
| OCR accuracy          | Minimum acceptable OCR accuracy for image-based uploads: 90%                 |
| AI modal response     | AI assistant popup response should load within 10 seconds                     |
| Export performance    | PDF and Excel export complete within 10 seconds for up to 500 rows            |
| Webcam snapshots      | Stored securely; accessible only by admin; not shared externally              |
| Certificate uniqueness| Each certificate has a unique ID for authenticity verification                |
| Concurrency           | Multiple students can take the same test simultaneously without conflict       |
| Audit logs            | Tab-switch events, proctoring snapshots, test start/submit timestamps logged  |
| Scalability           | Architecture supports adding multi-admin, more languages, and more AI providers in future |
| Data retention        | Question version history, test attempt records, and dispatch logs retained indefinitely |

---

## 12. Glossary

| Term                      | Definition                                                                  |
|---------------------------|-----------------------------------------------------------------------------|
| MCQ                       | Multiple Choice Question — one correct answer                               |
| MSQ                       | Multiple Select Question — more than one correct answer                     |
| Assertion & Reasoning     | Question type with two statements and a logical relationship                 |
| Negative Marking          | Deduction of marks for a wrong answer                                       |
| Question Bank             | Central repository of all questions created, imported, or AI-generated      |
| Scheduling Window         | Start–end date/time period during which a test is accessible                |
| Attempt Limit             | Maximum times a student is allowed to attempt a test                        |
| Tab-switch Prevention     | Detection and logging of a student switching away from the exam tab         |
| Auto-submit               | Automatic submission when the timer reaches zero                            |
| Practice Test             | A test set by admin for unlimited-attempt, no-certificate practice          |
| Test Series               | A group of official tests with cumulative scoring and a shared leaderboard  |
| Leaderboard               | Ranked list of students by score for a test or series                       |
| Result Dispatch           | Admin sending results to students via communication channels                |
| Scheduled Dispatch        | Automated result delivery at a pre-set date and time                        |
| Fallback                  | Default email delivery when WhatsApp/Telegram is unavailable                |
| OTP                       | One-Time Password used for verification                                     |
| LaTeX                     | Typesetting language used to write mathematical formulas                    |
| MathJax / KaTeX           | JavaScript libraries that render LaTeX formulas in the browser              |
| OCR                       | Optical Character Recognition — converts image text to machine-readable text|
| AI/LLM Engine             | Artificial intelligence model used to generate questions from content       |
| Rich Text Editor          | Advanced text editor supporting formatting, formulas, and code blocks       |
| Syntax Highlighting       | Colour-coded display of programming code by language keywords               |
| MathML                    | XML-based language for describing mathematical notation in web pages        |
| Proctoring                | Webcam-based monitoring of students during a test                           |
| Plagiarism Detection      | Automated analysis to flag suspiciously similar answer patterns             |
| Auto-Calibration          | Automatic reassessment of question difficulty based on student performance  |
| Certificate               | PDF document issued to students who pass a test above the threshold         |
| Question Versioning       | Preservation of past versions of a question so historical records are stable|
| AI Assist Icons           | Claude, ChatGPT, Gemini, Grok icons on the answer review screen             |
| Series Score              | Cumulative score across all tests in a test series, method set by admin     |
| Bulk Import               | Importing many questions at once via a structured Excel or CSV file         |
