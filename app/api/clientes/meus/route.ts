import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCache, setCache } from "@/lib/cache";

// GET - Listar clientes do usuário logado
export async function GET(req: NextRequest) {
  try {
    // Como não temos NextAuth, vamos usar um header customizado ou query parameter
    // para identificar o usuário. Em produção, isso deveria ser feito com JWT ou session.
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userRole = searchParams.get("userRole");

    console.log("🔍 API /api/clientes/meus chamada com:", { userId, userRole });

    if (!userId) {
      console.log("❌ ID do usuário não fornecido");
      return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
    }

    // Tentar obter do cache primeiro
    const cacheKey = `clientes-usuario-${userId}`;
    const cachedClientes = getCache(cacheKey);
    
    if (cachedClientes) {
      console.log(`📦 Retornando clientes do usuário ${userId} do cache`);
      return NextResponse.json(cachedClientes);
    }

    console.log(`🔄 Buscando clientes do usuário ${userId} do banco...`);
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Construir filtro baseado no papel do usuário
    let filtro: any = {};
    
    if (userRole !== "admin") {
      // Vendedores só veem seus próprios clientes
      filtro.criadoPor = userId;
      console.log(`🔍 Filtro aplicado para usuário ${userId}:`, filtro);
    }
    // Admins veem todos os clientes (filtro vazio)

    const documentos = await collection.find(filtro).toArray();
    console.log(`📊 ${documentos.length} documentos encontrados para usuário ${userId}`);

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

    console.log(`✅ ${clientesCorrigidos.length} clientes processados para usuário ${userId}`);

    // Cache por 2 minutos para dados do usuário
    const ttl = 2 * 60 * 1000;
    setCache(cacheKey, clientesCorrigidos, ttl);
    
    console.log(`💾 ${clientesCorrigidos.length} clientes do usuário ${userId} salvos no cache por ${ttl/1000}s`);
    
    // Adicionar headers para controle de cache
    const response = NextResponse.json(clientesCorrigidos);
    response.headers.set('Cache-Control', 'private, max-age=120'); // 2 minutos
    response.headers.set('X-Cache-Status', 'MISS');
    
    return response;
  } catch (error) {
    console.error("Erro ao buscar clientes do usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}
