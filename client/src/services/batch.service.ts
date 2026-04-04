import api from './api';

export const batchService = {
  getAll: () => api.get('/batches'),
  getById: (id: string) => api.get(`/batches/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/batches', data),
  update: (id: string, data: { name: string; description?: string }) => api.put(`/batches/${id}`, data),
  remove: (id: string) => api.delete(`/batches/${id}`),
  addStudents: (id: string, studentIds: string[]) => api.post(`/batches/${id}/students`, { studentIds }),
  removeStudent: (id: string, studentId: string) => api.delete(`/batches/${id}/students/${studentId}`),
  assignTests: (id: string, testIds: string[]) => api.post(`/batches/${id}/tests`, { testIds }),
  removeTest: (id: string, testId: string) => api.delete(`/batches/${id}/tests/${testId}`),
};
