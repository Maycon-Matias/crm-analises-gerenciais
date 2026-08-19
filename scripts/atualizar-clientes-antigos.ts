import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'clientes.json');

const nomeParaId: Record<string, string> = {
  'Maycon': '1',
  'Beatriz': '2',
  'Camila': '3',
  'Fernanda': '4',
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