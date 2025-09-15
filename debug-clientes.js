// Script para debugar o problema dos clientes
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred';

async function debugClientes() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    const db = client.db('crm');
    const collection = db.collection('clientes');
    
    // Contar total de clientes
    const total = await collection.countDocuments();
    console.log('📊 Total de clientes no banco:', total);
    
    // Verificar clientes por criadoPor
    const clientesPorUsuario = await collection.aggregate([
      { $group: { _id: "$criadoPor", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('👥 Clientes por usuário:');
    clientesPorUsuario.forEach(item => {
      console.log(`  Usuário ${item._id}: ${item.count} clientes`);
    });
    
    // Verificar alguns clientes específicos
    const sampleClientes = await collection.find({}).limit(5).toArray();
    console.log('\n📋 Exemplos de clientes:');
    sampleClientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ID: ${cliente._id}`);
      console.log(`   Cliente: ${cliente.cliente}`);
      console.log(`   Status: ${cliente.status}`);
      console.log(`   CriadoPor: ${cliente.criadoPor}`);
      console.log(`   Usuarios: ${cliente.usuarios}`);
      console.log('---');
    });
    
    // Verificar se há clientes com criadoPor vazio ou null
    const clientesSemCriador = await collection.countDocuments({
      $or: [
        { criadoPor: { $exists: false } },
        { criadoPor: null },
        { criadoPor: "" }
      ]
    });
    console.log(`\n⚠️ Clientes sem criadoPor: ${clientesSemCriador}`);
    
    await client.close();
    console.log('🔌 Conexão fechada');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugClientes();
