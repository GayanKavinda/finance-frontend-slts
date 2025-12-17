/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/sanctum/csrf-cookie',
        destination: 'http://localhost:8000/sanctum/csrf-cookie',
      },
    ];
  },
};

export default nextConfig;