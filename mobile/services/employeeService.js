import api from './api';

export const employeeService = {
  list: (status, search) => api.get('/employees', { params: { status, search } }),
  get: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  toggleStatus: (id, status) => api.patch(`/employees/${id}/status`, null, { params: { status } }),
  getHistory: (id) => api.get(`/employees/${id}/history`)
};
