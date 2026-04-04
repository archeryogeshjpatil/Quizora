import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/common/AdminLayout';
import { StudentLayout } from './components/common/StudentLayout';

// Home page
import { HomePage } from './pages/HomePage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SubjectsPage } from './pages/admin/SubjectsPage';
import { QuestionsPage } from './pages/admin/QuestionsPage';
import { TestsPage } from './pages/admin/TestsPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { AdminAnalyticsPage } from './pages/admin/AnalyticsPage';
import { AdminResultsPage } from './pages/admin/ResultsPage';
import { SeriesPage } from './pages/admin/SeriesPage';
import { BatchesPage } from './pages/admin/BatchesPage';
import { CertificatesPage } from './pages/admin/CertificatesPage';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { PreTestPage } from './pages/student/PreTestPage';
import { ExamPage } from './pages/student/ExamPage';
import { ResultPage } from './pages/student/ResultPage';
import { ReviewPage } from './pages/student/ReviewPage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { StudentAnalyticsPage } from './pages/student/AnalyticsPage';
import { MyResultsPage } from './pages/student/MyResultsPage';
import { StudentCertificatesPage } from './pages/student/CertificatesPage';
import { StudentSeriesPage } from './pages/student/SeriesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="questions" element={<QuestionsPage />} />
              <Route path="tests" element={<TestsPage />} />
              <Route path="series" element={<SeriesPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="results" element={<AdminResultsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
            </Route>

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute role="STUDENT">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="tests" element={<StudentDashboard />} />
              <Route path="practice" element={<StudentDashboard />} />
              <Route path="test/:testId/pre-test" element={<PreTestPage />} />
              <Route path="test/:testId/exam" element={<ExamPage />} />
              <Route path="test/:testId/result" element={<ResultPage />} />
              <Route path="test/:testId/review" element={<ReviewPage />} />
              <Route path="series" element={<StudentSeriesPage />} />
              <Route path="results" element={<MyResultsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="analytics" element={<StudentAnalyticsPage />} />
              <Route path="certificates" element={<StudentCertificatesPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
