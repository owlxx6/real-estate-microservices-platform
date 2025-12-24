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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { saleAPI } from '../services/saleAPI';

function PropertiesForSale() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    minRooms: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await saleAPI.getAllForSale();
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error loading properties for sale:', err);
      setError('Failed to load properties. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.type) params.type = filters.type;
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
      if (filters.minRooms) params.minRooms = parseInt(filters.minRooms);
      
      const response = await saleAPI.searchForSale(params);
      setProperties(response.data || []);
    } catch (err) {
      console.error('Error searching properties:', err);
      setError('Failed to search properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      city: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      minRooms: ''
    });
    loadProperties();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FOR_SALE': return 'success';
      case 'RESERVED': return 'warning';
      case 'SOLD': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'FOR_SALE': return 'For Sale';
      case 'RESERVED': return 'Reserved';
      case 'SOLD': return 'Sold';
      default: return status;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            🏡 Properties for Sale
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find your dream property
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          variant="outlined"
        >
          Reset
        </Button>
      </Box>

      {/* Filtres de recherche */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g., Paris, Lyon"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="APARTMENT">Apartment</MenuItem>
                <MenuItem value="HOUSE">House</MenuItem>
                <MenuItem value="VILLA">Villa</MenuItem>
                <MenuItem value="LAND">Land</MenuItem>
                <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                <MenuItem value="OFFICE">Office</MenuItem>
                <MenuItem value="STUDIO">Studio</MenuItem>
                <MenuItem value="DUPLEX">Duplex</MenuItem>
                <MenuItem value="PENTHOUSE">Penthouse</MenuItem>
              </Select>
            </FormControl>
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
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Rooms"
              type="number"
              value={filters.minRooms}
              onChange={(e) => setFilters({ ...filters, minRooms: e.target.value })}
              inputProps={{ min: 0 }}
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
            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} for Sale
          </Typography>

          {properties.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No properties found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search criteria
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {properties.map((property) => (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
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
                        {property.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        📍 {property.city}
                      </Typography>
                      
                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip 
                          label={property.type} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={getStatusLabel(property.saleStatus)}
                          size="small"
                          color={getStatusColor(property.saleStatus)}
                        />
                      </Box>
                      
                      <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">
                        ${property.salePrice?.toLocaleString()}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        🛏️ {property.rooms} rooms • 🚿 {property.bathrooms} baths • 
                        📐 {property.surface} m²
                      </Typography>
                      
                      {property.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {property.description}
                        </Typography>
                      )}
                      
                      {/* Features */}
                      <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                        {property.hasParking && <Chip label="🅿️ Parking" size="small" variant="outlined" />}
                        {property.hasGarden && <Chip label="🌳 Garden" size="small" variant="outlined" />}
                        {property.hasPool && <Chip label="🏊 Pool" size="small" variant="outlined" />}
                        {property.hasElevator && <Chip label="🛗 Elevator" size="small" variant="outlined" />}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/properties/sale/${property.id}`)}
                        disabled={property.saleStatus === 'SOLD'}
                      >
                        {property.saleStatus === 'SOLD' ? 'Sold' : 'View Details'}
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

export default PropertiesForSale;

