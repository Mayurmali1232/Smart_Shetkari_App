import api from './api';

export const expenseService = {
  listExpenses: (tractorId, category) => api.get('/tractor-expenses', { params: { tractorId, category } }),
  recordExpense: (data) => api.post('/tractor-expenses', data),
  listPayments: (bookingId) => api.get('/tractor-payments', { params: { bookingId } }),
  recordPayment: (data) => api.post('/tractor-payments', data)
};
