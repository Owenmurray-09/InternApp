-- Create the job-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-images',
  'job-images',
  true,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Create policy to allow public read access to job images
CREATE POLICY "Public read access for job images" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');

-- Create policy to allow authenticated users to upload job images
CREATE POLICY "Authenticated users can upload job images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'job-images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update their own job images
CREATE POLICY "Users can update their own job images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'job-images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete their own job images
CREATE POLICY "Users can delete their own job images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'job-images'
  AND auth.role() = 'authenticated'
);