# VoiceCast - 音声配信プラットフォーム

## 概要

VoiceCastは、配信者が管理画面から音声エピソードを登録し、ユーザーがWebブラウザから再生できるシンプルな音声配信プラットフォームです。

## 技術スタック

- **フロントエンド**: HTML, CSS (各HTMLファイル内に内包), JavaScript
- **バックエンド**: Supabase (データベース, 認証, ストレージ)

## プロジェクト構成

```
voiceCast/
├─ user/
│  └─ index.html           # ユーザー向け再生画面
│
├─ admin/
│  ├─ login.html           # 配信者ログイン画面
│  └─ admin.html           # 管理ダッシュボード & 音声アップロード
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
2. 各HTMLファイル（`user/index.html`, `admin/login.html`, `admin/admin.html`）をWebブラウザで開きます。
   - `admin/login.html` から配信者としてログインし、エピソードのアップロード・管理が可能です。
   - `user/index.html` で公開されているエピソードを閲覧・再生できます。

## 操作マニュアル

### 配信者向け操作

1. **ログイン**: `admin/login.html` にアクセスし、登録済みのメールアドレスとパスワードでログインします。
2. **エピソードアップロード**: ログイン後、`admin/admin.html` に遷移します。音声ファイルをドラッグ＆ドロップまたはファイル選択でアップロードし、タイトル、説明、ジャンルを入力して「公開する」ボタンをクリックします。

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
