import { useCallback, useEffect, useState } from 'react';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: null,
    username: null,
    isLoading: true
  });

  const checkAuth = useCallback(() => {
    // Lecture sécurisée de localStorage
    const token = localStorage.getItem('token');
    const roleRaw = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    
    // Normalisation du token
    const hasToken = token !== null && token !== undefined && token.trim() !== '';
    
    // Normalisation du rôle
    let role = null;
    if (roleRaw !== null && roleRaw !== undefined && roleRaw !== 'null' && roleRaw !== 'undefined') {
      const trimmed = String(roleRaw).trim();
      if (trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined') {
        role = trimmed.toUpperCase();
      }
    }
    
    // Normalisation du username
    const normalizedUsername = (username !== null && username !== undefined && username !== 'null' && username !== 'undefined') 
      ? String(username).trim() 
      : null;
    
    // État d'authentification : true UNIQUEMENT si token existe et n'est pas vide
    const isAuthenticated = hasToken;
    
    const newState = {
      isAuthenticated,
      role,
      username: normalizedUsername,
      isLoading: false
    };
    
    // Logs simplifiés
    console.log('useAuth: checkAuth', {
      hasToken,
      role: role || 'null',
      username: normalizedUsername || 'null'
    });
    
    setAuthState(newState);
    
    return { isAuthenticated, role, username: normalizedUsername };
  }, []);

  useEffect(() => {
    // Vérification initiale
    checkAuth();
    
    // Écouter les changements de localStorage (entre onglets)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'role' || e.key === 'username') {
        console.log('useAuth: Storage event', e.key);
        checkAuth();
      }
    };
    
    // Écouter l'événement personnalisé authStateChanged (même onglet)
    const handleAuthStateChanged = () => {
      console.log('useAuth: authStateChanged event');
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChanged);
    
    // Vérification périodique (pour les changements dans le même onglet)
    // Utiliser une variable locale pour éviter les problèmes de closure
    let lastKnownToken = localStorage.getItem('token');
    let lastKnownRole = localStorage.getItem('role');
    
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      const currentRole = localStorage.getItem('role');
      
      // Vérifier si le token ou le rôle a changé
      if (currentToken !== lastKnownToken || currentRole !== lastKnownRole) {
        console.log('useAuth: Change detected', {
          tokenChanged: currentToken !== lastKnownToken,
          roleChanged: currentRole !== lastKnownRole
        });
        lastKnownToken = currentToken;
        lastKnownRole = currentRole;
        checkAuth();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
      clearInterval(interval);
    };
  }, [checkAuth]);

  const hasRole = useCallback((requiredRole) => {
    return authState.role === requiredRole;
  }, [authState.role]);

  const isAgentOrAdmin = useCallback(() => {
    return authState.role === 'AGENT' || authState.role === 'ADMIN';
  }, [authState.role]);

  const isAdmin = useCallback(() => {
    return authState.role === 'ADMIN';
  }, [authState.role]);

  const isAgent = useCallback(() => {
    return authState.role === 'AGENT';
  }, [authState.role]);

  const isClient = useCallback(() => {
    return authState.role === 'CLIENT';
  }, [authState.role]);

  return {
    ...authState,
    hasRole,
    isAgentOrAdmin,
    isAdmin,
    isAgent,
    isClient,
    refreshAuth: checkAuth
  };
};
