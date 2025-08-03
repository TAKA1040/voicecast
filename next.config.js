/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的サイト生成を完全無効化
  output: 'standalone',
  
  // 全ページを動的レンダリング強制
  experimental: {
    isrMemoryCacheSize: 0,
  },
  
  // キャッシュを完全に無効化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires', 
            value: '0'
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig