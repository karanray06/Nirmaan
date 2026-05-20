-- Run this in Supabase SQL Editor AFTER creating the registrations table

-- Site Settings (key-value store for theme, QR code, fees, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_settings" ON public.site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_settings" ON public.site_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_settings" ON public.site_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_settings" ON public.site_settings FOR DELETE TO anon USING (true);

-- Default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('admin_password', 'nirmaan2026admin'),
  ('primary_color', '#8b1e3f'),
  ('accent_color', '#c9a96e'),
  ('fee_early_bird', '1800'),
  ('fee_standard', '2100'),
  ('fee_ip', '1900'),
  ('qr_code_url', ''),
  ('upi_id', 'nirmaan@bank'),
  ('conference_date', '2026-08-08')
ON CONFLICT (key) DO NOTHING;

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  display_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
-- Run this in Supabase SQL Editor AFTER creating the registrations table

-- Site Settings (key-value store for theme, QR code, fees, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_settings" ON public.site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_settings" ON public.site_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_settings" ON public.site_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_settings" ON public.site_settings FOR DELETE TO anon USING (true);

-- Default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('admin_password', 'nirmaan2026admin'),
  ('primary_color', '#8b1e3f'),
  ('accent_color', '#c9a96e'),
  ('fee_early_bird', '1800'),
  ('fee_standard', '2100'),
  ('fee_ip', '1900'),
  ('qr_code_url', ''),
  ('upi_id', 'nirmaan@bank'),
  ('conference_date', '2026-08-08')
ON CONFLICT (key) DO NOTHING;

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  display_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_team" ON public.team_members FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_team" ON public.team_members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_team" ON public.team_members FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_team" ON public.team_members FOR DELETE TO anon USING (true);

-- Insert default team members
INSERT INTO public.team_members (name, role, phone, photo_url, display_order) VALUES
  ('Kavya Nidhi', 'Founder', '+91 88265 93840', '/kavya.jpeg', 1),
  ('Awani', 'Chief Advisor', '+91 82716 83544', '/awani.jpeg', 2),
  ('Pranjull Chauhan', 'Advisor', 'Indraja Foundation', '', 3),
  ('Vihaan Pandey', 'President', 'Indraja Foundation', '', 4)
ON CONFLICT DO NOTHING;

-- Storage bucket for uploads (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_messages" ON public.messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon_delete_messages" ON public.messages FOR DELETE TO anon USING (true);

-- Add dates_announced setting
INSERT INTO public.site_settings (key, value) VALUES ('dates_announced', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, value) VALUES ('schedule_announced', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, value) VALUES ('current_theme', 'default') ON CONFLICT (key) DO NOTHING;

-- Schedule table
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day INT NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  color TEXT DEFAULT 'gold',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_schedule" ON public.schedule FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_schedule" ON public.schedule FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_schedule" ON public.schedule FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_schedule" ON public.schedule FOR DELETE TO anon USING (true);

-- Insert default schedule data
INSERT INTO public.schedule (day, time, title, description, venue, color, display_order) VALUES
  (1, '09:00 AM', 'Opening Ceremony', 'Inaugural addresses, lighting of the lamp, and cultural performances.', 'Main Auditorium', 'gold', 1),
  (1, '11:30 AM', 'Committee Session I', 'Roll call, setting the agenda, and opening statements.', 'Respective Committee Rooms', 'rose', 2),
  (1, '01:30 PM', 'Networking Lunch', '', 'Dining Hall', 'burgundy', 3),
  (1, '02:30 PM', 'Committee Session II', 'Moderated caucuses and initial draft resolutions.', 'Respective Committee Rooms', 'rose', 4),
  (2, '09:00 AM', 'Committee Session III', 'Continuation of debate, working papers, and draft resolutions.', 'Respective Committee Rooms', 'gold', 5),
  (2, '11:30 AM', 'Committee Session IV', 'Final debate, voting on resolutions, and Moot Court finals.', 'Respective Committee Rooms', 'rose', 6),
  (2, '01:00 PM', 'Lunch & Refreshments', '', 'Dining Hall', 'burgundy', 7),
  (2, '02:30 PM', 'Closing Ceremony & Awards', 'Merit-based awards, special recognitions, and farewell addresses.', 'Main Auditorium', 'gold', 8)
ON CONFLICT DO NOTHING;

-- Reform Delegate registrations fields
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS portfolio_pref_1 TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS portfolio_pref_2 TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS referral TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS anything_else TEXT;

