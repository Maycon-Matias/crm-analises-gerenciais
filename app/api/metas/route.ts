import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Listar todas as metas
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
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

    return NextResponse.json(metasFormatadas);
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    return NextResponse.json({ error: "Erro ao buscar metas" }, { status: 500 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    return NextResponse.json({ error: "Erro ao excluir meta" }, { status: 500 });
  }
}
