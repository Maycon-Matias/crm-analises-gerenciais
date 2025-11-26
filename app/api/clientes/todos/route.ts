import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCache, setCache, deleteCache } from "@/lib/cache";

// GET - Listar TODOS os clientes (sem paginação)
export async function GET() {
  try {
    console.log("🔄 API /api/clientes/todos chamada");
    
    // Tentar obter do cache primeiro
    const cacheKey = "clientes-todos";
    const cachedClientes = getCache(cacheKey);
    
    if (cachedClientes) {
      console.log("📦 Retornando TODOS os clientes do cache");
      console.log(`📊 Cache contém ${cachedClientes.length} clientes`);
      return NextResponse.json(cachedClientes);
    }

    console.log("🔄 Buscando TODOS os clientes do banco...");
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Contar documentos antes de buscar
    const totalDocs = await collection.countDocuments();
    console.log(`📊 Total de documentos na coleção: ${totalDocs}`);

    const documentos = await collection.find({}).toArray();
    console.log(`📋 Documentos encontrados: ${documentos.length}`);

    const clientesCorrigidos = documentos.map((doc) => {
      return {
        id: doc._id.toString(),
        cliente: doc.cliente?.trim() || doc["cliente "]?.trim() || "",
        produto: doc.produto?.trim() || doc["produto "]?.trim() || "",
        banco: doc.banco?.trim() || doc["banco "]?.trim() || "",
        fonte: doc.fonte?.trim() || doc["fonte "]?.trim() || "",
        valor: doc.valor?.trim() || doc["valor "]?.trim() || doc["vale.."]?.trim() || "R$ 0,00",
        data: doc.data || doc["data "] || "",
        mes: doc.mes || doc["me.."] || "",
        usuarios: doc.usuarios?.trim() || doc["usuários"]?.trim() || "",
        status: doc.status?.trim() || doc["status "]?.trim() || "pendente",
        cpf: doc.cpf?.trim() || "",
        telefone: doc.telefone?.trim() || "",
        criadoPor: doc.criadoPor || "",
        data_previsao_pagamento: doc.data_previsao_pagamento || "",
        data_pagamento: doc.data_pagamento || "",
        observacoes: doc.observacoes?.trim() || ""
      };
    });

    console.log(`✅ ${clientesCorrigidos.length} clientes processados`);
    console.log("📋 Primeiros clientes:", clientesCorrigidos.slice(0, 3).map(c => ({
      id: c.id,
      cliente: c.cliente,
      status: c.status,
      criadoPor: c.criadoPor
    })));

    // Cache por 3 minutos
    const ttl = 3 * 60 * 1000;
    setCache(cacheKey, clientesCorrigidos, ttl);
    
    console.log(`💾 ${clientesCorrigidos.length} clientes salvos no cache por ${ttl/1000}s`);
    
    // Adicionar headers para controle de cache
    const response = NextResponse.json(clientesCorrigidos);
    response.headers.set('Cache-Control', 'public, max-age=180');
    response.headers.set('X-Cache-Status', 'MISS');
    
    return response;
  } catch (error) {
    console.error("❌ Erro ao buscar todos os clientes:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

// POST - Limpar cache (para debug)
export async function POST() {
  try {
    console.log("🗑️ Limpando cache de clientes...");
    deleteCache("clientes-todos");
    return NextResponse.json({ success: true, message: "Cache limpo" });
  } catch (error) {
    console.error("❌ Erro ao limpar cache:", error);
    return NextResponse.json({ error: "Erro ao limpar cache" }, { status: 500 });
  }
}
