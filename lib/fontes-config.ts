// Configuração das fontes de venda e suas categorias
export interface FonteConfig {
  nome: string;
  categoria: 'principal' | 'corretor';
  descricao: string;
  ativo: boolean;
  // Percentual de contribuição desta fonte para metas de VALOR
  // 1 (100%) para fontes principais, 0.5 (50%) para corretores
  percentualMeta: number;
}

// Configuração das fontes de venda
export const FONTES_CONFIG: FonteConfig[] = [
  // FONTES PRINCIPAIS (contam no mês para metas e performance)
  {
    nome: "Indicação(RO)",
    categoria: "principal",
    descricao: "Indicações diretas do vendedor RO",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "URA",
    categoria: "principal", 
    descricao: "Vendas via URA (Unidade de Resposta Audível)",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "Trafego",
    categoria: "principal",
    descricao: "Vendas via tráfego orgânico/pago",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "Rede Social",
    categoria: "principal",
    descricao: "Vendas via redes sociais (Instagram, Facebook, etc.)",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "Balcão",
    categoria: "principal",
    descricao: "Vendas diretas no balcão/escritório",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "Discador",
    categoria: "principal",
    descricao: "Vendas via discador/telemarketing ativo",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "Cliente Fixo",
    categoria: "principal",
    descricao: "Clientes recorrentes/fixos",
    ativo: true,
    percentualMeta: 1
  },
  {
    nome: "Indicação",
    categoria: "principal",
    descricao: "Indicações gerais (sem especificar vendedor)",
    ativo: true,
    percentualMeta: 1
  },

  // FONTES DE CORRETORES (não contam no mês principal)
  {
    nome: "Corretor(TI)",
    categoria: "corretor",
    descricao: "Vendas via corretor TI",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(RA)",
    categoria: "corretor",
    descricao: "Vendas via corretor RA", 
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(JO)",
    categoria: "corretor",
    descricao: "Vendas via corretor JO",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(GI)",
    categoria: "corretor",
    descricao: "Vendas via corretor GI",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(WE)",
    categoria: "corretor",
    descricao: "Vendas via corretor WE",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(GE)",
    categoria: "corretor",
    descricao: "Vendas via corretor GE",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(CA)",
    categoria: "corretor",
    descricao: "Vendas via corretor CA",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(BI)",
    categoria: "corretor",
    descricao: "Vendas via corretor BI",
    ativo: true,
    percentualMeta: 0.5
  },
  {
    nome: "Corretor(SA)",
    categoria: "corretor",
    descricao: "Vendas via corretor SA (Sabrina)",
    ativo: true,
    percentualMeta: 0.5
  }
];

// Funções utilitárias para trabalhar com as fontes
export function getFonteCategoria(nomeFonte: string): 'principal' | 'corretor' | null {
  const fonte = FONTES_CONFIG.find(f => f.nome === nomeFonte);
  return fonte ? fonte.categoria : null;
}

export function isFontePrincipal(nomeFonte: string): boolean {
  return getFonteCategoria(nomeFonte) === 'principal';
}

export function isFonteCorretor(nomeFonte: string): boolean {
  return getFonteCategoria(nomeFonte) === 'corretor';
}

// Percentual de contribuição para metas de VALOR, por fonte
// Caso a fonte não seja encontrada, considerar 0 (não contribui)
export function getPercentualMeta(nomeFonte: string): number {
  const fonte = FONTES_CONFIG.find(f => f.nome === nomeFonte);
  return fonte ? fonte.percentualMeta : 0;
}

export function getFontesPrincipais(): string[] {
  return FONTES_CONFIG
    .filter(f => f.categoria === 'principal' && f.ativo)
    .map(f => f.nome);
}

export function getFontesCorretor(): string[] {
  return FONTES_CONFIG
    .filter(f => f.categoria === 'corretor' && f.ativo)
    .map(f => f.nome);
}

export function getTodasFontes(): string[] {
  return FONTES_CONFIG
    .filter(f => f.ativo)
    .map(f => f.nome);
}

// Função para validar se uma fonte é válida
export function isFonteValida(nomeFonte: string): boolean {
  return FONTES_CONFIG.some(f => f.nome === nomeFonte && f.ativo);
}
