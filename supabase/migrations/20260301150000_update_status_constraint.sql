-- Update applications status constraint to allow 'submitted'
ALTER TABLE public.applications
DROP CONSTRAINT applications_status_check;

ALTER TABLE public.applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('pending', 'submitted', 'accepted', 'rejected'));