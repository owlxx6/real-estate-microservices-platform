import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Intercepteur pour ajouter le token JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============= SALE PROPERTIES =============

export const saleAPI = {
  // Récupérer tous les biens à vendre
  getAllForSale: () => axios.get(`${API_URL}/sales`),
  
  // Récupérer un bien à vendre par ID
  getSaleById: (id) => axios.get(`${API_URL}/sales/${id}`),
  
  // Récupérer le bien à vendre d'une propriété
  getSaleByPropertyId: (propertyId) => axios.get(`${API_URL}/sales/property/${propertyId}`),
  
  // Créer/activer un bien pour la vente
  createSale: (saleData) => axios.post(`${API_URL}/sales`, saleData),
  
  // Mettre à jour un bien à vendre
  updateSale: (id, saleData) => axios.put(`${API_URL}/sales/${id}`, saleData),
  
  // Réserver un bien (offre acceptée)
  reserveSale: (id) => axios.put(`${API_URL}/sales/${id}/reserve`),
  
  // Marquer comme vendu
  sellProperty: (id, finalPrice) => 
    axios.put(`${API_URL}/sales/${id}/sell`, null, { params: { finalPrice } }),
  
  // Désactiver la vente
  deactivateSale: (id) => axios.delete(`${API_URL}/sales/${id}`),
  
  // Rechercher des biens à vendre
  searchForSale: (params) => axios.get(`${API_URL}/sales/search`, { params }),
  
  // Statistiques de vente
  getStatistics: () => axios.get(`${API_URL}/sales/statistics`),
};

