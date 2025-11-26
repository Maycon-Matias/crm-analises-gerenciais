import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PUT - Marcar como pago e setar data_pagamento
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data_pagamento } = await req.json();
    if (!data_pagamento) {
      return NextResponse.json({ error: "data_pagamento é obrigatório" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "pago", data_pagamento } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao marcar como pago:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


