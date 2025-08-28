import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCache, deleteCache } from "@/lib/cache";

// POST - Executar migração de Corretor(RO) para Indicação(RO)
export async function POST(req: NextRequest) {
  try {
    // Verificar se é uma requisição autorizada (pode adicionar autenticação aqui)
    const { confirmacao } = await req.json();
    
    if (confirmacao !== "CONFIRMO_MIGRACAO") {
      return NextResponse.json({ 
        error: "Confirmação necessária para executar migração" 
      }, { status: 400 });
    }

    console.log('🚀 Iniciando migração via API...');
    
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // 1. Verificar status atual
    const statusAtual = await collection.aggregate([
      {
        $group: {
          _id: "$fonte",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    console.log('📊 Status atual das fontes:');
    statusAtual.forEach(item => {
      console.log(`   - ${item._id || 'Sem fonte'}: ${item.count} clientes`);
    });

    // 2. Buscar clientes para migrar
    const clientesParaMigrar = await collection.find({ 
      fonte: "Corretor(RO)" 
    }).toArray();

    console.log(`📊 Encontrados ${clientesParaMigrar.length} clientes para migrar`);

    if (clientesParaMigrar.length === 0) {
      return NextResponse.json({ 
        message: "Nenhum cliente encontrado para migração",
        status: "sem_migracao",
        detalhes: {
          clientesMigrados: 0,
          clientesEncontrados: 0
        }
      });
    }

    // 3. Executar migração
    const result = await collection.updateMany(
      { fonte: "Corretor(RO)" },
      { $set: { fonte: "Indicação(RO)" } }
    );

    console.log(`✅ Migração concluída com sucesso!`);
    console.log(`📈 ${result.modifiedCount} clientes atualizados`);

    // 4. Verificar status pós-migração
    const statusPosMigracao = await collection.aggregate([
      {
        $group: {
          _id: "$fonte",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // 5. Limpar cache para refletir mudanças
    deleteCache("clientes-todos");
    console.log('🗑️ Cache de clientes limpo após migração');

    // 6. Preparar resposta
    const resposta = {
      message: "Migração executada com sucesso",
      status: "migracao_concluida",
      detalhes: {
        clientesMigrados: result.modifiedCount,
        clientesEncontrados: result.matchedCount,
        statusAtual: statusAtual,
        statusPosMigracao: statusPosMigracao
      },
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Migração via API concluída com sucesso!');
    
    return NextResponse.json(resposta);

  } catch (error) {
    console.error('❌ Erro durante migração via API:', error);
    return NextResponse.json({ 
      error: "Erro interno durante migração",
      detalhes: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}

// GET - Verificar status atual das fontes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("clientes");

    // Agrupar por fonte para ver a distribuição atual
    const pipeline = [
      {
        $group: {
          _id: "$fonte",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const resultado = await collection.aggregate(pipeline).toArray();

    // Contar clientes por categoria
    const clientesCorretorRO = resultado.find(item => item._id === "Corretor(RO)")?.count || 0;
    const clientesIndicacaoRO = resultado.find(item => item._id === "Indicação(RO)")?.count || 0;

    const status = {
      fontes: resultado,
      resumo: {
        totalClientes: resultado.reduce((acc, item) => acc + item.count, 0),
        corretorRO: clientesCorretorRO,
        indicacaoRO: clientesIndicacaoRO,
        precisaMigracao: clientesCorretorRO > 0,
        migracaoConcluida: clientesCorretorRO === 0 && clientesIndicacaoRO > 0
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return NextResponse.json({ 
      error: "Erro ao verificar status das fontes" 
    }, { status: 500 });
  }
}
