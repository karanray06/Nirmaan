# Nirmaan MUN

Premium Model United Nations conference website.

## Features
- Vanilla JS, CSS3, HTML5
- Vite build system
- Supabase backend for registrations & Secretariat applications
- xAI Grok integrated AI Assistant
- Multi-step forms
- Supabase Auth-protected Admin Dashboard

## Setup Instructions
1. Run `schema.sql` and `supabase_setup.sql` in your Supabase SQL editor.
2. Run `supabase_security_fix.sql` to apply security fixes and restrict RLS policies.
3. Run `supabase_secretariat_setup.sql` to set up the Secretariat applications tables and storage buckets.
4. Go to your Supabase Dashboard -> Authentication -> Users -> Add User. Create a user (e.g. `admin@nirmaan.org`) and set a strong password. You will use this email and password to log in to the admin dashboard.
