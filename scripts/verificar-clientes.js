const { MongoClient } = require('mongodb');

async function verificarClientes() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db('crm');
    const clientesCollection = db.collection('clientes');
    const metasCollection = db.collection('metas');

    // Verificar quantos clientes existem
    const totalClientes = await clientesCollection.countDocuments();
    console.log(`📊 Total de clientes no banco: ${totalClientes}`);

    if (totalClientes === 0) {
      console.log('❌ NENHUM CLIENTE ENCONTRADO!');
      
      // Verificar se a collection existe
      const collections = await db.listCollections().toArray();
      console.log('📋 Collections existentes:', collections.map(c => c.name));
      
      // Verificar se há dados em outras collections
      const totalMetas = await metasCollection.countDocuments();
      console.log(`📊 Total de metas: ${totalMetas}`);
      
    } else {
      console.log('✅ Clientes encontrados!');
      
      // Mostrar alguns clientes como exemplo
      const clientesExemplo = await clientesCollection.find({}).limit(3).toArray();
      console.log('\n📝 Exemplos de clientes:');
      clientesExemplo.forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente || cliente['cliente ']} - ${cliente.produto || cliente['produto ']} - ${cliente.status || cliente['status ']}`);
      });
    }

    // Verificar estrutura dos documentos
    if (totalClientes > 0) {
      const primeiroCliente = await clientesCollection.findOne({});
      console.log('\n🔍 Estrutura do primeiro cliente:');
      console.log(JSON.stringify(primeiroCliente, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro ao verificar clientes:', error);
  } finally {
    await client.close();
  }
}

verificarClientes();
