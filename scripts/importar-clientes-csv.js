const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { randomUUID } = require('crypto');

const csvPath = path.join(__dirname, '../clientes-DESKTOP-FF5J69R.csv');
const jsonPath = path.join(__dirname, '../data/clientes.json');

// Mapeamento de nomes de usuário para IDs
const vendedorIds = {
  beatriz: '2',
  camila: '3',
  fernanda: '4',
  ana: '5',
  patricia: '6',
};

const results = [];

fs.createReadStream(csvPath)
  .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.trim() }))
  .on('data', (data) => {
    // Remove espaços extras dos valores
    const cleanData = {};
    for (const key in data) {
      cleanData[key.trim()] = typeof data[key] === 'string' ? data[key].trim() : data[key];
    }
    const usuarioNome = (cleanData.usuarios || '').toLowerCase();
    // Função para converter data DD/MM/YYYY para YYYY-MM-DD
    function formatarData(dataStr) {
      if (!dataStr) return '';
      const partes = dataStr.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
      return dataStr;
    }
    results.push({
      id: randomUUID(),
      cliente: cleanData.cliente || '',
      produto: cleanData.produto || '',
      banco: cleanData.banco || '',
      fonte: cleanData.fonte || '',
      valor: cleanData['valor'] || '',
      data: formatarData(cleanData.data || ''),
      mes: cleanData.mes || '',
      usuarios: cleanData.usuarios || '',
      status: cleanData.status && cleanData.status.trim()
        ? cleanData.status.trim().toLowerCase().normalize('NFD').replace(/[^\w\s]/gi, '')
        : 'pendente',
      cpf: cleanData.cpf || '',
      telefone: cleanData.telefone || '',
      criadoPor: vendedorIds[usuarioNome] || '',
    });
  })
  .on('end', () => {
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log('Importação concluída!');
  }); 