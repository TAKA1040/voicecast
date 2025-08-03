'use client'

import { useState, useEffect } from 'react'

// 動的レンダリング強制（SSRキャッシュを無効化）
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/client'
import { Episode } from '@/lib/types'
import EpisodePlayer from '@/components/episode-player'
import EpisodeCard from '@/components/episode-card'
import GenreFilter from '@/components/genre-filter'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export default function HomePage() {
  console.log('🚨🚨🚨 HomePage component loaded - NEW VERSION!')
  console.log('🚨 Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
  console.log('🚨 Timestamp:', new Date().toISOString())
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [genres, setGenres] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Check if there's an auth code in the URL (OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      console.log('🎉 Auth code found on homepage - OAuth successful!')
      console.log('Code:', code)
      
      // Clear the URL to clean up
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      
      // Don't redirect to callback, let the auth state check handle it
      console.log('Waiting for auth state to be established...')
      // User will stay on homepage after auth
      return
    }

    // 認証状態を確認（リダイレクトなし）
    const checkAuthState = async () => {
      try {
        console.log('HomePage: Checking auth state...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('HomePage: Auth state check error:', error)
          setUser(null)
          return
        }

        if (session?.user) {
          console.log('HomePage: User authenticated:', session.user.email)
          console.log('HomePage: Session expires:', session.expires_at)
          console.log('HomePage: Access token present:', !!session.access_token)
          
          setUser(session.user)
          
          // 認証済みユーザーでもホームページを表示（リダイレクトしない）
          console.log('🏠 HomePage: User authenticated, showing homepage with user info')
          console.log('🏠 HomePage: NOT redirecting to admin - staying on homepage')
          console.log('🏠 HomePage: Cache buster - user can view public episodes')
        } else {
          console.log('HomePage: No authenticated user found')
          setUser(null)
        }
      } catch (err) {
        console.error('HomePage: Unexpected auth error:', err)
        setUser(null)
      }
    }

    const fetchEpisodes = async () => {
      console.log('🔍 HomePage: fetchEpisodes 開始...')
      console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔍 Anon Key存在:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('🔍 クエリ結果:')
      console.log('  - data:', data)
      console.log('  - error:', error)
      console.log('  - data length:', data?.length || 0)

      if (error) {
        console.error('❌ Error fetching episodes:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        setError('エピソードの読み込みに失敗しました。')
      } else {
        const episodes = data as Episode[]
        console.log('✅ Episodes fetched:', episodes.length)
        episodes.forEach((ep, index) => {
          console.log(`  ${index + 1}. ${ep.title} (${ep.id})`)
        })
        
        setAllEpisodes(episodes)
        setFilteredEpisodes(episodes)
        if (episodes.length > 0) {
          setSelectedEpisode(episodes[0])
        }
        // ジャンルリストを抽出
        const uniqueGenres = [...new Set(episodes.map(ep => ep.genre).filter(g => g))]
        setGenres(uniqueGenres as string[])
      }
      setLoading(false)
    }

    checkAuthState()
    fetchEpisodes()

    // 認証状態の変更を監視（リダイレクトなし）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('HomePage: Auth state changed:', event, session ? 'session present' : 'no session')
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        console.log('HomePage: SIGNED_IN event, staying on homepage')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleGenreChange = (genre: string) => {
    if (genre.toLowerCase() === 'all') {
      setFilteredEpisodes(allEpisodes)
    } else {
      const filtered = allEpisodes.filter(ep => ep.genre === genre)
      setFilteredEpisodes(filtered)
    }
  }

  const handlePlay = (episode: Episode) => {
    setSelectedEpisode(episode)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">エピソードを読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
        <p className="text-white text-xl">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <header className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-black mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                🎙️ VoiceCast
              </h1>
              <p className="text-gray-600 text-lg md:text-xl">
                誰でも聴ける音声配信プラットフォーム
              </p>
            </div>
            
            {/* ナビゲーションメニュー */}
            <div className="flex gap-4 items-center">
              {user ? (
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  <div className="text-center md:text-right">
                    <span className="text-sm text-gray-600 block">こんにちは、{user.email}</span>
                    <span className="text-xs text-green-600 block">✓ ログイン済み</span>
                  </div>
                  <Link 
                    href="/admin"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                  >
                    📊 管理画面へ
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <GenreFilter genres={genres} onGenreChange={handleGenreChange} />

        <EpisodePlayer episode={selectedEpisode} />

        {/* 最新の配信 - シンプルデザイン */}
        <section className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🎙️ 最新の配信
          </h2>

          {filteredEpisodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎧</div>
              <p className="text-gray-500">まだエピソードがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEpisodes.map((episode) => (
                <div 
                  key={episode.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handlePlay(episode)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {episode.title}
                      </h3>
                      {episode.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {episode.description}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <span>📅 {new Date(episode.created_at).toLocaleDateString('ja-JP')}</span>
                        {episode.genre && (
                          <span className="ml-3 px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {episode.genre}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button 
                        className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-pink-600 hover:to-purple-600 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlay(episode)
                        }}
                      >
                        ▶️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* フッター - 管理者ログイン（条件分岐なし・常時表示）*/}
        <footer className="mt-12 text-center space-y-2" data-testid="main-footer">
          <div className="space-y-1">
            <Link 
              href="/login"
              className="inline-flex items-center px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              data-testid="admin-login-button"
            >
              👨‍💼 管理者ログイン
            </Link>
            <div className="text-xs text-gray-400">
              {user && `ログイン済み: ${user.email}`}
            </div>
          </div>
          <div className="text-xs text-gray-300">
            {new Date().toLocaleString('ja-JP')}
          </div>
        </footer>
      </div>
    </div>
  )
}