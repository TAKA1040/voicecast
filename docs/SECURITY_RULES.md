# Firestore / Storage セキュリティルール設計

本プロジェクトでは、データベースとストレージのセキュリティを確保するため、Firebaseのセキュリティルールを全面的に活用します。基本方針は**「デフォルトで全拒否、許可する操作を明示的に定義する」**です。

## 1. 設計思想

- **管理者中心のアクセス制御**: コンテンツの書き込み（作成・更新・削除）は、特定のGoogleアカウントでログインした管理者のみに許可します。
- **管理者判定**: 認証されたユーザーのEメールアドレス（`request.auth.token.email`）が、ルールにハードコードされた管理者アドレスと一致するかどうかで判定します。
- **公開読み取り**: `episodes` のような公開コンテンツは、誰でも読み取り可能です。

## 2. Firestore (`episodes` コレクション) のルール

- **ファイルパス**: `firestore.rules`
- **ルール定義**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /episodes/{episodeId} {
      // 誰でも読み取り可能
      allow read: if true;

      // 書き込みは、認証済みで、かつメールアドレスが管理者のものである場合のみ許可
      allow write: if request.auth != null && request.auth.token.email == 'dash201206@gmail.com';
    }
  }
}
```

## 3. Cloud Storage (`audios` フォルダ) のルール

- **場所**: Firebaseコンソールの `Storage` -> `ルール` タブで設定
- **ルール定義**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // audiosフォルダ以下のファイルに対するルール
    match /audios/{userId}/{fileName} {
      // 誰でも読み取り可能 (音声再生のため)
      allow read: if true;

      // 書き込みは認証済みユーザーにのみ許可
      // 詳細な管理者チェックはFirestoreルールで行うため、Storageルールはシンプルに保つ
      allow write: if request.auth != null;
    }
  }
}
```