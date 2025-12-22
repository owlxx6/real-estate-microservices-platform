import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import { SearchOutlined, LocationOn, AttachMoney } from '@mui/icons-material';
import { propertyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    status: 'AVAILABLE',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const response = await propertyAPI.search(searchFilters);
      setProperties(response.data.content || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const searchFilters = {};
    if (filters.city) searchFilters.city = filters.city;
    if (filters.type) searchFilters.type = filters.type;
    if (filters.status) searchFilters.status = filters.status;
    if (filters.minPrice) searchFilters.minPrice = filters.minPrice;
    if (filters.maxPrice) searchFilters.maxPrice = filters.maxPrice;
    if (filters.minRooms) searchFilters.minRooms = filters.minRooms;

    fetchProperties(searchFilters);
  };

  const handleReset = () => {
    setFilters({
      city: '',
      type: '',
      status: 'AVAILABLE',
      minPrice: '',
      maxPrice: '',
      minRooms: '',
    });
    fetchProperties();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px' }}>
      <Typography variant="h4" gutterBottom>
        Find Your Dream Property
      </Typography>

      {/* Search Filters */}
      <Card style={{ marginBottom: '30px', padding: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="City"
              variant="outlined"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g., New York"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                label="Property Type"
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
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              variant="outlined"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              variant="outlined"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Rooms"
              type="number"
              variant="outlined"
              value={filters.minRooms}
              onChange={(e) => setFilters({ ...filters, minRooms: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Properties Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {properties.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" color="textSecondary">
                No properties found. Try adjusting your search filters.
              </Typography>
            </Grid>
          ) : (
            properties.map((property) => (
              <Grid item xs={12} md={4} key={property.id}>
                <Card 
                  style={{ cursor: 'pointer', height: '100%' }}
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <CardMedia
                    component="div"
                    style={{
                      height: 200,
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" color="textSecondary">
                      {property.type}
                    </Typography>
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom noWrap>
                      {property.title}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary" ml={0.5}>
                        {property.city}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AttachMoney fontSize="small" color="primary" />
                      <Typography variant="h6" color="primary">
                        {formatPrice(property.price)}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} mb={1}>
                      <Chip label={`${property.rooms} rooms`} size="small" />
                      <Chip label={`${property.surface} m²`} size="small" />
                      <Chip label={`${property.bathrooms} baths`} size="small" />
                    </Box>
                    <Chip
                      label={property.status}
                      color={property.status === 'AVAILABLE' ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Home;

