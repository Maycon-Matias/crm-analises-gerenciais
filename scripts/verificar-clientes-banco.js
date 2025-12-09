// Script para verificar se há clientes no banco de dados MongoDB
import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente manualmente
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  try {
    const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8');
    const mongoMatch = envFile.match(/MONGODB_URI=(.+)/);
    if (mongoMatch) {
      mongoUri = mongoMatch[1].trim();
    }
  } catch (err) {
    // Arquivo não existe, usar padrão
  }
}

const uri = mongoUri || "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";

console.log("========================================");
console.log("  Verificação de Clientes no MongoDB");
console.log("========================================");
console.log("\n🔍 Verificando conexão...");

let client;

try {
  client = new MongoClient(uri);
  await client.connect();
  console.log("✅ Conectado ao MongoDB com sucesso!");

  // Listar todos os bancos de dados
  const adminDb = client.db().admin();
  const databases = await adminDb.listDatabases();
  console.log("\n📊 Bancos de dados disponíveis:");
  databases.databases.forEach(db => {
    console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
  });

  // Verificar banco "crm"
  const db = client.db("crm");
  console.log("\n🔍 Verificando banco 'crm'...");
  
  // Listar coleções
  const collections = await db.listCollections().toArray();
  console.log("\n📋 Coleções no banco 'crm':");
  collections.forEach(col => {
    console.log(`   - ${col.name}`);
  });

  // Verificar coleção "clientes"
  const clientesCollection = db.collection("clientes");
  const totalClientes = await clientesCollection.countDocuments();
  
  console.log(`\n📊 Total de clientes na coleção: ${totalClientes}`);

  if (totalClientes === 0) {
    console.log("\n⚠️  NENHUM CLIENTE ENCONTRADO na coleção 'clientes'!");
    console.log("   Possíveis causas:");
    console.log("   1. O banco de dados está vazio");
    console.log("   2. Os clientes estão em outro banco de dados");
    console.log("   3. Os clientes estão em outra coleção");
  } else {
    console.log(`\n✅ Encontrados ${totalClientes} clientes!`);
    
    // Mostrar alguns exemplos
    const exemplos = await clientesCollection.find({}).limit(5).toArray();
    console.log("\n📋 Exemplos de clientes (primeiros 5):");
    exemplos.forEach((cliente, index) => {
      console.log(`\n   Cliente ${index + 1}:`);
      console.log(`   - ID: ${cliente._id}`);
      console.log(`   - Nome: ${cliente.cliente || cliente["cliente "] || "N/A"}`);
      console.log(`   - Status: ${cliente.status || cliente["status "] || "N/A"}`);
      console.log(`   - Produto: ${cliente.produto || cliente["produto "] || "N/A"}`);
      console.log(`   - Data: ${cliente.data || cliente["data "] || "N/A"}`);
    });

    // Verificar campos comuns
    console.log("\n🔍 Verificando estrutura dos documentos...");
    const primeiroCliente = await clientesCollection.findOne({});
    if (primeiroCliente) {
      console.log("   Campos encontrados no primeiro cliente:");
      Object.keys(primeiroCliente).forEach(campo => {
        console.log(`   - ${campo}`);
      });
    }
  }

  // Verificar outros bancos que possam ter clientes
  console.log("\n🔍 Verificando outros bancos...");
  for (const dbInfo of databases.databases) {
    if (dbInfo.name !== "crm" && !dbInfo.name.startsWith("admin") && !dbInfo.name.startsWith("local")) {
      try {
        const otherDb = client.db(dbInfo.name);
        const otherCollections = await otherDb.listCollections().toArray();
        const hasClientes = otherCollections.some(col => col.name === "clientes" || col.name.includes("cliente"));
        
        if (hasClientes) {
          console.log(`\n⚠️  Banco '${dbInfo.name}' tem coleções relacionadas a clientes!`);
          for (const col of otherCollections) {
            if (col.name.includes("cliente")) {
              const colObj = otherDb.collection(col.name);
              const count = await colObj.countDocuments();
              console.log(`   - ${col.name}: ${count} documentos`);
            }
          }
        }
      } catch (err) {
        // Ignorar erros ao acessar outros bancos
      }
    }
  }

} catch (error) {
  console.error("\n❌ Erro ao verificar banco de dados:", error);
  console.error("\n🔧 Verifique:");
  console.error("   1. Se MONGODB_URI está correta no .env.local");
  console.error("   2. Se as credenciais estão corretas");
  console.error("   3. Se o cluster MongoDB está acessível");
  console.error("   4. Se sua rede permite conexões MongoDB");
} finally {
  if (client) {
    await client.close();
    console.log("\n✅ Conexão fechada");
  }
}

console.log("\n========================================");

