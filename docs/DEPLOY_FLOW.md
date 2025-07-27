# デプロイフローと環境管理

## 1. デプロイの仕組み

本プロジェクトは、**Git-based Workflow** を採用しています。

1.  **開発**: ローカル環境でコードの変更を行います。
2.  **プッシュ**: 変更内容をGitHubリポジトリの `master` ブランチにプッシュします。
3.  **自動デプロイ**: GitHubへのプッシュをトリガーとして、**Firebase Hostingが自動的にビルドとデプロイを開始します。**
4.  **公開**: ビルドが成功すると、変更内容が本番環境 (`https://voicecast.web.app` またはカスタムドメイン) に公開されます。

## 2. Firebase Hosting プロジェクト設定

Firebase Hostingの設定は、プロジェクトルートの `firebase.json` によって管理されています。

```json
// firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "asia-northeast1"
    }
  }
}
```

この `frameworksBackend` 設定により、Firebase CLIは自動でNext.jsアプリケーションを認識し、ビルド、最適化、デプロイ（SSR部分はCloud Runへ、静的アセットはHosting CDNへ）をすべて行ってくれます。

## 3. 環境変数管理

Firebaseの接続情報などの機密情報は、環境変数として管理します。

- **ローカル開発**: プロジェクトルートの `.env.local` ファイルに記述します。このファイルは `.gitignore` によってGitの管理対象外となっています。
- **本番環境 (Cloud Run)**: Next.jsのサーバーサイドで必要な環境変数は、Cloud Runの環境変数として設定する必要があります。Firebase Hostingのフレームワーク統合機能では、デプロイ時に特定の `.env` ファイルを読み込ませることも可能です。

**必須の環境変数 (.env.local):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

これらの値は、Firebaseコンソールのプロジェクト設定画面から取得できます。

## 4. 手動デプロイ

ローカル環境から手動でデプロイを実行する場合は、以下のコマンドを使用します。

```bash
firebase deploy --only hosting
```