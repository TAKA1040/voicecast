import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div>
      <h2>管理画面 (ようこそ, {user.email})</h2>
      <p>ここに音声アップロード機能を実装します。</p>
    </div>
  )
}
