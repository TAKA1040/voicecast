# 画面更新されない問題を防ぐためのマニュアル

## 🚨 問題の本質

**Next.js App Router + Vercel** の組み合わせは、以下の理由で画面更新が反映されにくい：

1. **多重キャッシュレイヤー**
   - Vercel Edge Cache
   - Next.js ISR (Incremental Static Regeneration)
   - Browser Cache
   - Service Worker Cache

2. **SSR/SSG の複雑な動作**
   - 静的生成とサーバーレンダリングの混在
   - Hydration mismatch
   - 条件分岐での状態不整合

---

## ✅ 予防策（プロジェクト開始時）

### **1. 技術スタック選択**

**推奨しない組み合わせ:**
- ❌ Next.js App Router + Vercel
- ❌ 複雑な条件分岐を含むSSR
- ❌ 多重キャッシュレイヤー

**推奨する組み合わせ:**
- ✅ Vite + React + Vercel
- ✅ Next.js Pages Router (App Routerより安定)
- ✅ SPA (Single Page Application) + API分離
- ✅ Astro + React (部分的ハイドレーション)

### **2. Next.js使用時の設定**

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発中はキャッシュ無効化
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
            { key: 'Pragma', value: 'no-cache' },
            { key: 'Expires', value: '0' }
          ]
        }
      ]
    }
    return []
  }
}
```

**ページレベル設定:**
```typescript
// 全ページで動的レンダリング強制
export const dynamic = 'force-dynamic'
export const runtime = 'edge' // オプション
```

### **3. コーディング規則**

**避けるべきパターン:**
```typescript
// ❌ 複雑な条件分岐
{!user ? (
  <ComplexComponent />
) : (
  <AnotherComplexComponent />
)}

// ❌ useEffect内での条件分岐
useEffect(() => {
  if (user) {
    // 複雑な処理
  }
}, [user])
```

**推奨パターン:**
```typescript
// ✅ シンプルな表示/非表示
<div style={{ display: user ? 'block' : 'none' }}>
  <Component />
</div>

// ✅ CSS classによる制御
<div className={user ? 'visible' : 'hidden'}>
  <Component />
</div>
```

---

## 🔧 問題発生時の対処法

### **1. 緊急対応（即座に実行）**

```bash
# ブラウザでハードリフレッシュ
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 開発者ツールでキャッシュクリア
F12 → Application → Storage → Clear site data

# シークレットモードでテスト
Ctrl + Shift + N (Chrome)
```

### **2. コード修正での対応**

**vercel.json追加:**
```json
{
  "version": 2,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "X-Cache-Buster", "value": "$(date +%s)" }
      ]
    }
  ]
}
```

**タイムスタンプによるキャッシュバスター:**
```typescript
// URLにタイムスタンプ追加
<Link href={`/page?v=${Date.now()}`}>

// data属性でキャッシュバスター
<div data-cache-buster={Date.now()}>
```

### **3. デプロイレベルでの対応**

```bash
# Vercelキャッシュクリア
npx vercel --prod --force

# 環境変数でキャッシュ無効化
VERCEL_FORCE_NO_BUILD_CACHE=1

# 新しいドメインでテスト
vercel --prod --alias=test-$(date +%s).vercel.app
```

---

## 📋 デバッグチェックリスト

### **問題発生時の確認手順:**

1. **[ ] ブラウザキャッシュ確認**
   - ハードリフレッシュ実行
   - シークレットモードでテスト
   - 異なるブラウザでテスト

2. **[ ] Vercelデプロイ確認**
   - デプロイが完了しているか
   - ビルドエラーが発生していないか
   - コミットハッシュが最新か

3. **[ ] コード確認**
   - 条件分岐が複雑すぎないか
   - TypeScriptエラーがないか
   - console.logが出力されているか

4. **[ ] 設定確認**
   - next.config.jsが正しいか
   - vercel.jsonが設定されているか
   - 環境変数が正しいか

---

## 🎯 最終的な解決策

### **小規模プロジェクトの場合:**

**Vite + React + Netlify/Vercel:**
```bash
# プロジェクト作成
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

**利点:**
- キャッシュ問題がほぼ発生しない
- 即座に反映される
- シンプルな設定

### **中規模プロジェクトの場合:**

**Next.js Pages Router:**
```bash
# Pages Routerで作成
npx create-next-app@latest --use-npm --pages-src
```

**利点:**
- App Routerより安定
- キャッシュ制御が簡単
- 豊富な情報とサンプル

---

## ⚠️ 重要な教訓

1. **技術選択の重要性**
   - 新しい技術は必ずしも良いとは限らない
   - 安定性 > 最新性
   - チーム全体の理解度を考慮

2. **開発体験の優先**
   - 修正が即座に反映されること
   - デバッグが容易であること
   - 問題の原因が特定しやすいこと

3. **プロダクション準備**
   - 開発中に発生する問題は本番でも発生する
   - ユーザー体験の悪化につながる
   - 運用コストの増大

---

## 📞 緊急時の連絡先

**問題が解決しない場合:**
1. プロジェクトを一時的に停止
2. より安定した技術スタックへの移行を検討
3. 専門家に相談

**記録すべき情報:**
- 発生時刻
- 実行したコマンド
- エラーメッセージ
- ブラウザとOS情報
- 再現手順