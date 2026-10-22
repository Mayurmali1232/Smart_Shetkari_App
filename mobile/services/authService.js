import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (token) => api.post('/auth/refresh', { refreshToken: token }),
  forgotPassword: (mobileNumber) => api.post('/auth/forgot-password', { mobileNumber }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  updateLanguage: (language) => api.patch('/profile/language', { language })
};
