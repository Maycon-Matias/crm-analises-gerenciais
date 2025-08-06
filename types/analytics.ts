export interface Meta {
  id: string;
  usuario: string;
  mes: string;
  ano: number;
  valorMeta: number;
  criadaEm: string;
  tipo?: "quantidade" | "valor";
}

export interface RegraComissao {
  id: string;
  tipo: "produto" | "banco";
  produto?: string;
  banco?: string;
  percentual: number;
  valorMinimo?: number;
  valorMaximo?: number;
  ativa: boolean;
}

export interface RegraComissaoBanco {
  id: string;
  banco: string;
  percentual: number;
  valorMinimo?: number;
  valorMaximo?: number;
  ativa: boolean;
}

export interface ComissaoCalculada {
  usuarioId: string;
  usuario: string;
  mes: string;
  ano: number;
  vendas: {
    produto: string;
    banco: string;
    quantidade: number;
    valorTotal: number;
    comissao: number;
  }[];
  totalVendas: number;
  totalComissao: number;
}

export interface VendaPorPeriodo {
  periodo: string;
  valor: number;
  quantidade: number;
  ticketMedio: number;
}

export interface VendaPorProduto {
  produto: string;
  quantidade: number;
  valor: number;
  percentual: number;
}

export interface ProgressoMeta {
  usuario: string;
  meta: number;
  vendido: number;
  faltante: number;
  percentualAlcancado: number;
  diasRestantes: number;
  mediaVendasDiaria: number;
  projecao: number;
}
