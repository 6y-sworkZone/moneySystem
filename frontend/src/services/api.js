import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  get: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  updateBalance: (id, balance) => api.patch(`/accounts/${id}/balance`, { balance }),
  delete: (id) => api.delete(`/accounts/${id}`),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  get: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  import: (formData) => api.post('/transactions/import', formData),
};

export const categoryRulesAPI = {
  getAll: () => api.get('/category-rules'),
  create: (data) => api.post('/category-rules', data),
  update: (id, data) => api.put(`/category-rules/${id}`, data),
  delete: (id) => api.delete(`/category-rules/${id}`),
};

export const reportsAPI = {
  getMonthlySummary: (year, month) => api.get('/reports/monthly-summary', { params: { year, month } }),
  getCategoryBreakdown: (year, month) => api.get('/reports/category-breakdown', { params: { year, month } }),
  getYearlyTrend: (year) => api.get('/reports/yearly-trend', { params: { year } }),
  getNetWorth: () => api.get('/reports/net-worth'),
  getAccountBalances: () => api.get('/reports/account-balances'),
};

export const budgetsAPI = {
  getAll: (month) => api.get('/budgets', { params: { month } }),
  getComparison: (month) => api.get('/budgets/comparison', { params: { month } }),
  create: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const investmentsAPI = {
  getAll: () => api.get('/investments'),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  updateCurrentPrice: (id, current_price) => api.patch(`/investments/${id}/current-price`, { current_price }),
  delete: (id) => api.delete(`/investments/${id}`),
};

export default api;
