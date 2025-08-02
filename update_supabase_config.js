// Supabase設定更新スクリプト
const { createClient } = require('@supabase/supabase-js');

// 管理用のSupabaseクライアント作成
const supabase = createClient(
  'https://emkxinzasmmhwxfgagyh.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key が必要
);

async function updateAuthConfig() {
  try {
    console.log('Supabase認証設定を更新中...');
    
    // 新しい設定
    const newConfig = {
      site_url: 'https://voicecast-oxid6pmzu-takas-projects-ebc9ff02.vercel.app',
      uri_allow_list: [
        'https://127.0.0.1:3000',
        'https://voicecast-oxid6pmzu-takas-projects-ebc9ff02.vercel.app/admin'
      ]
    };
    
    console.log('新しい設定:', newConfig);
    console.log('⚠️  Service Role Key が必要です。');
    console.log('Supabase Dashboard → Settings → API → service_role key をコピーしてください');
    
  } catch (error) {
    console.error('設定更新エラー:', error);
  }
}

updateAuthConfig();