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

async function testEpisodes() {
  console.log('🔍 エピソード取得テスト開始...')
  
  // Service Role で管理者権限テスト
  console.log('\n=== Service Role でのテスト ===')
  const adminClient = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    const { data: adminData, error: adminError } = await adminClient
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (adminError) {
      console.error('❌ Service Role エラー:', adminError)
    } else {
      console.log(`✅ Service Role: ${adminData.length}件のエピソード取得`)
      adminData.forEach((ep, i) => {
        console.log(`  ${i+1}. ${ep.title} (ID: ${ep.id})`)
        console.log(`     作成日: ${ep.created_at}`)
        console.log(`     音声URL: ${ep.audio_url || '❌ なし'}`)
        console.log(`     ジャンル: ${ep.genre || '未設定'}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Service Role 例外:', error)
  }
  
  // Anonymous Key でのテスト
  console.log('\n=== Anonymous Key でのテスト ===')
  const anonClient = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    const { data: anonData, error: anonError } = await anonClient
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (anonError) {
      console.error('❌ Anonymous Key エラー:', anonError)
      console.log('💡 RLSが有効のままの可能性があります')
    } else {
      console.log(`✅ Anonymous Key: ${anonData.length}件のエピソード取得`)
      anonData.forEach((ep, i) => {
        console.log(`  ${i+1}. ${ep.title} (ID: ${ep.id})`)
      })
    }
  } catch (error) {
    console.error('❌ Anonymous Key 例外:', error)
  }
  
  // RLS状態確認
  console.log('\n=== RLS状態確認 ===')
  try {
    const { data: rlsStatus, error: rlsError } = await adminClient
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('tablename', 'episodes')
    
    if (rlsError) {
      console.error('❌ RLS状態確認エラー:', rlsError)
    } else {
      console.log('📋 RLS状態:', rlsStatus)
    }
  } catch (error) {
    console.log('⚠️ RLS状態確認不可:', error.message)
  }
}

testEpisodes()