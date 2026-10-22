import api from './api';

export const wageService = {
  calculateSuggested: (data) => api.post('/wages/calculate', data),
  createRecord: (data) => api.post('/wages', data),
  getRecords: (employeeId) => api.get('/wages', { params: { employeeId } }),
  deleteRecord: (id) => api.delete(`/wages/${id}`),
  recordPayment: (data) => api.post('/wages/payments', data),
  getPayments: (employeeId) => api.get('/wages/payments', { params: { employeeId } }),
  getBalances: () => api.get('/wages/balances')
};
