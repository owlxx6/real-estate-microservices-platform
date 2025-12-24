-- Sample Data for Real Estate Platform (Sale and Rental)

USE client_db;

-- Insert sample agents
INSERT INTO agents (first_name, last_name, email, phone, specialization, license_number, years_experience, rating, created_at) VALUES
('John', 'Smith', 'john.smith@realestate.com', '+1234567890', 'Luxury Properties', 'RE-001', 10, 4.8, NOW()),
('Sarah', 'Johnson', 'sarah.johnson@realestate.com', '+1234567891', 'Commercial Real Estate', 'RE-002', 8, 4.6, NOW()),
('Michael', 'Brown', 'michael.brown@realestate.com', '+1234567892', 'Residential Properties', 'RE-003', 12, 4.9, NOW()),
('Emma', 'Davis', 'emma.davis@realestate.com', '+1234567893', 'Rental Properties', 'RE-004', 6, 4.7, NOW()),
('David', 'Wilson', 'david.wilson@realestate.com', '+1234567894', 'Investment Properties', 'RE-005', 15, 4.9, NOW());

-- Insert sample clients
INSERT INTO clients (first_name, last_name, email, phone, type, notes, created_at) VALUES
('Alice', 'Anderson', 'alice.anderson@email.com', '+1234567895', 'BUYER', 'Looking for luxury villa', NOW()),
('Bob', 'Martinez', 'bob.martinez@email.com', '+1234567896', 'SELLER', 'Selling apartment in downtown', NOW()),
('Carol', 'Taylor', 'carol.taylor@email.com', '+1234567897', 'RENTER', 'Looking for 2-bedroom apartment', NOW()),
('Daniel', 'Thomas', 'daniel.thomas@email.com', '+1234567898', 'LANDLORD', 'Has multiple properties for rent', NOW()),
('Eva', 'Garcia', 'eva.garcia@email.com', '+1234567899', 'INVESTOR', 'Looking for investment opportunities', NOW());

USE property_db;

-- Insert sample properties (mix of SALE and RENTAL)
INSERT INTO properties (title, description, type, transaction_type, price, monthly_rent, deposit_amount, rental_duration, surface, rooms, bathrooms, address, city, postal_code, status, agent_id, has_parking, has_garden, has_pool, has_elevator, floor_number, total_floors, year_built, created_at) VALUES
-- Properties for SALE
('Luxury Villa in Beverly Hills', 'Stunning 5-bedroom villa with pool, garden, and amazing views', 'VILLA', 'SALE', 2500000.00, NULL, NULL, NULL, 450, 5, 4, '123 Sunset Boulevard', 'Los Angeles', '90210', 'AVAILABLE', 1, TRUE, TRUE, TRUE, FALSE, NULL, NULL, 2018, NOW()),
('Modern Downtown Apartment', 'Contemporary 2-bedroom apartment in the heart of downtown', 'APARTMENT', 'SALE', 450000.00, NULL, NULL, NULL, 95, 2, 2, '456 Main Street', 'New York', '10001', 'AVAILABLE', 1, TRUE, FALSE, FALSE, TRUE, 15, 20, 2020, NOW()),
('Spacious Family House', 'Perfect family home with 4 bedrooms and large backyard', 'HOUSE', 'SALE', 650000.00, NULL, NULL, NULL, 220, 4, 3, '789 Oak Avenue', 'Chicago', '60601', 'AVAILABLE', 2, TRUE, TRUE, FALSE, FALSE, NULL, NULL, 2015, NOW()),
('Commercial Office Space', 'Prime commercial space in business district', 'COMMERCIAL', 'SALE', 1200000.00, NULL, NULL, NULL, 300, 8, 3, '321 Business Park', 'San Francisco', '94102', 'AVAILABLE', 2, TRUE, FALSE, FALSE, TRUE, 5, 10, 2019, NOW()),
('Investment Land Plot', 'Excellent investment opportunity, zoned for development', 'LAND', 'SALE', 350000.00, NULL, NULL, NULL, 2000, 0, 0, 'Highway 101', 'Austin', '78701', 'AVAILABLE', 5, FALSE, FALSE, FALSE, FALSE, NULL, NULL, NULL, NOW()),

