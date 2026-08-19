import { MongoClient } from "mongodb";
import XLSX from "xlsx";
import { readFileSync, mkdirSync } from "fs";
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
    // Sem .env.local, usa fallback abaixo.
  }

  throw new Error("MONGODB_URI não encontrada.");
}

function normalizeForSheet(doc) {
  const normalized = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value === null || value === undefined) {
      normalized[key] = "";
    } else if (value instanceof Date) {
      normalized[key] = value.toISOString();
    } else if (typeof value === "object") {
      normalized[key] = JSON.stringify(value);
    } else {
      normalized[key] = value;
    }
  }
  if (doc?._id?.toString) normalized._id = doc._id.toString();
  return normalized;
}

async function loadCollectionDocs(db, collectionName, limit) {
  const collection = db.collection(collectionName);
  const cursor = collection.find({});
  if (limit > 0) cursor.limit(limit);
  const docs = await cursor.toArray();
  return docs.map(normalizeForSheet);
}

function sanitizeSheetName(name) {
  return name.replace(/[\\/?*\[\]:]/g, "_").slice(0, 31);
}

async function tryExportFromDb(db, requestedCollections, limit) {
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map((c) => c.name);
  const byLower = new Map(existingNames.map((name) => [name.toLowerCase(), name]));

  const results = [];
  let total = 0;

  for (const requestedName of requestedCollections) {
    const exact = existingNames.includes(requestedName) ? requestedName : null;
    const caseInsensitive = byLower.get(requestedName.toLowerCase()) || null;
    const matchedName = exact || caseInsensitive;

    if (!matchedName) {
      results.push({
        requestedName,
        matchedName: null,
        docs: [],
      });
      continue;
    }

    const docs = await loadCollectionDocs(db, matchedName, limit);
    total += docs.length;
    results.push({
      requestedName,
      matchedName,
      docs,
    });
  }

  return { results, total, existingNames };
}

async function main() {
  const dbName = getArg("db", "crm");
  const outputArg = getArg(
    "output",
    `exports/clientes-whatsapp-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.xlsx`
  );
  const outputPath = resolve(process.cwd(), outputArg);
  const limitArg = getArg("limit", "");
  const limit = limitArg ? Number(limitArg) : 0;

  if (limit && Number.isNaN(limit)) {
    throw new Error("Valor de --limit inválido.");
  }

  const collectionsRaw = getArg(
    "collections",
    "dados_coletados_do_whatsapp,whatsapp-finalizado"
  );
  const collections = collectionsRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (collections.length === 0) {
    throw new Error("Informe ao menos uma coleção em --collections.");
  }

  const uri = getMongoUri();
  const client = new MongoClient(uri);

  try {
    console.log("Conectando ao MongoDB...");
    await client.connect();
    let selectedDb = client.db(dbName);
    let exportData = await tryExportFromDb(selectedDb, collections, limit);

    if (exportData.total === 0) {
      console.log(
        `Nenhum registro encontrado em '${dbName}'. Procurando automaticamente em outros bancos...`
      );

      const admin = client.db().admin();
      const dbs = await admin.listDatabases();

      for (const dbInfo of dbs.databases) {
        const candidateDb = client.db(dbInfo.name);
        const candidateExport = await tryExportFromDb(candidateDb, collections, limit);
        if (candidateExport.total > 0) {
          selectedDb = candidateDb;
          exportData = candidateExport;
          console.log(`Banco detectado automaticamente: '${dbInfo.name}'`);
          break;
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    for (const item of exportData.results) {
      const sheetName = sanitizeSheetName(item.requestedName || item.matchedName || "aba");
      const worksheet = XLSX.utils.json_to_sheet(item.docs);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      if (item.matchedName) {
        console.log(
          `Coleção '${item.requestedName}' -> '${item.matchedName}': ${item.docs.length} registros exportados.`
        );
      } else {
        console.log(`Coleção '${item.requestedName}' não encontrada no banco '${selectedDb.databaseName}'.`);
      }
    }

    if (exportData.total === 0) {
      console.log(`Nenhum registro encontrado para as coleções solicitadas.`);
      console.log(`Banco usado: '${selectedDb.databaseName}'`);
      console.log(`Coleções existentes neste banco: ${exportData.existingNames.join(", ") || "(nenhuma)"}`);
    }

    mkdirSync(dirname(outputPath), { recursive: true });
    XLSX.writeFile(workbook, outputPath);

    console.log(`Planilha gerada com sucesso: ${outputPath}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Erro ao gerar planilha:", error.message);
  process.exit(1);
});
