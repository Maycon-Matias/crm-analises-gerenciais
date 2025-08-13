import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";
const options = {
  maxPoolSize: 10, // Máximo de conexões no pool
  serverSelectionTimeoutMS: 5000, // Timeout para seleção do servidor
  socketTimeoutMS: 45000, // Timeout para operações de socket
  bufferMaxEntries: 0, // Desabilitar buffer para operações
  retryWrites: true,
  w: 'majority'
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise as Promise<MongoClient>;

export default clientPromise; 