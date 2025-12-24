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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { propertyAPI } from '../services/api';
import { rentalAPI } from '../services/rentalAPI';

function AdminRentals() {
  const [properties, setProperties] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [rentalForm, setRentalForm] = useState({
    propertyId: null,
    pricePerNight: '',
    cleaningFee: 0,
    maxGuests: 1,
    rules: 'No smoking\nNo pets\nQuiet hours: 22:00-08:00',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, rentalsRes, statsRes] = await Promise.all([
        propertyAPI.search({}),
        rentalAPI.getAllRentals(),
        rentalAPI.getStatistics()
      ]);
      
      setProperties(propsRes.data.content || propsRes.data || []);
      setRentals(rentalsRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const isPropertyRental = (propertyId) => {
    return rentals.find(r => r.propertyId === propertyId);
  };

  const handleOpenDialog = (property, existingRental = null) => {
    setCurrentProperty(property);
    
    if (existingRental) {
      setRentalForm({
        propertyId: existingRental.propertyId,
        pricePerNight: existingRental.pricePerNight,
        cleaningFee: existingRental.cleaningFee || 0,
        maxGuests: existingRental.maxGuests,
        rules: existingRental.rules || '',
        checkInTime: existingRental.checkInTime,
        checkOutTime: existingRental.checkOutTime,
        isActive: existingRental.isActive
      });
    } else {
      setRentalForm({
        propertyId: property.id,
        pricePerNight: '',
        cleaningFee: 0,
        maxGuests: property.rooms || 1,
        rules: 'No smoking\nNo pets\nQuiet hours: 22:00-08:00',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        isActive: true
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProperty(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const rental = isPropertyRental(currentProperty.id);
      
      if (rental) {
        await rentalAPI.updateRental(rental.id, rentalForm);
        setSuccess('Rental property updated successfully!');
      } else {
        await rentalAPI.createRental(rentalForm);
        setSuccess('Property activated for rental successfully!');
      }
      
      handleCloseDialog();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving rental:', err);
      setError(err.response?.data?.message || 'Failed to save rental property.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (rentalId) => {
    if (!window.confirm('Are you sure you want to deactivate this rental?')) return;
    
    try {
      await rentalAPI.deactivateRental(rentalId);
      setSuccess('Rental deactivated successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deactivating rental:', err);
      setError('Failed to deactivate rental.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            🏠 Rental Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activate and manage properties for short-term rental
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Rentals
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.activeRentals || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Properties
              </Typography>
              <Typography variant="h4">
                {properties.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Bookings
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pendingBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Confirmed Bookings
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.confirmedBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Properties Table */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6">
            Properties List
          </Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>City</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Rooms</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Rental Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => {
                const rental = isPropertyRental(property.id);
                return (
                  <TableRow key={property.id} hover>
                    <TableCell>#{property.id}</TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>
                      <Chip label={property.type} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{property.rooms}</TableCell>
                    <TableCell>
                      <Chip 
                        label={property.status} 
                        size="small" 
                        color={property.status === 'AVAILABLE' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {rental ? (
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label={rental.isActive ? 'Active Rental' : 'Inactive'}
                          size="small"
                          color={rental.isActive ? 'success' : 'default'}
                        />
                      ) : (
                        <Chip label="Not for Rental" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {rental ? (
                        <>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(property, rental)}
                            title="Edit rental settings"
                          >
                            <EditIcon />
                          </IconButton>
                          {rental.isActive && (
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeactivate(rental.id)}
                              title="Deactivate rental"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog(property)}
                        >
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Rental Configuration Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isPropertyRental(currentProperty?.id) ? 'Edit Rental Settings' : 'Activate for Rental'}
        </DialogTitle>
        <DialogContent>
          {currentProperty && (
            <Box mb={2} mt={1}>
              <Typography variant="subtitle1" color="primary">
                {currentProperty.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentProperty.city} • {currentProperty.type} • {currentProperty.rooms} rooms
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Night ($)"
                type="number"
                value={rentalForm.pricePerNight}
                onChange={(e) => setRentalForm({ ...rentalForm, pricePerNight: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cleaning Fee ($)"
                type="number"
                value={rentalForm.cleaningFee}
                onChange={(e) => setRentalForm({ ...rentalForm, cleaningFee: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Max Guests"
                type="number"
                value={rentalForm.maxGuests}
                onChange={(e) => setRentalForm({ ...rentalForm, maxGuests: e.target.value })}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Check-in Time"
                type="time"
                value={rentalForm.checkInTime}
                onChange={(e) => setRentalForm({ ...rentalForm, checkInTime: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Check-out Time"
                type="time"
                value={rentalForm.checkOutTime}
                onChange={(e) => setRentalForm({ ...rentalForm, checkOutTime: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="House Rules"
                multiline
                rows={4}
                value={rentalForm.rules}
                onChange={(e) => setRentalForm({ ...rentalForm, rules: e.target.value })}
                placeholder="No smoking&#10;No pets&#10;Quiet hours: 22:00-08:00"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || !rentalForm.pricePerNight || !rentalForm.maxGuests}
          >
            {submitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminRentals;

