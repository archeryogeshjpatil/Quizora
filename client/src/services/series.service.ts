import api from './api';

export const seriesService = {
  getAll: () => api.get('/series'),
  getById: (id: string) => api.get(`/series/${id}`),
  create: (data: any) => api.post('/series', data),
  update: (id: string, data: any) => api.put(`/series/${id}`, data),
  remove: (id: string) => api.delete(`/series/${id}`),
  getLeaderboard: (id: string) => api.get(`/series/${id}/leaderboard`),
  getStudentSeries: () => api.get('/series/student'),
};
