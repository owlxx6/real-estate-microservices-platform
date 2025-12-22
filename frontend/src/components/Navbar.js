import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Home,
  Dashboard,
  AdminPanelSettings,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUsername, logout } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const username = getUsername();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          Real Estate Platform
        </Typography>
        <Box>
          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
            Home
          </Button>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            startIcon={<AdminPanelSettings />}
            onClick={() => navigate('/admin')}
          >
            Admin
          </Button>
          <Typography
            variant="body2"
            style={{ display: 'inline', marginLeft: '20px', marginRight: '10px' }}
          >
            {username}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={logout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
