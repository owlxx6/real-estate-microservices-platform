import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import PropertySearch from './pages/PropertySearch';
import PropertyDetails from './pages/PropertyDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import RentalSearch from './pages/RentalSearch';
import RentalDetails from './pages/RentalDetails';
import MyBookings from './pages/MyBookings';
import AdminRentals from './pages/AdminRentals';
import AdminBookings from './pages/AdminBookings';
import PropertiesForSale from './pages/PropertiesForSale';
import SalePropertyDetails from './pages/SalePropertyDetails';
import AdminSales from './pages/AdminSales';
import { useAuth } from './hooks/useAuth';
import RoleBasedRoute from './components/RoleBasedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Ou un loader
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/property-search"
              element={
                <PrivateRoute>
                  <PropertySearch />
                </PrivateRoute>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <PrivateRoute>
                  <PropertyDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute requireAgentOrAdmin>
                  <Dashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleBasedRoute requireAdmin>
                  <Admin />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/rentals"
              element={
                <PrivateRoute>
                  <RentalSearch />
                </PrivateRoute>
              }
            />
            <Route
              path="/rentals/:id"
              element={
                <PrivateRoute>
                  <RentalDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <RoleBasedRoute requiredRole="CLIENT">
                  <MyBookings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin/rentals"
              element={
                <RoleBasedRoute requireAgentOrAdmin>
                  <AdminRentals />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RoleBasedRoute requireAgentOrAdmin>
                  <AdminBookings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/properties/for-sale"
              element={
                <PrivateRoute>
                  <PropertiesForSale />
                </PrivateRoute>
              }
            />
            <Route
              path="/properties/sale/:id"
              element={
                <PrivateRoute>
                  <SalePropertyDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <RoleBasedRoute requireAgentOrAdmin>
                  <AdminSales />
                </RoleBasedRoute>
              }
            />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;

