-- Script d'initialisation de la base de données rental_db

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

-- Données d'exemple (optionnel)
-- INSERT INTO rental_properties (property_id, price_per_night, cleaning_fee, max_guests, rules, is_active)
-- VALUES
-- (1, 150.00, 50.00, 4, 'No smoking\nNo pets\nCheck-in after 15:00\nCheck-out before 11:00', TRUE),
-- (2, 200.00, 75.00, 6, 'No smoking\nPets allowed\nQuiet hours: 22:00-08:00', TRUE),
-- (3, 100.00, 40.00, 2, 'No smoking\nNo parties\nRespect neighbors', TRUE);

