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

async function checkEpisodeOwners() {
  console.log('🔍 エピソード所有者チェック開始...')
  
  const adminClient = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    const { data: episodes, error } = await adminClient
      .from('episodes')
      .select('id, title, user_id, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ エラー:', error)
      return
    }
    
    console.log(`\n📊 全エピソード (${episodes.length}件):`)
    episodes.forEach((ep, i) => {
      console.log(`  ${i+1}. ${ep.title} (ID: ${ep.id})`)
      console.log(`     所有者ID: ${ep.user_id || '❌ 未設定'}`)
      console.log(`     作成日: ${ep.created_at}`)
      console.log('')
    })
    
    // 現在のユーザーID
    const currentUserId = 'fdb572fb-b65f-4818-8626-616d66ebc974'
    console.log(`🔍 現在のユーザーID: ${currentUserId}`)
    
    const userEpisodes = episodes.filter(ep => ep.user_id === currentUserId)
    console.log(`📱 現在のユーザーのエピソード: ${userEpisodes.length}件`)
    
    const noOwnerEpisodes = episodes.filter(ep => !ep.user_id)
    console.log(`❌ 所有者未設定のエピソード: ${noOwnerEpisodes.length}件`)
    
    if (noOwnerEpisodes.length > 0) {
      console.log('\n🔧 修正提案: 所有者未設定のエピソードを現在のユーザーに割り当て')
      console.log(`UPDATE episodes SET user_id = '${currentUserId}' WHERE user_id IS NULL;`)
    }
    
  } catch (error) {
    console.error('❌ 例外:', error)
  }
}

checkEpisodeOwners()