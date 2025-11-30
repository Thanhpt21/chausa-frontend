/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  async headers() {
    return [
      {
        // Áp dụng cho tất cả API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Hoặc domain cụ thể
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' }
        ]
      },
      {
        // Áp dụng cho các tài nguyên tĩnh nếu cần
        source: '/:path*.(jpg|jpeg|png|gif|ico|svg|webp)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'https://eitbackend-production.up.railway.app/:path*'
      },
      {
        source: '/api/auth/:path*',
        destination: 'https://eitbackend-production.up.railway.app/auth/:path*'
      }
    ]
  }
};

module.exports = nextConfig;