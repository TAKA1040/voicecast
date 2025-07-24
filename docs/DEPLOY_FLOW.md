# デプロイフローと環境管理

## 1. デプロイの仕組み

本プロジェクトは、**Git-based Workflow** を採用しています。

1.  **開発**: ローカル環境でコードの変更を行います。
2.  **プッシュ**: 変更内容をGitHubリポジトリの `master` ブランチにプッシュします。
3.  **自動デプロイ**: GitHubへのプッシュをトリガーとして、Vercelが自動的にビルドとデプロイを開始します。
4.  **公開**: ビルドが成功すると、変更内容が本番環境 (`https://voicecast.vercel.app`) に公開されます。

## 2. Vercel プロジェクト設定

Vercel側の設定は、プロジェクトルートの `vercel.json` によって明示的に管理されています。

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

この設定により、VercelのUI上の古い設定（静的サイト時代のもの）が上書きされ、このプロジェクトがNext.jsアプリケーションとして正しく認識・ビルドされることが保証されます。

## 3. 環境変数管理

Supabaseの接続情報などの機密情報は、環境変数として管理します。

- **ローカル開発**: プロジェクトルートの `.env.local` ファイルに記述します。このファイルは `.gitignore` によってGitの管理対象外となっています。
- **本番環境 (Vercel)**: Vercelのプロジェクト設定画面 (`Settings` -> `Environment Variables`) で設定します。

**必須の環境変数:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

これらの値が設定されていない場合、Vercelでのビルドは失敗します。

## 4. Supabase スキーマ変更

データベースのテーブル定義やRLSポリシーの変更は、`supabase/migrations/` 以下のSQLファイルで管理します。

変更を本番環境に適用する際は、Supabase CLIの `db push` コマンドを使用します。
**注意:** 直接本番DBを操作する危険なコマンドのため、実行前に十分なレビューが必要です。
