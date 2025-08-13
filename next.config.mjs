/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de segurança
  poweredByHeader: false,
  
  // Configurações de imagens
  images: {
    unoptimized: true,
    domains: [], // Lista de domínios permitidos para imagens
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configurações experimentais
  experimental: {
    forceSwcTransforms: false,
    serverComponentsExternalPackages: ['mongodb'],
  },
  
  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  
  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/clientes',
        permanent: true,
      },
    ];
  },
  
  // Configurações de rewrites
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health/route',
      },
    ];
  },
};

export default nextConfig;
