-- Sample Data for Real Estate Platform
-- Run this after starting all services (JPA will create tables)

USE client_db;

-- Insert sample agents
INSERT INTO agents (first_name, last_name, email, phone, specialization) VALUES
('John', 'Smith', 'john.smith@realestate.com', '+1234567890', 'Luxury Properties'),
('Sarah', 'Johnson', 'sarah.johnson@realestate.com', '+1234567891', 'Commercial Real Estate'),
('Michael', 'Brown', 'michael.brown@realestate.com', '+1234567892', 'Residential Properties'),
('Emma', 'Davis', 'emma.davis@realestate.com', '+1234567893', 'Investment Properties'),
('David', 'Wilson', 'david.wilson@realestate.com', '+1234567894', 'Land Development');

-- Insert sample clients
INSERT INTO clients (first_name, last_name, email, phone, type) VALUES
('Alice', 'Anderson', 'alice.anderson@email.com', '+1234567895', 'BUYER'),
('Bob', 'Martinez', 'bob.martinez@email.com', '+1234567896', 'SELLER'),
('Carol', 'Taylor', 'carol.taylor@email.com', '+1234567897', 'RENTER'),
('Daniel', 'Thomas', 'daniel.thomas@email.com', '+1234567898', 'LANDLORD'),
('Eva', 'Garcia', 'eva.garcia@email.com', '+1234567899', 'BUYER');

USE property_db;

-- Insert sample properties
INSERT INTO properties (title, description, type, price, surface, rooms, bathrooms, address, city, status, agent_id) VALUES
('Luxury Villa in Beverly Hills', 'Stunning 5-bedroom villa with pool, garden, and amazing views', 'VILLA', 2500000.00, 450, 5, 4, '123 Sunset Boulevard', 'Los Angeles', 'AVAILABLE', 1),
('Modern Downtown Apartment', 'Contemporary 2-bedroom apartment in the heart of downtown', 'APARTMENT', 450000.00, 95, 2, 2, '456 Main Street', 'New York', 'AVAILABLE', 1),
('Spacious Family House', 'Perfect family home with 4 bedrooms and large backyard', 'HOUSE', 650000.00, 220, 4, 3, '789 Oak Avenue', 'Chicago', 'AVAILABLE', 2),
('Commercial Office Space', 'Prime commercial space in business district', 'COMMERCIAL', 1200000.00, 300, 8, 3, '321 Business Park', 'San Francisco', 'AVAILABLE', 2),
('Investment Land Plot', 'Excellent investment opportunity, zoned for development', 'LAND', 350000.00, 2000, 0, 0, 'Highway 101', 'Austin', 'AVAILABLE', 5),
('Beachfront Condo', 'Beautiful oceanview condo with 3 bedrooms', 'APARTMENT', 850000.00, 150, 3, 2, '555 Beach Drive', 'Miami', 'RESERVED', 3),
('Suburban Family Home', 'Quiet neighborhood, 3 bedrooms, move-in ready', 'HOUSE', 425000.00, 180, 3, 2, '888 Maple Street', 'Seattle', 'AVAILABLE', 3),
('Luxury Penthouse', 'Top floor penthouse with panoramic city views', 'APARTMENT', 1850000.00, 250, 4, 3, '999 Skyline Tower', 'Boston', 'SOLD', 1),
('Mountain Retreat Villa', 'Exclusive mountain villa with ski access', 'VILLA', 1950000.00, 380, 4, 4, '777 Mountain Road', 'Denver', 'AVAILABLE', 4),
('Downtown Retail Space', 'High-traffic retail location, ready for business', 'COMMERCIAL', 750000.00, 200, 5, 2, '111 Shopping Plaza', 'Portland', 'AVAILABLE', 2);

USE client_db;

-- Insert sample visits (use property IDs from above)
INSERT INTO visits (property_id, client_id, visit_date, status, notes) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'SCHEDULED', 'Client interested in luxury properties'),
(2, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), 'COMPLETED', 'Client liked the location but found it small'),
(3, 5, DATE_ADD(NOW(), INTERVAL 5 DAY), 'SCHEDULED', 'Family looking for schools nearby'),
(4, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 'COMPLETED', 'Potential investor, requested financial details'),
(6, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), 'SCHEDULED', 'Interested in beachfront properties'),
(7, 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'COMPLETED', 'Client wants to schedule second visit'),
(9, 5, DATE_ADD(NOW(), INTERVAL 10 DAY), 'SCHEDULED', 'Looking for vacation home'),
(1, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), 'CANCELLED', 'Client decided on different property'),
(10, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', 'Business owner looking for retail space'),
(5, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), 'COMPLETED', 'Investment opportunity discussion');

