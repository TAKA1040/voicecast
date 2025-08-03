# VoiceCast 完全再設計 設計図

## 🎯 新プロジェクト: **VoiceStudy**

**コンセプト**: 学習・教育特化の音声配信プラットフォーム

---

## 🏗️ 技術スタック（確実に動作する組み合わせ）

### **フロントエンド**
- ✅ **Vite + React + TypeScript**
- ✅ **Tailwind CSS** (スタイリング)
- ✅ **React Router DOM** (ルーティング)
- ✅ **Zustand** (状態管理 - Redux より軽量)

### **バックエンド**
- ✅ **Supabase** (既存データベース活用)
- ✅ **Supabase Auth** (認証)
- ✅ **Supabase Storage** (音声ファイル)

### **ホスティング**
- ✅ **Netlify** (シンプル、確実、即座に反映)
- ✅ **環境変数管理** (Netlify UI)

### **開発ツール & AI支援**
- ✅ **ESLint + Prettier** (コード品質)
- ✅ **Vitest** (テスト)
- ✅ **Gemini CLI対応** (コスト削減)

---

## 📁 プロジェクト構造

```
voicestudy/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/           # 再利用可能コンポーネント
│   │   ├── ui/              # 基本UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── AudioPlayer.tsx   # 音声プレイヤー
│   │   ├── EpisodeCard.tsx   # エピソードカード
│   │   └── Layout.tsx        # 共通レイアウト
│   ├── pages/               # ページコンポーネント
│   │   ├── HomePage.tsx     # 公開ページ
│   │   ├── LoginPage.tsx    # ログインページ
│   │   └── AdminPage.tsx    # 管理画面
│   ├── hooks/               # カスタムフック
│   │   ├── useAuth.ts       # 認証
│   │   └── useEpisodes.ts   # エピソード管理
│   ├── services/            # API通信
│   │   ├── supabase.ts      # Supabase設定
│   │   └── api.ts           # API関数
│   ├── store/               # 状態管理
│   │   └── useStore.ts      # Zustand store
│   ├── types/               # 型定義
│   │   └── index.ts
│   ├── utils/               # ユーティリティ
│   │   └── helpers.ts
│   ├── App.tsx              # メインアプリ
│   └── main.tsx             # エントリーポイント
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── netlify.toml
```

---

## 🗃️ データベース設計（既存Supabase活用）

### **既存データ活用の安全性**
✅ **問題なし** - 理由：
- 既存の `episodes` テーブル構造は理想的
- RLS（Row Level Security）で安全にアクセス制御
- 新アプリは既存データを**読み取り専用**で開始可能
- 段階的に機能追加（最初は表示のみ → 後でCRUD追加）

### **既存テーブル構造**
```sql
-- episodes テーブル（既存データをそのまま活用）
episodes (
  id: uuid PRIMARY KEY                    ✅ 既存
  title: text NOT NULL                   ✅ 既存
  description: text                      ✅ 既存
  audio_url: text NOT NULL              ✅ 既存
  genre: text                           ✅ 既存
  user_id: uuid                         ✅ 既存
  created_at: timestamp                 ✅ 既存
  updated_at: timestamp                 ✅ 既存
)

-- 学習特化の拡張（将来的に追加可能）
study_sessions (
  id: uuid PRIMARY KEY
  episode_id: uuid REFERENCES episodes(id)
  user_id: uuid REFERENCES auth.users(id)
  progress: integer DEFAULT 0
  completed: boolean DEFAULT false
  notes: text
  created_at: timestamp DEFAULT now()
)
```

### **段階的データ移行戦略**

#### **Phase 1: 読み取り専用（安全）**
```sql
-- 既存データの表示のみ
-- RLSポリシーで安全にアクセス
CREATE POLICY "Public read access" ON episodes
  FOR SELECT USING (true);
```

#### **Phase 2: 新機能追加（既存に影響なし）**
```sql
-- 新しいテーブル追加
-- 既存データは一切変更しない
CREATE TABLE study_sessions (...);
```

#### **Phase 3: 完全移行（段階的）**
```sql
-- 必要に応じてデータ移行
-- バックアップ取得後に実行
```

---

## 🎨 UI/UX 設計

### **ページ構成**

#### **1. ホームページ (`/`)**
```typescript
interface HomePage {
  components: [
    'Header',           // タイトル + ログインボタン
    'EpisodeList',      // シンプルなエピソードリスト
    'AudioPlayer',      // 音声プレイヤー（下部固定）
    'Footer'            // 管理者ログイン
  ]
}
```

#### **2. 管理画面 (`/admin`)**
```typescript
interface AdminPage {
  components: [
    'AdminHeader',      // ユーザー情報 + ログアウト
    'EpisodeUpload',    // 音声ファイルアップロード
    'EpisodeManager',   // 自分のエピソード管理
    'Analytics'         // 再生数など（将来）
  ]
}
```

#### **3. ログインページ (`/login`)**
```typescript
interface LoginPage {
  components: [
    'LoginForm',        // Google OAuth
    'BackToHome'        // ホームに戻る
  ]
}
```

---

## 🧩 コンポーネント設計

### **AudioPlayer.tsx**
```typescript
interface AudioPlayerProps {
  episode: Episode | null
  episodes: Episode[]
  onEpisodeChange: (episode: Episode) => void
}

// 機能:
// - 再生/停止
// - 前/次のエピソード
// - プログレスバー
// - 音量調整
```

