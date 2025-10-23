import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
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

// Handle auth errors
api.interceptors.response.use(
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

// Auth endpoints
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (email, password, firstName, lastName) =>
    api.post('/auth/register', { email, password, firstName, lastName }),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// News endpoints
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),

  getById: (id) => api.get(`/news/${id}`),

  getByStock: (symbol, limit = 20) =>
    api.get(`/news/stock/${symbol}`, { params: { limit } }),

  getStats: () => api.get('/news/stats/summary'),
};

// Recommendations endpoints
export const recommendationsAPI = {
  getAll: (params) => api.get('/recommendations', { params }),

  getTop: (limit = 10) => api.get('/recommendations/top', { params: { limit } }),

  getByStock: (symbol) => api.get(`/recommendations/stock/${symbol}`),

  getSummary: () => api.get('/recommendations/summary/dashboard'),

  getHistorical: (symbol) => api.get(`/recommendations/historical/${symbol}`),
};

// Analysis endpoints
export const analysisAPI = {
  get: (articleId) => api.get(`/analysis/${articleId}`),

  reanalyze: (articleId) => api.post(`/analysis/reanalyze/${articleId}`),

  triggerAggregation: () => api.post('/analysis/trigger'),
};

export default api;
