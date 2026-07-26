-- ==============================================================================
-- Nirmaan MUN: Revert Security Fixes (Make Database Public Again)
-- Run this in the Supabase SQL Editor to restore old login behavior
-- ==============================================================================

-- 1. Site Settings
DROP POLICY IF EXISTS "anon_read_settings" ON public.site_settings;
DROP POLICY IF EXISTS "anon_update_settings" ON public.site_settings;
DROP POLICY IF EXISTS "anon_insert_settings" ON public.site_settings;
DROP POLICY IF EXISTS "anon_delete_settings" ON public.site_settings;

CREATE POLICY "anon_read_settings" ON public.site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_settings" ON public.site_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_settings" ON public.site_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_settings" ON public.site_settings FOR DELETE TO anon USING (true);

-- 2. Registrations
DROP POLICY IF EXISTS "Allow public insert" ON public.registrations;
DROP POLICY IF EXISTS "Allow read own" ON public.registrations;
DROP POLICY IF EXISTS "Allow public update" ON public.registrations;
DROP POLICY IF EXISTS "Allow public delete" ON public.registrations;
DROP POLICY IF EXISTS "Allow admin all" ON public.registrations;

CREATE POLICY "Allow public insert" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.registrations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.registrations FOR DELETE USING (true);

-- 3. Secretariat Applications
DROP POLICY IF EXISTS "Allow anon insert" ON public.secretariat_applications;
DROP POLICY IF EXISTS "Allow admin select" ON public.secretariat_applications;
DROP POLICY IF EXISTS "Allow admin update" ON public.secretariat_applications;
DROP POLICY IF EXISTS "Allow admin delete" ON public.secretariat_applications;

CREATE POLICY "Allow anon insert" ON public.secretariat_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON public.secretariat_applications FOR SELECT USING (true);
CREATE POLICY "Allow anon update" ON public.secretariat_applications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete" ON public.secretariat_applications FOR DELETE USING (true);

-- 4. Messages
DROP POLICY IF EXISTS "anon_insert_messages" ON public.messages;
DROP POLICY IF EXISTS "anon_read_messages" ON public.messages;
DROP POLICY IF EXISTS "anon_delete_messages" ON public.messages;
DROP POLICY IF EXISTS "auth_manage_messages" ON public.messages;

CREATE POLICY "anon_insert_messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_messages" ON public.messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_messages" ON public.messages FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_messages" ON public.messages FOR DELETE TO anon USING (true);

-- 5. Team Members
DROP POLICY IF EXISTS "anon_read_team" ON public.team_members;
DROP POLICY IF EXISTS "anon_insert_team" ON public.team_members;
DROP POLICY IF EXISTS "anon_update_team" ON public.team_members;
DROP POLICY IF EXISTS "anon_delete_team" ON public.team_members;
DROP POLICY IF EXISTS "auth_manage_team" ON public.team_members;

CREATE POLICY "anon_read_team" ON public.team_members FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_team" ON public.team_members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_team" ON public.team_members FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_team" ON public.team_members FOR DELETE TO anon USING (true);

-- 6. Schedule
DROP POLICY IF EXISTS "anon_read_schedule" ON public.schedule;
DROP POLICY IF EXISTS "anon_insert_schedule" ON public.schedule;
DROP POLICY IF EXISTS "anon_update_schedule" ON public.schedule;
DROP POLICY IF EXISTS "anon_delete_schedule" ON public.schedule;
DROP POLICY IF EXISTS "auth_manage_schedule" ON public.schedule;

CREATE POLICY "anon_read_schedule" ON public.schedule FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_schedule" ON public.schedule FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_schedule" ON public.schedule FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_schedule" ON public.schedule FOR DELETE TO anon USING (true);

-- 7. Admin Action Log
DROP POLICY IF EXISTS "auth_insert_log" ON public.admin_action_log;
DROP POLICY IF EXISTS "auth_read_log" ON public.admin_action_log;

CREATE POLICY "anon_insert_log" ON public.admin_action_log FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_read_log" ON public.admin_action_log FOR SELECT TO anon USING (true);

-- 8. Storage Buckets (Make public)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anon Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Manage" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Anon Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Anon Update" ON storage.objects FOR UPDATE USING (bucket_id = 'payment-proofs');
CREATE POLICY "Anon Delete" ON storage.objects FOR DELETE USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Auth Select Secretariat CVs" ON storage.objects;
CREATE POLICY "Anon Select Secretariat CVs" ON storage.objects FOR SELECT USING (bucket_id = 'secretariat-cvs');
