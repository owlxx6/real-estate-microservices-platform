import React, { useState, useEffect } from 'react';
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
import { rentalAPI, bookingAPI } from '../services/rentalAPI';

function RentalDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  
  const [bookingForm, setBookingForm] = useState({
    startDate: location.state?.startDate || '',
    endDate: location.state?.endDate || '',
    numberOfGuests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  useEffect(() => {
    loadRentalDetails();
  }, [id]);

  const loadRentalDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await rentalAPI.getRentalById(id);
      setRental(response.data);
    } catch (err) {
      console.error('Error loading rental:', err);
      setError('Failed to load rental details.');
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingForm.startDate || !bookingForm.endDate) return 0;
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!rental) return 0;
    const nights = calculateNights();
    const nightsTotal = nights * rental.pricePerNight;
    const cleaningFee = rental.cleaningFee || 0;
    return nightsTotal + cleaningFee;
  };

  const handleBookingSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const bookingData = {
        rentalPropertyId: parseInt(id),
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
              {rental.propertyTitle}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📍 {rental.propertyAddress}, {rental.propertyCity}
            </Typography>
            
            <Box display="flex" gap={1} mb={3} flexWrap="wrap">
              <Chip label={rental.propertyType} color="primary" />
              <Chip 
                icon={<PeopleIcon />} 
                label={`Up to ${rental.maxGuests} guests`} 
              />
              <Chip 
                label={`${rental.propertyRooms} bedrooms`} 
              />
              <Chip 
                label={`${rental.propertyBathrooms} bathrooms`} 
              />
              <Chip 
                label={`${rental.propertySurface} m²`} 
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              💰 Pricing
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
              ${rental.pricePerNight}
              <Typography component="span" variant="body1" color="text.secondary">
                {' '}/ night
              </Typography>
            </Typography>
            {rental.cleaningFee > 0 && (
              <Typography variant="body2" color="text.secondary">
                + ${rental.cleaningFee} cleaning fee
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              ⏰ Check-in / Check-out
            </Typography>
            <Box display="flex" gap={2}>
              <Chip 
                icon={<AccessTimeIcon />}
                label={`Check-in: ${rental.checkInTime}`} 
              />
              <Chip 
                icon={<AccessTimeIcon />}
                label={`Check-out: ${rental.checkOutTime}`} 
              />
            </Box>

            {rental.rules && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📋 House Rules
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {rental.rules}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Colonne Droite: Formulaire de réservation */}
        <Grid item xs={12} md={5}>
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
                      onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                      required
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Check-out Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={bookingForm.endDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                      required
                      inputProps={{ min: bookingForm.startDate || new Date().toISOString().split('T')[0] }}
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
                      inputProps={{ min: 1, max: rental.maxGuests }}
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

                {nights > 0 && (
                  <Box mt={3}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Price Breakdown
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>
                        ${rental.pricePerNight} × {nights} nights
                      </Typography>
                      <Typography>
                        ${(nights * rental.pricePerNight).toFixed(2)}
                      </Typography>
                    </Box>
                    {rental.cleaningFee > 0 && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Cleaning fee</Typography>
                        <Typography>${rental.cleaningFee.toFixed(2)}</Typography>
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
                  disabled={!bookingForm.startDate || !bookingForm.endDate || !bookingForm.guestName || !bookingForm.guestEmail || submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Reserve Now'}
                </Button>

                <Typography variant="caption" display="block" textAlign="center" mt={2} color="text.secondary">
                  You won't be charged yet. Waiting for host confirmation.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de confirmation */}
      <Dialog open={openConfirm} onClose={() => !submitting && setOpenConfirm(false)}>
        <DialogTitle>Confirm Your Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Property:</strong> {rental.propertyTitle}
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

