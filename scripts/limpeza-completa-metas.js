// Script para limpeza COMPLETA das metas duplicadas
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';
const COLLECTION_NAME = 'metas';

async function limpezaCompletaMetas() {
  let client;
  
  try {
    console.log('🧹 INICIANDO LIMPEZA COMPLETA DAS METAS...');
    console.log('==========================================');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Verificar situação atual
    const totalAntes = await collection.countDocuments({});
    console.log(`📊 Total de metas ANTES da limpeza: ${totalAntes}`);
    
    // Contar metas por usuário
    const metasPorUsuario = await collection.aggregate([
      { $group: { _id: "$usuario", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n📋 DISTRIBUIÇÃO ATUAL DAS METAS:');
    metasPorUsuario.forEach(item => {
      console.log(`   ${item._id || 'SEM NOME'}: ${item.count} metas`);
    });
    
    // Remover TODAS as metas (limpeza completa)
    console.log('\n🗑️  REMOVENDO TODAS AS METAS...');
    const resultadoRemocao = await collection.deleteMany({});
    console.log(`✅ Metas removidas: ${resultadoRemocao.deletedCount}`);
    
    // Verificar se a limpeza funcionou
    const totalDepois = await collection.countDocuments({});
    console.log(`📊 Total de metas APÓS limpeza: ${totalDepois}`);
    
    if (totalDepois === 0) {
      console.log('\n🎉 LIMPEZA COMPLETA REALIZADA COM SUCESSO!');
      console.log('✅ Banco de metas completamente limpo');
      console.log('✅ Agora você pode criar novas metas sem conflitos');
      console.log('\n💡 PRÓXIMOS PASSOS:');
      console.log('   1. Acesse o gerenciador de metas');
      console.log('   2. Crie uma nova meta para a Patricia');
      console.log('   3. Configure: Patricia - Abril 2025 - R$ 120.000');
      console.log('   4. As metas agora serão salvas corretamente');
    } else {
      console.log('❌ Erro: Ainda existem metas no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar limpeza
limpezaCompletaMetas();
