import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Empêcher tout comportement par défaut de formulaire
  useEffect(() => {
    const handleSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Empêcher tous les submits de formulaire
    document.addEventListener('submit', handleSubmit, true);
    
    return () => {
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  const handleLogin = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation && typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    
    console.log('=== HANDLE LOGIN CALLED ===');
    console.log('Credentials:', { username: credentials.username, password: '***' });
    
    if (loading) {
      console.log('Already loading, ignoring click');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      console.log('Making API call to /api/auth/login');
      const response = await authAPI.login(credentials);
      console.log('Login response received:', response);
      
      // Vérifier que la réponse contient les données attendues
      if (!response || !response.data) {
        console.error('Invalid response structure:', response);
        setError('Réponse invalide du serveur. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      console.log('Full response.data:', JSON.stringify(response.data, null, 2));
      console.log('Response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data
      });
      
      // Extraire les données de manière plus robuste
      const token = response.data?.token;
      const username = response.data?.username;
      const role = response.data?.role;
      
      console.log('Extracted data:', { 
        token: token ? 'present' : 'missing', 
        username, 
        role,
        roleType: typeof role,
        roleValue: role,
        roleIsUndefined: role === undefined,
        roleIsNull: role === null,
        roleIsEmpty: role === '',
        rawRole: JSON.stringify(role)
      });
      
      // Vérifier que le token existe
      if (!token) {
        console.error('Token missing in response');
        setError('Token non reçu. Veuillez vérifier vos identifiants.');
        setLoading(false);
        return;
      }

      // Vérifier que le rôle existe
      if (!role) {
        console.error('Role missing in response! Response data:', response.data);
        setError('Rôle non reçu du serveur.');
        setLoading(false);
        return;
      }

      // DEBUG OBLIGATOIRE - Log AVANT stockage
      console.log('=== BEFORE STORAGE ===');
      console.log('response.data:', JSON.stringify(response.data, null, 2));
      console.log('Token:', token ? 'PRESENT' : 'MISSING', token ? token.substring(0, 20) + '...' : '');
      console.log('Username:', username);
      console.log('Role:', role, 'Type:', typeof role);
      
      // Normaliser les valeurs - Ne JAMAIS stocker "null" ou undefined comme string
      const normalizedToken = token && String(token).trim() !== '' ? String(token).trim() : null;
      const normalizedUsername = username && String(username).trim() !== '' ? String(username).trim() : null;
      const normalizedRole = role && String(role).trim() !== '' ? String(role).trim().toUpperCase() : null;
      
      // Vérifier que toutes les valeurs sont valides avant stockage
      if (!normalizedToken) {
        console.error('ERROR: Token is invalid, cannot save');
        setError('Token invalide reçu du serveur.');
        setLoading(false);
        return;
      }
      
      if (!normalizedRole) {
        console.error('ERROR: Role is invalid, cannot save');
        setError('Rôle invalide reçu du serveur.');
        setLoading(false);
        return;
      }
      
      console.log('Normalized values:', {
        token: normalizedToken ? 'PRESENT' : 'MISSING',
        username: normalizedUsername || 'null',
        role: normalizedRole || 'null'
      });
      
      // Stocker EXACTEMENT les mêmes clés pour TOUS les rôles
      localStorage.setItem('token', normalizedToken);
      localStorage.setItem('role', normalizedRole);
      if (normalizedUsername) {
        localStorage.setItem('username', normalizedUsername);
      }
      
      // Enregistrer le temps du login pour protéger contre les suppressions accidentelles
      sessionStorage.setItem('lastLoginTime', Date.now().toString());
      console.log('Login time recorded:', sessionStorage.getItem('lastLoginTime'));
      
      // DEBUG OBLIGATOIRE - Log APRÈS stockage
      console.log('=== AFTER STORAGE ===');
      const savedToken = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role');
      const savedUsername = localStorage.getItem('username');
      console.log('localStorage.getItem("token"):', savedToken ? 'PRESENT' : 'MISSING', savedToken ? savedToken.substring(0, 20) + '...' : '');
      console.log('localStorage.getItem("role"):', savedRole || 'null');
      console.log('localStorage.getItem("username"):', savedUsername || 'null');
      
      // Vérification finale
      if (!savedToken || !savedRole) {
        console.error('ERROR: Storage failed! Token or role missing after save');
        setError('Erreur lors de la sauvegarde des données d\'authentification.');
        setLoading(false);
        return;
      }
      
      // Déclencher l'événement pour notifier useAuth
      window.dispatchEvent(new Event('authStateChanged'));
      
      setLoading(false);
      
      // Navigation avec React Router - NE PAS recharger la page
      console.log('=== NAVIGATION ===');
      console.log('Role:', savedRole);
      console.log('Navigating to:', savedRole === 'ADMIN' || savedRole === 'AGENT' ? '/dashboard' : '/property-search');
      
      // Utiliser navigate() de React Router sans rechargement
      if (savedRole === 'ADMIN' || savedRole === 'AGENT') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/property-search', { replace: true });
      }
    } catch (err) {
      console.error('=== LOGIN ERROR CAUGHT ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error request:', err.request);
      console.error('Error message:', err.message);
      console.error('Error config:', err.config);
      console.error('===========================');
      
      // Afficher un message d'erreur plus détaillé
      if (err.response) {
        // Erreur de réponse du serveur
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error || 'Erreur serveur';
        
        if (status === 401) {
          setError('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
        } else if (status === 500) {
          setError('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          setError(`Erreur ${status}: ${message}`);
        }
      } else if (err.request) {
        // Pas de réponse du serveur
        setError('Impossible de contacter le serveur. Vérifiez que les services backend sont démarrés.');
      } else {
        // Erreur de configuration
        setError('Erreur de configuration. Veuillez réessayer.');
      }
      setLoading(false);
    }
  }, [credentials, loading]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box
          component="div"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                e.stopPropagation();
                handleLogin(e);
              }
            }}
            autoComplete="username"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                e.preventDefault();
                e.stopPropagation();
                handleLogin(e);
              }
            }}
            autoComplete="current-password"
          />
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              console.log('=== BUTTON CLICKED ===');
              if (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation && typeof e.stopImmediatePropagation === 'function') {
                  e.stopImmediatePropagation();
                }
              }
              handleLogin(e);
              return false;
            }}
            onMouseDown={(e) => {
              console.log('=== BUTTON MOUSEDOWN ===');
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            disabled={loading}
            sx={{ mt: 3 }}
            type="button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          <strong>Comptes de test:</strong><br />
          admin / password123 (ADMIN)<br />
          agent1 / password123 (AGENT)<br />
          client1 / password123 (CLIENT)
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
