import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Testando conexão MongoDB...");
    
    const client = await clientPromise;
    console.log("Cliente MongoDB conectado");
    
    const db = client.db("crm");
    console.log("Database selecionado");
    
    const collections = await db.listCollections().toArray();
    console.log("Collections encontradas:", collections.map(c => c.name));
    
    return NextResponse.json({ 
      status: "success", 
      message: "MongoDB conectado com sucesso",
      collections: collections.map(c => c.name)
    });
    
  } catch (error) {
    console.error("Erro na conexão MongoDB:", error);
    return NextResponse.json({ 
      status: "error", 
      message: "Erro na conexão MongoDB",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
