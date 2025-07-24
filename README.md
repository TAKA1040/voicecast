# VoiceCast - 音声配信プラットフォーム

VoiceCastは、配信者が管理画面から音声エピソードを登録し、ユーザーがWebブラウザから再生できるシンプルな音声配信プラットフォームです。

---

## 🚨 **重要: プロジェクトを理解するための第一歩**

このプロジェクトの技術的な詳細、設計思想、運用ルールは、すべて `/docs` フォルダに集約されています。

**開発・保守・改修など、このプロジェクトに関わる全ての関係者は、作業に着手する前に、必ず以下のドキュメント群に目を通してください。**

`/docs` フォルダは、本ツールの信頼性と継続性を支える最も重要な資産です。

### 📘 中核ドキュメントへのクイックリンク

- **[プロジェクト概要・設計思想 (`OVERVIEW.md`)](./docs/OVERVIEW.md)**: まず最初にここを読んでください。
- **[認証フローと設定 (`AUTH_SETUP.md`)](./docs/AUTH_SETUP.md)**: Google OAuthを含む認証の仕組みについて。
- **[デプロイと環境管理 (`DEPLOY_FLOW.md`)](./docs/DEPLOY_FLOW.md)**: Vercelへのデプロイ手順と環境変数について。
- **[デバッグガイド (`DEBUG_GUIDE.md`)](./docs/DEBUG_GUIDE.md)**: エラー発生時の対処法。
- **[運用ルール (`OPERATION_RULES.md`)](./docs/OPERATION_RULES.md)**: 全関係者が遵守すべきルール。

---

## ✨ 技術スタック

このプロジェクトは、堅牢性と開発者体験を重視し、以下のモダンな技術スタックで構築されています。

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **認証・バックエンド**: Supabase (Auth, Database, Storage)
- **認証ライブラリ**: `@supabase/ssr`
- **スタイリング**: Tailwind CSS
- **ホスティング**: Vercel

---

## 🚀 ローカル開発環境のセットアップ

1.  **リポジトリをクローン:**
    ```bash
    git clone https://github.com/TAKA1040/voiceCast.git
    cd voiceCast
    ```

2.  **依存関係をインストール:**
    ```bash
    npm install
    ```

3.  **環境変数を設定:**
    - プロジェクトルートに `.env.local` という名前のファイルを作成します。
    - VercelまたはSupabaseのダッシュボードから取得した環境変数をコピーします。
    ```
    NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
    ```

4.  **開発サーバーを起動:**
    ```bash
    npm run dev
    ```

5.  **ブラウザで確認:**
    - `http://localhost:3000` にアクセスすると、トップページが表示されます。
    - `http://localhost:3000/login` にアクセスすると、ログインページが表示されます。

---

## 🌐 主要なルート

- `/`: ユーザー向けのトップページ（将来的にエピソード一覧が表示される）
- `/login`: 管理者向けのログインページ
- `/admin`: 【要認証】音声のアップロードと管理を行うダッシュボード
- `/api/auth/callback`: Google OAuth認証後にリダイレクトされるAPIルート