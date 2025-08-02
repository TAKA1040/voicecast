#!/bin/bash

# 自動修正スクリプト - Supabase Service Role Key を使用

echo "🚀 Supabase自動修正スクリプト"
echo "==============================="

# Service Role Key の確認
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY が設定されていません"
    echo ""
    echo "手動で実行してください:"
    echo "1. Supabase Dashboard → Settings → API"
    echo "2. Service Role Key をコピー"  
    echo "3. export SUPABASE_SERVICE_ROLE_KEY='your_key_here'"
    echo "4. このスクリプトを再実行"
    echo ""
    echo "または、Supabase Dashboard の SQL Editor で以下のファイルを実行:"
    echo "EXECUTE_IN_SUPABASE.sql"
    exit 1
fi

echo "✅ Service Role Key 確認完了"

# プロジェクトID
PROJECT_REF="emkxinzasmmhwxfgagyh"
BASE_URL="https://${PROJECT_REF}.supabase.co"

echo "🔧 ストレージバケット修正中..."

# 1. 古いバケットを削除
curl -X DELETE "${BASE_URL}/storage/v1/bucket/audio" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json"

# 2. 新しいバケットを作成
curl -X POST "${BASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "audios",
    "name": "audios", 
    "public": true,
    "allowed_mime_types": ["audio/*"],
    "file_size_limit": 52428800
  }'

echo "📊 データベースマイグレーション実行中..."

# 3. データベーススキーマ修正
SQL_QUERY="
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE episodes 
SET published_at = created_at 
WHERE published_at IS NULL;
"

curl -X POST "${BASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL_QUERY}\"}"

echo ""
echo "✅ 自動修正完了！"
echo "🧪 ブラウザでエピソード表示をテストしてください"