import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { saleAPI } from '../services/saleAPI';

function SalePropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openInquiry, setOpenInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const loadPropertyDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await saleAPI.getSaleById(id);
      setProperty(response.data);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPropertyDetails();
  }, [loadPropertyDetails]);

  const handleInquirySubmit = () => {
    // Pour l'instant, juste afficher un message
    alert(`Inquiry sent for ${property.title}!\n\nThis feature will send your inquiry to the agent.`);
    setOpenInquiry(false);
    setInquiryForm({ name: '', email: '', phone: '', message: '' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !property) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!property) {
    return <Alert severity="info">Property not found</Alert>;
  }

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
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/properties/for-sale')} 
        sx={{ mb: 2 }}
      >
        Back to Listings
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Colonne Gauche: Détails du bien */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {/* Header */}
            <Box mb={3}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {property.title}
              </Typography>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📍 {property.address}, {property.city} {property.postalCode}
              </Typography>
              
              <Chip 
                label={getStatusLabel(property.saleStatus)} 
                color={getStatusColor(property.saleStatus)}
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Prix */}
            <Box mb={3}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                ${property.salePrice?.toLocaleString()}
              </Typography>
              {property.soldPrice && property.saleStatus === 'SOLD' && (
                <Typography variant="body2" color="text.secondary">
                  Sold for: ${property.soldPrice?.toLocaleString()}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Caractéristiques */}
            <Typography variant="h6" gutterBottom>
              📐 Property Details
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Typography variant="body1" fontWeight="bold">{property.type}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Surface</Typography>
                <Typography variant="body1" fontWeight="bold">{property.surface} m²</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Rooms</Typography>
                <Typography variant="body1" fontWeight="bold">{property.rooms}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                <Typography variant="body1" fontWeight="bold">{property.bathrooms}</Typography>
              </Grid>
              {property.floorNumber && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Floor</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {property.floorNumber}/{property.totalFloors}
                  </Typography>
                </Grid>
              )}
              {property.yearBuilt && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Year Built</Typography>
                  <Typography variant="body1" fontWeight="bold">{property.yearBuilt}</Typography>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Features */}
            <Typography variant="h6" gutterBottom>
              ✨ Features
            </Typography>
            <Box display="flex" gap={1} mb={3} flexWrap="wrap">
              {property.hasParking && <Chip label="🅿️ Parking" color="primary" variant="outlined" />}
              {property.hasGarden && <Chip label="🌳 Garden" color="success" variant="outlined" />}
              {property.hasPool && <Chip label="🏊 Swimming Pool" color="info" variant="outlined" />}
              {property.hasElevator && <Chip label="🛗 Elevator" color="secondary" variant="outlined" />}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Description */}
            <Typography variant="h6" gutterBottom>
              📝 Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {property.description}
            </Typography>

            {property.soldAt && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Sold on: {new Date(property.soldAt).toLocaleDateString()}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Colonne Droite: Contact / Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Interested?
              </Typography>

              <Box mb={3}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ${property.salePrice?.toLocaleString()}
                </Typography>
              </Box>

              {property.saleStatus === 'FOR_SALE' && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mb: 2 }}
                    onClick={() => setOpenInquiry(true)}
                  >
                    Contact Agent
                  </Button>
                  
                  <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                    Request more information or schedule a visit
                  </Typography>
                </>
              )}

              {property.saleStatus === 'RESERVED' && (
                <Alert severity="warning">
                  This property is currently reserved
                </Alert>
              )}

              {property.saleStatus === 'SOLD' && (
                <Alert severity="error">
                  This property has been sold
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Property ID:</strong> #{property.propertyId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Listed:</strong> {new Date(property.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inquiry Dialog */}
      <Dialog open={openInquiry} onClose={() => setOpenInquiry(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Agent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Send an inquiry about {property.title}
          </Typography>
          
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                placeholder="I'm interested in this property..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInquiry(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInquirySubmit} 
            variant="contained"
            disabled={!inquiryForm.name || !inquiryForm.email}
          >
            Send Inquiry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalePropertyDetails;

