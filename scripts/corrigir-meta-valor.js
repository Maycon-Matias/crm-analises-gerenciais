const { MongoClient, ObjectId } = require('mongodb');

async function corrigirMetaValor() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('crm');
    const metasCollection = db.collection('metas');

    // Encontrar a meta de valor para agosto/2025
    const metaValor = await metasCollection.findOne({
      mes: { $in: ['Agosto', 'agosto', 'AGOSTO'] },
      ano: 2025,
      tipo: 'valor',
      usuario: 'geral'
    });

    if (metaValor) {
      console.log('Meta de valor atual:', metaValor);
      
      // Atualizar para R$ 100.000
      const result = await metasCollection.updateOne(
        { _id: metaValor._id },
        { $set: { valorMeta: 100000 } }
      );

      if (result.modifiedCount > 0) {
        console.log('Meta de valor atualizada para R$ 100.000');
      } else {
        console.log('Nenhuma alteração necessária');
      }
    } else {
      console.log('Meta de valor não encontrada');
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

corrigirMetaValor();
