-- ==========================================
-- Pastor's Diary - Supabase Database Setup
-- ==========================================
-- Run this SQL in the Supabase SQL Editor:
-- https://havlcqnaupruxxpreyxo.supabase.co
-- Go to: SQL Editor > New query > Paste this > Run
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  passage TEXT,
  series TEXT,
  status TEXT DEFAULT 'Draft',
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - but allow all for now
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (public access for now)
CREATE POLICY "Allow all operations on sermons" ON sermons
  FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data
INSERT INTO sermons (title, date, passage, series, status, content) VALUES
  ('Walking by Faith', '2026-08-16', '2 Corinthians 5:7', 'Faith Series', 'Scheduled', '<p>Faith is not simply believing in something you cannot see. It is trusting in the One who sees everything...</p>'),
  ('God''s Amazing Grace', '2026-08-23', 'Ephesians 2:8-9', 'Grace Series', 'Draft', '<p>Grace is the unmerited favor of God. It is a gift that we do not deserve...</p>'),
  ('The Good Shepherd', '2026-08-09', 'John 10:11-18', 'Gospel of John', 'Preached', '<p>Jesus said, "I am the good shepherd. The good shepherd lays down his life for the sheep..."</p>');

-- Create a storage bucket for attachments (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- ==========================================
-- Appointments / Schedule Planner
-- ==========================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  reminder_minutes INTEGER DEFAULT 30,
  is_reminded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample appointments
INSERT INTO appointments (title, description, date, time, location, reminder_minutes) VALUES
  ('Hospital Visit - Bro. Santos', 'Visit Brother Santos at Manila Doctors Hospital, Room 405', '2026-08-10', '09:00', 'Manila Doctors Hospital', 30),
  ('Youth Fellowship Meeting', 'Monthly youth planning session', '2026-08-12', '18:00', 'Church Hall', 60),
  ('Wedding Counseling - Rivera Family', 'Pre-marital counseling session 3 of 6', '2026-08-14', '14:00', 'Church Office', 15),
  ('Midweek Prayer Service', 'Weekly prayer service and Bible study', '2026-08-13', '19:00', 'Main Sanctuary', 30);
