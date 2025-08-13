const { MongoClient } = require('mongodb');

async function limparMetasDuplicadas() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('crm');
    const metasCollection = db.collection('metas');

    // Encontrar todas as metas de agosto/2025
    const metasAgosto2025 = await metasCollection.find({
      mes: { $in: ['Agosto', 'agosto', 'AGOSTO'] },
      ano: 2025
    }).toArray();

    console.log(`Encontradas ${metasAgosto2025.length} metas para agosto/2025`);

    // Agrupar por tipo e usuário
    const metasAgrupadas = {};
    metasAgosto2025.forEach(meta => {
      const chave = `${meta.tipo}_${meta.usuario}`;
      if (!metasAgrupadas[chave]) {
        metasAgrupadas[chave] = [];
      }
      metasAgrupadas[chave].push(meta);
    });

    // Manter apenas uma meta de cada tipo/usuário (a mais recente)
    let metasParaManter = [];
    let metasParaRemover = [];

    Object.values(metasAgrupadas).forEach(grupo => {
      if (grupo.length > 1) {
        // Ordenar por data de criação (mais recente primeiro)
        grupo.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm));
        
        // Manter a primeira (mais recente)
        metasParaManter.push(grupo[0]);
        
        // Marcar as outras para remoção
        metasParaRemover.push(...grupo.slice(1));
      } else {
        // Se só há uma, manter
        metasParaManter.push(grupo[0]);
      }
    });

    console.log(`Metas para manter: ${metasParaManter.length}`);
    console.log(`Metas para remover: ${metasParaRemover.length}`);

    // Remover metas duplicadas
    if (metasParaRemover.length > 0) {
      const idsParaRemover = metasParaRemover.map(meta => meta._id);
      const result = await metasCollection.deleteMany({ _id: { $in: idsParaRemover } });
      console.log(`Removidas ${result.deletedCount} metas duplicadas`);
    }

    // Verificar resultado final
    const metasFinais = await metasCollection.find({
      mes: { $in: ['Agosto', 'agosto', 'AGOSTO'] },
      ano: 2025
    }).toArray();

    console.log(`\nMetas finais para agosto/2025: ${metasFinais.length}`);
    metasFinais.forEach(meta => {
      console.log(`- ${meta.usuario}: ${meta.tipo} = ${meta.valorMeta} (${meta.criadaEm})`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

limparMetasDuplicadas();
