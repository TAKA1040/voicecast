#!/bin/bash

# VoiceCast プロジェクト セットアップスクリプト
# CLI連携重視の効率的セットアップ

set -e

echo "🚀 VoiceCast セットアップ開始..."

# 必要なCLIツールの確認
check_cli() {
    local cmd=$1
    local name=$2
    
    if ! command -v $cmd &> /dev/null; then
        echo "❌ $name が見つかりません"
        echo "インストール方法: https://docs.${name}.com"
        exit 1
    else
        echo "✅ $name 確認完了"
    fi
}

echo "📋 必須CLIツールの確認..."
check_cli "node" "Node.js"
check_cli "npm" "npm"
check_cli "git" "Git"
check_cli "gh" "GitHub CLI"
check_cli "supabase" "Supabase CLI"
check_cli "vercel" "Vercel CLI"

# パッケージインストール
echo "📦 依存関係のインストール..."
npm install

# Supabaseプロジェクトのリンク
echo "🔗 Supabaseプロジェクトにリンク..."
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "⚠️  SUPABASE_ACCESS_TOKEN が設定されていません"
    echo "手動でリンクしてください: supabase link --project-ref emkxinzasmmhwxfgagyh"
else
    supabase link --project-ref emkxinzasmmhwxfgagyh
fi

# Vercelプロジェクトのリンク
echo "🔗 Vercelプロジェクトにリンク..."
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN が設定されていません"
    echo "手動でリンクしてください: vercel link"
else
    vercel link --yes
fi

# 環境変数の確認
echo "🔍 環境変数の確認..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local ファイルが見つかりません"
    echo "サンプルファイルを作成中..."
    cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local
fi

# 型定義の生成
echo "🏗️  Supabase型定義を生成..."
if command -v supabase &> /dev/null && [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    supabase gen types typescript --linked > lib/supabase.types.ts || echo "⚠️  型定義生成をスキップ"
fi

# 開発サーバーの準備確認
echo "🧪 開発環境の準備確認..."
npm run build || echo "⚠️  ビルドエラーあり - 環境変数を確認してください"

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "📝 次のステップ:"
echo "1. .env.local ファイルに環境変数を設定"
echo "2. supabase link --project-ref emkxinzasmmhwxfgagyh (未実行の場合)"
echo "3. vercel link (未実行の場合)"
echo "4. npm run dev でローカル開発開始"
echo ""
echo "🔧 便利なコマンド:"
echo "- npm run dev      : 開発サーバー起動"
echo "- npm run build    : 本番ビルド"
echo "- npm run db:push  : データベース更新"
echo "- npm run deploy   : 本番デプロイ"