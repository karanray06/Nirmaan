-- ==============================================================================
-- Nirmaan MUN: Security Audit Fixes (Run this in the Supabase SQL Editor)
-- ==============================================================================

-- 1. Rotate the dummy admin password just in case it hasn't been changed yet
-- (Though the real fix is migrating away from this pattern to Supabase Auth)
UPDATE public.site_settings 
SET value = gen_random_uuid()::text 
WHERE key = 'admin_password';

-- ==============================================================================
-- 2. site_settings - Restrict entirely to authenticated admins
-- ==============================================================================
DROP POLICY IF EXISTS "anon_read_settings" ON public.site_settings;
DROP POLICY IF EXISTS "anon_update_settings" ON public.site_settings;
DROP POLICY IF EXISTS "anon_insert_settings" ON public.site_settings;
DROP POLICY IF EXISTS "anon_delete_settings" ON public.site_settings;

CREATE POLICY "auth_read_settings" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_insert_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_delete_settings" ON public.site_settings FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- 3. registrations - Anon INSERT only, Auth full access
-- ==============================================================================
DROP POLICY IF EXISTS "Allow public insert" ON public.registrations;
DROP POLICY IF EXISTS "Allow read own" ON public.registrations;
DROP POLICY IF EXISTS "Allow public update" ON public.registrations;
DROP POLICY IF EXISTS "Allow public delete" ON public.registrations;

-- Public can submit registration forms
CREATE POLICY "anon_insert_registrations" ON public.registrations FOR INSERT TO anon WITH CHECK (true);

-- Admins can manage everything
CREATE POLICY "auth_read_registrations" ON public.registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_registrations" ON public.registrations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_registrations" ON public.registrations FOR DELETE TO authenticated USING (true);

-- Add simple server-side validation to registrations
-- Drop constraint if it exists first to make it re-runnable
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS valid_email;
ALTER TABLE public.registrations ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS valid_age;
-- Age is currently a text column, so we cast it for validation, allowing nulls
ALTER TABLE public.registrations ADD CONSTRAINT valid_age CHECK (
  age IS NULL OR age = '' OR (age ~ '^[0-9]+$' AND age::int BETWEEN 5 AND 99)
);

-- ==============================================================================
-- 4. messages - Anon INSERT only, Auth full access
-- ==============================================================================
DROP POLICY IF EXISTS "anon_insert_messages" ON public.messages;
DROP POLICY IF EXISTS "anon_read_messages" ON public.messages;
DROP POLICY IF EXISTS "anon_delete_messages" ON public.messages;

-- Public can submit contact forms
CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);

-- Admins can manage everything
CREATE POLICY "auth_read_messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_delete_messages" ON public.messages FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- 5. team_members - Public READ, Auth full access
-- ==============================================================================
DROP POLICY IF EXISTS "anon_read_team" ON public.team_members;
DROP POLICY IF EXISTS "anon_insert_team" ON public.team_members;
DROP POLICY IF EXISTS "anon_update_team" ON public.team_members;
DROP POLICY IF EXISTS "anon_delete_team" ON public.team_members;

CREATE POLICY "anon_read_team" ON public.team_members FOR SELECT TO anon USING (visible = true);
CREATE POLICY "auth_all_team" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. schedule - Public READ, Auth full access
-- ==============================================================================
DROP POLICY IF EXISTS "anon_read_schedule" ON public.schedule;
DROP POLICY IF EXISTS "anon_insert_schedule" ON public.schedule;
DROP POLICY IF EXISTS "anon_update_schedule" ON public.schedule;
DROP POLICY IF EXISTS "anon_delete_schedule" ON public.schedule;

CREATE POLICY "anon_read_schedule" ON public.schedule FOR SELECT TO anon USING (true);
CREATE POLICY "auth_all_schedule" ON public.schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. Storage Buckets Fixes
-- ==============================================================================
-- payment-proofs: Drop the over-permissive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anon Insert" ON storage.objects;

-- Only admins can see payment proofs
CREATE POLICY "Auth Read Payment Proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs');
-- Admins can update/delete
CREATE POLICY "Auth Manage Payment Proofs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'payment-proofs') WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Auth Delete Payment Proofs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'payment-proofs');
-- Public can still upload (submit registration)
CREATE POLICY "Anon Insert Payment Proofs" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'payment-proofs');

-- team-photos: Prevent anon update/delete
DROP POLICY IF EXISTS "Team Photos Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Team Photos Anon Insert" ON storage.objects;
DROP POLICY IF EXISTS "Team Photos Anon Update" ON storage.objects;
DROP POLICY IF EXISTS "Team Photos Anon Delete" ON storage.objects;

CREATE POLICY "Public Read Team Photos" ON storage.objects FOR SELECT USING (bucket_id = 'team-photos');
CREATE POLICY "Auth Manage Team Photos" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'team-photos') WITH CHECK (bucket_id = 'team-photos');
-- We leave an anon INSERT for team photos if they are uploaded via the public form 
-- (Wait, the form is an admin dashboard. Only authenticated admins should be uploading team photos now).
-- So no anon INSERT for team-photos.
