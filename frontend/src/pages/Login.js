import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { authAPI } from '../services/api';
import { setAuthToken } from '../utils/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      const { token, username: user } = response.data;
      
      setAuthToken(token, user);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>
      <Paper elevation={3} style={{ padding: '40px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Real Estate Platform
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Login to continue
        </Typography>

        {error && (
          <Alert severity="error" style={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="textSecondary" align="center">
            Demo credentials: Any username/password combination
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
