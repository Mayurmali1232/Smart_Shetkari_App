import api from './api';

export const attendanceService = {
  getByDate: (date) => api.get('/attendance', { params: { date } }),
  getSummary: (date) => api.get('/attendance/summary', { params: { date } }),
  recordSingle: (data, date) => api.post('/attendance', data, { params: { date } }),
  recordBulk: (bulkData) => api.post('/attendance/bulk', bulkData),
  update: (id, data) => api.put(`/attendance/${id}`, data)
};
