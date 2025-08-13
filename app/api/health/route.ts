import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Verificar conexão com MongoDB
    const client = await clientPromise;
    const db = client.db("crm");
    
    // Ping no banco de dados
    await db.admin().ping();
    
    const responseTime = Date.now() - startTime;
    
    await logger.info("Health check realizado com sucesso", {
      action: "health_check",
      resource: "system",
      metadata: { responseTime }
    });
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${responseTime}ms`
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    await logger.error("Health check falhou", {
      action: "health_check",
      resource: "system",
      error: error as Error,
      metadata: { responseTime }
    });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      responseTime: `${responseTime}ms`
    }, { status: 503 });
  }
}
