import api from './api';

export const bookingService = {
  list: (status, tractorId) => api.get('/tractor-bookings', { params: { status, tractorId } }),
  get: (id) => api.get(`/tractor-bookings/${id}`),
  create: (data) => api.post('/tractor-bookings', data),
  update: (id, data) => api.put(`/tractor-bookings/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tractor-bookings/${id}/status`, null, { params: { status } }),
  completeWork: (id, data) => api.post(`/tractor-bookings/${id}/complete`, data)
};
