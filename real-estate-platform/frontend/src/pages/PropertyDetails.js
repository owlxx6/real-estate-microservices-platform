import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Chip, 
  Grid,
  Divider,
  Button,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { propertyAPI } from '../services/api';

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperty();
    // eslint-disable-next-line
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
        <Button onClick={() => navigate('/property-search')} sx={{ ml: 2 }}>
          Back to Search
        </Button>
      </Alert>
    );
  }

  if (!property) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Property not found</Typography>
        <Button onClick={() => navigate('/property-search')} sx={{ mt: 2 }}>
          Back to Search
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Bouton retour */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/property-search')}
        sx={{ mb: 3 }}
      >
        Back to Properties
      </Button>

      {/* En-tête principal */}
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          {property.title}
        </Typography>
        
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip 
            label={property.type} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
          <Chip 
            label={property.status}
            sx={{ 
              bgcolor: property.status === 'AVAILABLE' ? '#4caf50' : 
                       property.status === 'RESERVED' ? '#ff9800' : '#f44336',
              color: 'white'
            }}
          />
        </Box>

        <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
          ${property.price?.toLocaleString()}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Description
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary" paragraph>
              {property.description}
            </Typography>
          </Paper>

          {/* Caractéristiques */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Property Features
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <SquareFootIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">{property.surface}</Typography>
                    <Typography variant="body2" color="text.secondary">m² Surface</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <BedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">{property.rooms}</Typography>
                    <Typography variant="body2" color="text.secondary">Bedrooms</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <BathtubIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">{property.bathrooms}</Typography>
                    <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <CalendarTodayIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">
                      {new Date(property.createdAt).getFullYear()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Listed</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Barre latérale */}
        <Grid item xs={12} md={4}>
          {/* Localisation */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Location
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              <strong>Address:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {property.address}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>City:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.city}
            </Typography>
          </Paper>

          {/* Informations supplémentaires */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Property Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ '& > *': { mb: 2 } }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Property ID</Typography>
                <Typography variant="body1" fontWeight="bold">#{property.id}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body1" fontWeight="bold">{property.type}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1" fontWeight="bold">{property.status}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Agent ID</Typography>
                <Typography variant="body1" fontWeight="bold">#{property.agentId}</Typography>
              </Box>
              {property.updatedAt && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(property.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large"
              sx={{ mb: 2 }}
              disabled={property.status !== 'AVAILABLE'}
            >
              {property.status === 'AVAILABLE' ? 'Schedule Visit' : 'Not Available'}
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              size="large"
            >
              Contact Agent
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PropertyDetails;
