import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';

function PropertySearch() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      // Construction des paramètres de recherche
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          params[key] = filters[key];
        }
      });
      
      console.log('Loading properties with filters:', params);
      const response = await propertyAPI.search(params);
      console.log('Response:', response.data);
      
      setProperties(response.data.content || response.data || []);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    loadProperties();
  };

  const handleReset = () => {
    setFilters({
      city: '',
      type: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      minRooms: '',
    });
    setTimeout(() => loadProperties(), 100);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Search Properties
        </Typography>
        <IconButton onClick={handleReset} color="primary" title="Reset filters">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Filtres de recherche */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="e.g., New York, Paris"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filters.type}
                label="Property Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="APARTMENT">Apartment</MenuItem>
                <MenuItem value="HOUSE">House</MenuItem>
                <MenuItem value="VILLA">Villa</MenuItem>
                <MenuItem value="LAND">Land</MenuItem>
                <MenuItem value="COMMERCIAL">Commercial</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="RESERVED">Reserved</MenuItem>
                <MenuItem value="SOLD">Sold</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Price ($)"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Price ($)"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="10000000"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Rooms"
              type="number"
              value={filters.minRooms}
              onChange={(e) => handleFilterChange('minRooms', e.target.value)}
              placeholder="0"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={handleReset} sx={{ ml: 2 }}>Try Again</Button>
        </Alert>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
            </Typography>
          </Box>

          {properties.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No properties found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search filters
              </Typography>
              <Button variant="outlined" onClick={handleReset} sx={{ mt: 2 }}>
                Clear Filters
              </Button>
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
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap title={property.title}>
                        {property.title}
                      </Typography>
                      
                      <Typography color="textSecondary" gutterBottom>
                        📍 {property.city}
                      </Typography>
                      
                      <Box display="flex" gap={1} mb={2}>
                        <Chip 
                          label={property.type} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={property.status}
                          size="small"
                          color={
                            property.status === 'AVAILABLE' ? 'success' : 
                            property.status === 'RESERVED' ? 'warning' : 
                            'error'
                          }
                        />
                      </Box>
                      
                      <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">
                        ${property.price?.toLocaleString()}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        🛏️ {property.rooms} rooms • 🚿 {property.bathrooms} baths • 📐 {property.surface} m²
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
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
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

export default PropertySearch;
