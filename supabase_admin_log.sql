-- ==============================================================================
-- Nirmaan MUN: AI Helpdesk Action Log Schema
-- Run this in the Supabase SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  admin_email TEXT NOT NULL,
  action_name TEXT NOT NULL,
  details JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

-- Deny all anonymous access
DROP POLICY IF EXISTS "anon_insert_log" ON public.admin_action_log;
DROP POLICY IF EXISTS "anon_read_log" ON public.admin_action_log;

-- Authenticated admins can only insert and read the logs
CREATE POLICY "auth_insert_log" ON public.admin_action_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_read_log" ON public.admin_action_log FOR SELECT TO authenticated USING (true);
