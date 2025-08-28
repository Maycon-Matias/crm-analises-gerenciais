import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET - Testar se há clientes no banco
export async function GET() {
  try {
    console.log("🧪 Testando API de clientes...");
    
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Contar total de clientes
    const totalClientes = await collection.countDocuments();
    console.log(`📊 Total de clientes no banco: ${totalClientes}`);

    // Buscar alguns clientes para verificar estrutura
    const algunsClientes = await collection.find({}).limit(5).toArray();
    console.log("📋 Estrutura dos primeiros clientes:", algunsClientes.map(c => ({
      id: c._id,
      cliente: c.cliente,
      status: c.status,
      criadoPor: c.criadoPor
    })));

    // Verificar se há clientes com diferentes status
    const statusCounts = await collection.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    console.log("📈 Contagem por status:", statusCounts);

    // Verificar se há clientes criados por diferentes usuários
    const usuariosCounts = await collection.aggregate([
      { $group: { _id: "$criadoPor", count: { $sum: 1 } } }
    ]).toArray();
    console.log("👥 Contagem por usuário:", usuariosCounts);

    return NextResponse.json({
      success: true,
      message: "Teste de clientes concluído",
      totalClientes,
      algunsClientes: algunsClientes.map(c => ({
        id: c._id.toString(),
        cliente: c.cliente,
        status: c.status,
        criadoPor: c.criadoPor
      })),
      statusCounts,
      usuariosCounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Erro no teste de clientes:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erro no teste de clientes",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
