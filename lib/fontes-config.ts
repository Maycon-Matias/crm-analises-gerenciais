// Configuração das fontes de venda e suas categorias
export interface FonteConfig {
  nome: string;
  categoria: 'principal' | 'corretor';
  descricao: string;
  ativo: boolean;
}

// Configuração das fontes de venda
export const FONTES_CONFIG: FonteConfig[] = [
  // FONTES PRINCIPAIS (contam no mês para metas e performance)
  {
    nome: "Indicação(RO)",
    categoria: "principal",
    descricao: "Indicações diretas do vendedor RO",
    ativo: true
  },
  {
    nome: "URA",
    categoria: "principal", 
    descricao: "Vendas via URA (Unidade de Resposta Audível)",
    ativo: true
  },
  {
    nome: "Trafego",
    categoria: "principal",
    descricao: "Vendas via tráfego orgânico/pago",
    ativo: true
  },
  {
    nome: "Rede Social",
    categoria: "principal",
    descricao: "Vendas via redes sociais (Instagram, Facebook, etc.)",
    ativo: true
  },
  {
    nome: "Balcão",
    categoria: "principal",
    descricao: "Vendas diretas no balcão/escritório",
    ativo: true
  },
  {
    nome: "Discador",
    categoria: "principal",
    descricao: "Vendas via discador/telemarketing ativo",
    ativo: true
  },
  {
    nome: "Cliente Fixo",
    categoria: "principal",
    descricao: "Clientes recorrentes/fixos",
    ativo: true
  },
  {
    nome: "Indicação",
    categoria: "principal",
    descricao: "Indicações gerais (sem especificar vendedor)",
    ativo: true
  },

  // FONTES DE CORRETORES (não contam no mês principal)
  {
    nome: "Corretor(TI)",
    categoria: "corretor",
    descricao: "Vendas via corretor TI",
    ativo: true
  },
  {
    nome: "Corretor(RA)",
    categoria: "corretor",
    descricao: "Vendas via corretor RA", 
    ativo: true
  },
  {
    nome: "Corretor(JO)",
    categoria: "corretor",
    descricao: "Vendas via corretor JO",
    ativo: true
  },
  {
    nome: "Corretor(GI)",
    categoria: "corretor",
    descricao: "Vendas via corretor GI",
    ativo: true
  },
  {
    nome: "Corretor(WE)",
    categoria: "corretor",
    descricao: "Vendas via corretor WE",
    ativo: true
  },
  {
    nome: "Corretor(GE)",
    categoria: "corretor",
    descricao: "Vendas via corretor GE",
    ativo: true
  },
  {
    nome: "Corretor(CA)",
    categoria: "corretor",
    descricao: "Vendas via corretor CA",
    ativo: true
  },
  {
    nome: "Corretor(BI)",
    categoria: "corretor",
    descricao: "Vendas via corretor BI",
    ativo: true
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
