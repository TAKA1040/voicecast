/** @type {import('next').NextConfig} */
const nextConfig = {
  // 極度なキャッシュ無効化設定
  generateBuildId: () => 'build-' + Date.now(),
  
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
