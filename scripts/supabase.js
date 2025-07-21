// Supabaseの初期化設定
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://emkxinzasmmhwxfgagyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseKey);

// エピソード一覧を取得
async function fetchEpisodes() {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('エピソード取得エラー:', error);
    return [];
  }
  return data;
}

// 今後の関数（ログイン・音声アップロード・一覧取得など）はこの下に追加していきます

export { supabase };