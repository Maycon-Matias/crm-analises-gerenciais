import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI não definida. Usando string padrão (NÃO USE EM PRODUÇÃO)");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise as Promise<MongoClient>;

export default clientPromise; 