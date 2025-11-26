import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("crm");
    
    // Testar conexão
    const collections = await db.listCollections().toArray();
    
    // Contar documentos em cada coleção
    const stats = {};
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      stats[collection.name] = count;
    }
    
    return NextResponse.json({
      success: true,
      message: "Conexão com MongoDB estabelecida",
      collections: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao conectar com MongoDB:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
