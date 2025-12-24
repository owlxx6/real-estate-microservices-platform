import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import { inquiryAPI, propertyAPI } from '../services/api';
import { getEmailFromToken } from '../utils/auth';

function MyInquiries() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [properties, setProperties] = useState({});

  useEffect(() => {
    loadMyInquiries();
  }, []);

  const loadMyInquiries = async () => {
    setLoading(true);
    setError('');
    try {
      // Récupérer les inquiries par email du client
      const userEmail = getEmailFromToken();
      if (!userEmail) {
        setError('Unable to identify your account. Please log in again.');
        setLoading(false);
        return;
      }

      // L'email sera encodé automatiquement dans inquiryAPI.getByEmail
      const response = await inquiryAPI.getByEmail(userEmail);
      const myInquiries = response.data || [];
      
      setInquiries(myInquiries);

      // Charger les informations des propriétés
      const propertyIds = [...new Set(myInquiries.map(i => i.propertyId))];
      const propertiesData = {};
      
      for (const propertyId of propertyIds) {
        try {
          const propertyRes = await propertyAPI.getById(propertyId);
          propertiesData[propertyId] = propertyRes.data;
        } catch (err) {
          console.warn(`Failed to load property ${propertyId}:`, err);
        }
      }
      
      setProperties(propertiesData);
    } catch (err) {
      console.error('Error loading inquiries:', err);
      setError('Failed to load your inquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenDetailsDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'error';
      case 'CONTACTED': return 'warning';
      case 'RESPONDED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'NEW': return 'New';
      case 'CONTACTED': return 'Contacted';
      case 'RESPONDED': return 'Responded';
      case 'CLOSED': return 'Closed';
      default: return status;
    }
  };

  // Statistiques
  const respondedCount = inquiries.filter(i => i.status === 'RESPONDED').length;
  const pendingCount = inquiries.filter(i => i.status === 'NEW' || i.status === 'CONTACTED').length;

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
        My Inquiries
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View all your property inquiries and agent responses
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {inquiries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Inquiries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {respondedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                With Response
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {inquiries.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No inquiries yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When you contact an agent about a property, your inquiries will appear here.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/properties/for-sale')}
          >
            Browse Properties
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Your Message</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.map((inquiry) => {
                const property = properties[inquiry.propertyId];
                return (
                  <TableRow key={inquiry.id} hover>
                    <TableCell>
                      {property ? (
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <HomeIcon fontSize="small" />
                            <Button
                              size="small"
                              onClick={() => navigate(`/properties/sale/${property.id}`)}
                            >
                              {property.title}
                            </Button>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {property.city}
                          </Typography>
                        </Box>
                      ) : (
                        `Property #${inquiry.propertyId}`
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {inquiry.message?.substring(0, 100)}
                        {inquiry.message?.length > 100 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(inquiry.status)} 
                        size="small" 
                        color={getStatusColor(inquiry.status)}
                      />
                      {inquiry.status === 'RESPONDED' && (
                        <Chip 
                          label="Response Available" 
                          size="small" 
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        variant={inquiry.status === 'RESPONDED' ? 'contained' : 'outlined'}
                        color={inquiry.status === 'RESPONDED' ? 'success' : 'primary'}
                        startIcon={<MessageIcon />}
                        onClick={() => handleViewDetails(inquiry)}
                      >
                        {inquiry.status === 'RESPONDED' ? 'View Response' : 'View Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Inquiry Details
        </DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <>
              {properties[selectedInquiry.propertyId] && (
                <>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Property:</strong>
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setOpenDetailsDialog(false);
                        navigate(`/properties/sale/${selectedInquiry.propertyId}`);
                      }}
                    >
                      {properties[selectedInquiry.propertyId].title}
                    </Button>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {properties[selectedInquiry.propertyId].address}, {properties[selectedInquiry.propertyId].city}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Status:</strong>
                </Typography>
                <Chip 
                  label={getStatusLabel(selectedInquiry.status)} 
                  size="small" 
                  color={getStatusColor(selectedInquiry.status)}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Date Sent:</strong>
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Your Message:</strong>
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2">
                    {selectedInquiry.message}
                  </Typography>
                </Paper>
              </Box>

              {selectedInquiry.agentResponse ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Agent Response:</strong>
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {selectedInquiry.agentResponse}
                      </Typography>
                    </Paper>
                  </Box>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    The agent has responded to your inquiry. You can contact them directly using the information provided.
                  </Alert>
                </>
              ) : (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="info">
                    The agent has not responded yet. You will be notified when they reply.
                  </Alert>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>
            Close
          </Button>
          {selectedInquiry && properties[selectedInquiry.propertyId] && (
            <Button 
              variant="contained"
              onClick={() => {
                setOpenDetailsDialog(false);
                navigate(`/properties/sale/${selectedInquiry.propertyId}`);
              }}
            >
              View Property
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyInquiries;

