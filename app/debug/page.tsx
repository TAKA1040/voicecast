'use client'

import { useState } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = false

export default function DebugPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const buildTime = Date.now()
  
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-8">🔧 フッターデバッグページ</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-4">ユーザー状態テスト</h2>
        <button
          onClick={() => setUser(user ? null : { email: 'test@example.com' })}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
        >
          User状態切り替え
        </button>
        <span className="text-sm">
          現在: {user ? `ログイン中 (${user.email})` : '未ログイン'}
        </span>
      </div>

      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">期待する動作:</h3>
        <ul className="text-sm space-y-1">
          <li>• 未ログイン時: 「👨‍💼 管理者ログイン」ボタン表示</li>
          <li>• ログイン時: 「ログイン済み: メールアドレス」表示</li>
        </ul>
      </div>
      
      {/* テスト用フッター - メインページと同じ実装 */}
      <footer className="mt-12 p-4 border-2 border-red-500 text-center space-y-2">
        <p className="font-bold text-red-600">【デバッグ】フッター表示テスト</p>
        
        {!user ? (
          <div className="p-2 bg-green-50 border border-green-300 rounded">
            <Link 
              href="/login"
              className="inline-flex items-center px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              👨‍💼 管理者ログイン
            </Link>
          </div>
        ) : (
          <div className="p-2 bg-blue-50 border border-blue-300 rounded">
            <span className="text-xs text-gray-400">
              ログイン済み: {user.email}
            </span>
          </div>
        )}
        
        <div className="text-xs text-gray-300 mt-4">
          Debug Build: {buildTime} | {new Date().toLocaleTimeString()}
        </div>
      </footer>
      
      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="text-blue-500 hover:underline"
        >
          ← メインページに戻る
        </Link>
      </div>
    </div>
  )
}