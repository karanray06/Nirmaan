-- ==============================================================================
-- Nirmaan MUN: Secretariat Applications Setup (Run in Supabase SQL Editor)
-- ==============================================================================

-- 1. Create the secretariat_applications table
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
  mun_experience_rating INT CHECK (mun_experience_rating BETWEEN 1 AND 10),
  sectors TEXT[], -- Array for multi-select
  mun_cv_url TEXT,
  prior_secretariat_experience TEXT,
  why_suitable TEXT NOT NULL,
  unique_idea TEXT NOT NULL,
  why_passionate TEXT NOT NULL,
  portfolio_links TEXT,
  anything_else TEXT,
  reference TEXT,
  declaration_agreed BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT
);

-- Basic validation on email
ALTER TABLE public.secretariat_applications DROP CONSTRAINT IF EXISTS valid_email_sec;
ALTER TABLE public.secretariat_applications ADD CONSTRAINT valid_email_sec CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

-- 2. Set up RLS for secretariat_applications
ALTER TABLE public.secretariat_applications ENABLE ROW LEVEL SECURITY;

-- Public can submit applications
CREATE POLICY "anon_insert_secretariat" ON public.secretariat_applications FOR INSERT TO anon WITH CHECK (declaration_agreed = true);

-- Authenticated admins have full access
CREATE POLICY "auth_read_secretariat" ON public.secretariat_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_secretariat" ON public.secretariat_applications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_secretariat" ON public.secretariat_applications FOR DELETE TO authenticated USING (true);

-- 3. Create the storage bucket for Secretariat CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('secretariat-cvs', 'secretariat-cvs', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up storage policies for secretariat-cvs
-- Public can upload CVs when submitting their application
CREATE POLICY "Anon Insert Secretariat CVs" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'secretariat-cvs');

-- Only authenticated admins can read, update, or delete the CVs
CREATE POLICY "Auth Read Secretariat CVs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'secretariat-cvs');
CREATE POLICY "Auth Manage Secretariat CVs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'secretariat-cvs') WITH CHECK (bucket_id = 'secretariat-cvs');
CREATE POLICY "Auth Delete Secretariat CVs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'secretariat-cvs');
