supabase_project_url: https://emkxinzasmmhwxfgagyh.supabase.co
supabase_anon_key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVta3hpbnphc21taHd4ZmdhZ3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzQ1MDYsImV4cCI6MjA2ODY1MDUwNn0.csLhXj1dLKRoKcvoY0RJDiijBORfXGKeQkU80er_pUw
vercel_project_name: voiceCast
github_repo: TAKAI040/voiceCast

## 既知の課題

### Supabase Googleログインのリダイレクト問題（一時的な解決策）

**問題:**
Googleログイン後、本来のコールバックページ (`/auth/callback/`) を経由せず、直接ユーザー画面（ルートパス `/`）またはログイン画面 (`/login?error=true`) にリダイレクトされる問題が発生していた。

**現在の解決策（一時的）:**
Supabaseダッシュボードの `Authentication` -> `Settings` にある `Site URL` を、アプリケーションのルートURLではなく、**管理画面のパスを含むURL** に設定することで、Googleログイン後に直接管理画面にリダイレクトされるようになった。

例: `https://voicecast-q9ninplxm-takas-projects-ebc9ff02.vercel.app/admin`

**この解決策が一時的である理由（今後の課題）:**
1.  **役割の混同:** `Site URL` は本来、アプリケーションのルートURLを設定する場所であり、特定の保護されたページ（`/admin`）を設定するのはSupabaseの認証フローの意図と異なる。
2.  **専用コールバックハンドラのバイパス:** `app/auth/callback/page.tsx` はOAuth認証後のトークン処理を専門に行うために作成されたが、`Site URL` を `/admin` に設定することで、このハンドラが実質的にバイパスされている。
3.  **柔軟性の欠如:** 将来的に認証フローが複雑化したり、他のリダイレクトパスが必要になったりした場合に、この設定が制約となる可能性がある。
4.  **セキュリティのベストプラクティス:** OAuthのコールバックURLは、可能な限り特定のパスに限定することが推奨される。

**今後の課題:**
Supabaseの `Site URL` をアプリケーションのルートURL（例: `https://voicecast-q9ninplxm-takas-projects-ebc9ff02.vercel.app/`）に設定し、`app/auth/callback/page.tsx` がGoogle認証後のリダイレクトを正しく処理し、意図した `/admin` ページにリダイレクトされるようにする。これには、Supabaseが認証後にURLのハッシュフラグメント (`#access_token=...`) を正しく付与してリダイレクトする挙動を再確認し、必要であればアプリケーション側のコールバック処理を調整する必要がある。