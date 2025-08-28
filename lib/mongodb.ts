import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Configuração mais robusta do MongoDB
const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";

const options = {
  maxPoolSize: 10, // Máximo de conexões no pool
  serverSelectionTimeoutMS: 5000, // Timeout para seleção do servidor
  socketTimeoutMS: 45000, // Timeout para operações de socket
  retryWrites: true,
  w: "majority"
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
  } catch (error) {
    console.error("❌ Erro ao inicializar conexão MongoDB:", error);
    throw error;
  }
}

clientPromise = global._mongoClientPromise;

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("❌ Teste de conexão MongoDB falhou:", error);
    return false;
  }
}

export default clientPromise; 