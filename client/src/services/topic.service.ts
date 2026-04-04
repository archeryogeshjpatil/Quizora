import api from './api';

export const topicService = {
  getBySubject: (subjectId: string) => api.get(`/topics/subject/${subjectId}`),
  create: (data: { name: string; subjectId: string; description?: string }) => api.post('/topics', data),
  update: (id: string, data: { name: string; description?: string }) => api.put(`/topics/${id}`, data),
  remove: (id: string) => api.delete(`/topics/${id}`),
};
