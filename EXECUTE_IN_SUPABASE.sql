-- Supabase Dashboard の SQL Editor で以下を実行してください
-- これでエピソードファイル表示問題が解決します

-- 1. ストレージバケット修正
DELETE FROM storage.objects WHERE bucket_id = 'audio';
DELETE FROM storage.buckets WHERE id = 'audio';

INSERT INTO storage.buckets (id, name, public) VALUES ('audios', 'audios', true);

-- 2. ストレージポリシー追加
CREATE POLICY IF NOT EXISTS "Public can view audio files" ON storage.objects 
FOR SELECT USING (bucket_id = 'audios');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload audio files" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audios');

-- 3. 不足カラムの追加
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. 既存データの更新
UPDATE episodes 
SET published_at = created_at 
WHERE published_at IS NULL;

-- 5. 確認クエリ
SELECT 'Episodes count:' as info, count(*) as value FROM episodes
UNION ALL
SELECT 'Buckets:' as info, array_to_string(array_agg(name), ', ') as value FROM storage.buckets;