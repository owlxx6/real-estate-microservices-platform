-- Create databases for the Real Estate Platform
CREATE DATABASE IF NOT EXISTS property_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS client_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges (adjust username/password as needed)
GRANT ALL PRIVILEGES ON property_db.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON client_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

USE property_db;

-- The tables will be auto-created by JPA (spring.jpa.hibernate.ddl-auto=update)
-- But here are the schemas for reference:

/*
CREATE TABLE properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    type VARCHAR(20) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    surface INT NOT NULL,
    rooms INT NOT NULL,
    bathrooms INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    agent_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_agent (agent_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
*/

USE client_db;

/*
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_type (type)
) ENGINE=InnoDB;

CREATE TABLE agents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_specialization (specialization)
) ENGINE=InnoDB;

CREATE TABLE visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    visit_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_property (property_id),
    INDEX idx_client (client_id),
    INDEX idx_status (status),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB;
*/

