-- Script de données de test pour le module de location
-- À exécuter après init-rental-db.sql

USE rental_db;

-- Supprimer les données existantes (pour réinitialisation)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE bookings;
TRUNCATE TABLE rental_properties;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RENTAL PROPERTIES - Biens activés pour location
-- ============================================
-- Note: Ces propertyId doivent correspondre aux IDs existants dans property_db

INSERT INTO rental_properties (
    property_id, 
    price_per_night, 
    cleaning_fee, 
    max_guests, 
    rules, 
    check_in_time, 
    check_out_time, 
    is_active, 
    created_at, 
    updated_at
) VALUES 
-- Bien 1 - Appartement luxueux
(1, 150.00, 50.00, 4, 
'No smoking
No pets allowed
Quiet hours: 22:00-08:00
Maximum 4 guests
No parties or events', 
'15:00', '11:00', TRUE, NOW(), NOW()),

-- Bien 2 - Grande maison familiale
(2, 200.00, 75.00, 6, 
'No smoking
Pets allowed (small dogs only)
Quiet hours: 23:00-07:00
Maximum 6 guests
Please respect neighbors', 
'16:00', '10:00', TRUE, NOW(), NOW()),

-- Bien 3 - Studio confortable
(3, 80.00, 30.00, 2, 
'No smoking
No pets
Perfect for couples
Minimum stay: 2 nights', 
'14:00', '11:00', TRUE, NOW(), NOW()),

-- Bien 4 - Villa avec piscine
(4, 300.00, 100.00, 8, 
'No smoking inside
Pets allowed
Pool access 08:00-22:00
Maximum 8 guests
Garden maintenance on Mondays', 
'15:00', '10:00', TRUE, NOW(), NOW()),

-- Bien 5 - Penthouse vue mer
(5, 250.00, 80.00, 5, 
'No smoking
No pets
Breathtaking sea view
Rooftop terrace access
Quiet hours: 22:00-08:00', 
'15:00', '11:00', TRUE, NOW(), NOW());

-- ============================================
-- BOOKINGS - Réservations de test
-- ============================================

INSERT INTO bookings (
    rental_property_id,
    start_date,
    end_date,
    number_of_guests,
    total_price,
    status,
    guest_name,
    guest_email,
    guest_phone,
    special_requests,
    created_at,
    updated_at
) VALUES 
-- Réservation CONFIRMED - En cours
(1, '2024-12-20', '2024-12-27', 2, 1100.00, 'CONFIRMED',
'John Smith', 'john.smith@example.com', '+33612345678',
'Late check-in around 20:00',
'2024-12-01 10:30:00', '2024-12-01 11:00:00'),

-- Réservation CONFIRMED - Future
(2, '2025-01-15', '2025-01-22', 4, 1475.00, 'CONFIRMED',
'Marie Dubois', 'marie.dubois@example.com', '+33687654321',
'Bringing a small dog, need parking',
'2024-12-10 14:20:00', '2024-12-11 09:00:00'),

-- Réservation PENDING - En attente de confirmation
(3, '2025-02-01', '2025-02-05', 2, 350.00, 'PENDING',
'Pierre Martin', 'pierre.martin@example.com', '+33698765432',
'Honeymoon trip',
'2024-12-15 16:45:00', '2024-12-15 16:45:00'),

-- Réservation PENDING - Autre
(1, '2025-02-10', '2025-02-15', 3, 800.00, 'PENDING',
'Sophie Laurent', 'sophie.laurent@example.com', '+33676543210',
NULL,
'2024-12-18 11:00:00', '2024-12-18 11:00:00'),

-- Réservation CONFIRMED - Future (villa)
(4, '2025-03-01', '2025-03-08', 6, 2200.00, 'CONFIRMED',
'David Johnson', 'david.johnson@example.com', '+447123456789',
'Family vacation, need high chairs for kids',
'2024-12-05 09:15:00', '2024-12-06 14:30:00'),

-- Réservation COMPLETED - Passée
(5, '2024-11-10', '2024-11-17', 2, 1830.00, 'COMPLETED',
'Emma Wilson', 'emma.wilson@example.com', '+447987654321',
'Anniversary celebration',
'2024-10-20 13:45:00', '2024-11-17 12:00:00'),

-- Réservation CANCELLED - Annulée
(2, '2024-12-25', '2025-01-02', 5, 1675.00, 'CANCELLED',
'Lucas Garcia', 'lucas.garcia@example.com', '+34612345678',
'Christmas holidays',
'2024-11-15 10:00:00', '2024-11-20 08:30:00'),

-- Réservation CONFIRMED - Future (penthouse)
(5, '2025-01-25', '2025-02-01', 4, 1830.00, 'CONFIRMED',
'Anna Müller', 'anna.muller@example.com', '+4915123456789',
'Working remotely, need good WiFi',
'2024-12-12 15:20:00', '2024-12-13 10:00:00'),

-- Réservation PENDING - Weekend court
(3, '2025-01-20', '2025-01-22', 2, 190.00, 'PENDING',
'Jean Dupont', 'jean.dupont@example.com', '+33601234567',
'Weekend getaway',
'2024-12-19 18:00:00', '2024-12-19 18:00:00'),

-- Réservation COMPLETED - Passée (villa)
(4, '2024-10-15', '2024-10-20', 8, 1600.00, 'COMPLETED',
'Robert Brown', 'robert.brown@example.com', '+447765432109',
'Birthday party weekend',
'2024-09-25 12:00:00', '2024-10-20 11:00:00');

-- ============================================
-- VÉRIFICATION DES DONNÉES
-- ============================================

-- Compter les locations actives
SELECT 
    'Active Rentals' as metric,
    COUNT(*) as count
FROM rental_properties 
WHERE is_active = TRUE;

-- Compter les réservations par statut
SELECT 
    status,
    COUNT(*) as count
FROM bookings 
GROUP BY status
ORDER BY 
    FIELD(status, 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- Afficher un résumé
SELECT 
    rp.id as rental_id,
    rp.property_id,
    rp.price_per_night,
    rp.max_guests,
    rp.is_active,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_bookings,
    SUM(CASE WHEN b.status = 'PENDING' THEN 1 ELSE 0 END) as pending_bookings
FROM rental_properties rp
LEFT JOIN bookings b ON rp.id = b.rental_property_id
GROUP BY rp.id
ORDER BY rp.id;

-- Afficher les réservations à venir
SELECT 
    b.id,
    b.rental_property_id,
    b.guest_name,
    b.start_date,
    b.end_date,
    b.status,
    b.total_price
FROM bookings b
WHERE b.start_date >= CURDATE()
ORDER BY b.start_date;

-- ============================================
-- STATISTIQUES FINALES
-- ============================================

SELECT '=== DONNÉES CHARGÉES AVEC SUCCÈS ===' as message;
SELECT CONCAT('Locations actives: ', COUNT(*)) as info FROM rental_properties WHERE is_active = TRUE;
SELECT CONCAT('Total réservations: ', COUNT(*)) as info FROM bookings;
SELECT CONCAT('Réservations confirmées: ', COUNT(*)) as info FROM bookings WHERE status = 'CONFIRMED';
SELECT CONCAT('Réservations en attente: ', COUNT(*)) as info FROM bookings WHERE status = 'PENDING';