-- Properties for RENTAL
('Beachfront Condo for Rent', 'Beautiful oceanview condo with 3 bedrooms, monthly rental', 'APARTMENT', 'RENTAL', 850000.00, 3500.00, 7000.00, 12, 150, 3, 2, '555 Beach Drive', 'Miami', '33101', 'AVAILABLE', 3, TRUE, FALSE, TRUE, TRUE, 10, 15, 2021, NOW()),
('Suburban Family Home Rental', 'Quiet neighborhood, 3 bedrooms, available for long-term rent', 'HOUSE', 'RENTAL', 425000.00, 2200.00, 4400.00, NULL, 180, 3, 2, '888 Maple Street', 'Seattle', '98101', 'AVAILABLE', 3, TRUE, TRUE, FALSE, FALSE, NULL, NULL, 2017, NOW()),
('Downtown Studio for Rent', 'Cozy studio in city center, perfect for young professionals', 'STUDIO', 'RENTAL', 200000.00, 1500.00, 3000.00, 6, 45, 1, 1, '222 Urban Street', 'Portland', '97201', 'AVAILABLE', 4, FALSE, FALSE, FALSE, TRUE, 8, 12, 2022, NOW()),
('Luxury Penthouse', 'Top floor penthouse with panoramic city views - FOR SALE', 'PENTHOUSE', 'SALE', 1850000.00, NULL, NULL, NULL, 250, 4, 3, '999 Skyline Tower', 'Boston', '02101', 'SOLD', 1, TRUE, FALSE, FALSE, TRUE, 25, 25, 2023, NOW()),
('Mountain Retreat Villa', 'Exclusive mountain villa with ski access', 'VILLA', 'SALE', 1950000.00, NULL, NULL, NULL, 380, 4, 4, '777 Mountain Road', 'Denver', '80201', 'AVAILABLE', 5, TRUE, TRUE, TRUE, FALSE, NULL, NULL, 2016, NOW()),

-- More rental properties
('City Center Office Rental', 'Modern office space for rent, flexible terms', 'OFFICE', 'RENTAL', 600000.00, 5000.00, 10000.00, 24, 200, 6, 2, '111 Business Avenue', 'San Diego', '92101', 'AVAILABLE', 2, TRUE, FALSE, FALSE, TRUE, 3, 8, 2020, NOW()),
('Cozy Duplex for Rent', 'Two-story duplex, perfect for families', 'DUPLEX', 'RENTAL', 380000.00, 1800.00, 3600.00, NULL, 140, 3, 2, '444 Family Lane', 'Phoenix', '85001', 'RESERVED', 4, TRUE, TRUE, FALSE, FALSE, NULL, NULL, 2019, NOW());

USE client_db;

-- Insert sample visits
INSERT INTO visits (property_id, client_id, agent_id, visit_date, status, notes, feedback, rating, created_at) VALUES
(1, 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'SCHEDULED', 'Client interested in luxury properties', NULL, NULL, NOW()),
(2, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), 'COMPLETED', 'Client liked the location but found it small', 'Good location, but too small for family', 4, NOW()),
(3, 5, 2, DATE_ADD(NOW(), INTERVAL 5 DAY), 'SCHEDULED', 'Family looking for schools nearby', NULL, NULL, NOW()),
(6, 3, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), 'CONFIRMED', 'Interested in beachfront rental', NULL, NULL, NOW()),
(7, 3, 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'COMPLETED', 'Client wants to rent long-term', 'Perfect for family', 5, NOW()),
(8, 3, 4, DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', 'Looking for studio rental', NULL, NULL, NOW()),
(10, 5, 5, DATE_ADD(NOW(), INTERVAL 7 DAY), 'SCHEDULED', 'Investment property viewing', NULL, NULL, NOW()),
(11, 2, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), 'COMPLETED', 'Office space for business', 'Good for startup', 4, NOW()),
(12, 4, 4, DATE_ADD(NOW(), INTERVAL 4 DAY), 'SCHEDULED', 'Duplex rental inquiry', NULL, NULL, NOW()),
(4, 5, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 'COMPLETED', 'Commercial property for investment', 'Excellent location', 5, NOW());

-- Display summary
SELECT 'Sample data loaded successfully!' as Status;
SELECT COUNT(*) as 'Total Properties' FROM property_db.properties;
SELECT COUNT(*) as 'Properties for Sale' FROM property_db.properties WHERE transaction_type = 'SALE';
SELECT COUNT(*) as 'Properties for Rent' FROM property_db.properties WHERE transaction_type = 'RENTAL';
SELECT COUNT(*) as 'Total Agents' FROM client_db.agents;
SELECT COUNT(*) as 'Total Clients' FROM client_db.clients;
SELECT COUNT(*) as 'Total Visits' FROM client_db.visits;

