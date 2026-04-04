import api from './api';

export const userService = {
  getAll: (params?: Record<string, string>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/status`),
  getAttempts: (id: string) => api.get(`/users/${id}/attempts`),
};
