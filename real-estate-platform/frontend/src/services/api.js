import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
};

export const propertyAPI = {
  getAll: (page = 0, size = 20) => api.get(`/api/properties?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/properties/${id}`),
  search: (filters) => api.get('/api/properties/search', { params: filters }),
  create: (property) => api.post('/api/properties', property),
  update: (id, property) => api.put(`/api/properties/${id}`, property),
  delete: (id) => api.delete(`/api/properties/${id}`),
  getByAgent: (agentId) => api.get(`/api/properties/agent/${agentId}`),
  getStatistics: () => api.get('/api/properties/statistics'),
};

export const dashboardAPI = {
  getStatistics: () => api.get('/api/dashboard/statistics'),
};

export default api;
