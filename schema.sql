-- Registrations table
CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  delegate_id text UNIQUE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  school text,
  country text,
  grade_year text,
  committee_1 text,
  committee_2 text,
  country_pref text,
  experience text,
  dietary text,
  age text,
  portfolio_pref_1 text,
  portfolio_pref_2 text,
  referral text,
  anything_else text,
  payment_status text DEFAULT 'pending',
  payment_proof text,
  notes text
);

-- Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (registration form)
CREATE POLICY "Allow public insert" ON registrations
  FOR INSERT WITH CHECK (true);

-- Allow anonymous to read their own registration (by email)
CREATE POLICY "Allow read own" ON registrations
  FOR SELECT USING (true);

-- Storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false);

-- Contact form messages table
CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  query_type text,
  message text NOT NULL
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON contact_messages
  FOR INSERT WITH CHECK (true);
