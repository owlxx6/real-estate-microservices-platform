import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, clearAuthData, getUsername } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const username = getUsername();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          Real Estate Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {authenticated ? (
            <>
              <Button color="inherit" onClick={() => navigate('/property-search')}>
                All Properties
              </Button>
              <Typography variant="body2" sx={{ mx: 1, color: 'rgba(255,255,255,0.5)' }}>|</Typography>
              <Button color="inherit" onClick={() => navigate('/properties/for-sale')}>
                🏡 For Sale
              </Button>
              <Button color="inherit" onClick={() => navigate('/rentals')}>
                🏠 Rentals
              </Button>
              <Button color="inherit" onClick={() => navigate('/my-bookings')}>
                My Bookings
              </Button>
              <Typography variant="body2" sx={{ mx: 1, color: 'rgba(255,255,255,0.5)' }}>|</Typography>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/admin')}>
                Admin
              </Button>
              <Button color="inherit" onClick={() => navigate('/admin/sales')}>
                Manage Sales
              </Button>
              <Button color="inherit" onClick={() => navigate('/admin/rentals')}>
                Manage Rentals
              </Button>
              <Button color="inherit" onClick={() => navigate('/admin/bookings')}>
                Manage Bookings
              </Button>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                {username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
