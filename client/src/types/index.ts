// User types
export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: 'ADMIN' | 'STUDENT';
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  language: string;
  createdAt: string;
}

// Subject
export interface Subject {
  id: string;
  name: string;
  description?: string;
}

// Topic
export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  description?: string;
  _count?: { questions: number; tests: number };
}

// Question types
export type QuestionType = 'MCQ' | 'MSQ' | 'TRUE_FALSE' | 'MATCHING' | 'ASSERTION_REASONING';
export type Difficulty = 'SIMPLE' | 'MODERATE' | 'HARD' | 'VERY_HARD';

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  subjectId: string;
  topicId?: string;
  subject?: Subject;
  topic?: Topic;
  type: QuestionType;
  difficulty: Difficulty;
  text: string;
  imageUrl?: string;
  marks: number;
  correctAnswers: string[];
  explanation?: string;
  options: QuestionOption[];
  version: number;
}

// Test types
export type TestType = 'OFFICIAL' | 'PRACTICE';
export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Test {
  id: string;
  title: string;
  subjectId: string;
  topicId?: string;
  subject?: Subject;
  topic?: Topic;
  type: TestType;
  status: TestStatus;
  instructions?: string;
  isTimeBased: boolean;
  duration?: number;
  autoSubmitOnTimeout: boolean;
  startDate?: string;
  endDate?: string;
  attemptLimit?: number;
  marksPerQuestion: number;
  negativeMarking: boolean;
  negativeMarksValue: number;
  questionsPerPage: number;
  allowReview: boolean;
  tabSwitchPrevention: boolean;
  webcamProctoring: boolean;
  showResultImmediately: boolean;
  enableCertificate: boolean;
  passingPercentage?: number;
  totalMarks: number;
  _count?: { questions: number };
}

// Test Attempt
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'AUTO_SUBMITTED' | 'DISQUALIFIED';

export interface TestAttempt {
  id: string;
  testId: string;
  test?: Test;
  studentId: string;
  student?: User;
  status: AttemptStatus;
  responses?: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  timeTaken?: number;
  tabSwitchCount: number;
  startedAt: string;
  submittedAt?: string;
}

// Test Series
export interface TestSeries {
  id: string;
  name: string;
  description?: string;
  scoringMethod: 'SUM' | 'AVERAGE' | 'WEIGHTED_AVERAGE' | 'CUSTOM';
  enableCertificate: boolean;
  passingPercentage?: number;
  _count?: { tests: number };
}

// Certificate
export interface Certificate {
  id: string;
  studentId: string;
  testId: string;
  certificateId: string;
  filePath: string;
  score: number;
  percentage: number;
  issuedAt: string;
  test?: { title: string; subject: { name: string } };
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  score: number;
  percentage: number;
  timeTaken: number;
}

// API response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
