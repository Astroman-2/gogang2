import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    apiClient.post('/api/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data) => apiClient.post('/api/auth/register', data),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
};

// Patients API
export const patientsAPI = {
  list: (params) => apiClient.get('/api/clients', { params }),
  get: (id) => apiClient.get(`/api/clients/${id}`),
  create: (data) => apiClient.post('/api/clients', data),
  update: (id, data) => apiClient.put(`/api/clients/${id}`, data),
  delete: (id) => apiClient.delete(`/api/clients/${id}`),
};

// Appointments API
export const appointmentsAPI = {
  list: (params) => apiClient.get('/api/scheduling', { params }),
  get: (id) => apiClient.get(`/api/scheduling/${id}`),
  create: (data) => apiClient.post('/api/scheduling', data),
  update: (id, data) => apiClient.put(`/api/scheduling/${id}`, data),
  authorize: (id, authCode) =>
    apiClient.post(`/api/scheduling/${id}/authorize`, { auth_code: authCode }),
  complete: (id) => apiClient.post(`/api/scheduling/${id}/complete`),
  getStateInfo: (id) => apiClient.get(`/api/scheduling/${id}/state-info`),
};

// Billing API
export const billingAPI = {
  list: (params) => apiClient.get('/api/billing', { params }),
  get: (id) => apiClient.get(`/api/billing/${id}`),
  recordPayment: (id, amount) =>
    apiClient.post(`/api/billing/${id}/payment`, { amount }),
  downloadPDF: (id) => apiClient.get(`/api/billing/${id}/pdf`, { responseType: 'blob' }),
  getOverdueSummary: () => apiClient.get('/api/billing/overdue/summary'),
};

// Reports API
export const reportsAPI = {
  scheduleMaster: (startDate, endDate) =>
    apiClient.get('/api/reports/schedule-master', { params: { start_date: startDate, end_date: endDate } }),
  financeMaster: () => apiClient.get('/api/reports/finance-master'),
  authMaster: () => apiClient.get('/api/reports/auth-master'),
  providerPerformance: (startDate, endDate) =>
    apiClient.get('/api/reports/provider-performance', { params: { start_date: startDate, end_date: endDate } }),
  dashboardSummary: () => apiClient.get('/api/reports/dashboard-summary'),
};

// Metrics API
export const metricsAPI = {
  authorizationMetrics: () => apiClient.get('/api/metrics/authorization-metrics'),
  paymentMetrics: () => apiClient.get('/api/metrics/payment-metrics'),
};

export default apiClient;
