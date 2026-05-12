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
  ('Awani', 'Chief Advisor', '+91 82716 83544', '/awani.jpeg', 2)
ON CONFLICT DO NOTHING;

-- Storage bucket for uploads (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;
