-- Script complet pour initialiser le module de location avec données de test
-- Exécute init-rental-db.sql ET rental-sample-data.sql

-- ============================================
-- PARTIE 1: CRÉATION DE LA BASE ET TABLES
-- ============================================

CREATE DATABASE IF NOT EXISTS rental_db;
USE rental_db;

-- Table des biens louables
CREATE TABLE IF NOT EXISTS rental_properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    max_guests INT NOT NULL,
    rules TEXT,
    check_in_time VARCHAR(5) DEFAULT '15:00',
    check_out_time VARCHAR(5) DEFAULT '11:00',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_property_id (property_id),
    INDEX idx_is_active (is_active)
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rental_property_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_guests INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rental_property_id) REFERENCES rental_properties(id),
    INDEX idx_rental_property (rental_property_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status),
    INDEX idx_guest_email (guest_email)
);

SELECT '✅ Tables créées avec succès' as status;

-- ============================================
-- PARTIE 2: INSERTION DES DONNÉES DE TEST
-- ============================================

-- Nettoyer les données existantes
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE bookings;
TRUNCATE TABLE rental_properties;
SET FOREIGN_KEY_CHECKS = 1;

-- Insérer les biens en location
INSERT INTO rental_properties (
    property_id, price_per_night, cleaning_fee, max_guests, rules, 
    check_in_time, check_out_time, is_active, created_at, updated_at
) VALUES 
(1, 150.00, 50.00, 4, 'No smoking\nNo pets\nQuiet hours: 22:00-08:00\nMaximum 4 guests', 
 '15:00', '11:00', TRUE, NOW(), NOW()),
(2, 200.00, 75.00, 6, 'No smoking\nPets allowed (small dogs)\nQuiet hours: 23:00-07:00\nMaximum 6 guests', 
 '16:00', '10:00', TRUE, NOW(), NOW()),
(3, 80.00, 30.00, 2, 'No smoking\nNo pets\nPerfect for couples\nMinimum stay: 2 nights', 
 '14:00', '11:00', TRUE, NOW(), NOW()),
(4, 300.00, 100.00, 8, 'No smoking inside\nPets allowed\nPool access 08:00-22:00\nMaximum 8 guests', 
 '15:00', '10:00', TRUE, NOW(), NOW()),
(5, 250.00, 80.00, 5, 'No smoking\nNo pets\nBreathtaking sea view\nRooftop terrace access', 
 '15:00', '11:00', TRUE, NOW(), NOW());

SELECT '✅ Biens en location créés' as status;

-- Insérer les réservations
INSERT INTO bookings (
    rental_property_id, start_date, end_date, number_of_guests, total_price, status,
    guest_name, guest_email, guest_phone, special_requests, created_at, updated_at
) VALUES 
-- CONFIRMED - En cours
(1, '2024-12-20', '2024-12-27', 2, 1100.00, 'CONFIRMED',
 'John Smith', 'john.smith@example.com', '+33612345678', 'Late check-in around 20:00',
 '2024-12-01 10:30:00', '2024-12-01 11:00:00'),

-- CONFIRMED - Future
(2, '2025-01-15', '2025-01-22', 4, 1475.00, 'CONFIRMED',
 'Marie Dubois', 'marie.dubois@example.com', '+33687654321', 'Bringing a small dog',
 '2024-12-10 14:20:00', '2024-12-11 09:00:00'),

-- PENDING
(3, '2025-02-01', '2025-02-05', 2, 350.00, 'PENDING',
 'Pierre Martin', 'pierre.martin@example.com', '+33698765432', 'Honeymoon trip',
 '2024-12-15 16:45:00', '2024-12-15 16:45:00'),

(1, '2025-02-10', '2025-02-15', 3, 800.00, 'PENDING',
 'Sophie Laurent', 'sophie.laurent@example.com', '+33676543210', NULL,
 '2024-12-18 11:00:00', '2024-12-18 11:00:00'),

-- CONFIRMED - Villa
(4, '2025-03-01', '2025-03-08', 6, 2200.00, 'CONFIRMED',
 'David Johnson', 'david.johnson@example.com', '+447123456789', 'Family vacation',
 '2024-12-05 09:15:00', '2024-12-06 14:30:00'),

-- COMPLETED
(5, '2024-11-10', '2024-11-17', 2, 1830.00, 'COMPLETED',
 'Emma Wilson', 'emma.wilson@example.com', '+447987654321', 'Anniversary',
 '2024-10-20 13:45:00', '2024-11-17 12:00:00'),

-- CANCELLED
(2, '2024-12-25', '2025-01-02', 5, 1675.00, 'CANCELLED',
 'Lucas Garcia', 'lucas.garcia@example.com', '+34612345678', 'Christmas holidays',
 '2024-11-15 10:00:00', '2024-11-20 08:30:00'),

-- CONFIRMED - Penthouse
(5, '2025-01-25', '2025-02-01', 4, 1830.00, 'CONFIRMED',
 'Anna Müller', 'anna.muller@example.com', '+4915123456789', 'Need good WiFi',
 '2024-12-12 15:20:00', '2024-12-13 10:00:00'),

-- PENDING - Weekend
(3, '2025-01-20', '2025-01-22', 2, 190.00, 'PENDING',
 'Jean Dupont', 'jean.dupont@example.com', '+33601234567', 'Weekend getaway',
 '2024-12-19 18:00:00', '2024-12-19 18:00:00'),

-- COMPLETED - Villa
(4, '2024-10-15', '2024-10-20', 8, 1600.00, 'COMPLETED',
 'Robert Brown', 'robert.brown@example.com', '+447765432109', 'Birthday party',
 '2024-09-25 12:00:00', '2024-10-20 11:00:00');

SELECT '✅ Réservations créées' as status;

-- ============================================
-- PARTIE 3: VÉRIFICATION ET STATISTIQUES
-- ============================================

SELECT '\n=======================' as '';
SELECT '📊 STATISTIQUES' as '';
SELECT '=======================' as '';

SELECT CONCAT('✅ Locations actives: ', COUNT(*)) as info 
FROM rental_properties WHERE is_active = TRUE;

SELECT CONCAT('✅ Total réservations: ', COUNT(*)) as info 
FROM bookings;

SELECT CONCAT('⏳ En attente: ', COUNT(*)) as info 
FROM bookings WHERE status = 'PENDING';

SELECT CONCAT('✓ Confirmées: ', COUNT(*)) as info 
FROM bookings WHERE status = 'CONFIRMED';

SELECT CONCAT('✔ Terminées: ', COUNT(*)) as info 
FROM bookings WHERE status = 'COMPLETED';

SELECT CONCAT('✖ Annulées: ', COUNT(*)) as info 
FROM bookings WHERE status = 'CANCELLED';

SELECT '\n=======================' as '';
SELECT '🎉 DONNÉES CHARGÉES!' as '';
SELECT '=======================' as '';

