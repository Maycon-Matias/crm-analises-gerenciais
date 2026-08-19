// Teste rápido do cálculo de progresso
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
  return fonteConfig ? fonteConfig.categoria === 'principal' : false;
}

// Simular dados da Patricia
const clientesPatricia = [
  {
    usuarios: "patricia",
    fonte: "URA",
    status: "pago",
    data_pagamento: "2025-04-08",
    valor: "R$ 1.358,02"
  },
  {
    usuarios: "patricia",
    fonte: "Rede Social",
    status: "pago",
    data_pagamento: "2025-04-24",
    valor: "R$ 683,30"
  },
  {
    usuarios: "patricia",
    fonte: "Corretor(TI)", // Fonte de corretor - não deve contar
    status: "pago",
    data_pagamento: "2025-04-09",
    valor: "R$ 19.769,61"
  }
];

// Simular meta
const meta = {
  usuario: "Patricia",
  mes: "Abril",
  ano: 2025,
  valorMeta: 120000
};

// Testar função de cálculo
function calcularProgressoMeta(meta) {
  const vendasUsuario = clientesPatricia.filter((cliente) => {
    // Filtrar apenas clientes de fontes principais (não corretores)
    if (!isFontePrincipal(cliente.fonte)) {
      return false;
    }

    // Para clientes PAGOS: usar data_pagamento para cálculo
    if (cliente.status === "pago" && cliente.data_pagamento) {
      const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
      const mesPagamento = dataPagamento.toLocaleDateString("pt-BR", {
        month: "long",
      });
      const anoPagamento = dataPagamento.getFullYear();

      return (
        cliente.usuarios?.toLowerCase() === meta.usuario?.toLowerCase() &&
        mesPagamento.toLowerCase() === meta.mes.toLowerCase() &&
        anoPagamento === meta.ano
      );
    }
    
    return false;
  });

  console.log('🔍 Clientes filtrados:', vendasUsuario.length);
  vendasUsuario.forEach(c => console.log(`   ${c.usuarios} - ${c.fonte} - ${c.valor}`));

  // Somar apenas clientes PAGOS para o valor da meta
  const clientesPagosDoMes = vendasUsuario.filter(cliente => 
    cliente.status === "pago" && cliente.data_pagamento
  );

  const vendido = clientesPagosDoMes.reduce((acc, cliente) => {
    const valor = Number.parseFloat(
      cliente.valor
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim(),
    );
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  const percentualAlcancado = (vendido / meta.valorMeta) * 100;
  
  return {
    vendido,
    percentualAlcancado,
    status: percentualAlcancado >= 100 ? "atingida" : percentualAlcancado >= 80 ? "proxima" : "em_andamento"
  };
}

console.log('🧪 TESTE RÁPIDO DO CÁLCULO DE PROGRESSO (CORRIGIDO)');
console.log('======================================================');

const progresso = calcularProgressoMeta(meta);

console.log('\n📊 RESULTADO:');
console.log(`   Meta: R$ ${meta.valorMeta.toLocaleString('pt-BR')}`);
console.log(`   Vendido: R$ ${progresso.vendido.toLocaleString('pt-BR')}`);
console.log(`   Progresso: ${progresso.percentualAlcancado.toFixed(1)}%`);
console.log(`   Status: ${progresso.status}`);

console.log('\n✅ Teste concluído!');
