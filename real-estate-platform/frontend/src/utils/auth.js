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

export const setAuthData = (token, username) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

