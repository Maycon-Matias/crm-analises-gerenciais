import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { clearCache } from "@/lib/cache";

// PUT - Marcar como cancelado
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "cancelado" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Limpar cache após atualização
    clearCache();
    console.log("🗑️ Cache limpo após marcar cliente como cancelado");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao marcar como cancelado:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


