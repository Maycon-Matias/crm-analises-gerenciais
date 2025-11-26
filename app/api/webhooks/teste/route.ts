import { NextRequest, NextResponse } from "next/server";
import { testarWebhook } from "@/lib/webhook";

export async function POST(req: NextRequest) {
  try {
    const { url, headers, timeout } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
    }

    const resultado = await testarWebhook(
      url,
      headers || {},
      timeout || 30
    );

    return NextResponse.json({
      success: resultado.success,
      statusCode: resultado.statusCode,
      error: resultado.error,
    });
  } catch (error) {
    console.error("Erro ao testar webhook:", error);
    return NextResponse.json({ error: "Erro ao testar webhook" }, { status: 500 });
  }
}
