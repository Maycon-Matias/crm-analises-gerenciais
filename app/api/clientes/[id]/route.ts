import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { clearCache } from "@/lib/cache";

// GET - Obter um cliente por ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const doc = await collection.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const cliente = {
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
      observacoes: doc.observacoes?.trim() || "",
    };

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao obter cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT - Atualizar cliente inteiro
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const update = { ...payload };
    delete update.id;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Limpar cache após atualização
    clearCache();
    console.log("🗑️ Cache limpo após atualizar cliente");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Remover cliente
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Limpar cache após exclusão
    clearCache();
    console.log("🗑️ Cache limpo após excluir cliente");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


