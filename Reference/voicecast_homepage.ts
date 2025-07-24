import { createClient } from '@/lib/supabase/server'
import EpisodePlayer from '@/components/episode-player'
import EpisodeCard from '@/components/episode-card'
import GenreFilter from '@/components/genre-filter'

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

export default async function HomePage() {
  const supabase = createClient()
  
  // エピソードデータを取得
  const { data: episodes, error } = await supabase
    .from('episodes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching episodes:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
        <p className="text-white text-xl">エピソードの読み込みに失敗しました</p>
      </div>
    )
  }

  const episodesData: Episode[] = episodes || []
  const featuredEpisode = episodesData[0] // 最新のエピソードを注目配信とする

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* ヘッダー */}
        <header className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            🎙️ VoiceCast
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            誰でも聴ける音声配信プラットフォーム
          </p>
        </header>

        {/* ジャンルフィルター */}
        <GenreFilter />

        {/* メインプレイヤー */}
        {featuredEpisode && (
          <EpisodePlayer episode={featuredEpisode} />
        )}

        {/* エピソード一覧 */}
        <section className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              📻 最新の配信
            </h2>
            <div className="text-gray-500 text-sm md:text-base">
              {episodesData.length}件の配信
            </div>
          </div>

          {episodesData.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg md:text-xl mb-4">🎧 まだエピソードがありません</p>
              <p className="text-sm md:text-base">配信者の方は管理画面からエピソードを投稿してください</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {episodesData.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}