-- 🎯 最も簡単な修正：RLSを一時的に無効化

-- episodesテーブルのRLSを無効化
ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;

-- 確認
SELECT 'RLS disabled for episodes table' as status;