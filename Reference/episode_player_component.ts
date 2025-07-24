'use client'

import { useState } from 'react'

interface Episode {
  id: number
  title: string
  description: string | null
  genre: string | null
  audio_url: string
  created_at: string
  updated_at: string
  user_id: string | null
}

interface EpisodePlayerProps {
  episode: Episode
}

const genreMap: Record<string, { name: string; emoji: string }> = {
  tech: { name: 'テクノロジー', emoji: '💻' },
  business: { name: 'ビジネス', emoji: '💼' },
  lifestyle: { name: 'ライフスタイル', emoji: '🌱' },
  entertainment: { name: 'エンタメ', emoji: '🎭' },
  education: { name: '教育', emoji: '📚' },
  news: { name: 'ニュース', emoji: '📰' },
  health: { name: '健康', emoji: '💪' },
}

export default function EpisodePlayer({ episode }: EpisodePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(42) // サンプル進行状況

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGenreInfo = (genre: string | null) => {
    if (!genre || !genreMap[genre]) {
      return { name: 'その他', emoji: '🎧' }
    }
    return genreMap[genre]
  }

  const genreInfo = getGenreInfo(episode.genre)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: 実際の音声再生/停止処理を実装
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = (clickX / rect.width) * 100
    setProgress(newProgress)
    // TODO: 実際のシーク処理を実装
  }

  return (
    <section className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 mb-10 shadow-2xl text-center">
      {/* 注目バッジ */}
      <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 md:px-6 py-2 rounded-full text-sm font-semibold mb-6">
        ✨ 注目の配信
      </div>

      {/* アートワーク */}
      <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 md:mb-8 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-4xl md:text-6xl text-white shadow-2xl">
        {genreInfo.emoji}
      </div>

      {/* エピソード情報 */}
      <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 leading-tight px-4">
        {episode.title}
      </h2>
      
      <p className="text-lg md:text-xl text-gray-600 mb-6">
        配信者情報 {/* TODO: 将来的にユーザー情報を表示 */}
      </p>

      {/* メタ情報 */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8 text-sm md:text-base text-gray-500">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{formatDate(episode.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏱️</span>
          <span>音声ファイル</span> {/* TODO: 実際の長さを取得 */}
        </div>
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>-- 再生</span> {/* TODO: 再生数を実装 */}
        </div>
        <div className="flex items-center gap-2">
          <span>🏷️</span>
          <span>{genreInfo.name}</span>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8">
        <button 
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-300 bg-white text-gray-600 text-lg md:text-xl hover:border-pink-400 hover:text-pink-400 transition-all duration-300 hover:scale-110"
          aria-label="前のエピソード"
        >
          ⏮
        </button>
        
        <button
          onClick={handlePlayPause}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl md:text-2xl shadow-xl hover:scale-110 transition-all duration-300"
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <button 
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-300 bg-white text-gray-600 text-lg md:text-xl hover:border-pink-400 hover:text-pink-400 transition-all duration-300 hover:scale-110"
          aria-label="次のエピソード"
        >
          ⏭
        </button>
      </div>

      {/* プログレスバー */}
      <div className="max-w-md mx-auto px-4">
        <div 
          className="h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleProgressClick}
          role="slider"
          aria-label="再生位置"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
          <span>--:--</span> {/* TODO: 現在時間を実装 */}
          <span>--:--</span> {/* TODO: 全体時間を実装 */}
        </div>
      </div>

      {/* 説明文 */}
      {episode.description && (
        <div className="mt-6 text-gray-600 text-left max-w-2xl mx-auto px-4">
          <p className="leading-relaxed text-sm md:text-base">{episode.description}</p>
        </div>
      )}
    </section>
  )
}