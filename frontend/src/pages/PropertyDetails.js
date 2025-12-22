import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  AttachMoney,
  Home,
  Bathtub,
  MeetingRoom,
  Square,
  ArrowBack,
} from '@mui/icons-material';
import { propertyAPI } from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Container>
        <Typography>Property not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Back to Search
      </Button>

      <Card>
        <Box
          style={{
            height: 400,
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" color="textSecondary">
            {property.type}
          </Typography>
        </Box>

        <CardContent style={{ padding: '40px' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {property.title}
              </Typography>

              <Box display="flex" alignItems="center" mb={2}>
                <LocationOn color="action" />
                <Typography variant="h6" ml={1}>
                  {property.address}, {property.city}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" mb={3}>
                <AttachMoney style={{ fontSize: 40 }} color="primary" />
                <Typography variant="h3" color="primary">
                  {formatPrice(property.price)}
                </Typography>
              </Box>

              <Chip
                label={property.status}
                color={property.status === 'AVAILABLE' ? 'success' : 'default'}
                style={{ marginBottom: '30px' }}
              />

              <Divider style={{ marginBottom: '30px' }} />

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {property.description}
              </Typography>

              <Divider style={{ margin: '30px 0' }} />

              <Typography variant="h6" gutterBottom>
                Property Features
              </Typography>
              <Grid container spacing={3} style={{ marginTop: '10px' }}>
                <Grid item xs={6} md={3}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <MeetingRoom style={{ fontSize: 40 }} color="primary" />
                    <Typography variant="h6" mt={1}>
                      {property.rooms}
                    </Typography>
                    <Typography color="textSecondary">Rooms</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Bathtub style={{ fontSize: 40 }} color="primary" />
                    <Typography variant="h6" mt={1}>
                      {property.bathrooms}
                    </Typography>
                    <Typography color="textSecondary">Bathrooms</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Square style={{ fontSize: 40 }} color="primary" />
                    <Typography variant="h6" mt={1}>
                      {property.surface} m²
                    </Typography>
                    <Typography color="textSecondary">Surface</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Home style={{ fontSize: 40 }} color="primary" />
                    <Typography variant="h6" mt={1}>
                      {property.type}
                    </Typography>
                    <Typography color="textSecondary">Type</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card style={{ backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Agent
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Agent ID: {property.agentId}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginBottom: '10px' }}
                  >
                    Schedule Visit
                  </Button>
                  <Button variant="outlined" fullWidth>
                    Contact Agent
                  </Button>
                </CardContent>
              </Card>

              <Card style={{ marginTop: '20px' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Property Details
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Property ID
                    </Typography>
                    <Typography variant="body1">{property.id}</Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Listed On
                    </Typography>
                    <Typography variant="body1">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {property.updatedAt
                        ? new Date(property.updatedAt).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PropertyDetails;
