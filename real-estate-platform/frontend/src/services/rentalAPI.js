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

// ============= RENTAL PROPERTIES =============

export const rentalAPI = {
  // Récupérer tous les biens en location actifs
  getAllRentals: () => axios.get(`${API_URL}/rentals`),
  
  // Récupérer un bien en location par ID
  getRentalById: (id) => axios.get(`${API_URL}/rentals/${id}`),
  
  // Récupérer le bien en location d'une propriété
  getRentalByPropertyId: (propertyId) => axios.get(`${API_URL}/rentals/property/${propertyId}`),
  
  // Créer/activer un bien pour la location
  createRental: (rentalData) => axios.post(`${API_URL}/rentals`, rentalData),
  
  // Mettre à jour un bien en location
  updateRental: (id, rentalData) => axios.put(`${API_URL}/rentals/${id}`, rentalData),
  
  // Désactiver un bien en location
  deactivateRental: (id) => axios.delete(`${API_URL}/rentals/${id}`),
  
  // Rechercher des locations disponibles
  searchRentals: (params) => axios.get(`${API_URL}/rentals/search`, { params }),
  
  // Obtenir le calendrier de disponibilité
  getAvailability: (id, year, month) => 
    axios.get(`${API_URL}/rentals/${id}/availability`, { params: { year, month } }),
  
  // Statistiques de location
  getStatistics: () => axios.get(`${API_URL}/rentals/statistics`),
};

// ============= BOOKINGS =============

export const bookingAPI = {
  // Récupérer toutes les réservations
  getAllBookings: () => axios.get(`${API_URL}/bookings`),
  
  // Récupérer une réservation par ID
  getBookingById: (id) => axios.get(`${API_URL}/bookings/${id}`),
  
  // Créer une réservation
  createBooking: (bookingData) => axios.post(`${API_URL}/bookings`, bookingData),
  
  // Confirmer une réservation
  confirmBooking: (id) => axios.put(`${API_URL}/bookings/${id}/confirm`),
  
  // Annuler une réservation
  cancelBooking: (id) => axios.put(`${API_URL}/bookings/${id}/cancel`),
  
  // Marquer une réservation comme terminée
  completeBooking: (id) => axios.put(`${API_URL}/bookings/${id}/complete`),
  
  // Récupérer les réservations d'un bien
  getBookingsByRental: (rentalId) => axios.get(`${API_URL}/bookings/rental/${rentalId}`),
  
  // Récupérer les réservations d'un client
  getBookingsByGuest: (email) => axios.get(`${API_URL}/bookings/guest/${email}`),
  
  // Récupérer les réservations par statut
  getBookingsByStatus: (status) => axios.get(`${API_URL}/bookings/status/${status}`),
  
  // Réservations à venir
  getUpcomingBookings: () => axios.get(`${API_URL}/bookings/upcoming`),
  
  // Réservations en cours
  getActiveBookings: () => axios.get(`${API_URL}/bookings/active`),
  
  // Vérifier la disponibilité
  checkAvailability: (params) => axios.get(`${API_URL}/bookings/check-availability`, { params }),
  
  // Récupérer les dates réservées pour une propriété
  getBookedDates: (propertyId) => axios.get(`${API_URL}/bookings/booked-dates/${propertyId}`),
};

