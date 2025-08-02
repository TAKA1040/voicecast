-- Fix storage bucket name mismatch (audio -> audios)
-- This resolves the critical issue where uploaded files are not accessible

-- Drop the incorrectly named "audio" bucket if it exists
DELETE FROM storage.objects WHERE bucket_id = 'audio';
DELETE FROM storage.buckets WHERE id = 'audio';

-- Create the correct "audios" bucket that the application expects
INSERT INTO storage.buckets (id, name, public) VALUES ('audios', 'audios', true);

-- Create policy for public read access to audio files
CREATE POLICY "Public can view audio files" ON storage.objects 
FOR SELECT USING (bucket_id = 'audios');

-- Create policy for authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audios');

-- Create policy for users to update their own audio files
CREATE POLICY "Users can update own audio files" ON storage.objects 
FOR UPDATE TO authenticated USING (bucket_id = 'audios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to delete their own audio files
CREATE POLICY "Users can delete own audio files" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id = 'audios' AND auth.uid()::text = (storage.foldername(name))[1]);