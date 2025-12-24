import { Box, CircularProgress } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RoleBasedRoute({ children, requiredRole, requireAgentOrAdmin, requireAdmin }) {
  const { isAuthenticated, role, isLoading, hasRole, isAgentOrAdmin, isAdmin } = useAuth();
  
  console.log('RoleBasedRoute check:', {
    isAuthenticated,
    role,
    isLoading,
    requiredRole,
    requireAgentOrAdmin,
    requireAdmin,
    localStorageRole: localStorage.getItem('role')
  });
  
  // Attendre que l'authentification soit vérifiée
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check for specific role
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`Role ${role} does not match required role ${requiredRole}, redirecting to /property-search`);
    return <Navigate to="/property-search" replace />;
  }

  // Check for AGENT or ADMIN
  if (requireAgentOrAdmin && !isAgentOrAdmin()) {
    console.log(`Role ${role} is not AGENT or ADMIN, redirecting to /property-search`);
    return <Navigate to="/property-search" replace />;
  }

  // Check for ADMIN only
  if (requireAdmin && !isAdmin()) {
    console.log(`Role ${role} is not ADMIN, redirecting to /property-search`);
    return <Navigate to="/property-search" replace />;
  }

  console.log('RoleBasedRoute: Access granted for role:', role);
  return children;
}

export default RoleBasedRoute;

