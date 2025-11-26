// Script para remover metas do vendedor "geral" e manter apenas as da Mariele
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';
const COLLECTION_NAME = 'metas';

async function limparMetasGeral() {
  let client;
  
  try {
    console.log('🧹 Iniciando limpeza das metas do vendedor "geral"...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // 1. Verificar status atual
    const totalAntes = await collection.countDocuments({});
    console.log(`📊 Total de metas antes da limpeza: ${totalAntes}`);
    
    // 2. Verificar metas por vendedor
    const metasPorVendedor = await collection.aggregate([
      {
        $group: {
          _id: "$usuario",
          count: { $sum: 1 },
          metas: { $push: "$$ROOT" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    console.log('\n📋 METAS POR VENDEDOR ANTES DA LIMPEZA:');
    console.log('='.repeat(60));
    
    metasPorVendedor.forEach((grupo) => {
      console.log(`👤 ${grupo._id}: ${grupo.count} meta(s)`);
      grupo.metas.forEach((meta, index) => {
        console.log(`   ${index + 1}. ${meta.mes} ${meta.ano} - R$ ${meta.valorMeta}`);
      });
    });
    
    // 3. Remover apenas as metas do vendedor "geral"
    const resultado = await collection.deleteMany({ usuario: "geral" });
    
    console.log(`\n🗑️  Metas do vendedor "geral" removidas: ${resultado.deletedCount}`);
    
    // 4. Verificar resultado final
    const totalDepois = await collection.countDocuments({});
    console.log(`📊 Total de metas após limpeza: ${totalDepois}`);
    
    // 5. Verificar metas restantes
    const metasRestantes = await collection.find({}).toArray();
    
    console.log('\n✅ METAS RESTANTES (APENAS MARIELE):');
    console.log('='.repeat(60));
    
    if (metasRestantes.length > 0) {
      metasRestantes.forEach((meta, index) => {
        console.log(`${index + 1}. ${meta.usuario} - ${meta.mes} ${meta.ano} - R$ ${meta.valorMeta}`);
        console.log(`   ID: ${meta._id}`);
        console.log(`   Criada em: ${meta.criadaEm}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma meta encontrada!');
    }
    
    // 6. Verificar se ainda há metas do vendedor "geral"
    const metasGeralRestantes = await collection.countDocuments({ usuario: "geral" });
    
    if (metasGeralRestantes === 0) {
      console.log('✅ Todas as metas do vendedor "geral" foram removidas com sucesso!');
    } else {
      console.log(`⚠️  Ainda existem ${metasGeralRestantes} metas do vendedor "geral"`);
    }
    
    console.log('\n🎉 Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar a função
limparMetasGeral().catch(console.error);
