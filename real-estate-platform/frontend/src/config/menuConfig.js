import { ROLES } from './roles';

/**
 * Configuration centralisée du menu de navigation
 * Chaque élément définit :
 * - label: Texte affiché dans le menu
 * - path: Route React Router
 * - icon: (optionnel) Emoji ou icône
 * - allowedRoles: Liste des rôles autorisés à voir ce lien
 * - separator: (optionnel) Afficher un séparateur avant cet élément
 */
export const menuItems = [
  // Navigation publique - Accessible à tous les utilisateurs authentifiés
  {
    label: 'All Properties',
    path: '/property-search',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT, ROLES.CLIENT],
    separator: false
  },
  {
    label: 'For Sale',
    path: '/properties/for-sale',
    icon: '🏡',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT, ROLES.CLIENT],
    separator: false
  },
  {
    label: 'Rentals',
    path: '/rentals',
    icon: '🏠',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT, ROLES.CLIENT],
    separator: false
  },
  
  // CLIENT uniquement
  {
    label: 'My Bookings',
    path: '/my-bookings',
    allowedRoles: [ROLES.CLIENT],
    separator: false
  },
  {
    label: 'My Inquiries',
    path: '/my-inquiries',
    allowedRoles: [ROLES.CLIENT],
    separator: false
  },
  
  // AGENT et ADMIN - Gestion opérationnelle
  {
    label: 'Dashboard',
    path: '/dashboard',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT],
    separator: true
  },
  {
    label: 'My Contacts & Visits',
    path: '/my-contacts-visits',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT],
    separator: false
  },
  {
    label: 'Manage Sales',
    path: '/admin/sales',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT],
    separator: false
  },
  {
    label: 'Manage Rentals',
    path: '/admin/rentals',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT],
    separator: false
  },
  {
    label: 'Manage Bookings',
    path: '/admin/bookings',
    allowedRoles: [ROLES.ADMIN, ROLES.AGENT],
    separator: false
  },
  
  // ADMIN uniquement
  {
    label: 'Admin Panel',
    path: '/admin',
    allowedRoles: [ROLES.ADMIN],
    separator: true
  }
];

/**
 * Filtre les éléments du menu selon le rôle de l'utilisateur
 * @param {string} userRole - Rôle de l'utilisateur connecté
 * @returns {Array} Liste des éléments de menu autorisés
 */
export const getMenuItemsForRole = (userRole) => {
  if (!userRole) {
    return [];
  }
  
  return menuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );
};

/**
 * Groupe les éléments du menu par sections (pour affichage avec séparateurs)
 * @param {string} userRole - Rôle de l'utilisateur connecté
 * @returns {Array} Liste des sections de menu
 */
export const getMenuSections = (userRole) => {
  const items = getMenuItemsForRole(userRole);
  const sections = [];
  let currentSection = [];
  
  items.forEach((item, index) => {
    // Si l'élément demande un séparateur, créer une nouvelle section
    if (item.separator && currentSection.length > 0) {
      sections.push(currentSection);
      currentSection = [];
    }
    
    currentSection.push(item);
    
    // Si c'est le dernier élément, ajouter la section
    if (index === items.length - 1) {
      sections.push(currentSection);
    }
  });
  
  return sections;
};

