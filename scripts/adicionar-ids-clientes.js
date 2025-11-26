const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const filePath = path.join(__dirname, '../data/clientes.json');

function ensureIds() {
  const data = fs.readFileSync(filePath, 'utf-8');
  let clientes = JSON.parse(data);
  let alterado = false;

  clientes = clientes.map(cliente => {
    if (!cliente.id) {
      alterado = true;
      return { ...cliente, id: randomUUID() };
    }
    return cliente;
  });

  if (alterado) {
    fs.writeFileSync(filePath, JSON.stringify(clientes, null, 2), 'utf-8');
    console.log('IDs adicionados com sucesso!');
  } else {
    console.log('Todos os clientes já possuem ID.');
  }
}

ensureIds(); 