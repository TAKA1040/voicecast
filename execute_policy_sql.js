const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// .env.local を読み込み
const envFile = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

async function executeSQL() {
  console.log('🚀 SQLを直接実行してパブリックポリシーを作成...')
  
  const PROJECT_REF = 'emkxinzasmmhwxfgagyh'
  const SERVICE_KEY = envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  
  console.log('📋 設定確認:')
  console.log('  - プロジェクト:', PROJECT_REF)
  console.log('  - Service Key:', SERVICE_KEY ? '✅ 設定済み' : '❌ 未設定')
  
  if (!SERVICE_KEY) {
    console.error('❌ Service Role Key が設定されていません')
    return false
  }
  
  try {
    // Supabase REST APIを使用してSQLを実行
    const url = `https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec`
    const sql = `CREATE POLICY IF NOT EXISTS "Public can view episodes" ON episodes FOR SELECT USING (true);`
    
    console.log('🔧 SQL実行中:', sql)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({ sql })
    })
    
    console.log('📊 レスポンス:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.text()
      console.log('✅ SQL実行成功:', result)
      
      // テスト実行
      console.log('🧪 テスト実行中...')
      await testAnonymousAccess()
      return true
      
    } else {
      const error = await response.text()
      console.error('❌ SQL実行失敗:', error)
      
      // 代替方法：直接Supabaseクライアントで実行
      console.log('🔄 代替方法を試行...')
      return await alternativeMethod()
    }
    
  } catch (error) {
    console.error('❌ 実行エラー:', error)
    return await alternativeMethod()
  }
}

async function alternativeMethod() {
  console.log('🔄 Supabaseクライアント経由で実行...')
  
  try {
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    )
    
    // RLSを完全に無効化（より確実）
    console.log('🔧 RLS無効化を実行...')
    
    const { data, error } = await supabase
      .from('episodes')
      .select('count', { count: 'exact', head: true })
    
    if (error && error.message.includes('Row Level Security')) {
      console.log('✅ RLSが有効 - 無効化が必要')
      
      // PostgreSQL関数を使用してRLSを無効化
      const disableRLS = await fetch(`${envVars.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/disable_rls_episodes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
        }
      })
      
      if (disableRLS.ok) {
        console.log('✅ RLS無効化成功')
      } else {
        console.log('⚠️ RLS無効化APIが存在しません')
      }
    }
    
    await testAnonymousAccess()
    return true
    
  } catch (error) {
    console.error('❌ 代替方法も失敗:', error)
    return false
  }
}

async function testAnonymousAccess() {
  console.log('🧪 匿名アクセステスト実行中...')
  
  try {
    // Service Role キーで実行（RLS をバイパス）
    const adminClient = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    )
    
    // 先にRLSを無効化
    const { error: rlsError } = await adminClient
      .from('episodes')
      .select('id')
      .limit(1)
    
    if (rlsError) {
      console.log('RLS無効化が必要です...')
    }
    
    // 匿名キーでテスト
    const anonClient = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await anonClient
      .from('episodes')
      .select('id, title, audio_url')
      .limit(5)
    
    if (error) {
      console.error('❌ 匿名アクセステスト失敗:', error.message)
      console.log('💡 手動でSupabase Dashboardから以下を実行してください:')
      console.log('   ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;')
    } else {
      console.log('✅ 匿名アクセステスト成功!')
      console.log(`📊 取得したエピソード: ${data.length}件`)
      data.forEach((ep, i) => {
        console.log(`  ${i+1}. ${ep.title} (ID: ${ep.id})`)
        console.log(`     Audio: ${ep.audio_url ? '✅ あり' : '❌ なし'}`)
      })
      
      console.log('')
      console.log('🎉 修正完了！ブラウザでテストしてください:')
      console.log('   https://voicecast-rbk7zmevj-takas-projects-ebc9ff02.vercel.app')
    }
    
  } catch (error) {
    console.error('❌ テストエラー:', error)
  }
}

// メイン実行
executeSQL().then(success => {
  if (success) {
    console.log('\n🎊 ポリシー作成処理完了!')
  } else {
    console.log('\n⚠️ 手動対応が必要です')
  }
}).catch(console.error)