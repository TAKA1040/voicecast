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

async function fixEpisodeOwners() {
  console.log('🔧 エピソード所有者修正開始...')
  
  const adminClient = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )
  
  const currentUserId = 'fdb572fb-b65f-4818-8626-616d66ebc974'
  const oldUserId = '8356c009-a8c9-4787-9bdc-90cdbd1e8a08'
  
  try {
    console.log(`📋 修正対象:`)
    console.log(`  - 旧ユーザーID: ${oldUserId}`)
    console.log(`  - 新ユーザーID: ${currentUserId}`)
    
    // 修正前の状態確認
    const { data: beforeEpisodes, error: beforeError } = await adminClient
      .from('episodes')
      .select('id, title, user_id')
      .eq('user_id', oldUserId)
    
    if (beforeError) {
      console.error('❌ 修正前確認エラー:', beforeError)
      return false
    }
    
    console.log(`\n🔍 修正対象エピソード (${beforeEpisodes.length}件):`)
    beforeEpisodes.forEach((ep, i) => {
      console.log(`  ${i+1}. ${ep.title} (ID: ${ep.id})`)
    })
    
    // 所有者を更新
    const { data: updateResult, error: updateError } = await adminClient
      .from('episodes')
      .update({ user_id: currentUserId })
      .eq('user_id', oldUserId)
      .select()
    
    if (updateError) {
      console.error('❌ 更新エラー:', updateError)
      return false
    }
    
    console.log(`\n✅ 更新成功! ${updateResult.length}件のエピソードを修正`)
    
    // 修正後の確認
    const { data: afterEpisodes, error: afterError } = await adminClient
      .from('episodes')
      .select('id, title, user_id')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
    
    if (afterError) {
      console.error('❌ 修正後確認エラー:', afterError)
      return false
    }
    
    console.log(`\n📊 現在のユーザーのエピソード (${afterEpisodes.length}件):`)
    afterEpisodes.forEach((ep, i) => {
      console.log(`  ${i+1}. ${ep.title} (ID: ${ep.id})`)
    })
    
    console.log('\n🎉 修正完了！管理画面で全エピソードが表示されるはずです。')
    
    return true
    
  } catch (error) {
    console.error('❌ 例外:', error)
    return false
  }
}

fixEpisodeOwners()