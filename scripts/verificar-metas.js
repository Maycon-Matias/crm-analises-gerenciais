// Script para verificar todas as metas cadastradas no banco de dados
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';
const COLLECTION_NAME = 'metas';

async function verificarMetas() {
  let client;

  try {
    console.log('🔍 Verificando metas cadastradas no banco...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Buscar todas as metas
    const todasMetas = await collection.find({}).toArray();
    
    console.log(`📊 Total de metas encontradas: ${todasMetas.length}`);
    
    if (todasMetas.length === 0) {
      console.log('ℹ️ Nenhuma meta cadastrada no banco');
      return;
    }
    
    // Mostrar detalhes de cada meta
    console.log('\n📋 DETALHES DAS METAS:');
    console.log('='.repeat(80));
    
    todasMetas.forEach((meta, index) => {
      console.log(`\n${index + 1}. Meta ID: ${meta._id}`);
      console.log(`   Usuário: ${meta.usuario || 'NÃO DEFINIDO'}`);
      console.log(`   Mês: ${meta.mes || 'NÃO DEFINIDO'}`);
      console.log(`   Ano: ${meta.ano || 'NÃO DEFINIDO'}`);
      console.log(`   Valor: R$ ${meta.valorMeta?.toLocaleString('pt-BR') || 'NÃO DEFINIDO'}`);
      console.log(`   Tipo: ${meta.tipo || 'valor'}`);
      console.log(`   Criada em: ${meta.criadaEm || 'NÃO DEFINIDO'}`);
      console.log(`   Criada por: ${meta.criadoPor || 'SISTEMA'}`);
      
      // Verificar se há campos suspeitos
      const camposSuspeitos = [];
      if (!meta.usuario || meta.usuario === '') camposSuspeitos.push('usuario vazio');
      if (!meta.mes || meta.mes === '') camposSuspeitos.push('mes vazio');
      if (!meta.ano || meta.ano === 0) camposSuspeitos.push('ano inválido');
      if (!meta.valorMeta || meta.valorMeta === 0) camposSuspeitos.push('valor zero');
      
      if (camposSuspeitos.length > 0) {
        console.log(`   ⚠️  PROBLEMAS: ${camposSuspeitos.join(', ')}`);
      }
    });
    
    // Análise das metas
    console.log('\n📈 ANÁLISE DAS METAS:');
    console.log('='.repeat(80));
    
    // Agrupar por usuário
    const metasPorUsuario = {};
    todasMetas.forEach(meta => {
      const usuario = meta.usuario || 'SEM_USUARIO';
      if (!metasPorUsuario[usuario]) metasPorUsuario[usuario] = [];
      metasPorUsuario[usuario].push(meta);
    });
    
    Object.entries(metasPorUsuario).forEach(([usuario, metas]) => {
      console.log(`\n👤 ${usuario}: ${metas.length} meta(s)`);
      metas.forEach(meta => {
        console.log(`   - ${meta.mes} ${meta.ano}: R$ ${meta.valorMeta?.toLocaleString('pt-BR')}`);
      });
    });
    
    // Verificar metas duplicadas
    const metasDuplicadas = [];
    for (let i = 0; i < todasMetas.length; i++) {
      for (let j = i + 1; j < todasMetas.length; j++) {
        const meta1 = todasMetas[i];
        const meta2 = todasMetas[j];
        
        if (meta1.usuario === meta2.usuario && 
            meta1.mes === meta2.mes && 
            meta1.ano === meta2.ano) {
          metasDuplicadas.push({ meta1, meta2 });
        }
      }
    }
    
    if (metasDuplicadas.length > 0) {
      console.log('\n🚨 METAS DUPLICADAS ENCONTRADAS:');
      console.log('='.repeat(80));
      metasDuplicadas.forEach((dup, index) => {
        console.log(`\n${index + 1}. Duplicata:`);
        console.log(`   Meta 1: ${dup.meta1.usuario} - ${dup.meta1.mes} ${dup.meta1.ano} - R$ ${dup.meta1.valorMeta}`);
        console.log(`   Meta 2: ${dup.meta2.usuario} - ${dup.meta2.mes} ${dup.meta2.ano} - R$ ${dup.meta2.valorMeta}`);
      });
    } else {
      console.log('\n✅ Nenhuma meta duplicada encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar metas:', error);
    throw error;
  } finally {
    if (client) {
    await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

// Executar verificação se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verificarMetas()
    .then(() => {
      console.log('\n🎉 Verificação concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Falha na verificação:', error);
      process.exit(1);
    });
}

export { verificarMetas };
