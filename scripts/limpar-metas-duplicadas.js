// Script para limpar metas duplicadas e incorretas
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';
const COLLECTION_NAME = 'metas';

async function limparMetasDuplicadas() {
  let client;

  try {
    console.log('🧹 Iniciando limpeza de metas duplicadas...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // 1. Verificar status atual
    const totalAntes = await collection.countDocuments({});
    console.log(`📊 Total de metas antes da limpeza: ${totalAntes}`);
    
    if (totalAntes === 0) {
      console.log('ℹ️ Nenhuma meta encontrada para limpeza');
      return;
    }
    
    // 2. Identificar metas duplicadas
    const pipeline = [
      {
        $group: {
          _id: {
            usuario: "$usuario",
            mes: "$mes",
            ano: "$ano"
          },
          count: { $sum: 1 },
          metas: { $push: "$$ROOT" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];
    
    const duplicatas = await collection.aggregate(pipeline).toArray();
    console.log(`🔍 Encontradas ${duplicatas.length} combinações duplicadas`);
    
    // 3. Mostrar detalhes das duplicatas
    if (duplicatas.length > 0) {
      console.log('\n📋 DETALHES DAS DUPLICATAS:');
      console.log('='.repeat(80));
      
      duplicatas.forEach((dup, index) => {
        console.log(`\n${index + 1}. ${dup._id.usuario} - ${dup._id.mes} ${dup._id.ano} (${dup.count} metas)`);
        dup.metas.forEach((meta, metaIndex) => {
          console.log(`   ${metaIndex + 1}. ID: ${meta._id} - Valor: R$ ${meta.valorMeta} - Criada: ${meta.criadaEm}`);
        });
      });
    }
    
    // 4. Limpar metas duplicadas (manter apenas a primeira de cada grupo)
    let totalRemovidas = 0;
    
    for (const dup of duplicatas) {
      const metasParaRemover = dup.metas.slice(1); // Manter a primeira, remover as outras
      
      for (const meta of metasParaRemover) {
        await collection.deleteOne({ _id: meta._id });
        totalRemovidas++;
      }
    }
    
    // 5. Verificar resultado
    const totalDepois = await collection.countDocuments({});
    console.log(`\n🎉 Limpeza concluída!`);
    console.log(`📊 Total removido: ${totalRemovidas} metas duplicadas`);
    console.log(`📊 Total restante: ${totalDepois} metas`);
    
    // 6. Verificar se ainda há duplicatas
    const duplicatasRestantes = await collection.aggregate(pipeline).toArray();
    if (duplicatasRestantes.length === 0) {
      console.log('✅ Nenhuma duplicata restante!');
    } else {
      console.log(`⚠️  Ainda existem ${duplicatasRestantes.length} combinações duplicadas`);
    }
    
    // 7. Mostrar resumo final
    console.log('\n📈 RESUMO FINAL:');
    console.log('='.repeat(80));
    
    const metasPorUsuario = await collection.aggregate([
      {
        $group: {
          _id: "$usuario",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    metasPorUsuario.forEach(item => {
      console.log(`👤 ${item._id || 'SEM_USUARIO'}: ${item.count} meta(s)`);
    });

  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
    throw error;
  } finally {
    if (client) {
    await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar limpeza
limparMetasDuplicadas()
  .then(() => {
    console.log('\n🎉 Limpeza concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Falha na limpeza:', error);
    process.exit(1);
  });
