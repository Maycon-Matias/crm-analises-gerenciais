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
  },
  
  // Configuração correta para pacotes externos
  serverExternalPackages: ['mongodb'],
  
  // Configuração para permitir origens de desenvolvimento
  allowedDevOrigins: ['192.168.100.4', 'localhost', '127.0.0.1'],
  
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
  
  // Configurações de rewrites (removido - não necessário no App Router)
  // async rewrites() {
  //   return [];
  // },
};

export default nextConfig;
