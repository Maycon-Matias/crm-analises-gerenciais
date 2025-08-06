const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred";
const clientesPath = path.join(__dirname, "../data/clientes.json");

async function main() {
  const clientes = JSON.parse(fs.readFileSync(clientesPath, "utf-8"));
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(); // padrão do Atlas
  const collection = db.collection("clientes");

  let inseridos = 0;
  let ignorados = 0;

  for (const c of clientes) {
    const existe = await collection.findOne({
      cliente: c.cliente,
      data: c.data,
      produto: c.produto,
    });
    if (!existe) {
      await collection.insertOne(c);
      inseridos++;
    } else {
      ignorados++;
    }
  }

  console.log(`Migração concluída! Inseridos: ${inseridos}, Ignorados (duplicados): ${ignorados}`);
  await client.close();
}

main().catch(console.error); 