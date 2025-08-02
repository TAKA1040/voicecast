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

async function disableRLS() {
  console.log('🚀 RLSを直接無効化します...')
  
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    // Service roleを使用してSQL文を実行
    const { data, error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;'
    })
    
    if (error) {
      console.error('❌ RLS無効化失敗:', error)
      console.log('💡 手動でSupabase Dashboardから実行してください:')
      console.log('   ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;')
      return false
    }
    
    console.log('✅ RLS無効化成功!')
    
    // テスト実行
    await testAccess()
    return true
    
  } catch (error) {
    console.error('❌ 実行エラー:', error)
    console.log('💡 手動でSupabase Dashboardから実行してください:')
    console.log('   ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;')
    return false
  }
}

async function testAccess() {
  console.log('🧪 匿名アクセステスト実行中...')
  
  const anonClient = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    const { data, error } = await anonClient
      .from('episodes')
      .select('id, title, audio_url')
      .limit(5)
    
    if (error) {
      console.error('❌ 匿名アクセステスト失敗:', error.message)
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

// 実行
disableRLS()