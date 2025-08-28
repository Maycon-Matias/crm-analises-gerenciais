import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCache, setCache } from "@/lib/cache";

// GET - Buscar notificações de previsões de pagamento
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usuario = searchParams.get("usuario");
    const data = searchParams.get("data") || new Date().toISOString().split('T')[0];
    
    const cacheKey = `notificacoes-previsoes-${usuario || 'todos'}-${data}`;
    const cachedResult = getCache(cacheKey);
    
    if (cachedResult) {
      console.log("📦 Retornando notificações de previsões do cache");
      return NextResponse.json(cachedResult);
    }

    console.log("🔄 Buscando notificações de previsões do banco...");
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Buscar clientes com previsão para a data especificada
    const filtros: any = {
      data_previsao_pagamento: data,
      status: { $in: ["pendente", "cancelado"] } // Só clientes que ainda não pagaram
    };

    if (usuario) {
      filtros.usuarios = usuario;
    }

    const clientesComPrevisao = await collection.find(filtros).toArray();

    // Calcular estatísticas
    const totalPrevisto = clientesComPrevisao.reduce((acc, cliente) => {
      const valor = Number(cliente.valor?.replace("R$", "").replace(/\./g, "").replace(",", ".") || "0");
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    const resultado = {
      data,
      usuario: usuario || "todos",
      totalClientes: clientesComPrevisao.length,
      totalPrevisto: `R$ ${totalPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      clientes: clientesComPrevisao.map((doc) => ({
        id: doc._id.toString(),
        cliente: doc.cliente?.trim() || "",
        produto: doc.produto?.trim() || "",
        valor: doc.valor?.trim() || "",
        usuarios: doc.usuarios?.trim() || "",
        status: doc.status?.trim() || "",
        data_previsao_pagamento: doc.data_previsao_pagamento || "",
        observacoes: doc.observacoes?.trim() || ""
      }))
    };

    // Salvar no cache por 1 hora (notificações mudam pouco)
    setCache(cacheKey, resultado, 60 * 60 * 1000);
    console.log("💾 Notificações de previsões salvas no cache");

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar notificações de previsões:", error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

// POST - Marcar notificação como lida
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clienteId, usuario, data } = body;

    // Aqui você pode implementar um sistema para marcar notificações como lidas
    // Por enquanto, apenas retornamos sucesso
    console.log(`📱 Notificação marcada como lida: Cliente ${clienteId} para usuário ${usuario} em ${data}`);

    return NextResponse.json({ success: true, message: "Notificação marcada como lida" });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return NextResponse.json({ error: "Erro ao processar notificação" }, { status: 500 });
  }
}
