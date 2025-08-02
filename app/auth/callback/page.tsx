/**
 * サーバーサイドルートハンドラーへのリダイレクター
 * ブラウザキャッシュ対策として一時的に配置
 */
export default function ForceServerSide() {
  // 既存セッションチェック後、管理画面にリダイレクト
  if (typeof window !== 'undefined') {
    console.log('❌ CLIENT-SIDE page.tsx loaded - checking existing session')
    
    // PKCEエラー対応：既存セッションがあれば管理画面へ
    const authCookies = document.cookie.split(';').filter(c => c.includes('auth-token'))
    if (authCookies.length > 0) {
      console.log('✅ Found auth cookies, redirecting to admin')
      setTimeout(() => {
        window.location.href = '/admin'
      }, 500)
      return null
    }
    
    console.log('No auth cookies found, redirecting to login')
    setTimeout(() => {
      window.location.href = '/login?error=session_required'
    }, 1000)
    
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">サーバーサイド認証に切り替え中...</p>
        <p className="text-sm text-blue-500 mt-2">🔄 強制リロード実行中</p>
      </div>
    </div>
  )
}