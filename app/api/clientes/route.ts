import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { dispararWebhooks } from "@/lib/webhook";

// GET - Listar todos os clientes
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const documentos = await collection.find({}).toArray();

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
        data_pagamento: doc.data_pagamento || "",
        observacoes: doc.observacoes?.trim() || ""
      };
    });

    return NextResponse.json(clientesCorrigidos);
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

    // Disparar webhook para cliente excluído
    await dispararWebhooks("cliente.excluido", { id, ...clienteAtual });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}
