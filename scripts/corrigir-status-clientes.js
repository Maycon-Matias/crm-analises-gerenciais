const { readFile, writeFile } = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'CRM_v2', 'sistema-cadastro-clientes', 'data', 'clientes.json');

async function corrigirStatus() {
  const data = await readFile(DB_PATH, 'utf-8');
  const clientes = JSON.parse(data);
  let alterado = false;
  for (const cliente of clientes) {
    if (!cliente.status) {
      cliente.status = 'pendente';
      alterado = true;
    }
  }
  if (alterado) {
    await writeFile(DB_PATH, JSON.stringify(clientes, null, 2), 'utf-8');
    console.log('Status corrigido para clientes antigos!');
  } else {
    console.log('Todos os clientes já possuem status.');
  }
}

corrigirStatus().catch(console.error); 