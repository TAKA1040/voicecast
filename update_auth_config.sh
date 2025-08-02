#!/bin/bash

# Supabase Management APIで認証設定を更新

# 必要な値（実際の値に置換してください）
PROJECT_REF="emkxinzasmmhwxfgagyh"
ACCESS_TOKEN="YOUR_SUPABASE_ACCESS_TOKEN"  # Dashboard > Settings > Access Tokens から取得

# 新しい設定
NEW_SITE_URL="https://voicecast-oxid6pmzu-takas-projects-ebc9ff02.vercel.app"
REDIRECT_URLS="https://127.0.0.1:3000,https://voicecast-oxid6pmzu-takas-projects-ebc9ff02.vercel.app/admin"

echo "Supabase認証設定を更新中..."
echo "Site URL: $NEW_SITE_URL"
echo "Redirect URLs: $REDIRECT_URLS"

# Management APIで設定更新
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"site_url\": \"$NEW_SITE_URL\",
    \"uri_allow_list\": \"$REDIRECT_URLS\"
  }"

echo ""
echo "設定更新完了（予定）"
echo "Supabase Dashboardで確認してください"