# RLS (Row Level Security) ポリシー設計

本プロジェクトでは、データベースとストレージのセキュリティを確保するため、SupabaseのRLSを全面的に活用します。基本方針は**「デフォルトで全拒否、許可する操作を明示的に定義する」**です。

## 1. 設計思想

- **データの所有権**: `episodes` テーブルやストレージ内のオブジェクトは、すべて特定のユーザー (`user_id`) に紐づきます。
- **操作の制限**: ユーザーは、原則として自身が所有するデータ（`auth.uid() = user_id`）に対してのみ、書き込み・更新・削除が可能です。
- **読み取りの分離**: データの読み取り（SELECT）は、認証済みユーザーであれば、他のユーザーのデータも含めて許可します。（例: ユーザー向け再生画面）

## 2. `episodes` テーブルのRLSポリシー

- **ファイルパス**: `supabase/migrations/` 内のSQLファイルで管理
- **ポリシー一覧**:

```sql
-- ログインしているユーザーは全てのエピソードを読み取れる
CREATE POLICY "Enable read access for authenticated users"
ON public.episodes
FOR SELECT USING (auth.role() = 'authenticated');

-- 自身のuser_idでのみエピソードを作成できる
CREATE POLICY "Enable insert for authenticated users"
ON public.episodes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自身の_idを持つエピソードのみ更新できる
CREATE POLICY "Enable update for users based on user_id"
ON public.episodes
FOR UPDATE USING (auth.uid() = user_id);

-- 自身のuser_idを持つエピソードのみ削除できる
CREATE POLICY "Enable delete for users based on user_id"
ON public.episodes
FOR DELETE USING (auth.uid() = user_id);
```

## 3. `storage.objects` (ストレージ) のRLSポリシー

- **ファイルパス**: `supabase/migrations/` 内のSQLファイルで管理
- **ポリシー一覧**:

```sql
-- 認証済みユーザーのみが "audios" バケットにアップロードできる
CREATE POLICY "Enable insert for authenticated users"
ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audios' AND auth.role() = 'authenticated');

-- 自身の音声ファイルのみ更新できる
CREATE POLICY "Enable update for users based on user_id"
ON storage.objects
FOR UPDATE USING (bucket_id = 'audios' AND auth.uid() = owner);

-- 自身の音声ファイルのみ削除できる
CREATE POLICY "Enable delete for users based on user_id"
ON storage.objects
FOR DELETE USING (bucket_id = 'audios' AND auth.uid() = owner);
```
