import api from './api';

export const analyticsService = {
  getStudentDashboard: () => api.get('/analytics/student/dashboard'),
  getStudentPerformance: () => api.get('/analytics/student/performance'),
  getAdminDashboard: () => api.get('/analytics/admin/dashboard'),
  getTestAnalytics: (testId: string) => api.get(`/analytics/admin/test/${testId}`),
  getTestLeaderboard: (testId: string) => api.get(`/analytics/leaderboard/test/${testId}`),
};

export const resultService = {
  getMyResults: () => api.get('/results/my-results'),
  getResultDetail: (attemptId: string) => api.get(`/results/my-results/${attemptId}`),
  getTestResults: (testId: string) => api.get(`/results/test/${testId}`),
};
