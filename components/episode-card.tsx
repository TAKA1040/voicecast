'use client'

import { useState } from 'react'
import { Episode } from '@/lib/types'
import { Timestamp } from 'firebase/firestore'

interface EpisodeCardProps {
  episode: Episode
  onPlay: (episode: Episode) => void
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

export default function EpisodeCard({ episode, onPlay }: EpisodeCardProps) {
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return `${Math.floor(diffDays / 30)}ヶ月前`
  }

  const getGenreInfo = (genre: string | null) => {
    if (!genre || !genreMap[genre]) {
      return { name: 'その他', emoji: '🎧' }
    }
    return genreMap[genre]
  }

  const genreInfo = getGenreInfo(episode.genre ?? null)

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlay(episode)
  }

  return (
    <article 
      className="bg-white rounded-2xl p-4 md:p-6 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-pink-200"
      onClick={() => onPlay(episode)}
    >
      <div className="flex items-center gap-3 md:gap-4 mb-4">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-lg md:text-2xl text-white flex-shrink-0">
          {genreInfo.emoji}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg leading-tight mb-1 line-clamp-2">
            {episode.title}
          </h3>
          <p className="text-gray-500 text-xs md:text-sm">
            配信者: {episode.user_id || '不明'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 text-xs md:text-sm">
        <span className="text-gray-500">
          {formatDate(episode.createdAt)}
        </span>
        <span className="text-pink-500 font-medium">
          ⏱️ 音声ファイル
        </span>
        <span className="bg-pink-100 text-pink-600 px-2 md:px-3 py-1 rounded-full text-xs font-medium">
          {genreInfo.name}
        </span>
      </div>

      {episode.description && (
        <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 line-clamp-2">
          {episode.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={handlePlayClick}
          className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-base md:text-lg hover:scale-110 transition-all duration-300 shadow-lg"
          aria-label="再生"
        >
          ▶
        </button>
        
        <div className="flex gap-3 md:gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>--</span>
          </div>
          <div className="flex items-center gap-1">
            <span>❤️</span>
            <span>--</span>
          </div>
        </div>
      </div>
    </article>
  )
}