
-- Create a new bucket for storing user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Set up a policy to allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = SUBSTRING(name FROM 'avatars/([^/]+)')::uuid);

-- Allow public read access to avatars
CREATE POLICY "Public access to avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
