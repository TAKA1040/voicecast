# 作業開始時の必須ルール

- このプロジェクト（C:\Windsurf\voiceCast）で作業を開始する際は、**必ず下記2点を最初に確認してください**。
  1. `docs`フォルダ内の最新ルール・運用ドキュメント（例：TASKS.md、voiceCast_設計書.md など）
  2. プロジェクトルート直下の `GEMINI.md`
- これらのファイル・ドキュメントに運用上の注意点や最新ルールが記載されています。**確認を怠るとプロジェクト全体の運用や成果物に影響します。**
- 内容に不明点や変更があった場合は、必ず運用チームへ速やかに共有・相談してください。
- 迷った場合や方針が不明な場合は、まず `GEMINI.md` の最新ルールを最優先で遵守してください。

---

## ✅ 作業前チェックリスト

- [ ] `docs`フォルダ内のルール・ドキュメントを確認した
- [ ] `GEMINI.md`を確認した
- [ ] 内容に疑問点や不明点があれば、すぐ運用チームに連絡した

---

## 概要

VoiceCastは、配信者が管理画面から音声エピソードを登録し、ユーザーがWebブラウザから再生できるシンプルな音声配信プラットフォームです。

## 技術スタック

- **フロントエンド**: HTML, CSS (各HTMLファイル内に内包), JavaScript
- **バックエンド**: Supabase (データベース, 認証, ストレージ)

## プロジェクト構成

```
voiceCast/
├─ public/
│  ├─ user/
│  │  └─ index.html           # ユーザー向け再生画面
│  │
│  ├─ admin/
│  │  ├─ login.html           # 配信者ログイン画面
│  │  └─ admin.html           # 管理ダッシュボード & 音声アップロード
│
├─ scripts/
│  └─ supabase.js          # Supabase 初期化 & 共通 API ラッパー
│
├─ assets/
│  ├─ images/              # サムネイル・UI画像など
│  └─ audio/               # （オフライン開発用）サンプル音声
│
└─ docs/
   ├─ TASKS.md             # 開発タスクリスト
   ├─ voiceCast_設計書.md  # プロジェクト設計書
   └─ RLS_Policy_説明書.md # Supabase RLSポリシー設定説明書
```

## 導入手順

### 1. Supabaseプロジェクトのセットアップ

1. Supabaseのウェブサイトにアクセスし、新しいプロジェクトを作成します。
2. **Region** は「Tokyo」を推奨します。
3. **RLS (Row Level Security)** はデフォルトで有効（ON）になっていることを確認してください。

### 2. データベーステーブルの作成

SupabaseプロジェクトのSQLエディタで、以下のSQLを実行して `episodes` テーブルを作成します。

```sql
create table episodes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  genre       text,
  audio_url   text not null,
  created_at  timestamp with time zone default now()
);
```

### 3. ストレージバケットの作成

SupabaseプロジェクトのStorageセクションで、新しいバケットを作成します。バケット名は `audio` としてください。

### 4. Supabase接続情報の更新

`scripts/supabase.js` ファイルを開き、以下の箇所をあなたのSupabaseプロジェクトの情報に置き換えます。

```javascript
// Supabase 初期化
const supabase = supabase.createClient(
  'https://<PROJECT>.supabase.co',
  '<PUBLIC_ANON_KEY>'
);
```

- `https://<PROJECT>.supabase.co`: あなたのSupabaseプロジェクトのURLに置き換えます。Supabaseダッシュボードの「Settings」→「API」ページで確認できます。
- `<PUBLIC_ANON_KEY>`: あなたのSupabaseプロジェクトのPublic Anon Keyに置き換えます。同APIページで確認できます。

### 5. ローカルでの実行

1. プロジェクトファイルをローカル環境に配置します。
2. 各HTMLファイル（`public/user/index.html`, `public/admin/login.html`, `public/admin/admin.html`）をWebブラウザで開きます。
   - `public/admin/login.html` から配信者としてログインし、エピソードのアップロード・管理が可能です。
   - `public/user/index.html` で公開されているエピソードを閲覧・再生できます。

## 操作マニュアル

### 配信者向け操作

1. **ログイン**: `public/admin/login.html` にアクセスし、登録済みのメールアドレスとパスワードでログインします。
2. **エピソードアップロード**: ログイン後、`public/admin/admin.html` に遷移します。音声ファイルをドラッグ＆ドロップまたはファイル選択でアップロードし、タイトル、説明、ジャンルを入力して「公開する」ボタンをクリックします。

### ユーザー向け操作

1. **エピソード閲覧**: `user/index.html` にアクセスすると、公開されているエピソードの一覧が表示されます。
2. **エピソード再生**: 各エピソードカードの再生ボタンをクリックすると、音声が再生されます。

## セキュリティに関する注意

- `PUBLIC_ANON_KEY` などの機密情報は、公開リポジトリに直接コミットしないでください。開発時はローカルの `.env` ファイルを使用し、本番環境ではVercelなどの環境変数機能を利用することを推奨します。
- RLSポリシーが正しく設定されていることを確認し、認証されていないアクセスからデータを保護してください。

## 困ったときは

- **ログインできない**: メールアドレスまたはパスワードが間違っている可能性があります。Supabaseの認証設定を確認してください。
- **エピソードがアップロードできない**: Supabase Storageのバケット設定（特にパーミッション）を確認してください。また、RLSポリシーにより認証されていないユーザーはアップロードできません。
- **エピソードが表示されない**: `scripts/supabase.js` のSupabase接続情報が正しいか確認してください。また、`episodes` テーブルにデータが登録されているか、RLSポリシーが読み取りを許可しているかを確認してください。

### 【運用経緯の追記】

#### `/public` ディレクトリを含む rewrite 設定の理由

- Vercel公式では `"outputDirectory": "public"` の場合、rewrite destination に `/public` は不要とされています。
- しかし実際のデプロイ環境では、destinationに `/public` を明記しないと404エラー等の問題が頻発しました。
- 多数回の検証の結果、「/public」付きのrewrite設定のみ現実に動作したため、例外運用として採用しています。
- 将来的な構成変更時もこの経緯を参考にしてください。

### 【運用経緯の追記】
