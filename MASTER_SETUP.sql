-- ==============================================================================
-- NIRMAAN MUN: MASTER DATABASE SETUP (Run this ONE script in Supabase SQL Editor)
-- Safe to run multiple times — uses IF NOT EXISTS and DROP POLICY IF EXISTS
-- ==============================================================================


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PART 1: CREATE ALL MISSING TABLES                          ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1A. site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1B. team_members
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

-- 1C. messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1D. schedule
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

-- 1E. registrations (extra columns if missing)
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS portfolio_pref_1 TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS portfolio_pref_2 TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS referral TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS anything_else TEXT;

-- 1F. secretariat_applications
CREATE TABLE IF NOT EXISTS public.secretariat_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  application_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  age TEXT,
  grade_year TEXT,
  institution TEXT,
  city_state TEXT,
  instagram_handle TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  mun_experience_rating INT,
  sectors TEXT[],
  mun_cv_url TEXT,
  prior_secretariat_experience TEXT,
  why_suitable TEXT,
  unique_idea TEXT,
  why_passionate TEXT,
  portfolio_links TEXT,
  anything_else TEXT,
  reference TEXT,
  declaration_agreed BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT
);

-- 1G. admin_allowlist
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  email TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by TEXT
);

-- 1H. admin_login_attempts
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  allowed BOOLEAN,
  timestamp TIMESTAMPTZ DEFAULT now(),
  ip TEXT,
  user_agent TEXT
);

-- 1I. admin_action_log
CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  admin_email TEXT NOT NULL,
  action_name TEXT NOT NULL,
  details JSONB NOT NULL
);


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PART 2: ENABLE RLS ON ALL TABLES                           ║
-- ╚══════════════════════════════════════════════════════════════╝

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretariat_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PART 3: DROP ALL OLD POLICIES (clean slate)                ║
-- ╚══════════════════════════════════════════════════════════════╝

DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('site_settings','registrations','messages','schedule',
                        'team_members','secretariat_applications',
                        'admin_allowlist','admin_login_attempts','admin_action_log')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PART 4: CREATE NEW SECURE POLICIES                         ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Helper function: is this user an admin?
-- (used in policy definitions below)

-- ── site_settings ──
-- NO anon access. Only admins.
CREATE POLICY "admin_all_settings" ON public.site_settings FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── registrations ──
-- Anon: INSERT only. Admins: full CRUD.
CREATE POLICY "anon_insert_registrations" ON public.registrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_all_registrations" ON public.registrations FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── secretariat_applications ──
-- Anon: INSERT only. Admins: full CRUD.
CREATE POLICY "anon_insert_secretariat" ON public.secretariat_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_all_secretariat" ON public.secretariat_applications FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── messages ──
-- Anon: INSERT only. Admins: full CRUD.
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "admin_all_messages" ON public.messages FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── schedule ──
-- Anon: SELECT only. Admins: full CRUD.
CREATE POLICY "anon_select_schedule" ON public.schedule FOR SELECT TO anon USING (true);
CREATE POLICY "admin_all_schedule" ON public.schedule FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── team_members ──
-- Anon: SELECT only. Admins: full CRUD.
CREATE POLICY "anon_select_team" ON public.team_members FOR SELECT TO anon USING (true);
CREATE POLICY "admin_all_team" ON public.team_members FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── admin_allowlist ──
CREATE POLICY "auth_read_own_allowlist" ON public.admin_allowlist 
  FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');
CREATE POLICY "admin_all_allowlist" ON public.admin_allowlist FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── admin_login_attempts ──
CREATE POLICY "admin_read_attempts" ON public.admin_login_attempts FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- ── admin_action_log ──
CREATE POLICY "admin_insert_log" ON public.admin_action_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_read_log" ON public.admin_action_log FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PART 5: STORAGE BUCKETS + POLICIES                         ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('secretariat-cvs', 'secretariat-cvs', false) ON CONFLICT (id) DO NOTHING;

-- payment-proofs
CREATE POLICY "anon_insert_payment_proofs" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "anon_select_payment_proofs" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'payment-proofs');
CREATE POLICY "admin_all_payment_proofs" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- team-photos
CREATE POLICY "anon_select_team_photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'team-photos');
CREATE POLICY "anon_insert_team_photos" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'team-photos');
CREATE POLICY "admin_all_team_photos" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'team-photos' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (bucket_id = 'team-photos' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- secretariat-cvs
CREATE POLICY "anon_insert_secretariat_cvs" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'secretariat-cvs');
CREATE POLICY "admin_all_secretariat_cvs" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'secretariat-cvs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
  WITH CHECK (bucket_id = 'secretariat-cvs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  PART 6: SEED ADMIN EMAILS + DEFAULT DATA                   ║
-- ╚══════════════════════════════════════════════════════════════╝

INSERT INTO public.admin_allowlist (email, added_by) VALUES
  ('kavyanidhi48@gmail.com', 'system'),
  ('awani60140@gmail.com', 'system'),
  ('professional.pranjullchauhan@gmail.com', 'system'),
  ('2006karanray@gmail.com', 'system'),
  ('nirmaan.indraja@gmail.com', 'system')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.site_settings (key, value) VALUES
  ('primary_color', '#8b1e3f'),
  ('accent_color', '#c9a96e'),
  ('fee_early_bird', '1800'),
  ('fee_standard', '2100'),
  ('fee_ip', '1900'),
  ('qr_code_url', ''),
  ('upi_id', 'nirmaan@bank'),
  ('conference_date', '2026-08-08'),
  ('dates_announced', 'true'),
  ('schedule_announced', 'true'),
  ('current_theme', 'default')
ON CONFLICT (key) DO NOTHING;

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


-- ╔══════════════════════════════════════════════════════════════╗
-- ║  DONE! Your database is now fully set up and secured.       ║
-- ╚══════════════════════════════════════════════════════════════╝
