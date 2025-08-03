# VoiceCast 完全再設計 設計図

## 🎯 新プロジェクト: **SimpleCast**

**コンセプト**: シンプルで確実に動作する音声配信プラットフォーム

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

### **開発ツール**
- ✅ **ESLint + Prettier** (コード品質)
- ✅ **Vitest** (テスト)

---

## 📁 プロジェクト構造

```
simplecast/
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

### **テーブル構造**
```sql
-- episodes テーブル（既存）
episodes (
  id: uuid PRIMARY KEY
  title: text NOT NULL
  description: text
  audio_url: text NOT NULL
  genre: text
  user_id: uuid REFERENCES auth.users(id)
  created_at: timestamp DEFAULT now()
  updated_at: timestamp DEFAULT now()
)

-- profiles テーブル（必要に応じて追加）
profiles (
  id: uuid PRIMARY KEY REFERENCES auth.users(id)
  email: text
  display_name: text
  avatar_url: text
  created_at: timestamp DEFAULT now()
)
```

### **RLS ポリシー（シンプル）**
```sql
-- 全員が見れる
CREATE POLICY "Anyone can view episodes" ON episodes
  FOR SELECT USING (true);

-- 自分のみ編集可能
CREATE POLICY "Users can manage own episodes" ON episodes
  FOR ALL USING (auth.uid() = user_id);
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
npm create vite@latest simplecast -- --template react-ts
cd simplecast

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

### **2. Supabase設定**
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
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

**この設計図通りに実装すれば、3-4時間で現在のVoiceCastより安定した動作をするSimpleCastが完成します。**