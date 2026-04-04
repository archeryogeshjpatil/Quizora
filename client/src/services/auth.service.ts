import api from './api';

export const authService = {
  register: (data: { fullName: string; email: string; mobile: string; password: string }) =>
    api.post('/auth/register', data),

  verifyOtp: (data: { userId: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  login: (data: { identifier: string; password: string }) =>
    api.post('/auth/login', data),

  adminLogin: (data: { email: string; password: string }) =>
    api.post('/auth/admin/login', data),

  forgotPassword: (data: { identifier: string }) =>
    api.post('/auth/forgot-password', data),

  resetPassword: (data: { identifier: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),

  getMe: () =>
    api.get('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),
};
