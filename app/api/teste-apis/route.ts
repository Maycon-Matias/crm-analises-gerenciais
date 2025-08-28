import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCache, setCache } from "@/lib/cache";

// GET - Testar todas as APIs principais
export async function GET() {
  try {
    console.log("🧪 Iniciando testes das APIs...");
    
    const resultados = {
      mongodb: false,
      cache: false,
      timestamp: new Date().toISOString()
    };

    // Teste 1: Conexão com MongoDB
    try {
      const client = await clientPromise;
      const db = client.db("crm");
      const collections = await db.listCollections().toArray();
      resultados.mongodb = true;
      console.log("✅ MongoDB: OK");
    } catch (error) {
      console.error("❌ MongoDB: Falhou", error);
    }

    // Teste 2: Sistema de Cache
    try {
      setCache("teste", "dados-teste", 60000);
      const dadosCache = getCache("teste");
      resultados.cache = dadosCache === "dados-teste";
      console.log("✅ Cache: OK");
    } catch (error) {
      console.error("❌ Cache: Falhou", error);
    }

    return NextResponse.json({
      success: true,
      message: "Teste das APIs concluído",
      resultados,
      collections: resultados.mongodb ? await (await clientPromise).db("crm").listCollections().toArray() : []
    });
  } catch (error) {
    console.error("❌ Erro no teste das APIs:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erro no teste das APIs",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
