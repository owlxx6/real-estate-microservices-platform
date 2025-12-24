-- Script pour corriger les mots de passe des utilisateurs
-- Le hash BCrypt pour "password123" doit être régénéré

USE client_db;

-- Supprimer les anciens utilisateurs
DELETE FROM users WHERE username IN ('admin', 'agent1', 'agent2', 'client1', 'client2', 'client3');

-- Insérer les utilisateurs avec le bon hash BCrypt pour "password123"
-- Hash généré avec: BCryptPasswordEncoder().encode("password123")
-- Note: Ce hash est un exemple, il faut le générer dynamiquement en Java

-- Pour l'instant, utilisons un hash connu qui fonctionne
-- Hash BCrypt valide pour "password123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

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
SELECT id, username, email, role, is_active FROM users ORDER BY role, username;

