import React, { useMemo } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';
import { getMenuSections } from '../config/menuConfig';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated: authenticated, username, role } = useAuth();

  const handleLogout = () => {
    clearAuthData();
    window.dispatchEvent(new Event('authStateChanged'));
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'error';
      case 'AGENT': return 'primary';
      case 'CLIENT': return 'success';
      default: return 'default';
    }
  };

  // Filtrer les éléments du menu selon le rôle
  const menuSections = useMemo(() => {
    if (!authenticated || !role) {
      return [];
    }
    return getMenuSections(role);
  }, [authenticated, role]);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }} 
          onClick={() => navigate('/')}
        >
          Real Estate Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {authenticated ? (
            <>
              {/* Menu dynamique basé sur la configuration */}
              {menuSections.map((section, sectionIndex) => (
                <React.Fragment key={`section-${sectionIndex}`}>
                  {/* Séparateur avant chaque section (sauf la première) */}
                  {sectionIndex > 0 && (
                    <Typography 
                      variant="body2" 
                      sx={{ mx: 1, color: 'rgba(255,255,255,0.5)' }}
                    >
                      |
                    </Typography>
                  )}
                  
                  {/* Éléments de la section */}
                  {section.map((item) => (
                    <Button
                      key={item.path}
                      color="inherit"
                      onClick={() => navigate(item.path)}
                    >
                      {item.icon && `${item.icon} `}
                      {item.label}
                    </Button>
                  ))}
                </React.Fragment>
              ))}
              
              {/* Informations utilisateur et logout */}
              <Typography 
                variant="body2" 
                sx={{ mx: 1, color: 'rgba(255,255,255,0.5)' }}
              >
                |
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {username}
                </Typography>
                <Chip 
                  label={role} 
                  size="small" 
                  color={getRoleColor(role)}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
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
