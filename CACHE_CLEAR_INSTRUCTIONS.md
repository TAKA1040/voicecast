# キャッシュクリア手順

管理画面からホームページに戻れない場合の手順：

## Chrome/Edge
1. F12 → 開発者ツール
2. Application タブ
3. Storage → Clear site data
4. または Ctrl+Shift+R (スーパーリロード)

## Firefox  
1. F12 → 開発者ツール
2. Storage タブ
3. サイトデータをクリア
4. または Ctrl+Shift+R

## 簡単な方法
**シークレットモード/プライベートブラウジング** で常にテストする

## 根本的解決
Vercelの **Cache-Control** ヘッダーを設定する必要がある可能性があります。