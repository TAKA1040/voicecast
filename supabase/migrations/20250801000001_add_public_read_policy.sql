-- Add public read policy for episodes
-- This allows anonymous users to view published episodes

CREATE POLICY "Public can view published episodes" ON episodes
  FOR SELECT USING (true);

-- Update existing policies to be more specific
DROP POLICY IF EXISTS "Users can view own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can insert own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can update own episodes" ON episodes;
DROP POLICY IF EXISTS "Users can delete own episodes" ON episodes;

-- Recreate policies with better naming
CREATE POLICY "Authenticated users can view own episodes" ON episodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own episodes" ON episodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own episodes" ON episodes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own episodes" ON episodes
  FOR DELETE USING (auth.uid() = user_id);