const { MongoClient } = require('mongodb');

// Configuração do MongoDB (mesma do lib/mongodb.ts)
const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: "majority",
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000,
  retryReads: true,
};

async function testConnection() {
  console.log('🔍 Testando conexão MongoDB...');
  console.log('📍 URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Mascarar credenciais
  
  let client;
  try {
    client = new MongoClient(uri, options);
    
    // Adicionar listeners para debug
    client.on('serverOpening', () => {
      console.log('🔄 Tentando conectar ao servidor...');
    });
    
    client.on('serverClosed', () => {
      console.log('⚠️ Servidor desconectado');
    });
    
    client.on('error', (error) => {
      console.error('❌ Erro na conexão:', error.message);
    });
    
    console.log('⏳ Conectando...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    // Testar ping
    console.log('🏓 Testando ping...');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping bem-sucedido!');
    
    // Testar acesso à coleção metas
    console.log('📊 Testando acesso à coleção metas...');
    const db = client.db('crm');
    const collection = db.collection('metas');
    const count = await collection.countDocuments();
    console.log(`✅ Coleção metas acessível! Documentos encontrados: ${count}`);
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔧 Possíveis soluções:');
      console.log('1. Verifique se MONGODB_URI está definida corretamente');
      console.log('2. Verifique se as credenciais estão corretas');
      console.log('3. Verifique se o cluster MongoDB está acessível');
      console.log('4. Verifique se a rede permite conexões MongoDB (porta 27017)');
      console.log('5. Verifique se o IP está na whitelist do MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar teste
testConnection().catch(console.error);
