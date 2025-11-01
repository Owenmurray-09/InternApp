-- Add contact information columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Verify the columns were added
\d applications;