import api from './api';

export const dairyService = {
  // Animals
  listAnimals: (params) => api.get('/dairy/animals', { params }),
  getAnimal: (id) => api.get(`/dairy/animals/${id}`),
  createAnimal: (data) => api.post('/dairy/animals', data),
  updateAnimal: (id, data) => api.put(`/dairy/animals/${id}`, data),
  deleteAnimal: (id) => api.delete(`/dairy/animals/${id}`),

  // Milk Production
  listMilkProduction: (params) => api.get('/dairy/milk-production', { params }),
  recordMilkProduction: (data) => api.post('/dairy/milk-production', data),
  updateMilkProduction: (id, data) => api.put(`/dairy/milk-production/${id}`, data),
  deleteMilkProduction: (id) => api.delete(`/dairy/milk-production/${id}`),

  // Milk Sales
  listMilkSales: (params) => api.get('/dairy/milk-sales', { params }),
  recordMilkSale: (data) => api.post('/dairy/milk-sales', data),
  updateMilkSale: (id, data) => api.put(`/dairy/milk-sales/${id}`, data),
  deleteMilkSale: (id) => api.delete(`/dairy/milk-sales/${id}`),

  // Internal Milk Usage (Home consumption, Calves, etc.)
  getMilkUsage: (date) => api.get('/dairy/milk-usage', { params: { date } }),
  recordMilkUsage: (data) => api.post('/dairy/milk-usage', data),

  // Expenses
  listExpenses: (params) => api.get('/dairy/expenses', { params }),
  recordExpense: (data) => api.post('/dairy/expenses', data),
  deleteExpense: (id) => api.delete(`/dairy/expenses/${id}`),

  // Health & Reminders
  listHealthRecords: (params) => api.get('/dairy/health', { params }),
  recordHealthEvent: (data) => api.post('/dairy/health', data),
  getReminders: (daysAhead = 14) => api.get('/dairy/health/reminders', { params: { daysAhead } }),
  deleteHealthRecord: (id) => api.delete(`/dairy/health/${id}`),

  // Dashboard & Financial Profit / Loss
  getDashboard: (date) => api.get('/dairy/dashboard', { params: { date } }),
  getProfitLossReport: (params) => api.get('/dairy/profit-loss', { params })
};
