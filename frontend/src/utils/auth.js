// Authentication utilities

export const setAuthToken = (token, username) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getUsername = () => {
  return localStorage.getItem('username');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/login';
};

export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return null;
  }
  return children;
};

