import { MongoClient } from "mongodb";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getArg(name, defaultValue) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : defaultValue;
}

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  try {
    const envPath = join(__dirname, "../.env.local");
    const envFile = readFileSync(envPath, "utf8");
    const match = envFile.match(/^MONGODB_URI=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // Ignora erro de leitura do .env.local e tenta fallback abaixo.
  }

  throw new Error("MONGODB_URI não encontrada em variável de ambiente nem em .env.local");
}

function serializeValue(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toCsv(rows) {
  const allKeys = new Set();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const escapeCell = (value) => `"${serializeValue(value).replace(/"/g, '""')}"`;
  const headerLine = headers.map(escapeCell).join(",");
  const lines = rows.map((row) => headers.map((h) => escapeCell(row[h])).join(","));
  return [headerLine, ...lines].join("\n");
}

async function main() {
  const dbName = getArg("db", "crm");
  const collectionName = getArg("collection", "clientes");
  const format = getArg("format", "json").toLowerCase();
  const limitArg = getArg("limit", "");
  const limit = limitArg ? Number(limitArg) : 0;

  if (!["json", "csv"].includes(format)) {
    throw new Error("Formato inválido. Use --format=json ou --format=csv");
  }

  if (limit && Number.isNaN(limit)) {
    throw new Error("Valor de --limit inválido");
  }

  const outputArg = getArg(
    "output",
    `exports/clientes-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${format}`
  );
  const outputPath = resolve(process.cwd(), outputArg);

  const uri = getMongoUri();
  const client = new MongoClient(uri);

  try {
    console.log(`Conectando ao MongoDB...`);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const cursor = collection.find({});
    if (limit > 0) cursor.limit(limit);

    const docs = await cursor.toArray();
    const normalized = docs.map((doc) => ({
      ...doc,
      _id: doc?._id?.toString?.() ?? doc._id,
    }));

    mkdirSync(dirname(outputPath), { recursive: true });

    if (format === "json") {
      writeFileSync(outputPath, JSON.stringify(normalized, null, 2), "utf8");
    } else {
      writeFileSync(outputPath, toCsv(normalized), "utf8");
    }

    console.log(`Exportação concluída com sucesso.`);
    console.log(`Banco: ${dbName} | Coleção: ${collectionName}`);
    console.log(`Registros exportados: ${normalized.length}`);
    console.log(`Arquivo: ${outputPath}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Erro ao exportar clientes:", error.message);
  process.exit(1);
});
