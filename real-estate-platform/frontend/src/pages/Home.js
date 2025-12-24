import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { propertyAPI, authAPI } from '../services/api';
import { isAuthenticated, setAuthData } from '../utils/auth';

function Home() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (authenticated) {
      loadFeaturedProperties();
    }
  }, [authenticated]);

  const loadFeaturedProperties = async () => {
    try {
      const response = await propertyAPI.search({});
      setFeaturedProperties((response.data.content || []).slice(0, 3));
    } catch (err) {
      console.error('Error loading featured properties:', err);
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    setRegisterSuccess('');

    // Validation
    if (!registerForm.username || !registerForm.email || !registerForm.password || 
        !registerForm.firstName || !registerForm.lastName) {
      setRegisterError('Please fill in all required fields.');
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegistering(true);

    try {
      const registerData = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        phone: registerForm.phone || null
      };

      const response = await authAPI.register(registerData);
      
      setRegisterSuccess('Account created successfully! Please log in.');
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
      });
      
      // Fermer le dialog après 2 secondes et rediriger vers login
      setTimeout(() => {
        setOpenRegisterDialog(false);
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setRegisterError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Registration failed. Username or email may already be in use.'
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          p: 8, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h2" gutterBottom fontWeight="bold">
          🏠 Welcome to Real Estate Platform
        </Typography>
        <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
          Find your dream property today
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', opacity: 0.8 }}>
          Discover the perfect home from our extensive collection of properties. 
          Browse, search, and connect with agents all in one place.
        </Typography>
        <Box sx={{ mt: 4 }}>
          {authenticated ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/property-search')}
                sx={{ mr: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                startIcon={<SearchIcon />}
              >
                Browse Properties
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' } }}
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ mr: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => setOpenRegisterDialog(true)}
                startIcon={<PersonAddIcon />}
                sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.9)', color: 'primary.main', '&:hover': { bgcolor: 'white' } }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/property-search')}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                View Properties
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Features */}
      <Container>
        <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold" sx={{ mb: 4 }}>
          Why Choose Us?
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <HomeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Wide Selection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse through hundreds of properties including apartments, houses, villas, and commercial spaces
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <SearchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Advanced Search
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter by location, price range, property type, and more to find exactly what you're looking for
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Secure & Trusted
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Work with verified agents and enjoy a secure, transparent property buying experience
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Featured Properties */}
        {authenticated && featuredProperties.length > 0 && (
          <>
            <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold" sx={{ mb: 4 }}>
              Featured Properties
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {featuredProperties.map((property) => (
                <Grid item xs={12} md={4} key={property.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {property.title}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        📍 {property.city}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip label={property.type} size="small" color="primary" />
                        <Chip 
                          label={property.status} 
                          size="small" 
                          color={property.status === 'AVAILABLE' ? 'success' : 'warning'}
                        />
                      </Box>
                      <Typography variant="h5" color="primary" fontWeight="bold">
                        ${property.price?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {property.rooms} rooms • {property.bathrooms} baths • {property.surface} m²
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box textAlign="center">
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/property-search')}
              >
                View All Properties
              </Button>
            </Box>
          </>
        )}
      </Container>

      {/* Register Dialog */}
      <Dialog 
        open={openRegisterDialog} 
        onClose={() => !registering && setOpenRegisterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Your Account</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign up to browse properties, contact agents, and book visits
          </Typography>

          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRegisterError('')}>
              {registerError}
            </Alert>
          )}

          {registerSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {registerSuccess}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Username"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              required
              disabled={registering}
              helperText="Minimum 3 characters"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
              disabled={registering}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  required
                  disabled={registering}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  required
                  disabled={registering}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              disabled={registering}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
              disabled={registering}
              helperText="Minimum 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              required
              disabled={registering}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenRegisterDialog(false);
              setRegisterError('');
              setRegisterSuccess('');
              setRegisterForm({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phone: ''
              });
            }} 
            disabled={registering}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRegister} 
            variant="contained"
            disabled={registering}
          >
            {registering ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
