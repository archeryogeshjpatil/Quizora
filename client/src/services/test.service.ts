import api from './api';

export const testService = {
  getAvailable: () => api.get('/tests/available'),
  getAll: () => api.get('/tests'),
  getById: (id: string) => api.get(`/tests/${id}`),
  getPreTestInfo: (id: string) => api.get(`/tests/${id}/pre-test`),
  create: (data: any) => api.post('/tests', data),
  update: (id: string, data: any) => api.put(`/tests/${id}`, data),
  remove: (id: string) => api.delete(`/tests/${id}`),
  startTest: (id: string) => api.post(`/tests/${id}/start`),
  submitTest: (id: string, data: { attemptId: string; responses: Record<string, string> }) =>
    api.post(`/tests/${id}/submit`, data),
  autoSave: (id: string, data: { attemptId: string; responses: Record<string, string> }) =>
    api.post(`/tests/${id}/auto-save`, data),
  getReview: (id: string) => api.get(`/tests/${id}/review`),
  publishResults: (id: string) => api.post(`/tests/${id}/publish-results`),
  getQuestionUsage: (questionIds: string[]) => api.post('/tests/question-usage', { questionIds }),
  autoCreate: (data: any) => api.post('/tests/auto-create', data),
};
