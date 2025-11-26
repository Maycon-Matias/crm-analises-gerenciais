import clientPromise from "../lib/mongodb";
import type { MongoClient } from "mongodb";

async function migrarClientes() {
  const client = (await clientPromise) as MongoClient;
  const dbTeste = client.db("teste");
  const dbCrm = client.db("crm");
  const collectionTeste = dbTeste.collection("clientes");
  const collectionCrm = dbCrm.collection("clientes");

  // Buscar todos os clientes do banco 'teste'
  const clientes = await collectionTeste.find({}).toArray();
  if (clientes.length === 0) {
    console.log("Nenhum cliente encontrado para migrar.");
    return;
  }

  // Inserir todos os clientes no banco 'crm'
  const resultado = await collectionCrm.insertMany(clientes);
  console.log(`Registros migrados: ${resultado.insertedCount}`);
}

migrarClientes().catch((err) => {
  console.error("Erro na migração:", err);
});
