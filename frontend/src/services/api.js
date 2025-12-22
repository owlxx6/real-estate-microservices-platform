import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  validateToken: () => api.post('/api/auth/validate'),
};

// Property APIs
export const propertyAPI = {
  getAll: (page = 0, size = 20) => 
    api.get(`/api/properties?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/properties/${id}`),
  create: (property) => api.post('/api/properties', property),
  update: (id, property) => api.put(`/api/properties/${id}`, property),
  delete: (id) => api.delete(`/api/properties/${id}`),
  search: (filters) => api.get('/api/properties/search', { params: filters }),
  getStatistics: () => api.get('/api/properties/statistics'),
  getByAgent: (agentId) => api.get(`/api/properties/agent/${agentId}`),
};

// Client APIs
export const clientAPI = {
  getAll: (page = 0, size = 20) => 
    api.get(`/api/clients?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/clients/${id}`),
  create: (client) => api.post('/api/clients', client),
  update: (id, client) => api.put(`/api/clients/${id}`, client),
  delete: (id) => api.delete(`/api/clients/${id}`),
};

// Agent APIs
export const agentAPI = {
  getAll: (page = 0, size = 20) => 
    api.get(`/api/agents?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/agents/${id}`),
  create: (agent) => api.post('/api/agents', agent),
  update: (id, agent) => api.put(`/api/agents/${id}`, agent),
  delete: (id) => api.delete(`/api/agents/${id}`),
  getPortfolio: (agentId) => api.get(`/api/agents/${agentId}/properties`),
};

// Visit APIs
export const visitAPI = {
  getAll: (page = 0, size = 20) => 
    api.get(`/api/visits?page=${page}&size=${size}`),
  getById: (id) => api.get(`/api/visits/${id}`),
  create: (visit) => api.post('/api/visits', visit),
  update: (id, visit) => api.put(`/api/visits/${id}`, visit),
  delete: (id) => api.delete(`/api/visits/${id}`),
  getByClient: (clientId) => api.get(`/api/visits/client/${clientId}`),
  getByProperty: (propertyId) => api.get(`/api/visits/property/${propertyId}`),
  getRecent: () => api.get('/api/visits/recent'),
};

// Dashboard APIs (Interface Service)
export const dashboardAPI = {
  getStatistics: () => api.get('/api/dashboard/statistics'),
  getAgentDashboard: (agentId) => api.get(`/api/dashboard/agent/${agentId}`),
  getClientDashboard: (clientId) => api.get(`/api/dashboard/client/${clientId}`),
};

// Search APIs (Interface Service)
export const searchAPI = {
  searchProperties: (filters) => 
    api.get('/api/search/properties', { params: filters }),
  getPropertyWithAgent: (propertyId) => 
    api.get(`/api/search/properties/${propertyId}`),
};

// Booking APIs (Interface Service)
export const bookingAPI = {
  createBooking: (booking) => api.post('/api/bookings', booking),
};

export default api;
