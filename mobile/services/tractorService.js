import api from './api';

export const tractorService = {
  list: () => api.get('/tractors'),
  get: (id) => api.get(`/tractors/${id}`),
  create: (data) => api.post('/tractors', data),
  update: (id, data) => api.put(`/tractors/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tractors/${id}/status`, null, { params: { status } })
};
