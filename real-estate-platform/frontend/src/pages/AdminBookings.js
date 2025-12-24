import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoIcon from '@mui/icons-material/Info';
import { bookingAPI, rentalAPI } from '../services/rentalAPI';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [actionDialog, setActionDialog] = useState({ open: false, booking: null, action: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        bookingAPI.getAllBookings(),
        rentalAPI.getStatistics()
      ]);
      
      setBookings(bookingsRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
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

  const handleAction = async () => {
    const { booking, action } = actionDialog;
    setProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      switch (action) {
        case 'confirm':
          await bookingAPI.confirmBooking(booking.id);
          setSuccess(`Booking #${booking.id} confirmed successfully!`);
          break;
        case 'cancel':
          await bookingAPI.cancelBooking(booking.id);
          setSuccess(`Booking #${booking.id} cancelled successfully!`);
          break;
        case 'complete':
          await bookingAPI.completeBooking(booking.id);
          setSuccess(`Booking #${booking.id} marked as completed!`);
          break;
        default:
          break;
      }
      
      setActionDialog({ open: false, booking: null, action: null });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error processing action:', err);
      setError(err.response?.data?.message || `Failed to ${action} booking.`);
      setActionDialog({ open: false, booking: null, action: null });
    } finally {
      setProcessing(false);
    }
  };

  const renderBookingRow = (booking) => (
    <TableRow key={booking.id} hover>
      <TableCell>#{booking.id}</TableCell>
      <TableCell>
        {booking.propertyTitle || `Property #${booking.rentalPropertyId}`}
        <br />
        <Typography variant="caption" color="text.secondary">
          {booking.propertyCity}
        </Typography>
      </TableCell>
      <TableCell>
        {booking.guestName}
        <br />
        <Typography variant="caption" color="text.secondary">
          {booking.guestEmail}
        </Typography>
      </TableCell>
      <TableCell>
        {new Date(booking.startDate).toLocaleDateString()}
        <br />
        <Typography variant="caption" color="text.secondary">
          to {new Date(booking.endDate).toLocaleDateString()}
        </Typography>
        <br />
        <Typography variant="caption">
          ({calculateNights(booking.startDate, booking.endDate)} nights)
        </Typography>
      </TableCell>
      <TableCell>
        <Chip 
          label={booking.status} 
          color={getStatusColor(booking.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          ${booking.totalPrice?.toFixed(2)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box display="flex" gap={0.5}>
          {booking.status === 'PENDING' && (
            <Tooltip title="Confirm">
              <IconButton
                size="small"
                color="success"
                onClick={() => setActionDialog({ open: true, booking, action: 'confirm' })}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <Tooltip title="Cancel">
              <IconButton
                size="small"
                color="error"
                onClick={() => setActionDialog({ open: true, booking, action: 'cancel' })}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {booking.status === 'CONFIRMED' && (
            <Tooltip title="Mark as Completed">
              <IconButton
                size="small"
                color="info"
                onClick={() => setActionDialog({ open: true, booking, action: 'complete' })}
              >
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="View Details">
            <IconButton size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
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
        📋 Booking Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage all rental reservations
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h4">
                {allBookings.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pendingBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Confirmed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.confirmedBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.completedBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bookings Table with Tabs */}
      <Paper>
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

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Guest</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allBookings.map(renderBookingRow)}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Guest</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingBookings.length > 0 ? (
                  pendingBookings.map(renderBookingRow)
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={2}>
                        No pending bookings
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Guest</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {confirmedBookings.length > 0 ? (
                  confirmedBookings.map(renderBookingRow)
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={2}>
                        No confirmed bookings
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Guest</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedBookings.length > 0 ? (
                  completedBookings.map(renderBookingRow)
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={2}>
                        No completed bookings
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Guest</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cancelledBookings.length > 0 ? (
                  cancelledBookings.map(renderBookingRow)
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={2}>
                        No cancelled bookings
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Action Confirmation Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => !processing && setActionDialog({ open: false, booking: null, action: null })}
      >
        <DialogTitle>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          {actionDialog.booking && (
            <>
              <Typography gutterBottom>
                Are you sure you want to <strong>{actionDialog.action}</strong> this booking?
              </Typography>
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2">
                  <strong>Booking ID:</strong> #{actionDialog.booking.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Guest:</strong> {actionDialog.booking.guestName}
                </Typography>
                <Typography variant="body2">
                  <strong>Property:</strong> {actionDialog.booking.propertyTitle}
                </Typography>
                <Typography variant="body2">
                  <strong>Dates:</strong> {new Date(actionDialog.booking.startDate).toLocaleDateString()} - {new Date(actionDialog.booking.endDate).toLocaleDateString()}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, booking: null, action: null })}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAction}
            variant="contained"
            color={actionDialog.action === 'cancel' ? 'error' : 'primary'}
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : `Yes, ${actionDialog.action}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminBookings;

