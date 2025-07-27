'use client'

import { useFirebase } from '@/app/hooks/useFirebase'
import { collection, addDoc } from 'firebase/firestore'
import { type User } from 'firebase/auth'
import { useState } from 'react'

type AlertMessage = {
  type: 'success' | 'error'
  text: string
}

const genres = [
  { id: 'tech', name: 'テクノロジー' },
  { id: 'business', name: 'ビジネス' },
  { id: 'lifestyle', name: 'ライフスタイル' },
  { id: 'entertainment', name: 'エンタメ' },
  { id: 'education', name: '教育' },
  { id: 'news', name: 'ニュース' },
  { id: 'health', name: '健康' },
  { id: 'other', name: 'その他' },
]

export default function AdminForm({ user }: { user: User }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('other')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [alert, setAlert] = useState<AlertMessage | null>(null)
  const firebase = useFirebase()

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
    if (!firebase) {
      setAlert({ type: 'error', text: 'Firebaseの初期化に失敗しました。' })
      return
    }

    setIsSubmitting(true)
    setAlert({ type: 'success', text: 'アップロードURLを取得しています...' })

    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) throw new Error(`署名付きURLの取得に失敗しました: ${await res.text()}`);
      const { url, key } = await res.json();
      
      setAlert({ type: 'success', text: 'ファイルをアップロードしています...' });

      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('ファイルアップロードに失敗しました。');

      const r2PublicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
      
      await addDoc(collection(firebase.db, 'episodes'), {
        title,
        description,
        genre,
        audio_url: r2PublicUrl,
        user_id: user.uid,
        createdAt: new Date(),
      })

      setAlert({ type: 'success', text: 'エピソードの公開に成功しました！' })
      setTitle('')
      setDescription('')
      setGenre('other')
      setFile(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error: any) {
      setAlert({ type: 'error', text: `エラーが発生しました: ${error.message}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">管理ダッシュボード</h1>
      <p className="text-gray-500 mb-8">ようこそ, {user.email}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
            ジャンル
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

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

        {alert && (
          <div className={`p-4 rounded-md ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p>{alert.text}</p>
          </div>
        )}

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
    </div>
  )
}
