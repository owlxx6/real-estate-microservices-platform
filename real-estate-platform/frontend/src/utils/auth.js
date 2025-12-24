export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUsername = () => {
  return localStorage.getItem('username');
};

export const getRole = () => {
  const role = localStorage.getItem('role') || 'CLIENT';
  console.log('getRole() called, returning:', role, 'Type:', typeof role);
  return role;
};

export const setAuthData = (token, username, role) => {
  console.log('setAuthData called with:', { token: token ? 'present' : 'missing', username, role, roleType: typeof role });
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  const roleToSave = role || 'CLIENT';
  console.log('Saving role to localStorage:', roleToSave);
  localStorage.setItem('role', roleToSave);
  const savedRole = localStorage.getItem('role');
  console.log('Role saved, verification:', savedRole, 'matches input:', savedRole === roleToSave);
};

export const clearAuthData = () => {
  // DEBUG: Log AVANT suppression
  console.log('=== EXPLICIT LOGOUT ===');
  console.log('Stack trace:', new Error().stack);
  console.log('Clearing auth data - explicit logout');
  
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  sessionStorage.removeItem('lastLoginTime');
};

// Helper functions for role checking
export const isAdmin = () => {
  return getRole() === 'ADMIN';
};

export const isAgent = () => {
  return getRole() === 'AGENT';
};

export const isClient = () => {
  return getRole() === 'CLIENT';
};

export const isAgentOrAdmin = () => {
  const role = getRole();
  const result = role === 'AGENT' || role === 'ADMIN';
  console.log('isAgentOrAdmin() called, role:', role, 'result:', result);
  return result;
};

export const hasRole = (requiredRole) => {
  return getRole() === requiredRole;
};

