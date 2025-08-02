-- 🚨 緊急修正：エピソードのパブリック表示を許可
-- Supabase Dashboard の SQL Editor で実行してください

-- 既存のポリシーを確認
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'episodes';

-- パブリック読み取りポリシーを作成（既存があれば上書き）
DROP POLICY IF EXISTS "Public can view episodes" ON episodes;

CREATE POLICY "Public can view episodes" ON episodes
FOR SELECT 
USING (true);

-- 確認クエリ
SELECT 'Policy created successfully' as status;

-- テストクエリ（匿名ユーザーとして実行）
-- これがエラーなく実行できれば修正成功
SET ROLE anon;
SELECT id, title, created_at FROM episodes ORDER BY created_at DESC;
RESET ROLE;