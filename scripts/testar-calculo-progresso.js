// Script para testar o cálculo de progresso das metas
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/?retryWrites=true&w=majority&appName=PoraCred';
const DB_NAME = 'crm';

// Simular a configuração de fontes
const FONTES_CONFIG = [
  { nome: "Indicação(RO)", categoria: "principal" },
  { nome: "URA", categoria: "principal" },
  { nome: "Trafego", categoria: "principal" },
  { nome: "Rede Social", categoria: "principal" },
  { nome: "Balcão", categoria: "principal" },
  { nome: "Discador", categoria: "principal" },
  { nome: "Cliente Fixo", categoria: "principal" },
  { nome: "Indicação", categoria: "principal" },
  { nome: "Corretor(TI)", categoria: "corretor" },
  { nome: "Corretor(RA)", categoria: "corretor" },
  { nome: "Corretor(JO)", categoria: "corretor" },
  { nome: "Corretor(GI)", categoria: "corretor" },
  { nome: "Corretor(WE)", categoria: "corretor" },
  { nome: "Corretor(GE)", categoria: "corretor" },
  { nome: "Corretor(CA)", categoria: "corretor" },
  { nome: "Corretor(BI)", categoria: "corretor" }
];

function isFontePrincipal(fonte) {
  const fonteConfig = FONTES_CONFIG.find(f => f.nome === fonte);
  return fonteConfig ? fonteConfig.categoria === 'principal' : false;
}

async function testarCalculoProgresso() {
  let client;
  
  try {
    console.log('🧪 Testando cálculo de progresso das metas...');
    
    // Conectar ao MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db(DB_NAME);
    const clientesCollection = db.collection('clientes');
    const metasCollection = db.collection('metas');
    
    // Buscar meta da Mariele
    const metaMariele = await metasCollection.findOne({ usuario: "Mariele" });
    if (!metaMariele) {
      console.log('❌ Meta da Mariele não encontrada');
      return;
    }
    
    console.log(`\n🎯 META DA MARIELE:`);
    console.log(`   Usuário: ${metaMariele.usuario}`);
    console.log(`   Período: ${metaMariele.mes} ${metaMariele.ano}`);
    console.log(`   Valor da Meta: R$ ${metaMariele.valorMeta.toLocaleString('pt-BR')}`);
    
    // Buscar clientes da Mariele
    const clientesMariele = await clientesCollection.find({
      usuarios: "mariele"
    }).toArray();
    
    console.log(`\n📊 CLIENTES DA MARIELE: ${clientesMariele.length}`);
    
    // Filtrar por período (Abril 2025)
    const clientesDoMes = clientesMariele.filter(cliente => {
      // Para clientes PAGOS: usar data_pagamento se disponível
      if (cliente.status === "pago" && cliente.data_pagamento) {
        const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
        const mesPagamento = dataPagamento.toLocaleDateString("pt-BR", { month: "long" });
        const anoPagamento = dataPagamento.getFullYear();
        
        return mesPagamento === "Abril" && anoPagamento === 2025;
      }
      
      // Para outros status: usar data de cadastro
      const dataCadastro = new Date(cliente.data + 'T00:00:00');
      const mesCadastro = dataCadastro.toLocaleDateString("pt-BR", { month: "long" });
      const anoCadastro = dataCadastro.getFullYear();
      
      return mesCadastro === "Abril" && anoCadastro === 2025;
    });
    
    console.log(`📅 Clientes do mês (Abril 2025): ${clientesDoMes.length}`);
    
    if (clientesDoMes.length > 0) {
      console.log('\n📋 CLIENTES DO MÊS:');
      clientesDoMes.forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.cliente}`);
        console.log(`   Fonte: ${cliente.fonte}`);
        console.log(`   Status: ${cliente.status}`);
        console.log(`   Valor: ${cliente.valor}`);
        console.log(`   Data: ${cliente.data}`);
        console.log(`   Data Pagamento: ${cliente.data_pagamento || 'N/A'}`);
        console.log(`   É Fonte Principal: ${isFontePrincipal(cliente.fonte)}`);
        console.log('   ---');
      });
      
      // Filtrar apenas fontes principais
      const clientesPrincipais = clientesDoMes.filter(c => isFontePrincipal(c.fonte));
      console.log(`\n🎯 CLIENTES DE FONTES PRINCIPAIS: ${clientesPrincipais.length}`);
      
      // Filtrar apenas clientes pagos
      const clientesPagos = clientesPrincipais.filter(c => c.status === "pago" && c.data_pagamento);
      console.log(`💰 CLIENTES PAGOS: ${clientesPagos.length}`);
      
      // Calcular valor total
      const valorTotal = clientesPagos.reduce((acc, cliente) => {
        const valor = Number.parseFloat(
          cliente.valor
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim(),
        );
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);
      
      console.log(`💵 VALOR TOTAL VENDIDO: R$ ${valorTotal.toLocaleString('pt-BR')}`);
      
      // Calcular progresso
      const percentualAlcancado = (valorTotal / metaMariele.valorMeta) * 100;
      console.log(`📊 PROGRESSO: ${percentualAlcancado.toFixed(1)}%`);
      console.log(`🎯 META: R$ ${metaMariele.valorMeta.toLocaleString('pt-BR')}`);
      console.log(`✅ FALTAM: R$ ${(metaMariele.valorMeta - valorTotal).toLocaleString('pt-BR')}`);
      
    } else {
      console.log('❌ Nenhum cliente encontrado para Abril 2025');
      
      // Verificar datas dos clientes
      const datasUnicas = [...new Set(clientesMariele.map(c => c.data))];
      console.log('\n📅 Datas encontradas nos clientes:', datasUnicas.slice(0, 10));
      
      const mesesUnicos = [...new Set(clientesMariele.map(c => {
        const data = new Date(c.data + 'T00:00:00');
        return data.toLocaleDateString("pt-BR", { month: "long" });
      }))];
      console.log('📅 Meses encontrados:', mesesUnicos);
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

testarCalculoProgresso();
