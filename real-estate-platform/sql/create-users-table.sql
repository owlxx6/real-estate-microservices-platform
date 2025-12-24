-- ============================================
-- Script de création des utilisateurs de test
-- ============================================
-- Ce script crée des comptes de test pour chaque rôle
-- Tous les mots de passe: password123
-- ============================================

USE client_db;

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'AGENT', 'CLIENT') NOT NULL,
    agent_id BIGINT NULL,
    client_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMPTES DE TEST PAR RÔLE
-- ============================================
-- Password pour tous: password123
-- Hash BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================

-- ADMIN - Accès total
INSERT IGNORE INTO users (username, password, email, role, is_active) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@realestate.com', 'ADMIN', TRUE);

-- AGENT - Gestion biens/ventes/locations (pas de gestion utilisateurs)
INSERT IGNORE INTO users (username, password, email, role, agent_id, is_active) VALUES
('agent1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'agent1@realestate.com', 'AGENT', 1, TRUE),
('agent2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'agent2@realestate.com', 'AGENT', 2, TRUE);

-- CLIENT - Consultation et ses propres réservations uniquement
INSERT IGNORE INTO users (username, password, email, role, client_id, is_active) VALUES
('client1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client1@example.com', 'CLIENT', 1, TRUE),
('client2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client2@example.com', 'CLIENT', 2, TRUE),
('client3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client3@example.com', 'CLIENT', 3, TRUE);

-- ============================================
-- RÉSUMÉ DES COMPTES DE TEST
-- ============================================
-- ADMIN:
--   Username: admin
--   Password: password123
--   Permissions: Accès total
--
-- AGENT:
--   Username: agent1 ou agent2
--   Password: password123
--   Permissions: Gestion biens/ventes/locations (pas utilisateurs)
--
-- CLIENT:
--   Username: client1, client2 ou client3
--   Password: password123
--   Permissions: Consultation + ses propres réservations
-- ============================================

-- Afficher les utilisateurs créés
SELECT id, username, email, role, is_active, created_at 
FROM users 
ORDER BY role, username;

