import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET - Testar conexão com MongoDB
export async function GET() {
  try {
    console.log("🔄 Testando conexão com MongoDB...");
    
    const client = await clientPromise;
    const db = client.db("crm");
    
    // Testar se conseguimos listar as coleções
    const collections = await db.listCollections().toArray();
    console.log("✅ Conexão com MongoDB bem-sucedida");
    console.log("📚 Coleções disponíveis:", collections.map(c => c.name));
    
    return NextResponse.json({ 
      success: true, 
      message: "Conexão com MongoDB OK",
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Erro na conexão com MongoDB:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erro na conexão com MongoDB",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
