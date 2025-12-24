/**
 * Constantes des rôles de l'application
 * Source de vérité unique pour les rôles
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  CLIENT: 'CLIENT'
};

/**
 * Vérifie si un rôle a accès à une liste de rôles autorisés
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string[]} allowedRoles - Liste des rôles autorisés
 * @returns {boolean}
 */
export const hasAccess = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) {
    return false;
  }
  return allowedRoles.includes(userRole);
};

/**
 * Vérifie si l'utilisateur est ADMIN ou AGENT
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {boolean}
 */
export const isAgentOrAdmin = (userRole) => {
  return userRole === ROLES.ADMIN || userRole === ROLES.AGENT;
};

