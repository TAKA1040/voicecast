# VoiceCast 開発タスクリスト（Windsurf & GEMINI 分担）

## ✅ 現在の状態

| ファイル | 実装状況 | 補足 |
|----------|----------|------|
| user/index.html | ✅ UI完成 | 音声カード静的・Supabase未接続 |
| admin/login.html | ✅ UI完成 | 認証はダミー（simulateLogin） |
| admin/admin.html | ✅ UI完成 | 音声アップロード処理は未実装 |
| scripts/supabase.js | 🔲 空のまま | Supabase接続未設定 |

---

## 🛠 タスクリスト（実装 + 文書）

### ★1. Supabase接続設定を追加する（Windsurf）

- [ ] `scripts/supabase.js` に createClient() 設定を記述
- [ ] プロジェクトURLとanon keyをAPIページからコピー
- [ ] admin.html / login.html / index.html でスクリプトを読み込む

### ★2. 認証機能の本実装（Windsurf）

- [ ] `login.html` の simulateLogin() を Supabase `signInWithPassword()` に置換
- [ ] 成功時 `admin.html` に遷移
- [ ] `admin.html` で `onAuthStateChange()` によるセッションチェックを追加

### ★3. 音声アップロードと登録処理（Windsurf）

- [ ] `<input type="file">` で選択された音声を Supabase Storage に保存
- [ ] その URL を `audio_url` として DBテーブル `episodes` に登録
- [ ] 「公開する」ボタンに連動する `publishEpisode()` を実装

### ★4. ユーザー画面に反映（Windsurf）

- [ ] `fetchEpisodes()` で Supabaseから最新のエピソード一覧を取得
- [ ] 各データをカードとして表示（タイトル・ジャンル・再生）

---

## 📘 ドキュメント & 保守用タスク（GEMINI）

### ☆ RLSポリシー設定説明書

- [ ] episodes テーブルの SELECT/INSERT RLSポリシー文を記載
- [ ] 「認証ユーザーしか投稿できない」構成を記述

### ☆ README & 操作マニュアル

- [ ] プロジェクト構成と導入手順をまとめた `README.md` を作成
- [ ] 各画面の使い方／エラー例などを追記

---

## 🗓 優先度順実行フロー（提案）

1. ★1 Supabase接続 → 完成確認
2. ★2 認証 → login → admin 遷移確認
3. ★3 管理画面から投稿 → Storage + DB反映
4. ★4 ユーザー画面で動的表示確認
5. ☆ 文書対応（README / RLS）をGEMINIで進行

---

## 更新履歴

- **2025-07-21**：初版作成（Windsurf実装分担＋GEMINI文書作成タスク分離）