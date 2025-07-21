# VoiceCast ― 音声配信プラットフォーム設計書（完全版）

## 1. プロジェクト概要
| 項目 | 内容 |
|------|------|
| プロジェクト名 | **VoiceCast** |
| ローカル保存先 | `C:\Windsurf\voiceCast\` |
| 目的 | エピソード（音声）を配信者が管理画面から登録し、ユーザー画面で再生できるようにする |
| 技術スタック | **HTML（CSS内包）＋ JavaScript**  / **Supabase**（DB・Auth・Storage）|

---

## 2. フォルダ／ファイル構成

voiceCast/
├─ user/
│ └─ index.html ... ユーザー向け再生画面
│
├─ admin/
│ ├─ login.html ... 配信者ログイン画面
│ └─ admin.html ... 管理ダッシュボード & 音声アップロード
│
├─ scripts/
│ └─ supabase.js ... Supabase 初期化 & 共通 API ラッパー
│
└─ assets/
├─ images/ ... サムネイル・UI画像など
└─ audio/ ... （オフライン開発用）サンプル音声



> **ポイント**  
> - CSS は各 HTML 内の `<style>` タグで完結。ファイル数を増やさず管理しやすい構成。  
> - すべての HTML から `scripts/supabase.js` を読み込み、Supabase に一元アクセス。

---

## 3. Supabase 設定

### 3-1. プロジェクト

| 設定 | 値 |
|------|----|
| Region | Tokyo (推奨) |
| RLS | **有効**（デフォルト ON） |

### 3-2. テーブル定義：`episodes`

```sql
create table episodes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  genre       text,
  audio_url   text not null,
  created_at  timestamp with time zone default now()
);
3-3. ストレージ
バケット名	用途
audio	アップロードされた音声ファイル（MP3 / WAV / M4A）

3-4. 認証（Auth）
項目	設定
メール/パスワード	有効
OAuth	今回は未使用
RLS Policy (episodes)	
SELECT : auth.role() = 'authenticated'
INSERT/UPDATE/DELETE : auth.role() = 'authenticated'

4. 共通スクリプト：scripts/supabase.js

// Supabase 初期化
const supabase = supabase.createClient(
  'https://<PROJECT>.supabase.co',
  '<PUBLIC_ANON_KEY>'
);

/* ---------- 認証 ---------- */
async function login(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}
async function logout() {
  return await supabase.auth.signOut();
}
function onAuthStateChanged(callback) {
  supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

/* ---------- Episodes ---------- */
async function uploadAudio(file) {
  const filepath = `${crypto.randomUUID()}/${file.name}`;
  const { error } = await supabase.storage
    .from('audio')
    .upload(filepath, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase
    .storage
    .from('audio')
    .getPublicUrl(filepath);
  return data.publicUrl;
}

async function createEpisode({ title, description, genre, audioUrl }) {
  const { error } = await supabase.from('episodes').insert({
    title, description, genre, audio_url: audioUrl
  });
  if (error) throw error;
}

async function fetchEpisodes() {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
5. 各 HTML の役割と連携
画面	主な機能	Supabase 呼び出し
login.html	メール & パスワード認証フォーム → 成功後に admin.html へリダイレクト	login()
admin.html	1. ドラッグ & ドロップで音声選択
2. プレビュー・メタ情報入力
3. 「公開する」クリックで audio バケットにアップロード → episodes 挿入	uploadAudio(), createEpisode()
user/index.html	1. ページロード時に fetchEpisodes() で最新一覧取得
2. カード表示 & 再生プレイヤー制御	fetchEpisodes()

6. 画面遷移フロー（配信者）

graph TD
    A[login.html] -- 成功 --> B[admin.html]
    B -- ログアウト --> A
7. セキュリティ & 運用メモ
環境変数

PUBLIC_ANON_KEY 等を公開リポジトリに置かない。開発時はローカル .env、本番は Vercel の環境変数機能へ。

RLS 必須

認証なしアクセスで episodes が読み取られないように確認。

ストレージ制限

バケット単位で Authenticated のみ書き込み可、読み取りは Public 可かどうか要件で決定。

8. 今後のタスク
優先	内容
★	admin.html にアップロード進行状況を Supabase Storage の実アップロードに置き換える
★	login.html にパスワードリセット（Supabase resetPasswordForEmail）実装
☆	ユーザー画面でジャンル / 検索フィルタを Supabase クエリに置き換え
☆	再生回数やいいね数を episodes にカラム追加し、更新 API を作成
△	PWA 化（オフライン再生）・分析基盤連携など