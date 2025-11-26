const { MongoClient } = require('mongodb');

async function verificarMetas() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('crm');
    const metasCollection = db.collection('metas');
    const clientesCollection = db.collection('clientes');

    // Verificar metas existentes para agosto/2025
    const metasAgosto2025 = await metasCollection.find({
      mes: { $in: ['Agosto', 'agosto', 'AGOSTO'] },
      ano: 2025
    }).toArray();

    console.log('Metas existentes para agosto/2025:', metasAgosto2025);

    // Verificar clientes de agosto/2025
    const clientesAgosto2025 = await clientesCollection.find({
      $or: [
        {
          status: 'pago',
          data_pagamento: { $regex: '^2025-08' }
        },
        {
          data: { $regex: '^2025-08' }
        }
      ]
    }).toArray();

    console.log('Clientes encontrados para agosto/2025:', clientesAgosto2025.length);
    
    if (clientesAgosto2025.length > 0) {
      console.log('Primeiros 3 clientes como exemplo:');
      clientesAgosto2025.slice(0, 3).forEach(cliente => {
        console.log(`- ${cliente.cliente}: ${cliente.status}, data: ${cliente.data}, data_pagamento: ${cliente.data_pagamento}`);
      });
    }

    // Se não há metas para agosto/2025, criar metas padrão
    if (metasAgosto2025.length === 0) {
      console.log('Criando metas padrão para agosto/2025...');
      
      const metaQuantidade = {
        usuario: 'geral',
        mes: 'Agosto',
        ano: 2025,
        valorMeta: 50,
        tipo: 'quantidade',
        criadaEm: new Date().toISOString()
      };

      const metaValor = {
        usuario: 'geral',
        mes: 'Agosto',
        ano: 2025,
        valorMeta: 100000, // R$ 100k
        tipo: 'valor',
        criadaEm: new Date().toISOString()
      };

      await metasCollection.insertOne(metaQuantidade);
      await metasCollection.insertOne(metaValor);
      
      console.log('Metas criadas com sucesso!');
    } else {
      console.log('Metas já existem para agosto/2025');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
  }
}

verificarMetas();
