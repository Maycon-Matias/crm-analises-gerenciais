// Script de migração para atualizar Corretor(RO) para Indicação(RO)
// Execute este script para migrar todos os clientes existentes

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'crm';
const COLLECTION_NAME = 'clientes';

async function migrarCorretorRO() {
  let client;
  
  try {
    console.log('🚀 Iniciando migração de Corretor(RO) para Indicação(RO)...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Buscar todos os clientes com fonte "Corretor(RO)"
    const clientesParaMigrar = await collection.find({ 
      fonte: "Corretor(RO)" 
    }).toArray();
    
    console.log(`📊 Encontrados ${clientesParaMigrar.length} clientes para migrar`);
    
    if (clientesParaMigrar.length === 0) {
      console.log('ℹ️ Nenhum cliente encontrado para migração');
      return;
    }
    
    // Atualizar todos os clientes
    const result = await collection.updateMany(
      { fonte: "Corretor(RO)" },
      { $set: { fonte: "Indicação(RO)" } }
    );
    
    console.log(`✅ Migração concluída com sucesso!`);
    console.log(`📈 ${result.modifiedCount} clientes atualizados`);
    console.log(`📊 ${result.matchedCount} clientes encontrados`);
    
    // Verificar se a migração foi bem-sucedida
    const clientesMigrados = await collection.find({ 
      fonte: "Indicação(RO)" 
    }).count();
    
    const clientesAntigos = await collection.find({ 
      fonte: "Corretor(RO)" 
    }).count();
    
    console.log(`🔍 Verificação pós-migração:`);
    console.log(`   - Clientes com "Indicação(RO)": ${clientesMigrados}`);
    console.log(`   - Clientes com "Corretor(RO)": ${clientesAntigos}`);
    
    if (clientesAntigos === 0 && clientesMigrados > 0) {
      console.log('🎉 Migração 100% bem-sucedida!');
    } else {
      console.log('⚠️ Atenção: Alguns clientes podem não ter sido migrados');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Função para verificar o status atual das fontes
async function verificarStatusFontes() {
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
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
    
    console.log('📊 Status atual das fontes:');
    resultado.forEach(item => {
      console.log(`   - ${item._id || 'Sem fonte'}: ${item.count} clientes`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Executar migração se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔄 Executando migração...');
  
  // Primeiro verificar status atual
  verificarStatusFontes()
    .then(() => {
      console.log('\n' + '='.repeat(50) + '\n');
      return migrarCorretorRO();
    })
    .then(() => {
      console.log('\n' + '='.repeat(50) + '\n');
      return verificarStatusFontes();
    })
    .then(() => {
      console.log('\n🎉 Migração concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Falha na migração:', error);
      process.exit(1);
    });
}

export { migrarCorretorRO, verificarStatusFontes };
