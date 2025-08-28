// Script para debugar clientes de Abril 2025 da Mariele
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';

async function debugClientesAbril() {
  let client;
  
  try {
    console.log('🔍 Debugando clientes de Abril 2025 da Mariele...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const clientesCollection = db.collection('clientes');
    
    // Buscar clientes da Mariele
    const clientesMariele = await clientesCollection.find({
      usuarios: "mariele"
    }).toArray();
    
    console.log(`📊 Total de clientes da Mariele: ${clientesMariele.length}`);
    
    // Verificar clientes com data_pagamento em Abril
    const clientesPagosAbril = clientesMariele.filter(cliente => {
      if (cliente.status === "pago" && cliente.data_pagamento) {
        const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
        const mesPagamento = dataPagamento.toLocaleDateString("pt-BR", { month: "long" });
        const anoPagamento = dataPagamento.getFullYear();
        
        if (mesPagamento === "abril" && anoPagamento === 2025) {
          console.log(`✅ Cliente pago em Abril: ${cliente.cliente} - ${cliente.data_pagamento}`);
          return true;
        }
      }
      return false;
    });
    
    console.log(`\n💰 Clientes PAGOS em Abril 2025: ${clientesPagosAbril.length}`);
    
    if (clientesPagosAbril.length > 0) {
      console.log('\n📋 DETALHES DOS CLIENTES PAGOS EM ABRIL:');
      clientesPagosAbril.forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente}`);
        console.log(`   Fonte: ${cliente.fonte}`);
        console.log(`   Valor: ${cliente.valor}`);
        console.log(`   Data Pagamento: ${cliente.data_pagamento}`);
        console.log(`   Data Cadastro: ${cliente.data}`);
        console.log('   ---');
      });
      
      // Calcular valor total
      const valorTotal = clientesPagosAbril.reduce((acc, cliente) => {
        const valor = Number.parseFloat(
          cliente.valor
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim(),
        );
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);
      
      console.log(`\n💵 VALOR TOTAL VENDIDO EM ABRIL: R$ ${valorTotal.toLocaleString('pt-BR')}`);
      
    } else {
      console.log('\n❌ Nenhum cliente pago encontrado para Abril 2025');
      
      // Verificar todas as datas de pagamento
      const datasPagamento = clientesMariele
        .filter(c => c.status === "pago" && c.data_pagamento)
        .map(c => c.data_pagamento);
      
      console.log('\n📅 Todas as datas de pagamento encontradas:');
      datasPagamento.forEach(data => {
        const dataObj = new Date(data + 'T00:00:00');
        const mes = dataObj.toLocaleDateString("pt-BR", { month: "long" });
        const ano = dataObj.getFullYear();
        console.log(`   ${data} -> ${mes} ${ano}`);
      });
    }
    
    // Verificar clientes cadastrados em Abril (para contagem)
    const clientesCadastradosAbril = clientesMariele.filter(cliente => {
      const dataCadastro = new Date(cliente.data + 'T00:00:00');
      const mesCadastro = dataCadastro.toLocaleDateString("pt-BR", { month: "long" });
      const anoCadastro = dataCadastro.getFullYear();
      
      if (mesCadastro === "abril" && anoCadastro === 2025) {
        console.log(`📝 Cliente cadastrado em Abril: ${cliente.cliente} - ${cliente.data} - Status: ${cliente.status}`);
        return true;
      }
      return false;
    });
    
    console.log(`\n📝 Clientes CADASTRADOS em Abril 2025: ${clientesCadastradosAbril.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Conexão com MongoDB fechada');
    }
  }
}

debugClientesAbril();
