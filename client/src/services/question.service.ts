import api from './api';

export const questionService = {
  getAll: (params?: Record<string, string>) => api.get('/questions', { params }),
  getById: (id: string) => api.get(`/questions/${id}`),
  getVersionHistory: (id: string) => api.get(`/questions/${id}/versions`),
  create: (data: any) => api.post('/questions', data),
  update: (id: string, data: any) => api.put(`/questions/${id}`, data),
  remove: (id: string) => api.delete(`/questions/${id}`),
  bulkImport: (file: File, subjectId: string, topicId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);
    if (topicId) formData.append('topicId', topicId);
    return api.post('/questions/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadTemplate: () => api.get('/questions/bulk-import/template', { responseType: 'blob' }),
  aiGenerate: (file: File, params: Record<string, any>) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    return api.post('/questions/ai-generate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  aiGenerateFromText: (data: {
    text: string;
    subjectId: string;
    count: number;
    types: string[];
    difficulty: string;
    language: string;
  }) => api.post('/questions/ai-generate-from-text', data),
  batchSave: (subjectId: string, questions: any[]) =>
    api.post('/questions/batch-save', { subjectId, questions }),
};
