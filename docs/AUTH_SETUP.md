# 認証設計・設定ガイド

## 1. 認証フロー概要

本アプリケーションの認証は、`@supabase/ssr` ライブラリを利用して、サーバーサイドでセッションを安全に管理する方式を採用しています。Cookieを利用してセッション情報をやり取りします。

1.  **ログイン試行**: ユーザーがログインページ (`/login`) で認証情報（メール/パスワード or Google OAuth）を入力します。
2.  **Supabaseへのリダイレクト**: Google OAuthの場合、ユーザーはSupabaseの認証エンドポイントにリダイレクトされます。
3.  **コールバック処理**: 認証成功後、SupabaseはアプリケーションのAPIルート (`/api/auth/callback`) にリダイレクトします。
4.  **セッション生成**: コールバックAPIは、受け取った認証コードをSupabaseに送信し、セッショントークンと交換します。このセッションは安全なHTTP Only Cookieとしてブラウザに保存されます。
5.  **管理画面へリダイレクト**: セッション生成後、ユーザーは管理画面 (`/admin`) にリダイレクトされます。

## 2. Google OAuth 設定要点

Googleログインを機能させるには、Google Cloud ConsoleとSupabaseの両方で設定が必要です。

### 2.1. Google Cloud Console

- **対象クライアントID**: `OAuth 2.0 クライアントID`
- **承認済みのリダイレクトURI**: 以下の2つが**必須**です。
    1.  `https://emkxinzasmmhwxfgagyh.supabase.co/auth/v1/callback` (Supabaseが内部的に使用)
    2.  `https://voicecast.vercel.app/api/auth/callback` (Next.jsアプリのコールバックAPI)

### 2.2. Supabase ダッシュボード

- **場所**: `Authentication` -> `Providers` -> `Google`
- **設定**:
    - `Enabled`: ONにする必要があります。
    - `Client ID`, `Client Secret`: Google Cloud Consoleで取得した値を正確に設定します。

## 3. セッション管理

### 3.1. サーバーコンポーネントでの認証チェック

保護したいページ（例: `app/admin/page.tsx`）では、ページの冒頭でサーバーサイドのSupabaseクライアントを使い、認証状態をチェックします。

```typescript
// in app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login') // 未認証ならログインページへ
  }
  // ... 認証済みユーザー向けの処理
}
```

### 3.2. クライアントコンポーネントでのセッション利用

クライアントコンポーネント (`'use client'`) 内で認証情報が必要な場合は、クライアント用のSupabaseクライアントを使用します。

```typescript
// in components/admin-form.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'

export default function AdminForm({ user }: { user: User }) {
  const supabase = createClient()
  // ...
}
```