### **EpisodeList.tsx** 
```typescript
interface EpisodeListProps {
  episodes: Episode[]
  onPlay: (episode: Episode) => void
}

// 表示内容（2行レイアウト）:
// Line 1: タイトル
// Line 2: 日付 + ジャンル + 再生ボタン
```

### **EpisodeUpload.tsx**
```typescript
interface EpisodeUploadProps {
  onUploadComplete: (episode: Episode) => void
}

// 機能:
// - ファイル選択（drag & drop対応）
// - タイトル・説明入力
// - ジャンル選択
// - アップロード進捗
```

---

## 🔧 実装ガイド

### **1. プロジェクト作成**
```bash
# 1. 新プロジェクト作成
npm create vite@latest voicestudy -- --template react-ts
cd voicestudy

# 2. 依存関係インストール
npm install @supabase/supabase-js
npm install react-router-dom
npm install zustand
npm install @types/node

# 3. 開発依存関係
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms
npm install -D vitest

# 4. Tailwind初期化
npx tailwindcss init -p
```

### **2. Supabase設定（既存データベース接続）**
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 既存VoiceCastと同じ認証情報を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// 既存データへの安全なアクセス関数
export const getEpisodes = async () => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### **3. 環境変数（既存と同じ）**
```env
# .env.local
VITE_SUPABASE_URL=https://emkxinzasmmhwxfgagyh.supabase.co
VITE_SUPABASE_ANON_KEY=your-existing-anon-key
```

### **3. 状態管理**
```typescript
// src/store/useStore.ts
import { create } from 'zustand'

interface AppState {
  currentEpisode: Episode | null
  episodes: Episode[]
  user: User | null
  setCurrentEpisode: (episode: Episode) => void
  setEpisodes: (episodes: Episode[]) => void
  setUser: (user: User | null) => void
}

export const useStore = create<AppState>((set) => ({
  currentEpisode: null,
  episodes: [],
  user: null,
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  setEpisodes: (episodes) => set({ episodes }),
  setUser: (user) => set({ user }),
}))
```

### **4. 認証フック**
```typescript
// src/hooks/useAuth.ts
import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useStore } from '../store/useStore'

export const useAuth = () => {
  const { user, setUser } = useStore()

  useEffect(() => {
    // 現在のセッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 認証状態変更監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser])

  return { user }
}
```

---

## 🚀 デプロイ設定

### **netlify.toml**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "your-supabase-url"
  VITE_SUPABASE_ANON_KEY = "your-anon-key"
```

### **package.json scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src"
  }
}
```

---

## ✅ 開発チェックリスト

### **Phase 1: 基盤構築（1時間）**
- [ ] Viteプロジェクト作成
- [ ] Tailwind設定
- [ ] Supabase接続確認
- [ ] 基本ルーティング設定

### **Phase 2: 基本機能（1時間）**
- [ ] エピソード一覧表示
- [ ] 音声プレイヤー実装
- [ ] 認証機能実装

### **Phase 3: 管理機能（1時間）**
- [ ] エピソードアップロード
- [ ] CRUD操作
- [ ] ユーザー管理

### **Phase 4: デプロイ（30分）**
- [ ] Netlifyデプロイ
- [ ] 環境変数設定
- [ ] 動作確認

---

## 💡 成功のポイント

1. **シンプル第一** - 複雑な機能は後回し
2. **即座に動作確認** - Viteの高速リロード活用
3. **既存データ活用** - Supabaseデータはそのまま使用
4. **段階的開発** - MVPから始めて徐々に機能追加

---

## 🎉 期待される結果

- ✅ **修正が即座に反映**される開発体験
- ✅ **シンプルで理解しやすい**コードベース  
- ✅ **確実に動作する**音声配信プラットフォーム
- ✅ **ユーザーに安心して提供できる**品質

**この設計図通りに実装すれば、3-4時間で現在のVoiceCastより安定した動作をするVoiceStudyが完成します。**

---

## 🤖 Gemini CLI 対応ガイド

### **初期開発でのコスト削減**

#### **Gemini CLI の利点**
- ✅ **コスト効率**: 開発初期の大量コード生成に最適
- ✅ **React対応**: コンポーネント生成が得意
- ✅ **TypeScript対応**: 型定義も自動生成
- ✅ **リファクタリング**: コード改善提案

#### **効果的な使い方**
```bash
# 1. 基本コンポーネント生成
gemini "Create a React TypeScript component for episode list with props interface"

# 2. カスタムフック生成  
gemini "Create useAuth hook for Supabase authentication with TypeScript"

# 3. API関数生成
gemini "Create CRUD functions for episodes table using Supabase client"

# 4. スタイリング
gemini "Add Tailwind CSS styling to this component for mobile-first design"
```

#### **Claude Code との使い分け**
- **Gemini CLI**: 初期開発、大量コード生成、リファクタリング
- **Claude Code**: 複雑な問題解決、デバッグ、アーキテクチャ設計

#### **開発フロー例**
1. **設計**: Claude Code で全体設計
2. **生成**: Gemini CLI でコンポーネント量産
3. **統合**: Claude Code で問題解決・最適化
4. **完成**: 両方の強みを活用した高品質アプリ