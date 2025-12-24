import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { bookingAPI } from '../services/rentalAPI';
import { propertyAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import RoleGuard from '../components/RoleGuard';
import { getEmailFromToken, getUsername } from '../utils/auth';

function RentalDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isClient } = useAuth();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  
  const [bookingForm, setBookingForm] = useState({
    startDate: location.state?.startDate || '',
    endDate: location.state?.endDate || '',
    numberOfGuests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  const loadRentalDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await propertyAPI.getById(id);
      const property = response.data;
      // Vérifier que c'est bien une propriété de location
      if (property.transactionType !== 'RENTAL') {
        setError('This property is not available for rental.');
        return;
      }
      setRental(property);
      
      // Charger les dates réservées
      try {
        const bookedDatesResponse = await bookingAPI.getBookedDates(id);
        setBookedDates(bookedDatesResponse.data.bookedDates || []);
      } catch (err) {
        console.warn('Could not load booked dates:', err);
        // Ne pas bloquer si on ne peut pas charger les dates réservées
        setBookedDates([]);
      }
    } catch (err) {
      console.error('Error loading rental:', err);
      setError('Failed to load rental details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRentalDetails();
  }, [loadRentalDetails]);

  // Pré-remplir l'email et le nom de l'utilisateur connecté
  useEffect(() => {
    const userEmail = getEmailFromToken();
    const username = getUsername();
    if (userEmail && !bookingForm.guestEmail) {
      setBookingForm(prev => ({ ...prev, guestEmail: userEmail }));
    }
    if (username && !bookingForm.guestName) {
      setBookingForm(prev => ({ ...prev, guestName: username }));
    }
  }, []);

  const calculateNights = () => {
    if (!bookingForm.startDate || !bookingForm.endDate) return 0;
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    // Vérifier que la date de fin est après la date de début
    if (end <= start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!rental) return 0;
    const nights = calculateNights();
    // Utiliser monthlyRent si disponible, sinon price, divisé par 30 pour obtenir le prix par nuit
    const pricePerNight = rental.monthlyRent ? (rental.monthlyRent / 30) : (rental.price ? (rental.price / 30) : 0);
    const nightsTotal = nights * pricePerNight;
    const deposit = rental.depositAmount || 0;
    return nightsTotal + deposit;
  };

  // Vérifier si une date est réservée
  const isDateBooked = (dateString) => {
    return bookedDates.includes(dateString);
  };
  
  // Vérifier si la période sélectionnée chevauche avec des dates réservées
  const hasDateConflict = () => {
    if (!bookingForm.startDate || !bookingForm.endDate) return false;
    
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const conflictDates = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (isDateBooked(dateStr)) {
        conflictDates.push(dateStr);
      }
    }
    
    return conflictDates.length > 0;
  };
  
  // Fonction de validation complète du formulaire
  const isFormValid = () => {
    // Vérifier que tous les champs requis sont remplis
    if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.guestName || !bookingForm.guestEmail) {
      return false;
    }
    
    // Vérifier que la date de check-out est après la date de check-in
    if (bookingForm.startDate && bookingForm.endDate) {
      const start = new Date(bookingForm.startDate);
      const end = new Date(bookingForm.endDate);
      if (end <= start) {
        return false;
      }
    }
    
    // Vérifier qu'il n'y a pas de conflit avec les dates réservées
    if (hasDateConflict()) {
      return false;
    }
    
    // Vérifier que l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.guestEmail)) {
      return false;
    }
    
    // Vérifier que le nombre de guests est valide (on peut utiliser rooms * 2 comme estimation)
    const maxGuests = rental ? (rental.rooms || 1) * 2 : 10;
    if (!rental || bookingForm.numberOfGuests < 1 || bookingForm.numberOfGuests > maxGuests) {
      return false;
    }
    
    return true;
  };

  const handleBookingSubmit = async () => {
    // Valider le formulaire avant de soumettre
    if (!isFormValid()) {
      setError('Please fill in all required fields correctly before submitting.');
      setOpenConfirm(false);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Utiliser propertyId - le backend créera automatiquement le RentalProperty si nécessaire
      const bookingData = {
        propertyId: parseInt(id), // Le backend créera automatiquement le RentalProperty
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        numberOfGuests: parseInt(bookingForm.numberOfGuests),
        guestName: bookingForm.guestName,
        guestEmail: bookingForm.guestEmail,
        guestPhone: bookingForm.guestPhone,
        specialRequests: bookingForm.specialRequests
      };
      
      await bookingAPI.createBooking(bookingData);
      setSuccess('Booking created successfully! Waiting for confirmation.');
      setOpenConfirm(false);
      
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please check the dates and try again.');
      setOpenConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !rental) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!rental) {
    return <Alert severity="info">Rental not found</Alert>;
  }

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <Box>
      <Button onClick={() => navigate('/rentals')} sx={{ mb: 2 }}>
        ← Back to Search
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Colonne Gauche: Détails du bien */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {rental.title}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📍 {rental.address || ''}, {rental.city}
            </Typography>
            
            <Box display="flex" gap={1} mb={3} flexWrap="wrap">
              {rental.type && <Chip label={rental.type} color="primary" />}
              <Chip 
                icon={<PeopleIcon />} 
                label={`Up to ${(rental.rooms || 1) * 2} guests`} 
              />
              <Chip 
                label={`${rental.rooms || 0} bedrooms`} 
              />
              <Chip 
                label={`${rental.bathrooms || 0} bathrooms`} 
              />
              <Chip 
                label={`${rental.surface || 0} m²`} 
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              💰 Pricing
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
              ${((rental.monthlyRent || rental.price || 0) / 30).toFixed(2)}
              <Typography component="span" variant="body1" color="text.secondary">
                {' '}/ night
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ${(rental.monthlyRent || rental.price || 0).toLocaleString()} / month
            </Typography>
            {rental.depositAmount && rental.depositAmount > 0 && (
              <Typography variant="body2" color="text.secondary">
                Deposit: ${rental.depositAmount.toLocaleString()}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            {rental.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📝 Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {rental.description}
                </Typography>
              </>
            )}

            {(rental.hasParking || rental.hasGarden || rental.hasPool || rental.hasElevator) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  ✨ Features
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {rental.hasParking && <Chip label="🅿️ Parking" size="small" />}
                  {rental.hasGarden && <Chip label="🌳 Garden" size="small" />}
                  {rental.hasPool && <Chip label="🏊 Pool" size="small" />}
                  {rental.hasElevator && <Chip label="🛗 Elevator" size="small" />}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Colonne Droite: Formulaire de réservation - CLIENT uniquement */}
        <Grid item xs={12} md={5}>
          <RoleGuard requiredRole="CLIENT">
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Book this rental
                </Typography>

              <Box component="form" mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Check-in Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={bookingForm.startDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        // Vérifier si la date est réservée
                        if (isDateBooked(selectedDate)) {
                          setError('This date is already booked. Please select another date.');
                          return;
                        }
                        setError('');
                        setBookingForm({ ...bookingForm, startDate: selectedDate });
                      }}
                      required
                      inputProps={{ 
                        min: new Date().toISOString().split('T')[0],
                        // Désactiver les dates réservées (via onInvalid)
                      }}
                      error={bookingForm.startDate && isDateBooked(bookingForm.startDate)}
                      helperText={bookingForm.startDate && isDateBooked(bookingForm.startDate) ? 'This date is already booked' : ''}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Check-out Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={bookingForm.endDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        // Vérifier si la date est réservée
                        if (isDateBooked(selectedDate)) {
                          setError('This date is already booked. Please select another date.');
                          return;
                        }
                        setError('');
                        setBookingForm({ ...bookingForm, endDate: selectedDate });
                      }}
                      required
                      inputProps={{ min: bookingForm.startDate || new Date().toISOString().split('T')[0] }}
                      error={bookingForm.endDate && isDateBooked(bookingForm.endDate)}
                      helperText={bookingForm.endDate && isDateBooked(bookingForm.endDate) ? 'This date is already booked' : ''}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Number of Guests"
                      type="number"
                      value={bookingForm.numberOfGuests}
                      onChange={(e) => setBookingForm({ ...bookingForm, numberOfGuests: e.target.value })}
                      required
                      inputProps={{ min: 1, max: (rental.rooms || 1) * 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Guest Name"
                      value={bookingForm.guestName}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={bookingForm.guestEmail}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={bookingForm.guestPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Special Requests"
                      multiline
                      rows={3}
                      value={bookingForm.specialRequests}
                      onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                    />
                  </Grid>
                </Grid>

                {/* Afficher les dates réservées */}
                {bookedDates.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      📅 Booked Dates (Unavailable):
                    </Typography>
                    <Typography variant="body2">
                      {bookedDates.slice(0, 10).map(date => new Date(date).toLocaleDateString()).join(', ')}
                      {bookedDates.length > 10 && ` ... and ${bookedDates.length - 10} more dates`}
                    </Typography>
                  </Alert>
                )}

                {/* Messages de validation */}
                {!bookingForm.startDate && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Check-in date is required.
                  </Alert>
                )}

                {!bookingForm.endDate && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Check-out date is required.
                  </Alert>
                )}

                {bookingForm.startDate && bookingForm.endDate && (() => {
                  const start = new Date(bookingForm.startDate);
                  const end = new Date(bookingForm.endDate);
                  if (end <= start) {
                    return (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Check-out date must be after check-in date.
                      </Alert>
                    );
                  }
                  
                  // Vérifier les conflits avec les dates réservées
                  if (hasDateConflict()) {
                    const conflictDates = [];
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                      const dateStr = d.toISOString().split('T')[0];
                      if (isDateBooked(dateStr)) {
                        conflictDates.push(new Date(dateStr).toLocaleDateString());
                      }
                    }
                    return (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        The selected period overlaps with booked dates: {conflictDates.join(', ')}. Please select different dates.
                      </Alert>
                    );
                  }
                  
                  return null;
                })()}

                {!bookingForm.guestName && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Guest name is required.
                  </Alert>
                )}

                {!bookingForm.guestEmail && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Email is required.
                  </Alert>
                )}

                {bookingForm.guestEmail && (() => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(bookingForm.guestEmail)) {
                    return (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Please enter a valid email address.
                      </Alert>
                    );
                  }
                  return null;
                })()}

                {bookingForm.numberOfGuests && rental && bookingForm.numberOfGuests < 1 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Number of guests must be at least 1.
                  </Alert>
                )}

                {bookingForm.numberOfGuests && rental && bookingForm.numberOfGuests > ((rental.rooms || 1) * 2) && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Number of guests cannot exceed {((rental.rooms || 1) * 2)}.
                  </Alert>
                )}

                {nights > 0 && (
                  <Box mt={3}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Price Breakdown
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>
                        ${((rental.monthlyRent || rental.price || 0) / 30).toFixed(2)} × {nights} nights
                      </Typography>
                      <Typography>
                        ${(nights * ((rental.monthlyRent || rental.price || 0) / 30)).toFixed(2)}
                      </Typography>
                    </Box>
                    {rental.depositAmount && rental.depositAmount > 0 && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Deposit</Typography>
                        <Typography>${rental.depositAmount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="bold">
                        Total
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3 }}
                  onClick={() => setOpenConfirm(true)}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Reserve Now'}
                </Button>

                <Typography variant="caption" display="block" textAlign="center" mt={2} color="text.secondary">
                  You won't be charged yet. Waiting for host confirmation.
                </Typography>
              </Box>
            </CardContent>
          </Card>
          </RoleGuard>
          
          {/* Message pour les non-CLIENT */}
          <RoleGuard requiredRole="CLIENT" fallback={
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Alert severity="info">
                  Only clients can make bookings. Please contact an agent for assistance.
                </Alert>
              </CardContent>
            </Card>
          }>
            {null}
          </RoleGuard>
        </Grid>
      </Grid>

      {/* Dialog de confirmation */}
      <Dialog open={openConfirm} onClose={() => !submitting && setOpenConfirm(false)}>
        <DialogTitle>Confirm Your Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Property:</strong> {rental.title}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Check-in:</strong> {bookingForm.startDate}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Check-out:</strong> {bookingForm.endDate}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Guests:</strong> {bookingForm.numberOfGuests}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Total:</strong> ${total.toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleBookingSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RentalDetails;

