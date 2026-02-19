-- Sample data for testing
-- Note: Passwords are hashed with bcrypt (password: "password123")

-- Insert admin user
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$rKvVJKJ5xGZqJ5xGZqJ5xOqJ5xGZqJ5xGZqJ5xGZqJ5xGZqJ5xGZq', '01712345678', 'admin');

-- Insert customer users
INSERT INTO users (name, email, password, phone, role) VALUES
('John Doe', 'john@example.com', '$2b$10$rKvVJKJ5xGZqJ5xGZqJ5xOqJ5xGZqJ5xGZqJ5xGZqJ5xGZqJ5xGZq', '01723456789', 'customer'),
('Jane Smith', 'jane@example.com', '$2b$10$rKvVJKJ5xGZqJ5xGZqJ5xOqJ5xGZqJ5xGZqJ5xGZqJ5xGZqJ5xGZq', '01734567890', 'customer');

-- Insert vehicles
INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES
('Toyota Camry 2024', 'car', 'ABC-1234', 50.00, 'available'),
('Honda Civic 2023', 'car', 'XYZ-5678', 45.00, 'available'),
('Yamaha R15', 'bike', 'BIKE-001', 20.00, 'available'),
('Ford Transit Van', 'van', 'VAN-2024', 80.00, 'available'),
('Toyota Land Cruiser', 'SUV', 'SUV-9999', 120.00, 'available');

-- Note: To use these users, you'll need to register through the API
-- which will properly hash the passwords
