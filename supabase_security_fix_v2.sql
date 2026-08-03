-- Step 1: Security Fixes

-- 1. DROP ALL EXISTING PERMISSIVE POLICIES
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('site_settings', 'registrations', 'messages', 'schedule', 'team_members', 'secretariat_applications')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretariat_applications ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RESTRICTED POLICIES

-- site_settings (NO anon access, authenticated gets full CRUD)
CREATE POLICY "auth_all_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- registrations (anon: INSERT only, authenticated: full CRUD)
CREATE POLICY "anon_insert_registrations" ON public.registrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_registrations" ON public.registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- secretariat_applications (anon: INSERT only, authenticated: full CRUD)
CREATE POLICY "anon_insert_secretariat" ON public.secretariat_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_secretariat" ON public.secretariat_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- messages (anon: INSERT only, authenticated: full CRUD)
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_all_messages" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- schedule (anon: SELECT only, authenticated: full CRUD)
CREATE POLICY "anon_select_schedule" ON public.schedule FOR SELECT TO anon USING (true);
CREATE POLICY "auth_all_schedule" ON public.schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- team_members (anon: SELECT only, authenticated: full CRUD)
CREATE POLICY "anon_select_team" ON public.team_members FOR SELECT TO anon USING (true);
CREATE POLICY "auth_all_team" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. STORAGE BUCKET POLICIES
-- payment-proofs (anon: INSERT only, auth: full)
CREATE POLICY "anon_insert_payment_proofs" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "auth_all_payment_proofs" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'payment-proofs') WITH CHECK (bucket_id = 'payment-proofs');

-- team-photos (anon: SELECT, INSERT. auth: full)
CREATE POLICY "anon_select_team_photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'team-photos');
CREATE POLICY "anon_insert_team_photos" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'team-photos');
CREATE POLICY "auth_all_team_photos" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'team-photos') WITH CHECK (bucket_id = 'team-photos');

-- secretariat-cvs (anon: INSERT only, auth: full)
CREATE POLICY "anon_insert_secretariat_cvs" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'secretariat-cvs');
CREATE POLICY "auth_all_secretariat_cvs" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'secretariat-cvs') WITH CHECK (bucket_id = 'secretariat-cvs');

-- 5. DB-LEVEL VALIDATION (CHECK CONSTRAINTS)
-- Add constraints safely
DO $$
BEGIN
  -- Email format constraint for registrations
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registrations_email_check') THEN
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Age constraint for registrations (e.g., 10 to 30)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registrations_age_check') THEN
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_age_check CHECK (age >= 10 AND age <= 30);
  END IF;

  -- Email format constraint for secretariat
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'secretariat_email_check') THEN
    ALTER TABLE public.secretariat_applications ADD CONSTRAINT secretariat_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Age constraint for secretariat
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'secretariat_age_check') THEN
    ALTER TABLE public.secretariat_applications ADD CONSTRAINT secretariat_age_check CHECK (age >= 10 AND age <= 30);
  END IF;
END $$;
