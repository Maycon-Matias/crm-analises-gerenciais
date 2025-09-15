import { MongoClient, MongoClientOptions } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Configuração mais robusta do MongoDB
const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";

const options: MongoClientOptions = {
  maxPoolSize: 10, // Máximo de conexões no pool
  serverSelectionTimeoutMS: 30000, // Aumentado para 30 segundos
  socketTimeoutMS: 45000, // Timeout para operações de socket
  connectTimeoutMS: 30000, // Timeout para conexão inicial
  retryWrites: true, // Habilitar retry para escritas
  w: "majority", // Write concern
  maxIdleTimeMS: 30000, // Tempo máximo de inatividade
  heartbeatFrequencyMS: 10000, // Frequência de heartbeat
  retryReads: true, // Habilitar retry para leituras
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI não definida. Usando string padrão (NÃO USE EM PRODUÇÃO)");
}

if (!global._mongoClientPromise) {
  try {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    console.log("🔌 Conexão MongoDB inicializada");
    
    // Adicionar listener para eventos de conexão
    client.on('serverOpening', () => {
      console.log("🔄 Tentando conectar ao servidor MongoDB...");
    });
    
    client.on('serverClosed', () => {
      console.log("⚠️ Servidor MongoDB desconectado");
    });
    
    client.on('error', (error) => {
      console.error("❌ Erro na conexão MongoDB:", error);
    });
    
  } catch (error) {
    console.error("❌ Erro ao inicializar conexão MongoDB:", error);
    throw error;
  }
}

clientPromise = global._mongoClientPromise;

// Função para testar a conexão
export async function testConnection() {
  try {
    console.log("🔍 Testando conexão MongoDB...");
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Conexão MongoDB funcionando");
    return true;
  } catch (error) {
    console.error("❌ Teste de conexão MongoDB falhou:", error);
    console.error("🔧 Verifique se:");
    console.error("   - MONGODB_URI está definida corretamente");
    console.error("   - As credenciais estão corretas");
    console.error("   - O cluster MongoDB está acessível");
    console.error("   - A rede permite conexões MongoDB");
    return false;
  }
}

export default clientPromise; 