import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { inquiryAPI, visitAPI, propertyAPI, clientAPI } from '../services/api';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PersonIcon from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function PropertyContacts() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [openResponseDialog, setOpenResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState({}); // Cache pour les informations clients
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitMenuAnchor, setVisitMenuAnchor] = useState(null);
  const [openVisitStatusDialog, setOpenVisitStatusDialog] = useState(false);
  const [newVisitStatus, setNewVisitStatus] = useState('');
  const [visitFeedback, setVisitFeedback] = useState('');

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [inquiriesRes, visitsRes, propertyRes] = await Promise.all([
        inquiryAPI.getByProperty(propertyId),
        visitAPI.getByProperty(propertyId),
        propertyAPI.getById(propertyId).catch(() => null)
      ]);
      setInquiries(inquiriesRes.data || []);
      const visitsData = visitsRes.data || [];
      setVisits(visitsData);
      
      // Charger les informations des clients
      const clientIds = [...new Set(visitsData.map(v => v.clientId))];
      const clientsData = {};
      for (const clientId of clientIds) {
        try {
          const clientRes = await clientAPI.getById(clientId);
          clientsData[clientId] = clientRes.data;
        } catch (err) {
          console.warn(`Failed to load client ${clientId}:`, err);
        }
      }
      setClients(clientsData);
      
      if (propertyRes) {
        setProperty(propertyRes.data);
      }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')} 
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom fontWeight="bold">
        Property Contacts & Visits
      </Typography>

      {property && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {property.title} - {property.address}, {property.city}
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`📧 Contacts (${inquiries.length})`} />
          <Tab label={`📅 Scheduled Visits (${visits.length})`} />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        {inquiries.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No inquiries yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Client inquiries will appear here
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Message</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>{inquiry.name}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" />
                        {inquiry.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {inquiry.phone ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" />
                          {inquiry.phone}
                        </Box>
                      ) : (
                        'N/A'
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
                        {inquiry.status === 'RESPONDED' ? 'View Response' : 'Respond'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
              No scheduled visits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled visits will appear here
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Client</strong></TableCell>
                  <TableCell><strong>Visit Date & Time</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visits.map((visit) => {
                  const client = clients[visit.clientId];
                  return (
                    <TableRow key={visit.id}>
                      <TableCell>
                        {client ? (
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon fontSize="small" />
                              <Typography variant="body2" fontWeight="medium">
                                {client.firstName} {client.lastName}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {client.email}
                            </Typography>
                            {client.phone && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {client.phone}
                              </Typography>
                            )}
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

      {/* Response Dialog */}
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

      {/* Visit Status Menu */}
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
          <MenuItem onClick={() => handleChangeVisitStatus('COMPLETED')}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Mark as Completed
          </MenuItem>
        )}
        {selectedVisit && selectedVisit.status === 'CONFIRMED' && (
          <MenuItem onClick={() => handleChangeVisitStatus('NO_SHOW')}>
            <EventBusyIcon sx={{ mr: 1, color: 'warning.main' }} />
            Mark as No-Show
          </MenuItem>
        )}
      </Menu>

      {/* Visit Status Change Dialog */}
      <Dialog 
        open={openVisitStatusDialog} 
        onClose={() => !submitting && setOpenVisitStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedVisit && `Update Visit Status`}
        </DialogTitle>
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

export default PropertyContacts;

