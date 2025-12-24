import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Component to conditionally render content based on user role
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {string} props.requiredRole - Specific role required (e.g., 'ADMIN', 'AGENT', 'CLIENT')
 * @param {boolean} props.requireAgentOrAdmin - If true, requires AGENT or ADMIN role
 * @param {boolean} props.requireAdmin - If true, requires ADMIN role only
 * @param {React.ReactNode} props.fallback - Optional fallback content to render if not authorized
 */
function RoleGuard({ 
  children, 
  requiredRole, 
  requireAgentOrAdmin, 
  requireAdmin,
  fallback = null 
}) {
  const { isAuthenticated, role, hasRole, isAgentOrAdmin, isAdmin } = useAuth();
  
  // Not authenticated - don't show
  if (!isAuthenticated) {
    return fallback;
  }
  
  // Check for specific role
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }
  
  // Check for AGENT or ADMIN
  if (requireAgentOrAdmin && !isAgentOrAdmin()) {
    return fallback;
  }
  
  // Check for ADMIN only
  if (requireAdmin && !isAdmin()) {
    return fallback;
  }
  
  // All checks passed - render children
  return <>{children}</>;
}

export default RoleGuard;

