import { NextResponse } from "next/server";
import { getCache, setCache, getCacheStats } from "@/lib/cache";

export async function GET() {
  try {
    // Testar cache
    const testKey = "test-cache";
    const testData = { message: "Teste de cache", timestamp: Date.now() };
    
    // Definir cache
    setCache(testKey, testData, 60000); // 1 minuto
    
    // Obter do cache
    const cachedData = getCache(testKey);
    
    // Estatísticas do cache
    const stats = getCacheStats();
    
    return NextResponse.json({
      success: true,
      test: {
        set: testData,
        retrieved: cachedData,
        working: cachedData !== null
      },
      stats
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
