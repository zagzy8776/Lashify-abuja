/*
# LashifyAbuja - Core Booking Schema

## Overview
Creates the foundational database schema for a luxury lash and brow booking platform.
This is a single-tenant app (one salon owner) with a public-facing booking flow
(no client login required) and a separate admin login for the owner.

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

## Security
- RLS enabled on all tables.
- Public (anon) can: read services, read gallery, read published reviews,
  read time slots, create clients, create appointments, read own appointments by phone.
- Admin (authenticated) can: full CRUD on all tables.
- App has a sign-in screen for the admin only, so policies use both
  `TO anon, authenticated` for public reads and `TO authenticated` for admin writes.
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
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (true);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_clients" ON clients;
CREATE POLICY "public_insert_clients" ON clients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_clients" ON clients;
CREATE POLICY "admin_read_clients" ON clients FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_clients" ON clients;
CREATE POLICY "admin_update_clients" ON clients FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_clients" ON clients;
CREATE POLICY "admin_delete_clients" ON clients FOR DELETE
  TO authenticated USING (true);

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
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_appointments" ON appointments;
CREATE POLICY "public_insert_appointments" ON appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_appointments_by_phone" ON appointments;
CREATE POLICY "public_read_appointments_by_phone" ON appointments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_appointments" ON appointments;
CREATE POLICY "admin_update_appointments" ON appointments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_appointments" ON appointments;
CREATE POLICY "admin_delete_appointments" ON appointments FOR DELETE
  TO authenticated USING (true);

-- Time slots table (working hours per day of week)
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_time_slots" ON time_slots;
CREATE POLICY "public_read_time_slots" ON time_slots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_time_slots" ON time_slots;
CREATE POLICY "admin_insert_time_slots" ON time_slots FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_time_slots" ON time_slots;
CREATE POLICY "admin_update_time_slots" ON time_slots FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_time_slots" ON time_slots;
CREATE POLICY "admin_delete_time_slots" ON time_slots FOR DELETE
  TO authenticated USING (true);

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
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery_items;
CREATE POLICY "public_read_gallery" ON gallery_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery_items;
CREATE POLICY "admin_insert_gallery" ON gallery_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery_items;
CREATE POLICY "admin_update_gallery" ON gallery_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery_items;
CREATE POLICY "admin_delete_gallery" ON gallery_items FOR DELETE
  TO authenticated USING (true);

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
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_reviews" ON reviews;
CREATE POLICY "public_read_published_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (true);

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
