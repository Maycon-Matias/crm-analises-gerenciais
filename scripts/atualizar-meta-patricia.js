// Script para atualizar a meta da Patricia para o período correto
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';

async function atualizarMetaPatricia() {
  let client;
  
  try {
    console.log('🔄 Atualizando meta da Patricia...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const metasCollection = db.collection('metas');
    
    // Buscar meta atual da Patricia
    const metaAtual = await metasCollection.findOne({ usuario: "Patricia" });
    if (!metaAtual) {
      console.log('❌ Meta da Patricia não encontrada');
      return;
    }
    
    console.log(`\n📋 META ATUAL:`);
    console.log(`   Usuário: ${metaAtual.usuario}`);
    console.log(`   Período: ${metaAtual.mes} ${metaAtual.ano}`);
    console.log(`   Valor: R$ ${metaAtual.valorMeta.toLocaleString('pt-BR')}`);
    
    // Atualizar para Abril 2025
    const resultado = await metasCollection.updateOne(
      { _id: metaAtual._id },
      { 
        $set: { 
          mes: "Abril",
          ano: 2025
        } 
      }
    );
    
    if (resultado.modifiedCount > 0) {
      console.log('\n✅ Meta atualizada com sucesso!');
      console.log('   Novo período: Abril 2025');
      
      // Verificar meta atualizada
      const metaAtualizada = await metasCollection.findOne({ usuario: "Patricia" });
      console.log(`\n📋 META ATUALIZADA:`);
      console.log(`   Usuário: ${metaAtualizada.usuario}`);
      console.log(`   Período: ${metaAtualizada.mes} ${metaAtualizada.ano}`);
      console.log(`   Valor: R$ ${metaAtualizada.valorMeta.toLocaleString('pt-BR')}`);
      
      // Calcular progresso esperado
      const valorMeta = metaAtualizada.valorMeta; // R$ 120.000
      const valorVendido = 163314.37; // Valor total das vendas da Patricia
      const progresso = (valorVendido / valorMeta) * 100;
      
      console.log(`\n🎯 PROGRESSO ESPERADO:`);
      console.log(`   Meta: R$ ${valorMeta.toLocaleString('pt-BR')}`);
      console.log(`   Vendido: R$ ${valorVendido.toLocaleString('pt-BR')}`);
      console.log(`   Progresso: ${progresso.toFixed(1)}%`);
      console.log(`   Status: ${progresso >= 100 ? 'Meta Atingida! 🎉' : 'Em andamento'}`);
      
    } else {
      console.log('❌ Erro ao atualizar meta');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

atualizarMetaPatricia();
