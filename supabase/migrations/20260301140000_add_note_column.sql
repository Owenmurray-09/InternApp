-- Add note column to applications table
ALTER TABLE public.applications
ADD COLUMN note text;