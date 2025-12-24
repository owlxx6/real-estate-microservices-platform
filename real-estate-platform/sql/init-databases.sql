-- Create databases for Real Estate Platform
CREATE DATABASE IF NOT EXISTS property_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS client_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON property_db.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON client_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

SELECT 'Databases created successfully!' as Status;
SHOW DATABASES LIKE '%_db';
