// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Proxy API requests to Laravel backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },

  // Optional: Also proxy Sanctum CSRF cookie endpoint if you plan to use stateful Sanctum later
  // (Not needed right now since we're using token-based auth)
  // {
  //   source: '/sanctum/csrf-cookie',
  //   destination: 'http://127.0.0.1:8000/sanctum/csrf-cookie',
  // },
};

export default nextConfig;