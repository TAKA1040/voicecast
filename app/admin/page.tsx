'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [router, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !title) {
      setMessage('タイトルとファイルは必須です。')
      return
    }
    setIsLoading(true)
    setMessage('アップロード中...')

    try {
      // 1. ファイルをストレージにアップロード
      const filePath = `${user!.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('audio') // あなたのバケット名に合わせてください
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. アップロードしたファイルの公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('audio') // あなたのバケット名に合わせてください
        .getPublicUrl(filePath)

      // 3. データベースにエピソード情報を保存
      const { error: dbError } = await supabase.from('episodes').insert({
        title,
        description,
        audio_url: publicUrl,
        user_id: user!.id,
      })

      if (dbError) throw dbError

      setMessage('アップロードに成功しました！')
      // フォームをリセット
      setTitle('')
      setDescription('')
      setFile(null)
      // (必要であれば) フォームの input もリセット
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if(fileInput) fileInput.value = ''

    } catch (error: any) {
      setMessage(`エラーが発生しました: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>管理画面</h2>
        <div>
          <span>{user.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>ログアウト</button>
        </div>
      </div>
      <hr style={{ margin: '20px 0' }} />
      <h3>新しいエピソードを公開</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title">タイトル</label><br />
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description">説明</label><br />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px', minHeight: '100px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="file-input">音声ファイル</label><br />
          <input
            type="file"
            id="file-input"
            accept="audio/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? '公開中...' : '公開する'}
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: message.includes('エラー') ? 'red' : 'green' }}>{message}</p>}
    </div>
  )
}