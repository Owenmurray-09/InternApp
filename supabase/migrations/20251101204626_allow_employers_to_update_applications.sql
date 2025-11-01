-- Allow employers to update application status for jobs they own
-- This fixes the issue where Accept/Reject buttons don't work due to RLS policies

-- Create policy to allow employers to update applications for their own jobs
CREATE POLICY "Employers can update applications for their jobs" ON applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM jobs
    INNER JOIN companies ON jobs.company_id = companies.id
    WHERE jobs.id = applications.job_id
    AND companies.owner_user_id = auth.uid()
  )
);