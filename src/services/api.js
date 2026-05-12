import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Log all responses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message;
    console.error(`[API] Error ${error.response?.status}:`, message);

    // Auto-logout on 401
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized — clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Business APIs
export const businessAPI = {
  create: (data) => api.post('/business', data),
  getAll: () => api.get('/business'),
  getById: (id) => api.get(`/business/${id}`),
  update: (id, data) => api.put(`/business/${id}`, data),
  delete: (id) => api.delete(`/business/${id}`),
};

// Flow APIs
export const flowAPI = {
  create: (data) => api.post('/flows', data),
  getByBusiness: (businessId) => api.get(`/flows/${businessId}`),
  update: (id, data) => api.put(`/flows/${id}`, data),
  delete: (id) => api.delete(`/flows/${id}`),
};

// Webhook test API
export const webhookAPI = {
  test: (data) => api.post('/webhook/test', data),
};

// Deposit APIs
export const depositAPI = {
  getByBusiness: (businessId) => api.get(`/deposits/${businessId}`),
  updateStatus: (id, status) => api.put(`/deposits/${id}/status`, { status }),
};

export default api;
