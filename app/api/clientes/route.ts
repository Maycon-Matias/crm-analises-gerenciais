import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { dispararWebhooks } from "@/lib/webhook";
import { validarDados, clienteSchema } from "@/lib/validation";
import { logger, logUserAction, logDatabaseOperation, logError } from "@/lib/logger";

// Função para verificar permissões do usuário
function verificarPermissao(cliente: any, userId: string, userRole: string): boolean {
  // Administradores podem fazer qualquer operação
  if (userRole === "admin") return true;
  
  // Usuários comuns só podem operar em seus próprios clientes
  return cliente.criadoPor === userId;
}

// Função para obter dados do usuário do localStorage (simulação)
function obterUsuarioLogado(): { id: string; role: string } | null {
  // Esta função não pode ser usada no servidor
  // Em produção, isso deveria vir de um token JWT ou sessão
  return null;
}

// GET - Listar todos os clientes
export async function GET(req: NextRequest) {
  try {
    await logger.info("Iniciando busca de clientes", { action: "GET", resource: "clientes" });
    
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const documentos = await collection.find({}).toArray();
    
    await logDatabaseOperation("find", "clientes", { count: documentos.length });

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

    await logger.info("Clientes buscados com sucesso", { 
      action: "GET", 
      resource: "clientes", 
      count: clientesCorrigidos.length 
    });

    return NextResponse.json(clientesCorrigidos);
  } catch (error) {
    await logError("Erro ao buscar clientes", { 
      action: "GET", 
      resource: "clientes", 
      error: error as Error 
    });
    
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

// POST - Cadastrar novo cliente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validar dados de entrada
    const clienteValidado = validarDados(clienteSchema, body);
    
    await logger.info("Iniciando cadastro de cliente", { 
      action: "POST", 
      resource: "clientes",
      metadata: { cliente: clienteValidado.cliente, produto: clienteValidado.produto }
    });

    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    const result = await collection.insertOne(clienteValidado);
    
    await logDatabaseOperation("insertOne", "clientes", { 
      clienteId: result.insertedId.toString(),
      cliente: clienteValidado.cliente 
    });

    // Disparar webhook para cliente criado
    const clienteComId = { ...clienteValidado, id: result.insertedId.toString() };
    await dispararWebhooks("cliente.criado", clienteComId);
    
    await logger.info("Cliente cadastrado com sucesso", { 
      action: "POST", 
      resource: "clientes",
      metadata: { clienteId: result.insertedId.toString() }
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validação falhou')) {
      await logger.warn("Falha na validação de dados", { 
        action: "POST", 
        resource: "clientes",
        metadata: { error: error.message }
      });
      
      return NextResponse.json({ 
        error: "Dados inválidos", 
        details: error.message 
      }, { status: 400 });
    }
    
    await logError("Erro ao cadastrar cliente", { 
      action: "POST", 
      resource: "clientes", 
      error: error as Error 
    });
    
    return NextResponse.json({ error: "Erro ao cadastrar cliente" }, { status: 500 });
  }
}

// PUT - Atualizar cliente
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    await logger.warn("Tentativa de atualizar cliente sem ID", { 
      action: "PUT", 
      resource: "clientes" 
    });
    
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    const dadosAtualizados = await req.json();
    
    // Validar dados de entrada (parcialmente)
    const clienteValidado = validarDadosParcial(clienteSchema, dadosAtualizados);
    
    await logger.info("Iniciando atualização de cliente", { 
      action: "PUT", 
      resource: "clientes",
      metadata: { clienteId: id }
    });

    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Buscar o cliente atual para verificar permissões
    const clienteAtual = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!clienteAtual) {
      await logger.warn("Cliente não encontrado para atualização", { 
        action: "PUT", 
        resource: "clientes",
        metadata: { clienteId: id }
      });
      
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: clienteValidado }
    );

    if (result.matchedCount === 0) {
      await logger.warn("Nenhum cliente foi atualizado", { 
        action: "PUT", 
        resource: "clientes",
        metadata: { clienteId: id }
      });
      
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Disparar webhook para cliente atualizado
    const clienteComId = { ...clienteValidado, id };
    await dispararWebhooks("cliente.atualizado", clienteComId);
    
    await logDatabaseOperation("updateOne", "clientes", { 
      clienteId: id,
      modifiedCount: result.modifiedCount 
    });
    
    await logger.info("Cliente atualizado com sucesso", { 
      action: "PUT", 
      resource: "clientes",
      metadata: { clienteId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validação falhou')) {
      await logger.warn("Falha na validação de dados para atualização", { 
        action: "PUT", 
        resource: "clientes",
        metadata: { clienteId: id, error: error.message }
      });
      
      return NextResponse.json({ 
        error: "Dados inválidos", 
        details: error.message 
      }, { status: 400 });
    }
    
    await logError("Erro ao atualizar cliente", { 
      action: "PUT", 
      resource: "clientes", 
      error: error as Error,
      metadata: { clienteId: id }
    });
    
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

// DELETE - Excluir cliente
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    await logger.warn("Tentativa de excluir cliente sem ID", { 
      action: "DELETE", 
      resource: "clientes" 
    });
    
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }

  try {
    await logger.info("Iniciando exclusão de cliente", { 
      action: "DELETE", 
      resource: "clientes",
      metadata: { clienteId: id }
    });

    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Buscar o cliente antes de excluir para o webhook
    const clienteParaExcluir = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!clienteParaExcluir) {
      await logger.warn("Cliente não encontrado para exclusão", { 
        action: "DELETE", 
        resource: "clientes",
        metadata: { clienteId: id }
      });
      
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      await logger.warn("Nenhum cliente foi excluído", { 
        action: "DELETE", 
        resource: "clientes",
        metadata: { clienteId: id }
      });
      
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Disparar webhook para cliente excluído
    const clienteComId = { ...clienteParaExcluir, id };
    await dispararWebhooks("cliente.excluido", clienteComId);
    
    await logDatabaseOperation("deleteOne", "clientes", { 
      clienteId: id,
      deletedCount: result.deletedCount 
    });
    
    await logger.info("Cliente excluído com sucesso", { 
      action: "DELETE", 
      resource: "clientes",
      metadata: { clienteId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await logError("Erro ao excluir cliente", { 
      action: "DELETE", 
      resource: "clientes", 
      error: error as Error,
      metadata: { clienteId: id }
    });
    
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}
