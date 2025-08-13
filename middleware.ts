import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache simples em memória para rate limiting
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

// Configurações de rate limiting
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100');
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutos

// Função para verificar rate limit
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Primeira requisição ou janela expirada
    rateLimitCache.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit excedido
  }
  
  // Incrementar contador
  record.count++;
  return true;
}

// Função para obter identificador único do cliente
function getClientIdentifier(req: NextRequest): string {
  // Tentar obter IP real (considerando proxies)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || req.ip || 'unknown';
  
  // Combinar IP com user agent para maior precisão
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent}`;
}

// Função para limpar cache expirado periodicamente
function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, record] of rateLimitCache.entries()) {
    if (now > record.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}

// Executar limpeza a cada 5 minutos
setInterval(cleanupExpiredCache, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  // Aplicar rate limiting apenas para APIs
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request);
    
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { 
          error: 'Rate limit excedido', 
          message: 'Muitas requisições. Tente novamente em alguns minutos.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW_MS).toString()
          }
        }
      );
    }
    
    // Adicionar headers de rate limit
    const record = rateLimitCache.get(identifier);
    if (record) {
      const remaining = Math.max(0, RATE_LIMIT_MAX - record.count);
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', record.resetTime.toString());
      return response;
    }
  }
  
  // Adicionar headers de segurança básicos
  const response = NextResponse.next();
  
  // Headers de segurança
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers de cache para APIs
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// Configurar quais rotas usar o middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
