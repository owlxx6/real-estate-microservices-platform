import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import { bookingAPI } from '../services/rentalAPI';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // Utiliser getAllBookings() qui filtre automatiquement par rôle côté backend
      // Pour CLIENT, le backend retourne uniquement ses propres réservations
      // basé sur l'email extrait du token JWT (header X-User-Email)
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelling(true);
    setError('');
    setSuccess('');
    try {
      await bookingAPI.cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully!');
      setCancelDialog({ open: false, bookingId: null });
      loadMyBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking.');
      setCancelDialog({ open: false, bookingId: null });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const filterBookingsByStatus = (status) => {
    if (status === 'ALL') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canCancel = (booking) => {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  };

  const renderBookingCard = (booking) => (
    <Grid item xs={12} md={6} key={booking.id}>
      <Card sx={{ 
        height: '100%',
        border: booking.status === 'CONFIRMED' ? '2px solid #4caf50' : undefined
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Typography variant="h6" gutterBottom>
              {booking.propertyTitle || `Rental #${booking.rentalPropertyId}`}
            </Typography>
            <Chip 
              label={booking.status} 
              color={getStatusColor(booking.status)}
              size="small"
            />
          </Box>

          {booking.propertyCity && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📍 {booking.propertyCity}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Check-in:</strong> {new Date(booking.startDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Check-out:</strong> {new Date(booking.endDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Guests:</strong> {booking.numberOfGuests}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="body2" color="text.secondary">
              {calculateNights(booking.startDate, booking.endDate)} nights
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Total: ${booking.totalPrice?.toFixed(2)}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Booked on: {new Date(booking.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button size="small" variant="outlined">
            View Details
          </Button>
          {canCancel(booking) && (
            <Button 
              size="small" 
              color="error"
              onClick={() => setCancelDialog({ open: true, bookingId: booking.id })}
            >
              Cancel Booking
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const allBookings = bookings;
  const pendingBookings = filterBookingsByStatus('PENDING');
  const confirmedBookings = filterBookingsByStatus('CONFIRMED');
  const completedBookings = filterBookingsByStatus('COMPLETED');
  const cancelledBookings = filterBookingsByStatus('CANCELLED');

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📅 My Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage your rental reservations
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start exploring rentals and make your first reservation!
          </Typography>
          <Button variant="contained" href="/rentals">
            Browse Rentals
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`All (${allBookings.length})`} />
              <Tab label={`Pending (${pendingBookings.length})`} />
              <Tab label={`Confirmed (${confirmedBookings.length})`} />
              <Tab label={`Completed (${completedBookings.length})`} />
              <Tab label={`Cancelled (${cancelledBookings.length})`} />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {allBookings.map(renderBookingCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {pendingBookings.length > 0 ? (
                pendingBookings.map(renderBookingCard)
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No pending bookings</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {confirmedBookings.length > 0 ? (
                confirmedBookings.map(renderBookingCard)
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No confirmed bookings</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {completedBookings.length > 0 ? (
                completedBookings.map(renderBookingCard)
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No completed bookings</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              {cancelledBookings.length > 0 ? (
                cancelledBookings.map(renderBookingCard)
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No cancelled bookings</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </>
      )}

      {/* Cancel Dialog */}
      <Dialog 
        open={cancelDialog.open} 
        onClose={() => !cancelling && setCancelDialog({ open: false, bookingId: null })}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialog({ open: false, bookingId: null })}
            disabled={cancelling}
          >
            No, Keep It
          </Button>
          <Button 
            onClick={() => handleCancelBooking(cancelDialog.bookingId)}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyBookings;

