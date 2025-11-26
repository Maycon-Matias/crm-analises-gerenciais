import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCache, setCache } from "@/lib/cache";

// GET - Obter estatísticas gerais com cache
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "geral";
    
    // Tentar obter do cache primeiro
    const cacheKey = `analytics-${tipo}`;
    const cachedAnalytics = getCache(cacheKey);
    
    if (cachedAnalytics) {
      console.log(`📦 Retornando analytics ${tipo} do cache`);
      return NextResponse.json(cachedAnalytics);
    }

    console.log(`🔄 Calculando analytics ${tipo} do banco...`);
    const client = await clientPromise;
    const db = client.db("crm");
    const clientesCollection = db.collection("clientes");
    const metasCollection = db.collection("metas");

    let resultado;

    switch (tipo) {
      case "geral":
        resultado = await calcularEstatisticasGerais(clientesCollection);
        break;
      case "vendas-por-mes":
        resultado = await calcularVendasPorMes(clientesCollection);
        break;
      case "produtos":
        resultado = await calcularVendasPorProduto(clientesCollection);
        break;
      case "usuarios":
        resultado = await calcularVendasPorUsuario(clientesCollection);
        break;
      default:
        resultado = await calcularEstatisticasGerais(clientesCollection);
    }

    // Salvar no cache por 3 minutos (analytics mudam menos frequentemente)
    setCache(cacheKey, resultado, 3 * 60 * 1000);
    console.log(`💾 Analytics ${tipo} salvos no cache`);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao calcular analytics:", error);
    return NextResponse.json({ error: "Erro ao calcular analytics" }, { status: 500 });
  }
}

// Função para calcular estatísticas gerais
async function calcularEstatisticasGerais(clientesCollection: any) {
  const clientes = await clientesCollection.find({}).toArray();
  
  const totalClientes = clientes.length;
  const clientesPagos = clientes.filter((c: any) => c.status === "pago");
  const clientesPendentes = clientes.filter((c: any) => c.status === "pendente");
  const clientesCancelados = clientes.filter((c: any) => c.status === "cancelado");
  
  const totalVendas = clientesPagos.reduce((acc: number, c: any) => {
    const valor = parsearValor(c.valor);
    return acc + valor;
  }, 0);
  
  const ticketMedio = totalVendas / clientesPagos.length || 0;
  const taxaConversao = (clientesPagos.length / totalClientes) * 100 || 0;
  
  return {
    totalClientes,
    totalVendas,
    ticketMedio,
    taxaConversao,
    vendasPorStatus: [
      { status: "pago", quantidade: clientesPagos.length, valor: totalVendas },
      { status: "pendente", quantidade: clientesPendentes.length, valor: 0 },
      { status: "cancelado", quantidade: clientesCancelados.length, valor: 0 }
    ]
  };
}

// Função para calcular vendas por mês
async function calcularVendasPorMes(clientesCollection: any) {
  const clientes = await clientesCollection.find({}).toArray();
  
  const vendasPorMes: { [key: string]: number } = {};
  
  clientes.forEach((cliente: any) => {
    if (cliente.status === "pago" && cliente.mes) {
      const mes = cliente.mes;
      const valor = parsearValor(cliente.valor);
      vendasPorMes[mes] = (vendasPorMes[mes] || 0) + valor;
    }
  });
  
  return Object.entries(vendasPorMes).map(([mes, valor]) => ({
    mes,
    valor,
    quantidade: clientes.filter((c: any) => c.mes === mes && c.status === "pago").length
  }));
}

// Função para calcular vendas por produto
async function calcularVendasPorProduto(clientesCollection: any) {
  const clientes = await clientesCollection.find({}).toArray();
  
  const vendasPorProduto: { [key: string]: number } = {};
  
  clientes.forEach((cliente: any) => {
    if (cliente.status === "pago" && cliente.produto) {
      const produto = cliente.produto;
      const valor = parsearValor(cliente.valor);
      vendasPorProduto[produto] = (vendasPorProduto[produto] || 0) + valor;
    }
  });
  
  return Object.entries(vendasPorProduto).map(([produto, valor]) => ({
    produto,
    valor,
    quantidade: clientes.filter((c: any) => c.produto === produto && c.status === "pago").length
  }));
}

// Função para calcular vendas por usuário
async function calcularVendasPorUsuario(clientesCollection: any) {
  const clientes = await clientesCollection.find({}).toArray();
  
  const vendasPorUsuario: { [key: string]: number } = {};
  
  clientes.forEach((cliente: any) => {
    if (cliente.status === "pago" && cliente.usuarios) {
      const usuario = cliente.usuarios;
      const valor = parsearValor(cliente.valor);
      vendasPorUsuario[usuario] = (vendasPorUsuario[usuario] || 0) + valor;
    }
  });
  
  return Object.entries(vendasPorUsuario).map(([usuario, valor]) => ({
    usuario,
    valor,
    quantidade: clientes.filter((c: any) => c.usuarios === usuario && c.status === "pago").length
  }));
}

// Função para parsear valores monetários
function parsearValor(valor: string): number {
  if (!valor) return 0;
  
  if (typeof valor === 'number') return valor;
  
  let valorLimpo = valor.toString()
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  
  const numero = Number.parseFloat(valorLimpo);
  return isNaN(numero) ? 0 : numero;
}
