# ドキュメント概要

## 1. プロジェクトの目的

VoiceCastは、配信者が管理画面から音声エピソードを登録し、ユーザーがWebブラウザから再生できるシンプルな音声配信プラットフォームです。

## 2. 技術構成と設計思想

本プロジェクトは、当初のSupabaseベースの構成から、メンテナンス性、拡張性、そしてGoogle Cloudとの親和性を高めるために、**Firebase**をバックエンドの中核としたモダンなWebアプリケーションとして再構築されました。

### 2.1. 主要技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **バックエンド**: Firebase
  - **データベース**: Firestore
  - **認証**: Firebase Authentication
  - **ストレージ**: Cloud Storage for Firebase
- **ホスティング**: Firebase Hosting (with Frameworks integration)
- **スタイリング**: Tailwind CSS

### 2.2. 設計方針

- **クライアント中心の認証**: 認証状態の管理は、Firebase SDKを通じてクライアントサイドで完結させます。`onAuthStateChanged` を利用してリアルタイムに状態を監視し、UIに反映させます。
- **サーバーコンポーネントとクライアントコンポーネントの分離**: Next.jsのベストプラクティスに従い、静的な表示や骨格はサーバーコンポーネント、ユーザーのインタラクションが必要な部分はクライアントコンポーネント (`'use client'`) として明確に分離します。
- **Infrastructure as Code (IaC)**: Firestoreのセキュリティルール (`firestore.rules`) やインデックス (`firestore.indexes.json`)、ホスティング設定 (`firebase.json`) は、すべてコードとしてリポジトリで管理します。
- **単一責任の原則**: 各コンポーネントやモジュールは、一つの機能にのみ責任を持つように設計します。（例: `components/login-form.tsx` はログインフォームのUIとロジックのみを担当）

## 3. ディレクトリ構造の概要

```
/
├─ app/              # Next.js App Routerのルート
│  ├─ admin/         # 【保護ルート】管理画面
│  ├─ login/         # ログインページ
│  └─ hooks/         # Reactカスタムフック
│
├─ components/       # 再利用可能なReactコンポーネント
│
├─ lib/firebase/     # Firebaseクライアント初期化のヘルパー
│
├─ firebase.json     # Firebase Hostingの設定
├─ firestore.rules   # Firestoreセキュリティルール
│
└─ docs/             # ★このドキュメント群
```