import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Home as HomeIcon,
  People,
  Event,
  AttachMoney,
} from '@mui/icons-material';
import { dashboardAPI } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          style={{
            backgroundColor: color,
            borderRadius: '50%',
            padding: '15px',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Container>
        <Typography>Error loading dashboard data</Typography>
      </Container>
    );
  }

  // Prepare data for charts
  const propertyTypeData = Object.entries(statistics.propertiesByType || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const propertyCityData = Object.entries(statistics.propertiesByCity || {}).map(
    ([name, properties]) => ({
      name,
      properties,
    })
  );

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px' }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Overview of platform statistics
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} style={{ marginTop: '20px', marginBottom: '30px' }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Properties"
            value={statistics.totalProperties || 0}
            icon={<HomeIcon />}
            color="#0088FE"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Available"
            value={statistics.availableProperties || 0}
            icon={<HomeIcon />}
            color="#00C49F"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Visits"
            value={statistics.totalVisits || 0}
            icon={<Event />}
            color="#FFBB28"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Clients"
            value={statistics.totalClients || 0}
            icon={<People />}
            color="#FF8042"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Property Types Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Properties by Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Properties by City Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Properties by City
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyCityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="properties" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Visit Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Visit Statistics
              </Typography>
              <Grid container spacing={3} style={{ marginTop: '10px' }}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {statistics.scheduledVisits || 0}
                    </Typography>
                    <Typography color="textSecondary">Scheduled</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {statistics.completedVisits || 0}
                    </Typography>
                    <Typography color="textSecondary">Completed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {statistics.recentActivities || 0}
                    </Typography>
                    <Typography color="textSecondary">Recent Activities</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary.main">
                      {statistics.averagePrice
                        ? `$${statistics.averagePrice.toLocaleString()}`
                        : 'N/A'}
                    </Typography>
                    <Typography color="textSecondary">Avg. Price</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
