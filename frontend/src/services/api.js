import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (userData) => 
    api.post('/auth/register', userData).then(res => res.data),
  
  getCurrentUser: () => 
    api.get('/auth/me').then(res => res.data)
};

export const membersAPI = {
  getAll: () => api.get('/members').then(res => res.data),
  getById: (id) => api.get(`/members/${id}`).then(res => res.data),
  getStats: (id) => api.get(`/members/${id}/stats`).then(res => res.data),
  update: (id, data) => api.put(`/members/${id}`, data).then(res => res.data)
};

export const contributionsAPI = {
  create: (data) => api.post('/contributions', data).then(res => res.data),
  getMy: () => api.get('/contributions/my').then(res => res.data),
  getAll: () => api.get('/contributions').then(res => res.data),
  approve: (id) => api.patch(`/contributions/${id}/approve`).then(res => res.data)
};

export const investmentsAPI = {
  getAll: () => api.get('/investments').then(res => res.data),
  create: (data) => api.post('/investments', data).then(res => res.data),
  update: (id, data) => api.put(`/investments/${id}`, data).then(res => res.data),
  getStats: () => api.get('/investments/stats/summary').then(res => res.data)
};

export const loansAPI = {
  create: (data) => api.post('/loans', data).then(res => res.data),
  getMy: () => api.get('/loans/my').then(res => res.data),
  getAll: () => api.get('/loans').then(res => res.data),
  approve: (id) => api.patch(`/loans/${id}/approve`).then(res => res.data),
  addRepayment: (id, data) => api.post(`/loans/${id}/repayments`, data).then(res => res.data)
};

export const profitsAPI = {
  getAll: () => api.get('/profits').then(res => res.data),
  getMy: () => api.get('/profits/my').then(res => res.data),
  create: (data) => api.post('/profits', data).then(res => res.data)
};

// ------------------ NEW ENDPOINTS ------------------ //

export const reportsAPI = {
  generateMemberStatement: (memberId) => 
    api.get(`/reports/member-statement/${memberId}`, { responseType: 'blob' }),
  
  generateGroupFinancialReport: () => 
    api.get('/reports/group-financial', { responseType: 'blob' }),
  
  generateInvestmentReport: (investmentId) => 
    api.get(`/reports/investment/${investmentId}`, { responseType: 'blob' }),
  
  getDashboardStats: () => 
    api.get('/reports/dashboard-stats').then(res => res.data)
};

export const notificationsAPI = {
  sendContributionReminders: (data) => 
    api.post('/notifications/contributions/reminder', data).then(res => res.data),
  
  sendLoanRepaymentReminders: () => 
    api.post('/notifications/loans/repayment-reminder').then(res => res.data),
  
  sendBroadcast: (data) => 
    api.post('/notifications/broadcast', data).then(res => res.data),
  
  getStats: () => 
    api.get('/notifications/stats').then(res => res.data)
};

export default api;
