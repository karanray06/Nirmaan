-- ==============================================================================
-- Nirmaan MUN: Delegate Form Schema Updates
-- Run this in the Supabase SQL Editor
-- ==============================================================================

-- 1. Ensure columns exist and set defaults for existing rows before adding constraints
UPDATE public.registrations SET grade_year = '11th' WHERE grade_year IS NULL OR grade_year = '';
UPDATE public.registrations SET experience = '0 (First Timer)' WHERE experience IS NULL OR experience = '';
UPDATE public.registrations SET committee_1 = 'UNHRC' WHERE committee_1 IS NULL OR committee_1 = '';
UPDATE public.registrations SET committee_2 = 'UNCSW' WHERE committee_2 IS NULL OR committee_2 = '';
UPDATE public.registrations SET anything_else = 'None' WHERE anything_else IS NULL;

-- 2. Enforce 'anything_else' as REQUIRED
ALTER TABLE public.registrations ALTER COLUMN anything_else SET NOT NULL;

-- 3. Drop existing constraints if re-running
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS valid_grade_year;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS valid_experience;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS valid_committee_1;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS valid_committee_2;

-- 4. Add strict CHECK constraints matching the source requirements
ALTER TABLE public.registrations ADD CONSTRAINT valid_grade_year CHECK (
  grade_year IN ('6th', '7th', '8th', '9th', '10th', '11th', '12th', '1st Year', '2nd Year', '3rd Year', '4th Year')
);

ALTER TABLE public.registrations ADD CONSTRAINT valid_experience CHECK (
  experience IN ('0 (First Timer)', '1-5', '6-10', '11-15', '15+')
);

ALTER TABLE public.registrations ADD CONSTRAINT valid_committee_1 CHECK (
  committee_1 IN ('AIPPM', 'UNHRC', 'IP', 'UNCSW', 'International Intelligence Bureau', 'Moot Court')
);

ALTER TABLE public.registrations ADD CONSTRAINT valid_committee_2 CHECK (
  committee_2 IN ('AIPPM', 'UNHRC', 'IP', 'UNCSW', 'International Intelligence Bureau', 'Mock Trial')
);
