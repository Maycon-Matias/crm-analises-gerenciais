export interface CampoPersonalizado {
  id: string;
  nome: string;
  tipo: "texto" | "numero" | "data" | "select" | "email" | "telefone";
  obrigatorio: boolean;
  opcoes?: string[]; // Para campos do tipo select
  ordem: number;
  ativo: boolean;
  categoria: "cliente" | "produto" | "administrativo";
}

export interface WebhookConfig {
  id: string;
  nome: string;
  url: string;
  eventos: ("cliente.criado" | "cliente.atualizado" | "cliente.excluido" | "cliente.pago")[];
  ativo: boolean;
  headers?: Record<string, string>;
  timeout: number; // em segundos
  tentativas: number;
  criadoEm: string;
  criadoPor: string;
}

export interface ConfiguracaoSistema {
  camposPersonalizados: CampoPersonalizado[];
  camposObrigatorios: string[];
  opcoesPredefinidas: {
    produtos: string[];
    bancos: string[];
    fontes: string[];
    usuarios: string[];
  };
  configuracaoImportacao: {
    mapeamentoCampos: Record<string, string>;
    camposIgnorados: string[];
    separadorCSV: string;
  };
  webhooks: WebhookConfig[];
}

export const configuracaoPadrao: ConfiguracaoSistema = {
  camposPersonalizados: [
    {
      id: "cliente",
      nome: "Nome do Cliente",
      tipo: "texto",
      obrigatorio: true,
      ordem: 1,
      ativo: true,
      categoria: "cliente",
    },
    {
      id: "produto",
      nome: "Produto",
      tipo: "select",
      obrigatorio: true,
      opcoes: ["Margem", "Cartão", "Portabilidade"],
      ordem: 2,
      ativo: true,
      categoria: "produto",
    },
    {
      id: "valor",
      nome: "Valor",
      tipo: "numero",
      obrigatorio: true,
      ordem: 3,
      ativo: true,
      categoria: "cliente",
    },
  ],
  camposObrigatorios: ["cliente", "produto", "valor"],
  opcoesPredefinidas: {
    produtos: ["Margem", "Cartão", "Portabilidade"],
    bancos: ["Porã Cred", "BMG", "Bradesco", "Zelicred"],
    fontes: ["Balcão", "Rede Social", "Indicação"],
    usuarios: ["Amanda", "Lais", "Carlos"],
  },
  configuracaoImportacao: {
    mapeamentoCampos: {},
    camposIgnorados: [],
    separadorCSV: ",",
  },
  webhooks: [],
};
