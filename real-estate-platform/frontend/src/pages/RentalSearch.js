import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { rentalAPI } from '../services/rentalAPI';

function RentalSearch() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    guests: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await rentalAPI.getAllRentals();
      setRentals(response.data || []);
    } catch (err) {
      console.error('Error loading rentals:', err);
      setError('Failed to load rentals. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.guests) params.guests = parseInt(filters.guests);
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
      
      const response = await rentalAPI.searchRentals(params);
      setRentals(response.data || []);
    } catch (err) {
      console.error('Error searching rentals:', err);
      setError('Failed to search rentals.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      guests: '',
      minPrice: '',
      maxPrice: ''
    });
    loadRentals();
  };

  const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        🏠 Search Rentals
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Find your perfect short-term rental
      </Typography>

      {/* Filtres de recherche */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Check-in"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
          </Grid>
          
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Check-out"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              inputProps={{ min: filters.startDate || new Date().toISOString().split('T')[0] }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Guests"
              type="number"
              value={filters.guests}
              onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleIcon />
                  </InputAdornment>
                )
              }}
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={handleReset} color="secondary">
            Reset Filters
          </Button>
        </Box>
      </Paper>

      {/* Résultats */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h6" mb={2}>
            {rentals.length} {rentals.length === 1 ? 'Rental' : 'Rentals'} Available
          </Typography>

          {rentals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No rentals found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search criteria
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {rentals.map((rental) => (
                <Grid item xs={12} sm={6} md={4} key={rental.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {rental.propertyTitle || 'Property'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📍 {rental.propertyCity}
                      </Typography>
                      
                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip 
                          label={rental.propertyType} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${rental.maxGuests} guests`}
                          size="small"
                        />
                      </Box>
                      
                      <Box mb={1}>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          ${rental.pricePerNight}/night
                        </Typography>
                        {rental.cleaningFee > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            + ${rental.cleaningFee} cleaning fee
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        🛏️ {rental.propertyRooms} rooms • 🚿 {rental.propertyBathrooms} baths • 
                        📐 {rental.propertySurface} m²
                      </Typography>
                      
                      <Box mt={2}>
                        <Typography variant="caption" color="text.secondary">
                          Check-in: {rental.checkInTime} • Check-out: {rental.checkOutTime}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/rentals/${rental.id}`, {
                          state: { startDate: filters.startDate, endDate: filters.endDate }
                        })}
                      >
                        View Details & Book
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

export default RentalSearch;

