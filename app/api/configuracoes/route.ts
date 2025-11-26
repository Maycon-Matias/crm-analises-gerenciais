import { NextResponse } from "next/server";

export async function GET() {
  // Exemplo de resposta de API para /api/configuracoes
  return NextResponse.json({ message: "API de configurações" });
} 