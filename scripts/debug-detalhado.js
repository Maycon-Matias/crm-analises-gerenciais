// Debug detalhado do cálculo de progresso
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
  { nome: "Corretor(RA)", categoria: "corretor" }
];

function isFontePrincipal(fonte) {
  const fonteConfig = FONTES_CONFIG.find(f => f.nome === fonte);
  const resultado = fonteConfig ? fonteConfig.categoria === 'principal' : false;
  console.log(`🔍 Fonte "${fonte}" -> É principal? ${resultado}`);
  return resultado;
}

// Simular dados da Mariele
const clientesMariele = [
  {
    usuarios: "mariele",
    fonte: "URA",
    status: "pago",
    data_pagamento: "2025-04-08",
    valor: "R$ 1.358,02"
  },
  {
    usuarios: "mariele",
    fonte: "Rede Social",
    status: "pago",
    data_pagamento: "2025-04-24",
    valor: "R$ 683,30"
  },
  {
    usuarios: "mariele",
    fonte: "Corretor(TI)",
    status: "pago",
    data_pagamento: "2025-04-09",
    valor: "R$ 19.769,61"
  }
];

// Simular meta
const meta = {
  usuario: "Mariele",
  mes: "Abril",
  ano: 2025,
  valorMeta: 120000
};

console.log('🧪 DEBUG DETALHADO DO CÁLCULO DE PROGRESSO');
console.log('============================================');

console.log('\n📋 DADOS DE ENTRADA:');
console.log(`   Meta: ${meta.usuario} - ${meta.mes} ${meta.ano} - R$ ${meta.valorMeta.toLocaleString('pt-BR')}`);
console.log(`   Total de clientes: ${clientesMariele.length}`);

clientesMariele.forEach((cliente, index) => {
  console.log(`\n   Cliente ${index + 1}:`);
  console.log(`     Usuários: "${cliente.usuarios}"`);
  console.log(`     Fonte: "${cliente.fonte}"`);
  console.log(`     Status: "${cliente.status}"`);
  console.log(`     Data Pagamento: "${cliente.data_pagamento}"`);
  console.log(`     Valor: "${cliente.valor}"`);
});

console.log('\n🔍 PROCESSANDO CADA CLIENTE:');

clientesMariele.forEach((cliente, index) => {
  console.log(`\n   --- CLIENTE ${index + 1}: ${cliente.usuarios} ---`);
  
  // 1. Verificar se é fonte principal
  const isPrincipal = isFontePrincipal(cliente.fonte);
  console.log(`   1. É fonte principal? ${isPrincipal}`);
  
  if (!isPrincipal) {
    console.log(`      ❌ Cliente descartado - não é fonte principal`);
    return;
  }
  
  // 2. Verificar se é pago e tem data de pagamento
  if (cliente.status !== "pago" || !cliente.data_pagamento) {
    console.log(`      ❌ Cliente descartado - não é pago ou não tem data de pagamento`);
    return;
  }
  
  console.log(`   2. É pago e tem data de pagamento? ✅`);
  
  // 3. Verificar data de pagamento
  const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
  const mesPagamento = dataPagamento.toLocaleDateString("pt-BR", { month: "long" });
  const anoPagamento = dataPagamento.getFullYear();
  
  console.log(`   3. Data de pagamento: ${cliente.data_pagamento}`);
  console.log(`      Mês extraído: "${mesPagamento}"`);
  console.log(`      Ano extraído: ${anoPagamento}`);
  
  // 4. Verificar se corresponde à meta
  const mesCorresponde = mesPagamento === meta.mes;
  const anoCorresponde = anoPagamento === meta.ano;
  const usuarioCorresponde = cliente.usuarios === meta.usuario;
  
  console.log(`   4. Verificações:`);
  console.log(`      Mês corresponde? "${mesPagamento}" === "${meta.mes}" ? ${mesCorresponde}`);
  console.log(`      Ano corresponde? ${anoPagamento} === ${meta.ano} ? ${anoCorresponde}`);
  console.log(`      Usuário corresponde? "${cliente.usuarios}" === "${meta.usuario}" ? ${usuarioCorresponde}`);
  
  const clienteValido = mesCorresponde && anoCorresponde && usuarioCorresponde;
  console.log(`      Cliente é válido para a meta? ${clienteValido ? '✅ SIM' : '❌ NÃO'}`);
  
  if (clienteValido) {
    console.log(`      🎯 CLIENTE INCLUÍDO NA META!`);
  }
});

console.log('\n✅ Debug detalhado concluído!');
