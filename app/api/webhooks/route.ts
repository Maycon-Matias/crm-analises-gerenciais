import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Listar todos os webhooks
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("webhooks");

    const webhooks = await collection.find({}).toArray();

    const webhooksFormatados = webhooks.map((webhook) => ({
      id: webhook._id.toString(),
      nome: webhook.nome,
      url: webhook.url,
      eventos: webhook.eventos,
      ativo: webhook.ativo,
      headers: webhook.headers || {},
      timeout: webhook.timeout || 30,
      tentativas: webhook.tentativas || 3,
      criadoEm: webhook.criadoEm,
      criadoPor: webhook.criadoPor,
    }));

    return NextResponse.json(webhooksFormatados);
  } catch (error) {
    console.error("Erro ao buscar webhooks:", error);
    return NextResponse.json({ error: "Erro ao buscar webhooks" }, { status: 500 });
  }
}

// POST - Criar novo webhook
export async function POST(_req: NextRequest) {
  try {
    const body = await _req.json();
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("webhooks");

    const novoWebhook = {
      ...body,
      criadoEm: new Date().toISOString(),
      criadoPor: body.criadoPor || "Sistema",
    };

    const result = await collection.insertOne(novoWebhook);

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      webhook: { ...novoWebhook, id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error("Erro ao criar webhook:", error);
    return NextResponse.json({ error: "Erro ao criar webhook" }, { status: 500 });
  }
}

// PUT - Atualizar webhook
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
    const collection = db.collection("webhooks");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Webhook não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar webhook:", error);
    return NextResponse.json({ error: "Erro ao atualizar webhook" }, { status: 500 });
  }
}

// DELETE - Excluir webhook
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("webhooks");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Webhook não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir webhook:", error);
    return NextResponse.json({ error: "Erro ao excluir webhook" }, { status: 500 });
  }
}
