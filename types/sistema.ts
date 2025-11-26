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
