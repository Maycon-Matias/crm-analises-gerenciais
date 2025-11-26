import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getCache, setCache, deleteCache } from "@/lib/cache";

// GET - Listar todas as metas
export async function GET(_req: NextRequest) {
  try {
    // Tentar obter do cache primeiro
    const cacheKey = "metas-todas";
    const cachedMetas = getCache(cacheKey);
    
    if (cachedMetas) {
      console.log("📦 Retornando metas do cache");
      return NextResponse.json(cachedMetas);
    }

    console.log("🔄 Buscando metas do banco...");
    
    // Tentar conectar com retry
    let client;
    let retries = 3;
    
    while (retries > 0) {
      try {
        client = await clientPromise;
        break;
      } catch (error) {
        retries--;
        console.warn(`⚠️ Tentativa de conexão falhou, ${retries} tentativas restantes:`, error);
        
        if (retries === 0) {
          throw error;
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!client) {
      throw new Error("Falha ao conectar com o MongoDB após múltiplas tentativas");
    }
    
    const db = client.db("crm");
    const collection = db.collection("metas");

    const metas = await collection.find({}).toArray();

    const metasFormatadas = metas.map((meta) => ({
      id: meta._id.toString(),
      usuario: meta.usuario,
      mes: meta.mes,
      ano: meta.ano,
      valorMeta: meta.valorMeta,
      criadaEm: meta.criadaEm,
      tipo: meta.tipo || "valor",
    }));

    // Salvar no cache por 5 minutos
    setCache(cacheKey, metasFormatadas, 5 * 60 * 1000);
    console.log(`💾 ${metasFormatadas.length} metas salvas no cache`);

    return NextResponse.json(metasFormatadas);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    
    // Retornar erro mais específico baseado no tipo de erro
    const err = error as Error & { name?: string };
    if (err.name === 'MongoServerSelectionError') {
      return NextResponse.json({ 
        error: "Erro de conexão com o banco de dados. Verifique se o MongoDB está acessível.",
        details: "Server selection timed out"
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: "Erro ao buscar metas",
      details: err.message || "Erro desconhecido"
    }, { status: 500 });
  }
}

// POST - Criar nova meta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("metas");

    const novaMeta = {
      ...body,
      criadaEm: new Date().toISOString(),
    };

    const result = await collection.insertOne(novaMeta);

    // Limpar cache de metas (dados mudaram)
    deleteCache("metas-todas");
    console.log("🗑️ Cache de metas limpo após criação");

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      meta: { ...novaMeta, id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}

// PUT - Atualizar meta
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("metas");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    // Limpar cache de metas (dados mudaram)
    deleteCache("metas-todas");
    console.log("🗑️ Cache de metas limpo após atualização");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 });
  }
}

// DELETE - Excluir meta
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("metas");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    // Limpar cache de metas (dados mudaram)
    deleteCache("metas-todas");
    console.log("🗑️ Cache de metas limpo após exclusão");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return NextResponse.json({ error: "Erro ao excluir meta" }, { status: 500 });
  }
}
