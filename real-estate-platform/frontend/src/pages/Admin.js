import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactsIcon from '@mui/icons-material/Contacts';
import { propertyAPI, userAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();
  const { isAdmin: userIsAdmin, isLoading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'APARTMENT',
    transactionType: 'SALE',
    price: '',
    surface: '',
    rooms: '',
    bathrooms: '',
    address: '',
    city: '',
    status: 'AVAILABLE',
    agentId: '1'
  });
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CLIENT',
    isActive: true,
    agentId: null,
    clientId: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProperties = useCallback(async () => {
    try {
      const response = await propertyAPI.search({});
      setProperties(response.data.content || []);
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setMessage({ type: 'error', text: 'Failed to load users.' });
    }
  }, []);

  useEffect(() => {
    if (userIsAdmin) {
      loadProperties();
      loadUsers();
    }
  }, [userIsAdmin, loadProperties, loadUsers]);

  // Check if user is admin - after hooks
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userIsAdmin) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          Accès refusé. Cette page est réservée aux administrateurs.
        </Alert>
      </Box>
    );
  }

  const handleOpenDialog = (property = null) => {
    if (property) {
      setCurrentProperty(property);
      setFormData({
        title: property.title,
        description: property.description,
        type: property.type,
        transactionType: property.transactionType || 'SALE',
        price: property.price,
        surface: property.surface,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        address: property.address,
        city: property.city,
        status: property.status,
        agentId: property.agentId
      });
    } else {
      setCurrentProperty(null);
      setFormData({
        title: '',
        description: '',
        type: 'APARTMENT',
        transactionType: 'SALE',
        price: '',
        surface: '',
        rooms: '',
        bathrooms: '',
        address: '',
        city: '',
        status: 'AVAILABLE',
        agentId: '1'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProperty(null);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Validation des champs requis
      if (!formData.title || !formData.description || !formData.address || !formData.city) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' });
        setLoading(false);
        return;
      }
      
      const price = parseFloat(formData.price);
      if (!price || price <= 0) {
        setMessage({ type: 'error', text: 'Price must be greater than 0.' });
        setLoading(false);
        return;
      }
      
      // Convertir les valeurs numériques et s'assurer que transactionType est présent
      const submitData = {
        ...formData,
        price: price,
        surface: parseInt(formData.surface) || 1,
        rooms: parseInt(formData.rooms) || 0,
        bathrooms: Math.max(0, parseInt(formData.bathrooms) || 0), // S'assurer que bathrooms >= 0
        agentId: parseInt(formData.agentId) || 1,
        transactionType: formData.transactionType || 'SALE'
      };
      
      if (currentProperty) {
        await propertyAPI.update(currentProperty.id, submitData);
        setMessage({ type: 'success', text: 'Property updated successfully!' });
      } else {
        await propertyAPI.create(submitData);
        setMessage({ type: 'success', text: 'Property created successfully!' });
      }
      handleCloseDialog();
      loadProperties();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving property:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save property. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyAPI.delete(id);
        setMessage({ type: 'success', text: 'Property deleted successfully!' });
        loadProperties();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to delete property.' });
      }
    }
  };

  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setUserFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive,
        agentId: user.agentId || null,
        clientId: user.clientId || null
      });
    } else {
      setCurrentUser(null);
      setUserFormData({
        username: '',
        email: '',
        password: '',
        role: 'CLIENT',
        isActive: true,
        agentId: null,
        clientId: null
      });
    }
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setCurrentUser(null);
    setUserFormData({
      username: '',
      email: '',
      password: '',
      role: 'CLIENT',
      isActive: true,
      agentId: null,
      clientId: null
    });
  };

  const handleUserFormChange = (field, value) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userData = {
        username: userFormData.username,
        email: userFormData.email,
        role: userFormData.role,
        isActive: userFormData.isActive,
        agentId: userFormData.agentId || null,
        clientId: userFormData.clientId || null
      };

      // Ajouter le mot de passe seulement si fourni (pour la création ou la mise à jour)
      if (userFormData.password && userFormData.password.trim() !== '') {
        userData.password = userFormData.password;
      }

      if (currentUser) {
        // Update existing user
        await userAPI.update(currentUser.id, userData);
        setMessage({ type: 'success', text: 'User updated successfully.' });
      } else {
        // Create new user
        if (!userData.password || userData.password.trim() === '') {
          setMessage({ type: 'error', text: 'Password is required for new users.' });
          setLoading(false);
          return;
        }
        await userAPI.create(userData);
        setMessage({ type: 'success', text: 'User created successfully.' });
      }

      handleCloseUserDialog();
      loadUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving user:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save user. Username or email may already exist.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const user = users.find(u => u.id === id);
    if (user && user.role === 'ADMIN') {
      setMessage({ type: 'error', text: 'Cannot delete admin users.' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This will deactivate the user account.')) {
      setLoading(true);
      try {
        await userAPI.delete(id);
        setMessage({ type: 'success', text: 'User deleted successfully.' });
        loadUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        console.error('Error deleting user:', err);
        setMessage({ type: 'error', text: 'Failed to delete user.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Admin Panel
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Property
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Properties Management" />
          <Tab label="User Management" />
          <Tab label="Statistics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>City</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} hover>
                    <TableCell>#{property.id}</TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>
                      <Chip label={property.type} size="small" color="primary" />
                    </TableCell>
                    <TableCell>${property.price?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={property.status} 
                        size="small" 
                        color={property.status === 'AVAILABLE' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={() => navigate(`/properties/${property.id}/contacts`)}
                        title="View Contacts & Visits"
                      >
                        <ContactsIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(property)}
                        title="Edit Property"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(property.id)}
                        title="Delete Property"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Users Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentUser(null);
                setUserFormData({
                  username: '',
                  email: '',
                  password: '',
                  role: 'CLIENT',
                  isActive: true,
                  agentId: null,
                  clientId: null
                });
                setOpenUserDialog(true);
              }}
            >
              Add User
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Agent ID</strong></TableCell>
                  <TableCell><strong>Client ID</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>#{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={
                          user.role === 'ADMIN' ? 'error' : 
                          user.role === 'AGENT' ? 'primary' : 
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={user.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{user.agentId || 'N/A'}</TableCell>
                    <TableCell>{user.clientId || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setCurrentUser(user);
                          setUserFormData({
                            username: user.username,
                            email: user.email,
                            password: '',
                            role: user.role,
                            isActive: user.isActive,
                            agentId: user.agentId || null,
                            clientId: user.clientId || null
                          });
                          setOpenUserDialog(true);
                        }}
                        title="Edit User"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                        disabled={user.role === 'ADMIN'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h3" color="primary">{properties.length}</Typography>
                <Typography>Total Properties</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h3" color="success.main">
                  {properties.filter(p => p.status === 'AVAILABLE').length}
                </Typography>
                <Typography>Available</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h3" color="info.main">
                  {properties.filter(p => p.status === 'SOLD').length}
                </Typography>
                <Typography>Sold</Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Dialog pour ajouter/modifier */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                required
              >
                <MenuItem value="APARTMENT">Apartment</MenuItem>
                <MenuItem value="HOUSE">House</MenuItem>
                <MenuItem value="VILLA">Villa</MenuItem>
                <MenuItem value="LAND">Land</MenuItem>
                <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                <MenuItem value="OFFICE">Office</MenuItem>
                <MenuItem value="STUDIO">Studio</MenuItem>
                <MenuItem value="DUPLEX">Duplex</MenuItem>
                <MenuItem value="PENTHOUSE">Penthouse</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Transaction Type"
                value={formData.transactionType}
                onChange={(e) => handleFormChange('transactionType', e.target.value)}
                required
              >
                <MenuItem value="SALE">Sale</MenuItem>
                <MenuItem value="RENTAL">Rental</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                required
              >
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="RESERVED">Reserved</MenuItem>
                <MenuItem value="SOLD">Sold</MenuItem>
                <MenuItem value="RENTED">Rented</MenuItem>
                <MenuItem value="UNAVAILABLE">Unavailable</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Surface (m²)"
                type="number"
                value={formData.surface}
                onChange={(e) => handleFormChange('surface', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rooms"
                type="number"
                value={formData.rooms}
                onChange={(e) => handleFormChange('rooms', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleFormChange('bathrooms', e.target.value)}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agent ID"
                type="number"
                value={formData.agentId}
                onChange={(e) => handleFormChange('agentId', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : (currentProperty ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={userFormData.username}
                onChange={(e) => handleUserFormChange('username', e.target.value)}
                required
                disabled={!!currentUser}
                helperText={currentUser ? "Username cannot be changed" : "Minimum 3 characters"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) => handleUserFormChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userFormData.password}
                onChange={(e) => handleUserFormChange('password', e.target.value)}
                required={!currentUser}
                helperText={currentUser ? "Leave empty to keep current password" : "Minimum 6 characters"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Role"
                value={userFormData.role}
                onChange={(e) => handleUserFormChange('role', e.target.value)}
                required
                SelectProps={{ native: true }}
              >
                <option value="CLIENT">CLIENT</option>
                <option value="AGENT">AGENT</option>
                <option value="ADMIN">ADMIN</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={userFormData.isActive ? 'true' : 'false'}
                onChange={(e) => handleUserFormChange('isActive', e.target.value === 'true')}
                SelectProps={{ native: true }}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Agent ID (Optional)"
                type="number"
                value={userFormData.agentId || ''}
                onChange={(e) => handleUserFormChange('agentId', e.target.value ? parseInt(e.target.value) : null)}
                helperText="For AGENT role only"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Client ID (Optional)"
                type="number"
                value={userFormData.clientId || ''}
                onChange={(e) => handleUserFormChange('clientId', e.target.value ? parseInt(e.target.value) : null)}
                helperText="For CLIENT role only"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={loading || !userFormData.username || !userFormData.email || (!currentUser && !userFormData.password)}
          >
            {loading ? <CircularProgress size={24} /> : (currentUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Admin;
