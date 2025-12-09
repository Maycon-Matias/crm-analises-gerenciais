export interface LogSistema {
  id: string;
  usuario: string;
  acao: string;
  detalhes: string;
  timestamp: string;
  tipo: "info" | "warning" | "error" | "success";
}

export interface BackupConfiguracao {
  id: string;
  nome: string;
  descricao: string;
  configuracao: any;
  criadoEm: string;
  criadoPor: string;
}

export interface NotificacaoSistema {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "info" | "warning" | "error" | "success";
  lida: boolean;
  criadaEm: string;
  usuarioId?: string;
}

export interface TemplateCampo {
  id: string;
  nome: string;
  descricao: string;
  categoria: "cliente" | "produto" | "geral";
  ativo: boolean;
  campos: Array<{
    nome: string;
    tipo: "texto" | "numero" | "data" | "email" | "telefone" | "select";
    obrigatorio: boolean;
    categoria: "cliente" | "produto";
  }>;
}

export interface BackupSistema {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  criadoEm: string;
  tamanho: string;
  tipo: "automatico" | "manual";
  status: "sucesso" | "erro" | "processando";
  criadoPor: string;
  configuracao: any;
}

export interface TemplateSistema {
  id: string;
  nome: string;
  descricao: string;
  categoria: "cliente" | "produto" | "geral";
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  campos: Array<{
    nome: string;
    tipo: "texto" | "numero" | "data" | "email" | "telefone" | "select";
    obrigatorio: boolean;
    categoria: "cliente" | "produto";
  }>;
}

export interface Configuracao {
  id: string;
  nome: string;
  valor: any;
  tipo: "string" | "number" | "boolean" | "object";
  categoria: "geral" | "cliente" | "produto" | "sistema";
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
}
