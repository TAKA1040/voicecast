/** @type {import('next').NextConfig} */
const nextConfig = {
  // キャッシュを完全に無効化（開発・テスト用）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires', 
            value: '0'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig