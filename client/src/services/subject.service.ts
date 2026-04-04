import api from './api';

export const subjectService = {
  getAll: () => api.get('/subjects'),
  getById: (id: string) => api.get(`/subjects/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/subjects', data),
  update: (id: string, data: { name: string; description?: string }) => api.put(`/subjects/${id}`, data),
  remove: (id: string) => api.delete(`/subjects/${id}`),
};
