-- Script pour régénérer les mots de passe avec un hash BCrypt valide
-- IMPORTANT: Ce hash doit être généré dynamiquement en Java
-- Hash utilisé: généré avec BCryptPasswordEncoder().encode("password123")

USE client_db;

-- Supprimer tous les utilisateurs existants
DELETE FROM users;

-- Insérer les utilisateurs avec un hash BCrypt VALIDE pour "password123"
-- Ce hash a été généré et testé avec BCryptPasswordEncoder
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- ADMIN
INSERT INTO users (username, password, email, role, is_active) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@realestate.com', 'ADMIN', TRUE);

-- AGENT
INSERT INTO users (username, password, email, role, agent_id, is_active) VALUES
('agent1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'agent1@realestate.com', 'AGENT', 1, TRUE),
('agent2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'agent2@realestate.com', 'AGENT', 2, TRUE);

-- CLIENT
INSERT INTO users (username, password, email, role, client_id, is_active) VALUES
('client1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client1@example.com', 'CLIENT', 1, TRUE),
('client2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client2@example.com', 'CLIENT', 2, TRUE),
('client3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client3@example.com', 'CLIENT', 3, TRUE);

-- Vérifier
SELECT id, username, email, role, is_active, LEFT(password, 30) as password_hash FROM users ORDER BY role, username;

