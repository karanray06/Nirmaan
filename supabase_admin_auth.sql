-- Step 4: Admin Authentication Schema

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
    email text PRIMARY KEY,
    added_at timestamptz DEFAULT now(),
    added_by text
);

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text,
    allowed boolean,
    timestamp timestamptz DEFAULT now(),
    ip text,
    user_agent text
);

-- 2. Enable RLS
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- 3. Policies for admin_allowlist
-- Authenticated users can read their own row (to verify themselves)
CREATE POLICY "auth_read_own_allowlist" ON public.admin_allowlist 
FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');

-- Existing admins can read and manage the entire allowlist
CREATE POLICY "admin_all_allowlist" ON public.admin_allowlist 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- 4. Policies for admin_login_attempts
-- Only admins can see login attempts
CREATE POLICY "admin_read_attempts" ON public.admin_login_attempts 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- Note: Inserting into login_attempts will be done server-side via Service Role Key (bypassing RLS)

-- 5. Seed Initial Admins
INSERT INTO public.admin_allowlist (email, added_by) VALUES
('kavyanidhi48@gmail.com', 'system'),
('awani60140@gmail.com', 'system'),
('professional.pranjullchauhan@gmail.com', 'system'),
('2006karanray@gmail.com', 'system'),
('nirmaan.indraja@gmail.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- 6. Tighten existing authenticated policies to require admin allowlist
-- We will replace the "auth_all_..." policies from Step 1 with strict admin checks.

-- site_settings
DROP POLICY IF EXISTS "auth_all_settings" ON public.site_settings;
CREATE POLICY "admin_all_settings" ON public.site_settings FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- registrations
DROP POLICY IF EXISTS "auth_all_registrations" ON public.registrations;
CREATE POLICY "admin_all_registrations" ON public.registrations FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- secretariat_applications
DROP POLICY IF EXISTS "auth_all_secretariat" ON public.secretariat_applications;
CREATE POLICY "admin_all_secretariat" ON public.secretariat_applications FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- messages
DROP POLICY IF EXISTS "auth_all_messages" ON public.messages;
CREATE POLICY "admin_all_messages" ON public.messages FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- schedule
DROP POLICY IF EXISTS "auth_all_schedule" ON public.schedule;
CREATE POLICY "admin_all_schedule" ON public.schedule FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- team_members
DROP POLICY IF EXISTS "auth_all_team" ON public.team_members;
CREATE POLICY "admin_all_team" ON public.team_members FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

-- storage objects
DROP POLICY IF EXISTS "auth_all_payment_proofs" ON storage.objects;
CREATE POLICY "admin_all_payment_proofs" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "auth_all_team_photos" ON storage.objects;
CREATE POLICY "admin_all_team_photos" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'team-photos' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (bucket_id = 'team-photos' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "auth_all_secretariat_cvs" ON storage.objects;
CREATE POLICY "admin_all_secretariat_cvs" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'secretariat-cvs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email')) 
WITH CHECK (bucket_id = 'secretariat-cvs' AND EXISTS (SELECT 1 FROM public.admin_allowlist WHERE email = auth.jwt() ->> 'email'));
