const { readFile, writeFile } = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'CRM_v2', 'sistema-cadastro-clientes', 'data', 'clientes.json');

const nomeParaId = {
  'Maycon': '1',
  'Amanda': '2',
  'Adriana': '3',
  'Lais': '4',
  'Ana': '5',
};

async function atualizarClientes() {
  const data = await readFile(DB_PATH, 'utf-8');
  const clientes = JSON.parse(data);
  let alterado = false;
  for (const cliente of clientes) {
    if (!cliente.criadoPor && cliente.usuarios && nomeParaId[cliente.usuarios]) {
      cliente.criadoPor = nomeParaId[cliente.usuarios];
      alterado = true;
    }
  }
  if (alterado) {
    await writeFile(DB_PATH, JSON.stringify(clientes, null, 2), 'utf-8');
    console.log('Clientes antigos atualizados com sucesso!');
  } else {
    console.log('Nenhum cliente antigo precisava ser atualizado.');
  }
}

atualizarClientes().catch(console.error); 