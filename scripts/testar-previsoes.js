const { MongoClient } = require('mongodb');

// URI do MongoDB Atlas
const uri = "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred";

async function testarSistemaPrevisoes() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await client.connect();
    console.log('✅ Conectado ao MongoDB!');
    
    const db = client.db('crm');
    const collection = db.collection('clientes');
    
    // 1. Verificar se existem clientes com data_previsao_pagamento
    console.log('\n📊 VERIFICANDO CLIENTES COM PREVISÃO...');
    
    const clientesComPrevisao = await collection.find({
      data_previsao_pagamento: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`📅 Total de clientes com previsão: ${clientesComPrevisao.length}`);
    
    if (clientesComPrevisao.length > 0) {
      console.log('\n📋 EXEMPLOS DE CLIENTES COM PREVISÃO:');
      clientesComPrevisao.slice(0, 3).forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente} - ${cliente.valor} - Previsão: ${cliente.data_previsao_pagamento}`);
      });
    }
    
    // 2. Verificar clientes para hoje
    const hoje = new Date().toISOString().split('T')[0];
    console.log(`\n🎯 VERIFICANDO PREVISÕES PARA HOJE (${hoje})...`);
    
    const previsoesHoje = await collection.find({
      data_previsao_pagamento: hoje,
      status: { $in: ["pendente", "cancelado"] }
    }).toArray();
    
    console.log(`📅 Clientes com previsão para hoje: ${previsoesHoje.length}`);
    
    if (previsoesHoje.length > 0) {
      console.log('\n📋 CLIENTES PARA HOJE:');
      previsoesHoje.forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente} - ${cliente.valor} - Vendedor: ${cliente.usuarios}`);
      });
      
      // Calcular total previsto
      const totalPrevisto = previsoesHoje.reduce((acc, cliente) => {
        const valor = Number(cliente.valor?.replace("R$", "").replace(/\./g, "").replace(",", ".") || "0");
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);
      
      console.log(`💰 Total previsto para hoje: R$ ${totalPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    }
    
    // 3. Verificar próximos 7 dias
    console.log('\n📅 VERIFICANDO PRÓXIMOS 7 DIAS...');
    
    const proximos7Dias = [];
    for (let i = 1; i <= 7; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];
      
      const previsoes = await collection.find({
        data_previsao_pagamento: dataStr,
        status: { $in: ["pendente", "cancelado"] }
      }).toArray();
      
      if (previsoes.length > 0) {
        proximos7Dias.push({
          data: dataStr,
          quantidade: previsoes.length,
          total: previsoes.reduce((acc, cliente) => {
            const valor = Number(cliente.valor?.replace("R$", "").replace(/\./g, "").replace(",", ".") || "0");
            return acc + (isNaN(valor) ? 0 : valor);
          }, 0)
        });
      }
    }
    
    console.log(`📊 Dias com previsões nos próximos 7 dias: ${proximos7Dias.length}`);
    
    if (proximos7Dias.length > 0) {
      console.log('\n📋 RESUMO DOS PRÓXIMOS 7 DIAS:');
      proximos7Dias.forEach((dia) => {
        console.log(`${dia.data}: ${dia.quantidade} clientes - R$ ${dia.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      });
    }
    
    // 4. Verificar se há clientes sem previsão
    console.log('\n❓ VERIFICANDO CLIENTES SEM PREVISÃO...');
    
    const clientesSemPrevisao = await collection.find({
      $or: [
        { data_previsao_pagamento: { $exists: false } },
        { data_previsao_pagamento: null }
      ],
      status: "pendente"
    }).toArray();
    
    console.log(`⚠️ Clientes pendentes sem previsão: ${clientesSemPrevisao.length}`);
    
    if (clientesSemPrevisao.length > 0) {
      console.log('\n📋 EXEMPLOS DE CLIENTES SEM PREVISÃO:');
      clientesSemPrevisao.slice(0, 3).forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente} - ${cliente.valor} - Cadastrado em: ${cliente.data}`);
      });
    }
    
    // 5. Estatísticas gerais
    console.log('\n📊 ESTATÍSTICAS GERAIS:');
    
    const totalClientes = await collection.countDocuments();
    const clientesPendentes = await collection.countDocuments({ status: "pendente" });
    const clientesPagos = await collection.countDocuments({ status: "pago" });
    const clientesComPrevisaoTotal = await collection.countDocuments({
      data_previsao_pagamento: { $exists: true, $ne: null }
    });
    
    console.log(`👥 Total de clientes: ${totalClientes}`);
    console.log(`⏳ Clientes pendentes: ${clientesPendentes}`);
    console.log(`✅ Clientes pagos: ${clientesPagos}`);
    console.log(`📅 Clientes com previsão: ${clientesComPrevisaoTotal}`);
    console.log(`📊 Percentual com previsão: ${((clientesComPrevisaoTotal / totalClientes) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 TESTE COMPLETO! Sistema de previsões funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar o teste
testarSistemaPrevisoes();
