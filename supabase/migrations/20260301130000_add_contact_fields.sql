-- Add contact fields to applications table
ALTER TABLE public.applications
ADD COLUMN contact_email text,
ADD COLUMN contact_phone text;