import api from './api';

export const reportService = {
  getDashboard: (date) => api.get('/reports/dashboard', { params: { date } }),
  getFinancialSummary: (startDate, endDate) => api.get('/reports/financial-summary', { params: { startDate, endDate } }),
  exportCsv: (startDate, endDate) =>
    api.get('/reports/export/csv', {
      params: { startDate, endDate },
      headers: {
        'Accept': 'text/csv, text/plain, */*'
      },
      responseType: 'text'
    })
};
