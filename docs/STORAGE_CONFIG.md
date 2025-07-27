# Cloud Storage (Cloudflare R2) 運用設定

## 1. ストレージ構成

本プロジェクトでは、音声ファイルの保存場所として **Cloudflare R2** を利用します。R2は、CloudflareのCDNと統合されており、大容量ファイルの配信において下り（Egress）の通信料金が無料という大きなメリットがあります。

- **プロバイダ**: Cloudflare R2
- **バケット名**: `.env.local` の `R2_BUCKET_NAME` で設定
- **公開URL**: `.env.local` の `NEXT_PUBLIC_R2_PUBLIC_URL` で設定

## 2. ファイルパス命名規則

アップロードされる音声ファイルは、Vercel APIルートで生成された一意なキーで保存されます。

- **パス形式**: `{timestamp}_{original_filename}`
- **例**: `1678886400000_episode1.mp3`

このキーは、Firestoreに保存される `audio_url` の一部となります。

## 3. アップロードフロー

セキュリティを確保するため、クライアント（ブラウザ）は直接R2に書き込む権限を持ちません。代わりに、以下の署名付きURL（Presigned URL）方式を採用しています。

1.  クライアントは、アップロードしたいファイルの情報（ファイル名、Content-Type）をVercelのAPIルート (`/api/upload-url`) に送信します。
2.  APIルートは、Cloudflare R2のSDKを使い、5分間だけ有効なアップロード専用のURL（署名付きURL）を生成し、クライアントに返します。
3.  クライアントは、受け取った署名付きURLに対して、音声ファイルをPUTリクエストで直接アップロードします。
4.  アップロード完了後、クライアントはR2の公開URLと他のメタデータ（タイトルなど）をFirestoreに保存します。

この方式により、サーバーの認証情報（`R2_SECRET_ACCESS_KEY`など）をクライアントに一切公開することなく、安全なファイルアップロードを実現しています。
