'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Episode } from '@/lib/types'
import EpisodePlayer from '@/components/episode-player'
import EpisodeCard from '@/components/episode-card'
import GenreFilter from '@/components/genre-filter'

export default function HomePage() {
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [genres, setGenres] = useState<string[]>([])

  useEffect(() => {
    const fetchEpisodes = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching episodes:', error)
        setError('エピソードの読み込みに失敗しました。')
      } else {
        const episodes = data as Episode[]
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

    fetchEpisodes()
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
        <header className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            🎙️ VoiceCast
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            誰でも聴ける音声配信プラットフォーム
          </p>
        </header>

        <GenreFilter genres={genres} onGenreChange={handleGenreChange} />

        <EpisodePlayer episode={selectedEpisode} />

        <section className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              📻 最新の配信
            </h2>
            <div className="text-gray-500 text-sm md:text-base">
              {filteredEpisodes.length}件の配信
            </div>
          </div>

          {filteredEpisodes.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg md:text-xl mb-4">🎧 このジャンルのエピソードはありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEpisodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} onPlay={handlePlay} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}