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
import { propertyAPI, inquiryAPI, visitAPI } from '../services/api';
import { getEmailFromToken, getUsername } from '../utils/auth';

function SalePropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openInquiry, setOpenInquiry] = useState(false);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    visitTime: '',
    notes: ''
  });

  const loadPropertyDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await propertyAPI.getById(id);
      const property = response.data;
      // Vérifier que c'est bien une propriété à vendre
      if (property.transactionType !== 'SALE') {
        setError('This property is not available for sale.');
        return;
      }
      setProperty(property);
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

  // Pré-remplir l'email et le nom de l'utilisateur connecté
  useEffect(() => {
    const userEmail = getEmailFromToken();
    const username = getUsername();
    if (userEmail && !inquiryForm.email) {
      setInquiryForm(prev => ({ ...prev, email: userEmail }));
    }
    if (username && !inquiryForm.name) {
      setInquiryForm(prev => ({ ...prev, name: username }));
    }
  }, []);

  const handleInquirySubmit = async () => {
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const inquiryData = {
        propertyId: parseInt(id),
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone || null,
        message: inquiryForm.message,
        status: 'NEW'
      };

      await inquiryAPI.create(inquiryData);
      setSuccess('Your inquiry has been sent successfully! The agent will contact you soon.');
      setOpenInquiry(false);
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error sending inquiry:', err);
      setError(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitVisit = async () => {
    if (!visitForm.visitDate) {
      setError('Please select a visit date.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Combiner date et heure
      const visitDateTime = visitForm.visitTime 
        ? `${visitForm.visitDate}T${visitForm.visitTime}:00`
        : `${visitForm.visitDate}T10:00:00`;

      // Le backend créera automatiquement le client depuis l'email du token
      const visitData = {
        propertyId: parseInt(id),
        visitDate: visitDateTime,
        notes: visitForm.notes || null
      };

      await visitAPI.create(visitData);
      setSuccess('Visit scheduled successfully! The agent will confirm the appointment.');
      setOpenVisitDialog(false);
      setVisitForm({ visitDate: '', visitTime: '', notes: '' });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error scheduling visit:', err);
      setError(err.response?.data?.message || 'Failed to schedule visit. Please try again.');
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

  if (error && !property) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!property) {
    return <Alert severity="info">Property not found</Alert>;
  }

  const getStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'AVAILABLE': return 'success';
      case 'RESERVED': return 'warning';
      case 'SOLD': return 'error';
      case 'PENDING': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'AVAILABLE': return 'Available';
      case 'RESERVED': return 'Reserved';
      case 'SOLD': return 'Sold';
      case 'PENDING': return 'Pending';
      default: return status || 'Unknown';
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
                📍 {property.address ? `${property.address}, ` : ''}{property.city}{property.postalCode ? ` ${property.postalCode}` : ''}
              </Typography>
              
              <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                <Chip 
                  label={getStatusLabel(property.status)} 
                  color={getStatusColor(property.status)}
                />
                <Chip 
                  label={property.transactionType || 'SALE'} 
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Prix */}
            <Box mb={3}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                ${property.price?.toLocaleString() || 'N/A'}
              </Typography>
              {(property.status === 'SOLD' || property.status === 'sold') && (
                <Typography variant="body2" color="text.secondary">
                  Sold
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
                <Typography variant="body1" fontWeight="bold">{property.type || 'N/A'}</Typography>
              </Grid>
              {property.surface && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Surface</Typography>
                  <Typography variant="body1" fontWeight="bold">{property.surface} m²</Typography>
                </Grid>
              )}
              {property.rooms && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Rooms</Typography>
                  <Typography variant="body1" fontWeight="bold">{property.rooms}</Typography>
                </Grid>
              )}
              {property.bathrooms && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                  <Typography variant="body1" fontWeight="bold">{property.bathrooms}</Typography>
                </Grid>
              )}
              {property.floorNumber && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Floor</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {property.floorNumber}{property.totalFloors ? `/${property.totalFloors}` : ''}
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
            {property.description && (
              <>
                <Typography variant="h6" gutterBottom>
                  📝 Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {property.description}
                </Typography>
              </>
            )}

            {property.updatedAt && (property.status === 'SOLD' || property.status === 'sold') && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(property.updatedAt).toLocaleDateString()}
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
                  ${property.price?.toLocaleString() || 'N/A'}
                </Typography>
              </Box>

              {(property.status === 'AVAILABLE' || property.status === 'available') && (
                <>
                  {/* Option 1: Programmer une visite */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mb: 1 }}
                    onClick={() => setOpenVisitDialog(true)}
                  >
                    📅 Schedule a Visit
                  </Button>
                  
                  {/* Option 2: Contacter l'agent */}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ mb: 2 }}
                    onClick={() => setOpenInquiry(true)}
                  >
                    📧 Contact Agent
                  </Button>
                </>
              )}

              {(property.status === 'RESERVED' || property.status === 'reserved') && (
                <Alert severity="warning">
                  This property is currently reserved
                </Alert>
              )}

              {(property.status === 'SOLD' || property.status === 'sold') && (
                <Alert severity="error">
                  This property has been sold
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Property ID:</strong> #{property.id}
              </Typography>
              {property.createdAt && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Listed:</strong> {new Date(property.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visit Dialog */}
      <Dialog open={openVisitDialog} onClose={() => !submitting && setOpenVisitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule a Visit</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Schedule a visit for {property?.title}
          </Typography>
          
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Visit Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={visitForm.visitDate}
                onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                required
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preferred Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={visitForm.visitTime}
                onChange={(e) => setVisitForm({ ...visitForm, visitTime: e.target.value })}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes or Special Requests"
                multiline
                rows={3}
                value={visitForm.notes}
                onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                placeholder="Any special requirements or questions..."
                disabled={submitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisitDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmitVisit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Schedule Visit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inquiry Dialog */}
      <Dialog open={openInquiry} onClose={() => !submitting && setOpenInquiry(false)} maxWidth="sm" fullWidth>
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                disabled={submitting}
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
                required
                disabled={submitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInquiry(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleInquirySubmit} 
            variant="contained"
            disabled={!inquiryForm.name || !inquiryForm.email || !inquiryForm.message || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Send Inquiry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SalePropertyDetails;

