import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
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
  TextField,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { inquiryAPI, visitAPI, propertyAPI, clientAPI } from '../services/api';
import { getEmailFromToken } from '../utils/auth';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function MyContactsAndVisits() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [openResponseDialog, setOpenResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState({});
  const [properties, setProperties] = useState({});
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitMenuAnchor, setVisitMenuAnchor] = useState(null);
  const [openVisitStatusDialog, setOpenVisitStatusDialog] = useState(false);
  const [newVisitStatus, setNewVisitStatus] = useState('');
  const [visitFeedback, setVisitFeedback] = useState('');
  const [agentId, setAgentId] = useState(null);

  useEffect(() => {
    // Récupérer l'agentId depuis le token ou localStorage
    // Pour l'instant, on va utiliser l'email pour trouver l'agent
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Pour l'instant, on charge toutes les inquiries et visites
      // TODO: Filtrer par agentId une fois qu'on a un moyen de l'obtenir
      const [inquiriesRes, visitsRes] = await Promise.all([
        inquiryAPI.getAll().catch(() => ({ data: { content: [] } })),
        visitAPI.getAll().catch(() => ({ data: { content: [] } }))
      ]);
      
      const inquiriesData = inquiriesRes.data?.content || inquiriesRes.data || [];
      const visitsData = visitsRes.data?.content || visitsRes.data || [];
      
      setInquiries(inquiriesData);
      setVisits(visitsData);
      
      // Charger les informations des clients et propriétés
      const clientIds = [...new Set(visitsData.map(v => v.clientId))];
      const propertyIds = [...new Set([
        ...inquiriesData.map(i => i.propertyId),
        ...visitsData.map(v => v.propertyId)
      ])];
      
      const clientsData = {};
      const propertiesData = {};
      
      for (const clientId of clientIds) {
        try {
          const clientRes = await clientAPI.getById(clientId);
          clientsData[clientId] = clientRes.data;
        } catch (err) {
          console.warn(`Failed to load client ${clientId}:`, err);
        }
      }
      
      for (const propertyId of propertyIds) {
        try {
          const propertyRes = await propertyAPI.getById(propertyId);
          propertiesData[propertyId] = propertyRes.data;
        } catch (err) {
          console.warn(`Failed to load property ${propertyId}:`, err);
        }
      }
      
      setClients(clientsData);
      setProperties(propertiesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load contacts and visits.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseText(inquiry.agentResponse || '');
    setOpenResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      setError('Please enter a response.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await inquiryAPI.update(selectedInquiry.id, {
        ...selectedInquiry,
        agentResponse: responseText,
        status: 'RESPONDED'
      });
      setOpenResponseDialog(false);
      setSelectedInquiry(null);
      setResponseText('');
      loadData();
    } catch (err) {
      console.error('Error updating inquiry:', err);
      setError(err.response?.data?.message || 'Failed to send response.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitMenuOpen = (event, visit) => {
    setVisitMenuAnchor(event.currentTarget);
    setSelectedVisit(visit);
  };

  const handleVisitMenuClose = () => {
    setVisitMenuAnchor(null);
    setSelectedVisit(null);
  };

  const handleChangeVisitStatus = (status) => {
    setNewVisitStatus(status);
    setVisitFeedback('');
    setOpenVisitStatusDialog(true);
    handleVisitMenuClose();
  };

  const handleSubmitVisitStatusChange = async () => {
    if (!selectedVisit) return;

    setSubmitting(true);
    setError('');

    try {
      await visitAPI.update(selectedVisit.id, {
        ...selectedVisit,
        status: newVisitStatus,
        feedback: visitFeedback || selectedVisit.feedback
      });
      setOpenVisitStatusDialog(false);
      setSelectedVisit(null);
      setNewVisitStatus('');
      setVisitFeedback('');
      loadData();
    } catch (err) {
      console.error('Error updating visit:', err);
      setError(err.response?.data?.message || 'Failed to update visit status.');
    } finally {
      setSubmitting(false);
    }
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

  const getVisitStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'info';
      case 'CONFIRMED': return 'success';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'warning';
      default: return 'default';
    }
  };

  // Statistiques
  const newInquiries = inquiries.filter(i => i.status === 'NEW').length;
  const upcomingVisits = visits.filter(v => 
    v.status === 'SCHEDULED' || v.status === 'CONFIRMED'
  ).length;

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
        My Contacts & Visits
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
                Total Contacts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error">
                {newInquiries}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New Contacts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {upcomingVisits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming Visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`📧 Contacts (${inquiries.length})`} />
          <Tab label={`📅 Visits (${visits.length})`} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {inquiries.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No inquiries yet
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Client</strong></TableCell>
                  <TableCell><strong>Message</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inquiries.map((inquiry) => {
                  const property = properties[inquiry.propertyId];
                  return (
                    <TableRow key={inquiry.id}>
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
                        <Box>
                          <Typography variant="body2">{inquiry.name}</Typography>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <EmailIcon fontSize="small" />
                            <Typography variant="caption">{inquiry.email}</Typography>
                          </Box>
                          {inquiry.phone && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <PhoneIcon fontSize="small" />
                              <Typography variant="caption">{inquiry.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {inquiry.message?.substring(0, 100)}
                          {inquiry.message?.length > 100 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={inquiry.status} 
                          size="small" 
                          color={getStatusColor(inquiry.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleRespondToInquiry(inquiry)}
                          disabled={inquiry.status === 'RESPONDED' || inquiry.status === 'CLOSED'}
                        >
                          {inquiry.status === 'RESPONDED' ? 'View' : 'Respond'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {visits.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No visits scheduled
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Client</strong></TableCell>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visits.map((visit) => {
                  const client = clients[visit.clientId];
                  const property = properties[visit.propertyId];
                  return (
                    <TableRow key={visit.id}>
                      <TableCell>
                        {property ? (
                          <Box>
                            <Button
                              size="small"
                              onClick={() => navigate(`/properties/sale/${property.id}`)}
                            >
                              {property.title}
                            </Button>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {property.city}
                            </Typography>
                          </Box>
                        ) : (
                          `Property #${visit.propertyId}`
                        )}
                      </TableCell>
                      <TableCell>
                        {client ? (
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon fontSize="small" />
                              <Typography variant="body2">
                                {client.firstName} {client.lastName}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {client.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2">Client #{visit.clientId}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarTodayIcon fontSize="small" />
                          {new Date(visit.visitDate).toLocaleString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={visit.status} 
                          size="small" 
                          color={getVisitStatusColor(visit.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {visit.notes || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleVisitMenuOpen(e, visit)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Response Dialog - Same as PropertyContacts */}
      <Dialog 
        open={openResponseDialog} 
        onClose={() => !submitting && setOpenResponseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedInquiry && `Respond to ${selectedInquiry.name}`}
        </DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Original Message:</strong>
                </Typography>
                <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="body2">{selectedInquiry.message}</Typography>
                </Paper>
              </Box>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Your Response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response to the client..."
                disabled={submitting || selectedInquiry.status === 'RESPONDED'}
              />
              {selectedInquiry.agentResponse && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Previous Response:</strong> {selectedInquiry.agentResponse}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenResponseDialog(false);
              setSelectedInquiry(null);
              setResponseText('');
            }} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitResponse} 
            variant="contained"
            disabled={!responseText.trim() || submitting || selectedInquiry?.status === 'RESPONDED'}
          >
            {submitting ? <CircularProgress size={24} /> : 'Send Response'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visit Status Menu and Dialog - Same as PropertyContacts */}
      <Menu
        anchorEl={visitMenuAnchor}
        open={Boolean(visitMenuAnchor)}
        onClose={handleVisitMenuClose}
      >
        {selectedVisit && selectedVisit.status === 'SCHEDULED' && (
          <MenuItem onClick={() => handleChangeVisitStatus('CONFIRMED')}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Confirm Visit
          </MenuItem>
        )}
        {selectedVisit && (selectedVisit.status === 'SCHEDULED' || selectedVisit.status === 'CONFIRMED') && (
          <MenuItem onClick={() => handleChangeVisitStatus('CANCELLED')}>
            <CancelIcon sx={{ mr: 1, color: 'error.main' }} />
            Cancel Visit
          </MenuItem>
        )}
        {selectedVisit && selectedVisit.status === 'CONFIRMED' && (
          <>
            <MenuItem onClick={() => handleChangeVisitStatus('COMPLETED')}>
              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
              Mark as Completed
            </MenuItem>
            <MenuItem onClick={() => handleChangeVisitStatus('NO_SHOW')}>
              <EventBusyIcon sx={{ mr: 1, color: 'warning.main' }} />
              Mark as No-Show
            </MenuItem>
          </>
        )}
      </Menu>

      <Dialog 
        open={openVisitStatusDialog} 
        onClose={() => !submitting && setOpenVisitStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Visit Status</DialogTitle>
        <DialogContent>
          {selectedVisit && (
            <>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Current Status:</strong> {selectedVisit.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>New Status:</strong> {newVisitStatus}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Visit Date:</strong> {new Date(selectedVisit.visitDate).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              {(newVisitStatus === 'COMPLETED' || newVisitStatus === 'NO_SHOW') && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Feedback / Notes"
                  value={visitFeedback}
                  onChange={(e) => setVisitFeedback(e.target.value)}
                  placeholder="Add feedback or notes about this visit..."
                  disabled={submitting}
                  sx={{ mt: 2 }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenVisitStatusDialog(false);
              setSelectedVisit(null);
              setNewVisitStatus('');
              setVisitFeedback('');
            }} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitVisitStatusChange} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyContactsAndVisits;

