import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { propertyAPI } from '../services/api';
import { saleAPI } from '../services/saleAPI';

function AdminSales() {
  const [properties, setProperties] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, action: null, sale: null });
  const [currentProperty, setCurrentProperty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [saleForm, setSaleForm] = useState({
    propertyId: null,
    salePrice: '',
    saleStatus: 'FOR_SALE',
    isActive: true
  });

  const [soldForm, setSoldForm] = useState({
    finalPrice: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, salesRes, statsRes] = await Promise.all([
        propertyAPI.search({}),
        saleAPI.getAllForSale(),
        saleAPI.getStatistics()
      ]);
      
      setProperties(propsRes.data.content || propsRes.data || []);
      setSales(salesRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const isPropertyForSale = (propertyId) => {
    return sales.find(s => s.propertyId === propertyId);
  };

  const handleOpenDialog = (property, existingSale = null) => {
    setCurrentProperty(property);
    
    if (existingSale) {
      setSaleForm({
        propertyId: existingSale.propertyId,
        salePrice: existingSale.salePrice,
        saleStatus: existingSale.saleStatus,
        isActive: existingSale.isActive
      });
    } else {
      setSaleForm({
        propertyId: property.id,
        salePrice: property.price || '',
        saleStatus: 'FOR_SALE',
        isActive: true
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProperty(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const sale = isPropertyForSale(currentProperty.id);
      
      if (sale) {
        await saleAPI.updateSale(sale.id, saleForm);
        setSuccess('Sale property updated successfully!');
      } else {
        await saleAPI.createSale(saleForm);
        setSuccess('Property listed for sale successfully!');
      }
      
      handleCloseDialog();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving sale:', err);
      setError(err.response?.data?.message || 'Failed to save sale property.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async () => {
    const { action, sale } = actionDialog;
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      switch (action) {
        case 'reserve':
          await saleAPI.reserveSale(sale.id);
          setSuccess('Property marked as reserved!');
          break;
        case 'sell':
          const finalPrice = soldForm.finalPrice ? parseFloat(soldForm.finalPrice) : null;
          await saleAPI.sellProperty(sale.id, finalPrice);
          setSuccess('Property marked as sold!');
          setSoldForm({ finalPrice: '' });
          break;
        case 'deactivate':
          await saleAPI.deactivateSale(sale.id);
          setSuccess('Sale listing deactivated!');
          break;
        default:
          break;
      }
      
      setActionDialog({ open: false, action: null, sale: null });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error processing action:', err);
      setError(err.response?.data?.message || `Failed to ${action} property.`);
      setActionDialog({ open: false, action: null, sale: null });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FOR_SALE': return 'success';
      case 'RESERVED': return 'warning';
      case 'SOLD': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        💼 Sale Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage properties for sale
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                For Sale
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.forSale || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Reserved
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.reserved || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Sold
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.sold || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Price
              </Typography>
              <Typography variant="h6" color="info.main">
                ${stats.averagePrice?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Properties Table */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6">
            Properties List
          </Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>City</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Sale Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => {
                const sale = isPropertyForSale(property.id);
                return (
                  <TableRow key={property.id} hover>
                    <TableCell>#{property.id}</TableCell>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>
                      <Chip label={property.type} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {sale ? (
                        <Typography fontWeight="bold">
                          ${sale.salePrice?.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {sale ? (
                        <Chip 
                          label={sale.saleStatus === 'FOR_SALE' ? 'For Sale' : sale.saleStatus}
                          size="small"
                          color={getStatusColor(sale.saleStatus)}
                        />
                      ) : (
                        <Chip label="Not Listed" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {sale ? (
                        <Box display="flex" gap={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenDialog(property, sale)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {sale.saleStatus === 'FOR_SALE' && (
                            <>
                              <Tooltip title="Mark as Reserved">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => setActionDialog({ open: true, action: 'reserve', sale })}
                                >
                                  <BookmarkIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark as Sold">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => setActionDialog({ open: true, action: 'sell', sale })}
                                >
                                  <AttachMoneyIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {sale.isActive && (
                            <Tooltip title="Deactivate">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => setActionDialog({ open: true, action: 'deactivate', sale })}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog(property)}
                        >
                          List for Sale
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Sale Configuration Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isPropertyForSale(currentProperty?.id) ? 'Edit Sale Listing' : 'List for Sale'}
        </DialogTitle>
        <DialogContent>
          {currentProperty && (
            <Box mb={2} mt={1}>
              <Typography variant="subtitle1" color="primary">
                {currentProperty.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentProperty.city} • {currentProperty.type} • {currentProperty.rooms} rooms
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sale Price ($)"
                type="number"
                value={saleForm.salePrice}
                onChange={(e) => setSaleForm({ ...saleForm, salePrice: e.target.value })}
                required
                inputProps={{ min: 0, step: 1000 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || !saleForm.salePrice}
          >
            {submitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog (Reserve/Sell/Deactivate) */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => !submitting && setActionDialog({ open: false, action: null, sale: null })}
      >
        <DialogTitle>
          {actionDialog.action === 'reserve' && 'Mark as Reserved'}
          {actionDialog.action === 'sell' && 'Mark as Sold'}
          {actionDialog.action === 'deactivate' && 'Deactivate Listing'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.sale && (
            <>
              {actionDialog.action === 'sell' && (
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Final Sale Price (optional)"
                    type="number"
                    value={soldForm.finalPrice}
                    onChange={(e) => setSoldForm({ finalPrice: e.target.value })}
                    helperText={`Listed price: $${actionDialog.sale.salePrice?.toLocaleString()}`}
                    inputProps={{ min: 0, step: 1000 }}
                  />
                </Box>
              )}
              
              <Typography>
                Are you sure you want to {actionDialog.action} this property?
              </Typography>
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2">
                  <strong>Property:</strong> {actionDialog.sale.title}
                </Typography>
                <Typography variant="body2">
                  <strong>City:</strong> {actionDialog.sale.city}
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> ${actionDialog.sale.salePrice?.toLocaleString()}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, action: null, sale: null })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAction}
            variant="contained"
            color={actionDialog.action === 'deactivate' ? 'error' : 'primary'}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminSales;

