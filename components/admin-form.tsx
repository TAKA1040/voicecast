'use client'

import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// アラートメッセージの型定義
type AlertMessage = {
  type: 'success' | 'error'
  text: string
}

// エピソードの型定義
interface Episode {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  user_id: string;
  created_at: string;
}

export default function AdminForm({ user }: { user: User }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [alert, setAlert] = useState<AlertMessage | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([]) // エピソード一覧のステート

  const supabase = createClient()

  // コンポーネントマウント時とエピソード公開時にエピソード一覧をフェッチ
  useEffect(() => {
    // エピソード一覧をフェッチする関数を useEffect の内部に定義
    const fetchEpisodes = async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching episodes:', error)
        setAlert({ type: 'error', text: 'エピソードの読み込みに失敗しました。' })
      } else {
        setEpisodes(data as Episode[])
      }
    }

    fetchEpisodes()
  }, [user.id, supabase]) // supabase も依存配列に追加

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setAlert(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setAlert(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !title) {
      setAlert({ type: 'error', text: 'タイトルとファイルは必須です。' })
      return
    }

    setIsSubmitting(true)
    setAlert({ type: 'success', text: 'アップロード処理を開始します...' })

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('audios')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('audios')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase.from('episodes').insert({
        title,
        description,
        audio_url: publicUrl,
        user_id: user.id,
      })

      if (dbError) throw dbError

      setAlert({ type: 'success', text: 'エピソードの公開に成功しました！' })
      // フォームをリセット
      setTitle('')
      setDescription('')
      setFile(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // エピソード一覧を更新
      const { data: updatedEpisodes, error: fetchError } = await supabase
        .from('episodes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching updated episodes:', fetchError);
      } else {
        setEpisodes(updatedEpisodes as Episode[]);
      }

    } catch (error: any) {
      setAlert({ type: 'error', text: `エラーが発生しました: ${error.message}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEpisode = async (episodeId: string, audioUrl: string) => {
    if (!confirm('本当にこのエピソードを削除しますか？')) {
      return
    }

    try {
      // データベースからエピソードを削除
      const { error: dbError } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId)

      if (dbError) throw dbError

      // ストレージから音声ファイルを削除
      const decodedUrl = decodeURIComponent(audioUrl);
      const filePath = decodedUrl.substring(decodedUrl.indexOf('/audios/') + '/audios/'.length);

      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('audios')
          .remove([filePath])

        if (storageError) throw storageError
      }

      setAlert({ type: 'success', text: 'エピソードを削除しました。' })
      // エピソード一覧を更新
      const { data: updatedEpisodes, error: fetchError } = await supabase
        .from('episodes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching updated episodes:', fetchError);
      } else {
        setEpisodes(updatedEpisodes as Episode[]);
      }

    } catch (error: any) {
      setAlert({ type: 'error', text: `削除中にエラーが発生しました: ${error.message}` })
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">管理ダッシュボード</h1>
      <p className="text-gray-500 mb-8">ようこそ, {user.email}</p>

      {/* エピソード公開フォーム */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">新しいエピソードを公開</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              音声ファイル
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600">ファイルをアップロード</span> またはドラッグ＆ドロップ
                </p>
                <p className="mt-1 text-xs text-gray-500">MP3, WAV, M4A</p>
              </div>
              <input
                type="file"
                id="file-input"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {file && (
              <div className="mt-4 text-sm text-gray-700">
                <span className="font-semibold">選択中のファイル:</span> {file.name}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Alert Message */}
          {alert && (
            <div className={`p-4 rounded-md ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p>{alert.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? '公開処理中...' : 'エピソードを公開'}
            </button>
          </div>
        </form>
      </section>

      {/* 公開済みエピソード一覧 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">公開済みエピソード</h2>
        {episodes.length === 0 ? (
          <p className="text-gray-500">まだエピソードがありません。</p>
        ) : (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <div key={episode.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{episode.title}</h3>
                  <p className="text-sm text-gray-600">{episode.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteEpisode(episode.id, episode.audio_url)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
