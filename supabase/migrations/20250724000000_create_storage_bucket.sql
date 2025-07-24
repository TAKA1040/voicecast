-- 1. "audio" バケットを作成 (パブリックアクセスを許可)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 既存のポリシーを削除 (冪等性を確保するため)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON storage.objects;

-- 3. 新しいRLSポリシーを設定
-- 認証済みユーザーのみが "audio" バケットにアップロードできる
CREATE POLICY "Enable insert for authenticated users" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- 自分の音声ファイルのみ更新できる
CREATE POLICY "Enable update for users based on user_id" ON storage.objects
  FOR UPDATE USING (bucket_id = 'audio' AND auth.uid() = owner);

-- 自分の音声ファイルのみ削除できる
CREATE POLICY "Enable delete for users based on user_id" ON storage.objects
  FOR DELETE USING (bucket_id = 'audio' AND auth.uid() = owner);
