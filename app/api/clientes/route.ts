import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { dispararWebhooks } from "@/lib/webhook";
import { getCache, setCache, deleteCache } from "@/lib/cache";

// GET - Listar clientes com paginação
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parâmetros de paginação
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = Math.min(parseInt(searchParams.get("limite") || "50"), 100); // Máximo 100 por página
    const ordenacao = searchParams.get("ordenacao") || "desc";
    const campo = searchParams.get("campo") || "data";
    
    // Parâmetros de filtro
    const status = searchParams.get("status");
    const mes = searchParams.get("mes");
    const usuario = searchParams.get("usuario");
    
    // Calcular offset
    const offset = (pagina - 1) * limite;
    
    // Criar chave de cache única para esta consulta
    const cacheKey = `clientes-${pagina}-${limite}-${ordenacao}-${campo}-${status || 'all'}-${mes || 'all'}-${usuario || 'all'}`;
    
    // Tentar obter do cache primeiro
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      console.log("📦 Retornando clientes paginados do cache");
      return NextResponse.json(cachedResult);
    }

    console.log("🔄 Buscando clientes paginados do banco...");
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Construir filtros
    const filtros: any = {};
    if (status) filtros.status = status;
    if (mes) filtros.mes = mes;
    if (usuario) filtros.usuarios = usuario;

    // Construir ordenação
    const ordenacaoObj: any = {};
    if (campo === "data") {
      ordenacaoObj.data = ordenacao === "asc" ? 1 : -1;
    } else if (campo === "cliente") {
      ordenacaoObj.cliente = ordenacao === "asc" ? 1 : -1;
    } else if (campo === "valor") {
      ordenacaoObj.valor = ordenacao === "asc" ? 1 : -1;
    } else {
      ordenacaoObj.data = ordenacao === "asc" ? 1 : -1;
    }

    // Contar total de documentos (com filtros)
    const total = await collection.countDocuments(filtros);
    
    // Buscar documentos paginados
    const documentos = await collection
      .find(filtros)
      .sort(ordenacaoObj)
      .skip(offset)
      .limit(limite)
      .toArray();

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

    // Calcular informações de paginação
    const totalPaginas = Math.ceil(total / limite);
    const temProxima = pagina < totalPaginas;
    const temAnterior = pagina > 1;

    const resultado = {
      clientes: clientesCorrigidos,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas,
        temProxima,
        temAnterior,
        offset
      },
      filtros: {
        status: status || null,
        mes: mes || null,
        usuario: usuario || null,
        ordenacao,
        campo
      }
    };

    // Salvar no cache por 2 minutos
    setCache(cacheKey, resultado, 2 * 60 * 1000);
    console.log("💾 Clientes paginados salvos no cache");

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

// POST - Cadastrar novo cliente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const result = await collection.insertOne(body);

    // CORREÇÃO: Limpar apenas caches específicos em vez de todos
    clearSpecificClientesCache();
    console.log("🗑️ Caches específicos de clientes limpos após inserção");

    // Disparar webhook para cliente criado
    const clienteComId = { ...body, id: result.insertedId.toString() };
    await dispararWebhooks("cliente.criado", clienteComId);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    return NextResponse.json({ error: "Erro ao cadastrar cliente" }, { status: 500 });
  }
}

// PUT - Atualizar cliente
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    const dadosAtualizados = await req.json();

    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Buscar o cliente atual para verificar permissões
    const clienteAtual = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!clienteAtual) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: dadosAtualizados }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // CORREÇÃO: Limpar apenas caches específicos em vez de todos
    clearSpecificClientesCache();
    console.log("🗑️ Caches específicos de clientes limpos após atualização");

    // Disparar webhook para cliente atualizado
    const clienteAtualizado = { ...clienteAtual, ...dadosAtualizados, id };
    await dispararWebhooks("cliente.atualizado", clienteAtualizado);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

// DELETE - Excluir cliente
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Buscar o cliente antes de excluir para o webhook
    const clienteAtual = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!clienteAtual) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // CORREÇÃO: Limpar apenas caches específicos em vez de todos
    clearSpecificClientesCache();
    console.log("🗑️ Caches específicos de clientes limpos após exclusão");

    // Disparar webhook para cliente excluído
    await dispararWebhooks("cliente.excluido", { id, ...clienteAtual });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}

// CORREÇÃO: Função otimizada para limpar apenas caches específicos
function clearSpecificClientesCache() {
  // Limpar cache de todos os clientes (mais importante)
  deleteCache("clientes-todos");
  
  // Limpar apenas caches paginados básicos (não todos)
  const paginasPrincipais = [1, 2, 3]; // Apenas primeiras páginas
  const limitesPrincipais = [10, 25, 50]; // Limites mais usados
  
  for (let p of paginasPrincipais) {
    for (let l of limitesPrincipais) {
      for (let o of ["desc"]) { // Apenas ordenação padrão
        for (let c of ["data"]) { // Apenas campo padrão
          deleteCache(`clientes-${p}-${l}-${o}-${c}-all-all-all`);
        }
      }
    }
  }
  
  console.log("🧹 Cache limpo de forma inteligente");
}
