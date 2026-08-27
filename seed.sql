-- ============================================================
-- Seed Data — sample admin/agent + travel packages
-- Run AFTER schema.sql: mysql -u root -p travel_booking < seed.sql
-- ============================================================
USE travel_booking;

-- Sample users
-- NOTE: these password hashes are placeholders. In Step 3 (auth),
-- your Node backend will hash real passwords with bcrypt — don't
-- try to log in with these directly, they're just to satisfy the
-- created_by foreign key for now.
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User',  'admin@travelapp.com', 'PLACEHOLDER_HASH', 'admin'),
('Agent Priya', 'priya.agent@travelapp.com', 'PLACEHOLDER_HASH', 'agent'),
('Test Customer', 'customer@travelapp.com', 'PLACEHOLDER_HASH', 'customer');

-- Sample travel packages across different timezones —
-- good spread for testing the timezone API integration later.
INSERT INTO travel_packages
(title, description, destination_city, destination_country, timezone_id, price, duration_days, max_capacity, image_url, created_by)
VALUES
('Tokyo Explorer',
 'Discover Tokyo''s blend of ancient temples and neon-lit streets. Includes guided Shibuya and Asakusa tours.',
 'Tokyo', 'Japan', 'Asia/Tokyo', 89999.00, 7, 15, NULL, 2),

('Paris Romance Getaway',
 'Eiffel Tower, Louvre, and Seine river cruise. Includes breakfast at a local patisserie every morning.',
 'Paris', 'France', 'Europe/Paris', 105000.00, 6, 12, NULL, 2),

('Bali Beach Retreat',
 'Relax on Bali''s beaches with a private villa stay and sunrise Mount Batur trek included.',
 'Bali', 'Indonesia', 'Asia/Makassar', 45000.00, 5, 20, NULL, 2),

('New York City Highlights',
 'Times Square, Central Park, and a Broadway show. Perfect for first-time NYC visitors.',
 'New York', 'United States', 'America/New_York', 125000.00, 6, 18, NULL, 2),

('Dubai Luxury Escape',
 'Desert safari, Burj Khalifa observation deck, and 5-star hotel stay.',
 'Dubai', 'United Arab Emirates', 'Asia/Dubai', 98000.00, 5, 15, NULL, 2),

('Sydney Coastal Adventure',
 'Bondi Beach, Sydney Opera House tour, and a day trip to the Blue Mountains.',
 'Sydney', 'Australia', 'Australia/Sydney', 115000.00, 8, 14, NULL, 2),

('Swiss Alps Trekking',
 'Guided hikes through the Alps with stays in Interlaken and Zermatt.',
 'Zurich', 'Switzerland', 'Europe/Zurich', 135000.00, 9, 10, NULL, 2),

('Singapore City Break',
 'Gardens by the Bay, Sentosa Island, and Marina Bay Sands rooftop access.',
 'Singapore', 'Singapore', 'Asia/Singapore', 72000.00, 5, 20, NULL, 2);