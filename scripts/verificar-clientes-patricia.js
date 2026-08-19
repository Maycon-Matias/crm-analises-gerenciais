// Script para verificar clientes da Patricia e entender por que não estão sendo contados
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';
const COLLECTION_NAME = 'clientes';

async function verificarClientesPatricia() {
  let client;
  
  try {
    console.log('🔍 Verificando clientes da Patricia...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Buscar clientes da Patricia
    const clientesPatricia = await collection.find({
      $or: [
        { usuarios: "patricia" },
        { criadoPor: "patricia" },
        { criadoPor: { $regex: /patricia/i } }
      ]
    }).toArray();
    
    console.log(`📊 Total de clientes da Patricia: ${clientesPatricia.length}`);
    
    if (clientesPatricia.length > 0) {
      console.log('\n📋 DETALHES DOS CLIENTES DA PATRICIA:');
      console.log('============================================================');
      
      clientesPatricia.forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente}`);
        console.log(`   Produto: ${cliente.produto}`);
        console.log(`   Banco: ${cliente.banco}`);
        console.log(`   Fonte: ${cliente.fonte}`);
        console.log(`   Valor: ${cliente.valor}`);
        console.log(`   Status: ${cliente.status}`);
        console.log(`   Data: ${cliente.data}`);
        console.log(`   Data Pagamento: ${cliente.data_pagamento || 'N/A'}`);
        console.log(`   Usuários: ${cliente.usuarios}`);
        console.log(`   Criado Por: ${cliente.criadoPor}`);
        console.log('   ---');
      });
      
      // Verificar fontes principais vs corretores
      const fontesPrincipais = clientesPatricia.filter(c => 
        !c.fonte.includes('Corretor') && 
        !c.fonte.includes('Indicação') &&
        !c.fonte.includes('RO')
      );
      
      const fontesCorretor = clientesPatricia.filter(c => 
        c.fonte.includes('Corretor') || 
        c.fonte.includes('Indicação') ||
        c.fonte.includes('RO')
      );
      
      console.log('\n🎯 ANÁLISE DE FONTES:');
      console.log(`   Fontes Principais: ${fontesPrincipais.length} clientes`);
      console.log(`   Fontes Corretor: ${fontesCorretor.length} clientes`);
      
      // Verificar clientes pagos
      const clientesPagos = clientesPatricia.filter(c => c.status === 'pago');
      console.log(`   Clientes Pagos: ${clientesPagos.length} clientes`);
      
      // Verificar valores
      const valorTotal = clientesPatricia.reduce((acc, c) => {
        const valor = Number.parseFloat(
          c.valor
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim(),
        );
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);
      
      console.log(`   Valor Total: R$ ${valorTotal.toLocaleString('pt-BR')}`);
      
    } else {
      console.log('❌ Nenhum cliente encontrado para a Patricia');
      
      // Verificar se há clientes com outros nomes similares
      const todosClientes = await collection.find({}).toArray();
      const nomesUnicos = [...new Set(todosClientes.map(c => c.usuarios))];
      console.log('\n🔍 Usuários encontrados no sistema:', nomesUnicos);
      
      const criadoPorUnicos = [...new Set(todosClientes.map(c => c.criadoPor))];
      console.log('🔍 IDs de criação encontrados:', criadoPorUnicos);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

verificarClientesPatricia();
