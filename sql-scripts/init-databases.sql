-- Real Estate Platform Database Initialization Script
-- This script creates the required databases for all microservices

-- Create Property Database
CREATE DATABASE IF NOT EXISTS property_db;

-- Create Client Database  
CREATE DATABASE IF NOT EXISTS client_db;

-- Show created databases
SHOW DATABASES LIKE '%_db';

-- Grant permissions (adjust username/password as needed)
-- GRANT ALL PRIVILEGES ON property_db.* TO 'root'@'localhost';
-- GRANT ALL PRIVILEGES ON client_db.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Databases created successfully!' AS status;

