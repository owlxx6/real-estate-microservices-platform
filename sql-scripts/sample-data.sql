-- Sample Data for Real Estate Platform
-- Run this after starting all services (they will create tables via Hibernate)

-- Use Client Database
USE client_db;

-- Insert Sample Agents
INSERT INTO agents (first_name, last_name, email, phone, specialization, created_at) VALUES
('John', 'Smith', 'john.smith@realestate.com', '+12025551001', 'Residential Properties', NOW()),
('Sarah', 'Johnson', 'sarah.johnson@realestate.com', '+12025551002', 'Commercial Properties', NOW()),
('Michael', 'Williams', 'michael.williams@realestate.com', '+12025551003', 'Luxury Villas', NOW()),
('Emily', 'Brown', 'emily.brown@realestate.com', '+12025551004', 'Apartments', NOW()),
('David', 'Jones', 'david.jones@realestate.com', '+12025551005', 'Land and Development', NOW());

-- Insert Sample Clients
INSERT INTO clients (first_name, last_name, email, phone, type, created_at) VALUES
('Alice', 'Anderson', 'alice.anderson@email.com', '+12025552001', 'BUYER', NOW()),
('Bob', 'Baker', 'bob.baker@email.com', '+12025552002', 'SELLER', NOW()),
('Carol', 'Clark', 'carol.clark@email.com', '+12025552003', 'RENTER', NOW()),
('Daniel', 'Davis', 'daniel.davis@email.com', '+12025552004', 'LANDLORD', NOW()),
('Eve', 'Evans', 'eve.evans@email.com', '+12025552005', 'BUYER', NOW());

-- Use Property Database
USE property_db;

-- Insert Sample Properties
INSERT INTO properties (title, description, type, price, surface, rooms, bathrooms, address, city, status, agent_id, created_at, updated_at) VALUES
('Modern Downtown Apartment', 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views', 'APARTMENT', 350000.00, 85, 2, 2, '123 Main Street, Unit 405', 'New York', 'AVAILABLE', 4, NOW(), NOW()),
('Luxury Beach Villa', 'Spectacular oceanfront villa with private beach access and infinity pool', 'VILLA', 2500000.00, 450, 6, 5, '456 Ocean Drive', 'Miami', 'AVAILABLE', 3, NOW(), NOW()),
('Family Suburban House', 'Spacious family home with large backyard in quiet neighborhood', 'HOUSE', 550000.00, 220, 4, 3, '789 Oak Avenue', 'Los Angeles', 'AVAILABLE', 1, NOW(), NOW()),
('Commercial Office Space', 'Prime commercial property in business district, ideal for corporate offices', 'COMMERCIAL', 1200000.00, 500, 10, 4, '321 Business Boulevard', 'Chicago', 'AVAILABLE', 2, NOW(), NOW()),
('Development Land Plot', 'Large plot of land approved for residential development', 'LAND', 800000.00, 5000, 0, 0, 'Highway 101, Plot 23', 'San Francisco', 'AVAILABLE', 5, NOW(), NOW()),
('Cozy Studio Apartment', 'Perfect starter home for young professionals', 'APARTMENT', 180000.00, 45, 1, 1, '555 Park Lane, Unit 102', 'Boston', 'AVAILABLE', 4, NOW(), NOW()),
('Mountain View House', 'Stunning mountain views with modern amenities', 'HOUSE', 675000.00, 280, 5, 4, '888 Mountain Road', 'Denver', 'RESERVED', 1, NOW(), NOW()),
('Penthouse Suite', 'Exclusive penthouse with panoramic city views', 'APARTMENT', 1500000.00, 320, 4, 3, '777 Skyline Tower', 'Seattle', 'AVAILABLE', 3, NOW(), NOW()),
('Renovated Colonial House', 'Historic colonial house fully renovated with modern features', 'HOUSE', 725000.00, 310, 5, 3, '234 Heritage Street', 'Philadelphia', 'SOLD', 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
('Retail Space Downtown', 'High-traffic retail location in shopping district', 'COMMERCIAL', 950000.00, 200, 3, 2, '999 Shopping Plaza', 'Austin', 'AVAILABLE', 2, NOW(), NOW());

-- Use Client Database for Visits
USE client_db;

-- Insert Sample Visits
INSERT INTO visits (property_id, client_id, visit_date, status, notes, created_at) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'SCHEDULED', 'Client interested in downtown location', NOW()),
(2, 5, DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', 'Luxury buyer, very interested', NOW()),
(3, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'COMPLETED', 'Client liked the property but concerned about distance', NOW()),
(6, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), 'SCHEDULED', 'Looking for rental options', NOW()),
(8, 5, DATE_SUB(NOW(), INTERVAL 10 DAY), 'COMPLETED', 'Client impressed with penthouse', NOW()),
(7, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'CANCELLED', 'Client found another property', NOW()),
(4, 4, DATE_ADD(NOW(), INTERVAL 5 DAY), 'SCHEDULED', 'Potential office relocation', NOW()),
(10, 3, DATE_SUB(NOW(), INTERVAL 8 DAY), 'COMPLETED', 'Retail space tour completed', NOW());

SELECT 'Sample data inserted successfully!' AS status;

