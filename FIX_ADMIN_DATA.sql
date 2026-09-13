-- ==============================================================================
-- NIRMAAN MUN: DATA & ADMIN POLICY FIX
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Restore the Team Members
INSERT INTO public.team_members (name, role, phone, photo_url, display_order) VALUES
  ('Kavya Nidhi', 'Founder', '+91 88265 93840', '/kavya.jpeg', 1),
  ('Awani', 'Chief Advisor', '+91 82716 83544', '/awani.jpeg', 2),
  ('Pranjull Chauhan', 'Advisor', 'Indraja Foundation', '', 3),
  ('Vihaan Pandey', 'President', 'Indraja Foundation', '', 4)
ON CONFLICT DO NOTHING;

-- 2. Make admin policies case-insensitive and more robust
DO $$ 
DECLARE
  pol record;
BEGIN
  -- Drop existing admin policies to replace them
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE policyname LIKE 'admin_all_%' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Apply new relaxed & case-insensitive Admin policies for all tables
CREATE POLICY "admin_all_settings" ON public.site_settings FOR ALL TO authenticated 
  USING (LOWER(auth.jwt() ->> 'email') IN (SELECT LOWER(email) FROM public.admin_allowlist));

CREATE POLICY "admin_all_registrations" ON public.registrations FOR ALL TO authenticated 
  USING (LOWER(auth.jwt() ->> 'email') IN (SELECT LOWER(email) FROM public.admin_allowlist));

CREATE POLICY "admin_all_secretariat" ON public.secretariat_applications FOR ALL TO authenticated 
  USING (LOWER(auth.jwt() ->> 'email') IN (SELECT LOWER(email) FROM public.admin_allowlist));

CREATE POLICY "admin_all_messages" ON public.messages FOR ALL TO authenticated 
  USING (LOWER(auth.jwt() ->> 'email') IN (SELECT LOWER(email) FROM public.admin_allowlist));

CREATE POLICY "admin_all_schedule" ON public.schedule FOR ALL TO authenticated 
  USING (LOWER(auth.jwt() ->> 'email') IN (SELECT LOWER(email) FROM public.admin_allowlist));

CREATE POLICY "admin_all_team" ON public.team_members FOR ALL TO authenticated 
  USING (LOWER(auth.jwt() ->> 'email') IN (SELECT LOWER(email) FROM public.admin_allowlist));

-- 3. Just in case your allowlist got wiped, re-insert the emails
INSERT INTO public.admin_allowlist (email, added_by) VALUES
  ('kavyanidhi48@gmail.com', 'system'),
  ('awani60140@gmail.com', 'system'),
  ('professional.pranjullchauhan@gmail.com', 'system'),
  ('2006karanray@gmail.com', 'system'),
  ('nirmaan.indraja@gmail.com', 'system')
ON CONFLICT (email) DO NOTHING;
