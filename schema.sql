-- ============================================================
-- Travel Booking App — Database Schema
-- ============================================================
-- Run this file to create the database + all tables.
-- Usage: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS travel_booking;
USE travel_booking;

-- ── Users ──────────────────────────────────────────────────────
-- role determines permission level:
--   'customer' → browse + book packages
--   'agent'    → customer permissions + create/edit packages
--   'admin'    → agent permissions + manage all users/bookings
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('customer', 'agent', 'admin') NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Travel Packages ────────────────────────────────────────────
-- timezone_id follows the IANA format (e.g. 'Asia/Tokyo', 'Europe/Paris')
-- so we can call a live timezone API for the destination's current time.
CREATE TABLE travel_packages (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(150) NOT NULL,
    description       TEXT,
    destination_city  VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    timezone_id       VARCHAR(50) NOT NULL,       -- e.g. 'Asia/Tokyo'
    price             DECIMAL(10, 2) NOT NULL,
    duration_days     INT NOT NULL,
    max_capacity      INT NOT NULL DEFAULT 20,
    image_url         VARCHAR(500),
    created_by        INT NOT NULL,                -- FK → agent/admin who listed it
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Bookings ───────────────────────────────────────────────────
-- Links a customer to a package. total_price is stored (not just
-- computed) so historical bookings keep their original price even
-- if the package price changes later.
CREATE TABLE bookings (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    package_id     INT NOT NULL,
    num_travelers  INT NOT NULL DEFAULT 1,
    total_price    DECIMAL(10, 2) NOT NULL,
    travel_date    DATE NOT NULL,
    status         ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES travel_packages(id) ON DELETE CASCADE
);

-- ── Payments ───────────────────────────────────────────────────
-- One-to-one with bookings — each booking has exactly one payment record.
CREATE TABLE payments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    booking_id       INT NOT NULL UNIQUE,
    amount           DECIMAL(10, 2) NOT NULL,
    payment_method   ENUM('card', 'upi', 'netbanking') NOT NULL DEFAULT 'card',
    payment_status   ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    transaction_id   VARCHAR(100),
    paid_at          TIMESTAMP NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ── Indexes for common queries ────────────────────────────────
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_package ON bookings(package_id);
CREATE INDEX idx_packages_destination ON travel_packages(destination_city);