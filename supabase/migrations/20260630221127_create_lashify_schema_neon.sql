/*
# LashifyAbuja - Core Booking Schema for Neon PostgreSQL

## Overview
Creates the foundational database schema for a luxury lash and brow booking platform.
This is a single-tenant app (one salon owner) with a public-facing booking flow
and a separate admin login for the owner.

## New Tables

### services
- `id` (uuid, primary key)
- `name` (text) - e.g. "Volume Lashes", "Brow Shaping"
- `slug` (text, unique) - URL-friendly identifier
- `description` (text) - what's included
- `price` (numeric) - in Naira
- `duration_minutes` (int) - service duration
- `category` (text) - 'lashes' | 'brows' | 'other'
- `image_url` (text) - optional service image
- `is_active` (boolean, default true) - owner can toggle off
- `sort_order` (int, default 0) - display ordering
- `created_at` (timestamptz)

### clients
- `id` (uuid, primary key)
- `name` (text)
- `phone` (text) - vital for WhatsApp coordination
- `email` (text, nullable)
- `notes` (text, nullable) - owner notes about client
- `created_at` (timestamptz)

### appointments
- `id` (uuid, primary key)
- `client_id` (uuid, FK to clients)
- `service_id` (uuid, FK to services)
- `appointment_date` (date) - the day
- `start_time` (time) - start time slot
- `end_time` (time) - computed end time
- `status` (text) - 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
- `notes` (text, nullable) - client notes
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### time_slots
- `id` (uuid, primary key)
- `day_of_week` (int, 0=Sunday..6=Saturday)
- `start_time` (time) - working hours start
- `end_time` (time) - working hours end
- `is_active` (boolean, default true)
- `created_at` (timestamptz)

### gallery_items
- `id` (uuid, primary key)
- `title` (text)
- `category` (text) - 'lashes' | 'brows' | 'other'
- `image_url` (text)
- `description` (text, nullable)
- `is_featured` (boolean, default false)
- `sort_order` (int, default 0)
- `created_at` (timestamptz)

### reviews
- `id` (uuid, primary key)
- `client_name` (text)
- `rating` (int, 1-5)
- `comment` (text)
- `service_id` (uuid, FK to services, nullable)
- `is_published` (boolean, default false)
- `created_at` (timestamptz)
*/

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes int NOT NULL DEFAULT 60,
  category text NOT NULL DEFAULT 'other',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  service_name text NOT NULL,
  service_price numeric(10,2) NOT NULL DEFAULT 0,
  service_duration int NOT NULL DEFAULT 60,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Time slots table (working hours per day of week)
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'lashes',
  image_url text NOT NULL,
  description text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(is_published);

-- Auto-update updated_at on appointments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure time_slots has a UNIQUE constraint on day_of_week for existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'time_slots_day_of_week_key'
    ) THEN
        ALTER TABLE time_slots ADD CONSTRAINT time_slots_day_of_week_key UNIQUE (day_of_week);
    END IF;
END $$;

-- Seed default services
INSERT INTO services (name, slug, description, price, duration_minutes, category, is_active, sort_order) VALUES
  ('Classic Lash Extensions', 'classic-lashes', 'A natural, mascara-like look. One extension is applied to each natural lash.', 15000, 90, 'lashes', true, 1),
  ('Hybrid Lash Extensions', 'hybrid-lashes', 'A perfect blend of classic and volume lashes for textured, fluffy results.', 20000, 105, 'lashes', true, 2),
  ('Volume Lash Extensions', 'volume-lashes', 'Fuller, denser lashes. Custom fans of 3-6 extensions are applied to each lash.', 25000, 120, 'lashes', true, 3),
  ('Mega Volume Extensions', 'mega-volume-lashes', 'Our ultimate full and dramatic look using ultra-lightweight fans.', 30000, 135, 'lashes', true, 4),
  ('Brow Shaping & Styling', 'brow-shaping', 'Professional shaping, mapping, and tweezing/waxing for perfect brows.', 8000, 45, 'brows', true, 5),
  ('Brow Lamination & Tint', 'brow-lamination', 'Relocate brow hairs for a fuller, brushed-up look including custom tinting.', 15000, 60, 'brows', true, 6),
  ('Lash Lift & Tint', 'lash-lift', 'Perm and tint your natural lashes for a beautiful, low-maintenance curl.', 12000, 60, 'other', true, 7)
ON CONFLICT (slug) DO NOTHING;

-- Seed default time slots (Monday - Saturday)
INSERT INTO time_slots (day_of_week, start_time, end_time, is_active) VALUES
  (1, '09:00:00', '18:00:00', true),
  (2, '09:00:00', '18:00:00', true),
  (3, '09:00:00', '18:00:00', true),
  (4, '09:00:00', '18:00:00', true),
  (5, '09:00:00', '18:00:00', true),
  (6, '10:00:00', '17:00:00', true)
ON CONFLICT (day_of_week) DO NOTHING;
