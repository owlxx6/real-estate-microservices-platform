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
  (response) => {
    // Ne pas supprimer les données si c'est une réponse de login réussie
    if (response.config?.url?.includes('/api/auth/login') && response.status === 200) {
      console.log('Login response intercepted - preserving auth data');
      return response;
    }
    return response;
  },
  (error) => {
    // DEBUG: Log AVANT toute suppression du localStorage
    console.log('=== API INTERCEPTOR ERROR ===');
    console.log('Error URL:', error.config?.url);
    console.log('Error status:', error.response?.status);
    console.log('Current path:', window.location.pathname);
    console.log('Stack trace:', new Error().stack);
    
    // Ne JAMAIS supprimer les données si l'erreur vient de la page de login
    if (error.config?.url?.includes('/api/auth/login')) {
      console.log('Login error intercepted - not clearing auth data');
      return Promise.reject(error);
    }
    
    // Ne supprimer les données QUE si :
    // 1. C'est une erreur 401 (non autorisé)
    // 2. On n'est PAS sur la page de login
    // 3. Le token existe dans localStorage (sinon c'est peut-être une erreur de timing)
    const token = localStorage.getItem('token');
    const isLoginPage = window.location.pathname.includes('/login');
    
    if (error.response?.status === 401 && !isLoginPage && token) {
      // Vérifier que ce n'est pas juste après un login (délai de grâce de 2 secondes)
      const lastLoginTimeStr = sessionStorage.getItem('lastLoginTime');
      const now = Date.now();
      const timeSinceLogin = lastLoginTimeStr ? now - parseInt(lastLoginTimeStr, 10) : Infinity;
      
      if (timeSinceLogin < 2000) {
        console.log('=== PROTECTING AUTH DATA (recent login) ===');
        console.log('Time since login:', timeSinceLogin, 'ms');
        console.log('Not clearing auth data - login was too recent');
        return Promise.reject(error);
      }
      
      console.log('=== CLEARING AUTH DATA (401 error) ===');
      console.log('Reason: 401 Unauthorized, not on login page, token exists');
      console.log('Time since login:', timeSinceLogin, 'ms');
      
      // Supprimer les données d'authentification
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      
      // Rediriger vers login (sans rechargement de page si possible)
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    } else {
      const lastLoginTimeStr = sessionStorage.getItem('lastLoginTime');
      const timeSinceLogin = lastLoginTimeStr ? Date.now() - parseInt(lastLoginTimeStr, 10) : 'N/A';
      
      console.log('=== NOT CLEARING AUTH DATA ===');
      console.log('Reason:', {
        is401: error.response?.status === 401,
        isLoginPage,
        hasToken: !!token,
        timeSinceLogin
      });
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
  getForSale: (page = 0, size = 20) => api.get(`/api/properties/for-sale?page=${page}&size=${size}`),
  getForRent: (page = 0, size = 20) => api.get(`/api/properties/for-rent?page=${page}&size=${size}`),
};

export const dashboardAPI = {
  getStatistics: () => api.get('/api/dashboard/statistics'),
};

export const inquiryAPI = {
  getAll: () => api.get('/api/inquiries'),
  getById: (id) => api.get(`/api/inquiries/${id}`),
  create: (inquiry) => api.post('/api/inquiries', inquiry),
  update: (id, inquiry) => api.put(`/api/inquiries/${id}`, inquiry),
  delete: (id) => api.delete(`/api/inquiries/${id}`),
  getByProperty: (propertyId) => api.get(`/api/inquiries/property/${propertyId}`),
  getByAgent: (agentId) => api.get(`/api/inquiries/agent/${agentId}`),
  getByEmail: (email) => api.get(`/api/inquiries/email/${encodeURIComponent(email)}`),
};

export const visitAPI = {
  getAll: () => api.get('/api/visits'),
  getById: (id) => api.get(`/api/visits/${id}`),
  create: (visit) => api.post('/api/visits', visit),
  update: (id, visit) => api.put(`/api/visits/${id}`, visit),
  delete: (id) => api.delete(`/api/visits/${id}`),
  getByProperty: (propertyId) => api.get(`/api/visits/property/${propertyId}`),
  getByClient: (clientId) => api.get(`/api/visits/client/${clientId}`),
};

export const clientAPI = {
  getById: (id) => api.get(`/api/clients/${id}`),
};

export default api;
