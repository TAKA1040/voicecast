# CLI連携重視の効率的コード生成標準

## 基本方針
Claude Code、Gemini CLI、その他AI開発支援ツールは、以下のCLI連携を最優先として効率的なコード生成を行う。

## 必須CLI連携ツール

### 1. GitHub Actions (自動化の中核)
```yaml
# 必須ワークフロー例
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
      - name: Update Supabase
        run: supabase db push
```

**活用原則:**
- すべてのデプロイメントをGitHub Actionsで自動化
- テスト → ビルド → デプロイのパイプラインを必須とする
- 手動デプロイメントは開発時のみ許可

### 2. GitHub CLI (リポジトリ操作)
```bash
# 必須コマンドパターン
gh repo create --public --clone
gh pr create --title "Feature: Add authentication" --body "Implements OAuth flow"
gh issue create --title "Bug: Storage bucket mismatch" --label bug
gh workflow run ci.yml
```

**活用原則:**
- プルリクエスト作成の自動化
- イシュー管理の効率化
- ワークフロー実行の自動化

### 3. Supabase CLI (データベース・認証管理)
```bash
# 必須操作パターン
supabase init
supabase start
supabase db push
supabase gen types typescript --local > lib/database.types.ts
supabase functions deploy
supabase link --project-ref [project-id]
```

**活用原則:**
- マイグレーションは必ずCLIで管理
- 型定義の自動生成を活用
- ローカル開発環境を必ず構築

### 4. Vercel CLI (デプロイメント管理)
```bash
# 必須デプロイパターン
vercel --prod
vercel env add SUPABASE_URL
vercel domains add example.com
vercel logs --follow
```

**活用原則:**
- 本番デプロイメントはCLIで管理
- 環境変数はCLIで設定
- ログ監視を積極活用

## 効率的コード生成ルール

### Rule 1: CLI-First アプローチ
- 手動操作よりもCLIコマンドを優先提案
- GUIでの操作説明は最小限に留める
- スクリプト化可能な手順を常に提供

### Rule 2: 自動化前提の設計
```bash
# 例：ワンコマンドセットアップ
#!/bin/bash
npm install
supabase start
vercel link
gh repo clone
```

### Rule 3: 型安全性の確保
```bash
# Supabaseからの型生成を必須とする
supabase gen types typescript --linked > lib/supabase.types.ts
```

### Rule 4: 環境構築の標準化
```json
// package.json scripts section
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "supabase db push",
    "db:pull": "supabase db pull",
    "db:reset": "supabase db reset",
    "deploy": "vercel --prod",
    "setup": "./scripts/setup.sh"
  }
}
```

## プロジェクト構造標準

```
project/
├── .github/
│   └── workflows/
│       ├── ci.yml (必須)
│       ├── deploy.yml (必須)
│       └── supabase-sync.yml (推奨)
├── supabase/
│   ├── config.toml (必須)
│   ├── migrations/ (必須)
│   └── functions/ (推奨)
├── scripts/
│   ├── setup.sh (必須)
│   ├── deploy.sh (推奨)
│   └── db-sync.sh (推奨)
└── vercel.json (必須)
```

## コマンド優先順位

### 高優先度 (必ず使用)
1. `git` - バージョン管理
2. `gh` - GitHub操作
3. `supabase` - データベース管理
4. `vercel` - デプロイメント
5. `npm`/`yarn` - パッケージ管理

### 中優先度 (積極活用)
1. `docker` - 環境統一
2. `curl` - API テスト  
3. `jq` - JSON処理
4. `grep`/`rg` - コード検索

### 低優先度 (必要時のみ)
1. GUI ツール操作
2. 手動ファイル編集
3. ブラウザでの設定変更

## エラーハンドリング標準

```bash
# 例：堅牢なデプロイスクリプト
#!/bin/bash
set -e  # エラー時停止

echo "🚀 Starting deployment..."

# 事前チェック
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not installed"
    exit 1
fi

# テスト実行
npm test || {
    echo "❌ Tests failed"
    exit 1
}

# デプロイ実行
vercel --prod || {
    echo "❌ Deployment failed"
    exit 1
}

echo "✅ Deployment successful"
```

## 実装時の必須チェックリスト

- [ ] GitHub Actions ワークフローが設定されている
- [ ] Supabase マイグレーションがCLIで管理されている  
- [ ] Vercel デプロイメントが自動化されている
- [ ] 環境変数がCLIで管理されている
- [ ] 型定義が自動生成されている
- [ ] エラーハンドリングが適切に実装されている
- [ ] ログ出力が適切に設定されている
- [ ] ドキュメントにCLIコマンド例が記載されている

## 禁止事項

### ❌ 避けるべき手法
- 手動でのファイルアップロード
- GUIでの設定変更（緊急時以外）
- ハードコードされた設定値
- CLI未対応のワークフロー提案
- 型定義の手動管理
- 手動でのデプロイメント（開発時以外）

### ✅ 推奨する手法
- すべての操作をCLIで実行
- 設定のコード化（Infrastructure as Code）
- 自動化されたテストとデプロイ
- 型安全性の確保
- 環境の標準化
- 継続的インテグレーション

---

**この標準に従うことで、開発効率とコード品質の両方を最大化する。**