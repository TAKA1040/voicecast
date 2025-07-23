import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminForm from '@/components/admin-form'

// ログアウト処理はサーバーアクションとして定義
const handleLogout = async () => {
  'use server'
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl">
        <div className="flex justify-end mb-4">
          <form action={handleLogout}>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              ログアウト
            </button>
          </form>
        </div>
        <AdminForm user={user} />
      </div>
    </div>
  )
}
