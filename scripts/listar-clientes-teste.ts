import clientPromise from "../lib/mongodb";
import type { MongoClient } from "mongodb";

async function listarClientes() {
  const client = (await clientPromise) as MongoClient;
  const dbTeste = client.db("teste");
  const collectionTeste = dbTeste.collection("clientes");

  const clientes = await collectionTeste.find({}).toArray();
  console.log(`Total de clientes encontrados: ${clientes.length}`);
  if (clientes.length > 0) {
    console.log("Primeiro cliente:", clientes[0]);
  }
}

listarClientes().catch(console.error);
