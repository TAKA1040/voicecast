# 変更履歴 (Changelog)

## [2025-07-27] - v3.0.0 - Firebaseへの移行

### Added
- **Firebase SDK**: `firebase` と `firebase-admin` を導入。
- **Firebase設定ファイル**: `.firebaserc`, `firebase.json`, `firestore.rules` を追加。
- **`useAuth` カスタムフック**: `onAuthStateChanged` を利用したクライアントサイドの認証状態管理フックを導入。
- **Firebaseクライアント**: `lib/firebase/client.ts` を作成し、Firebaseサービスの初期化処理を実装。

### Changed
- **バックエンド**: Supabaseから **Firebase** (Firestore, Authentication, Storage) に完全に移行。
- **認証フロー**: `@supabase/ssr` によるサーバーサイド認証から、Firebase SDKによるクライアントサイド認証に変更。
- **データベースアクセス**: SupabaseのクエリをすべてFirestoreのクエリ (`getDocs`, `addDoc`など) に置き換え。
- **ストレージアクセス**: Supabase Storageの処理をCloud Storageの処理 (`ref`, `uploadBytes`, `getDownloadURL`) に置き換え。
- **デプロイ**: Vercelから **Firebase Hosting** に移行。`firebase.json` でNext.jsのフレームワーク統合機能を設定。
- **環境変数**: Supabase関連の変数を廃止し、Firebase Webアプリ設定用の環境変数に変更。
- **ドキュメント**: `docs/` 以下のすべてのドキュメントをFirebaseベースの構成に合わせて更新。

### Removed
- **Supabaseライブラリ**: `@supabase/ssr`, `@supabase/supabase-js` を削除。
- **Supabase関連ファイル**: `lib/supabase`, `app/api/auth` ディレクトリを削除。
- **`RLS_POLICIES.md`**: `SECURITY_RULES.md` に名称変更し、内容をFirestoreのルールに刷新。

---

## [2025-07-24] - v2.0.0 - Next.jsへの抜本的再構築

### Added
- **`docs/` フォルダ**: プロジェクトの設計・運用資産として、ドキュメント群を再構築。
- **Next.js (App Router)**: プロジェクトのフレームワークを導入し、モダンなWebアプリケーションとして刷新。
- **TypeScript**: プロジェクト全体に静的型付けを導入。
- **Tailwind CSS**: スタイリングを全面的に刷新。
- **`@supabase/ssr`**: サーバーサイドでの安全な認証フローを確立。
- **サーバーコンポーネントとクライアントコンポーネント**: Next.jsのベストプラクティスに基づき、責務を分離。
- **Supabase CLI連携**: `supabase/migrations` によるデータベーススキーマ管理の基盤を導入。

### Changed
- **アーキテクチャ**: 静的HTML/CSS/JSの集合体から、Next.jsアプリケーションに完全に移行。
- **認証フロー**: クライアントサイドのみの実装から、サーバーサイドを含む堅牢な認証フローに変更。
- **管理画面**: UI/UXを全面的に改善し、Reactコンポーネントとして再実装。
- **デプロイ設定**: `vercel.json` を導入し、VercelのビルドプロセスをNext.js用に明示的に構成。

### Removed
- **旧 `public/` ディレクトリ**: 静的サイト時代のHTML/CSS/JSファイルをすべて削除（`backup_static` に保管）。
- **旧 `scripts/` ディレクトリ**: グローバルな `supabase.js` を廃止し、`lib/supabase/` 以下のモジュールに置き換え。
- **ミドルウェア (`middleware.ts`)**: Edge Runtimeでの不安定性を考慮し、認証チェックを各ページのサーバーコンポーネントで行う方式に変更。

---

## [2025-07-21] - v1.0.0 - 初期静的サイト構成

### Added
- 静的HTML/CSS/JSによる初期バージョンを作成。
- Supabase DB, Auth, Storageの基本的な連携を実装。