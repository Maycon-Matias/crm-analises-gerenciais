"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";

interface SistemaContextType {
  logs: LogSistema[];
  backups: BackupSistema[];
  notificacoes: NotificacaoSistema[];
  templates: TemplateSistema[];
  adicionarLog: (
    acao: string,
    detalhes: string,
    tipo: "info" | "success" | "warning" | "error",
  ) => void;
  criarBackup: (
    nome: string,
    descricao: string,
    configuracao: Configuracao,
  ) => void;
  restaurarBackup: (backupId: string) => Configuracao | null;
  limparLogs: () => void;
  exportarLogs: () => void;
  criarTemplate: (
    template: Omit<TemplateSistema, "id" | "criadoEm" | "criadoPor">,
  ) => void;
  aplicarTemplate: (templateId: string) => any[];
  adicionarNotificacao: (
    titulo: string,
    mensagem: string,
    tipo: "info" | "success" | "warning" | "error",
  ) => void;
  marcarNotificacaoLida: (notificacaoId: string) => void;
  limparNotificacoes: () => void;
}

const SistemaContext = createContext<SistemaContextType | undefined>(undefined);

const TEMPLATES_PADRAO: TemplateSistema[] = [
  {
    id: "template-pf",
    nome: "Cliente Pessoa Física",
    descricao: "Campos essenciais para cadastro de pessoa física",
    categoria: "pessoa-fisica",
    ativo: true,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema",
    campos: [
      { nome: "CPF", tipo: "texto", obrigatorio: true, categoria: "cliente" },
      { nome: "RG", tipo: "texto", obrigatorio: false, categoria: "cliente" },
      {
        nome: "Data de Nascimento",
        tipo: "data",
        obrigatorio: true,
        categoria: "cliente",
      },
      {
        nome: "Telefone",
        tipo: "telefone",
        obrigatorio: true,
        categoria: "cliente",
      },
      {
        nome: "Profissão",
        tipo: "texto",
        obrigatorio: false,
        categoria: "cliente",
      },
    ],
  },
  {
    id: "template-pj",
    nome: "Cliente Pessoa Jurídica",
    descricao: "Campos essenciais para cadastro de pessoa jurídica",
    categoria: "pessoa-juridica",
    ativo: true,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema",
    campos: [
      { nome: "CNPJ", tipo: "texto", obrigatorio: true, categoria: "cliente" },
      {
        nome: "Razão Social",
        tipo: "texto",
        obrigatorio: true,
        categoria: "cliente",
      },
      {
        nome: "Nome Fantasia",
        tipo: "texto",
        obrigatorio: false,
        categoria: "cliente",
      },
      {
        nome: "Inscrição Estadual",
        tipo: "texto",
        obrigatorio: false,
        categoria: "cliente",
      },
      {
        nome: "Responsável",
        tipo: "texto",
        obrigatorio: true,
        categoria: "cliente",
      },
    ],
  },
  {
    id: "template-financeiro",
    nome: "Dados Financeiros",
    descricao: "Campos para informações financeiras e bancárias",
    categoria: "financeiro",
    ativo: true,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema",
    campos: [
      {
        nome: "Banco",
        tipo: "select",
        obrigatorio: false,
        categoria: "produto",
      },
      {
        nome: "Agência",
        tipo: "texto",
        obrigatorio: false,
        categoria: "produto",
      },
      {
        nome: "Conta",
        tipo: "texto",
        obrigatorio: false,
        categoria: "produto",
      },
      {
        nome: "Renda Mensal",
        tipo: "numero",
        obrigatorio: false,
        categoria: "produto",
      },
      {
        nome: "Valor do Empréstimo",
        tipo: "numero",
        obrigatorio: false,
        categoria: "produto",
      },
    ],
  },
];

export function SistemaProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const user = auth?.user || null;

  const [logs, setLogs] = useState<LogSistema[]>([]);
  const [backups, setBackups] = useState<BackupSistema[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);
  const [templates, setTemplates] =
    useState<TemplateSistema[]>(TEMPLATES_PADRAO);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("sistema-logs");
    const savedBackups = localStorage.getItem("sistema-backups");
    const savedNotificacoes = localStorage.getItem("sistema-notificacoes");
    const savedTemplates = localStorage.getItem("sistema-templates");

    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (error) {
        console.error("Erro ao carregar logs:", error);
      }
    }

    if (savedBackups) {
      try {
        setBackups(JSON.parse(savedBackups));
      } catch (error) {
        console.error("Erro ao carregar backups:", error);
      }
    }

    if (savedNotificacoes) {
      try {
        setNotificacoes(JSON.parse(savedNotificacoes));
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    }

    if (savedTemplates) {
      try {
        const loadedTemplates = JSON.parse(savedTemplates);
        setTemplates([
          ...TEMPLATES_PADRAO,
          ...loadedTemplates.filter(
            (t: TemplateSistema) =>
              !TEMPLATES_PADRAO.some((p) => p.id === t.id),
          ),
        ]);
      } catch (error) {
        console.error("Erro ao carregar templates:", error);
      }
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem("sistema-logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("sistema-backups", JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem("sistema-notificacoes", JSON.stringify(notificacoes));
  }, [notificacoes]);

  useEffect(() => {
    const customTemplates = templates.filter(
      (t) => !TEMPLATES_PADRAO.some((p) => p.id === t.id),
    );
    localStorage.setItem("sistema-templates", JSON.stringify(customTemplates));
  }, [templates]);

  const adicionarLog = (
    acao: string,
    detalhes: string,
    tipo: "info" | "success" | "warning" | "error",
  ) => {
    const novoLog: LogSistema = {
      id: Date.now().toString(),
      acao,
      detalhes,
      tipo,
      usuario: user?.nome || "Sistema",
      timestamp: new Date().toISOString(),
    };

    setLogs((prev) => {
      const novosLogs = [novoLog, ...prev];
      // Manter apenas os últimos 1000 logs
      return novosLogs.slice(0, 1000);
    });
  };

  const criarBackup = (
    nome: string,
    descricao: string,
    configuracao: Configuracao,
  ) => {
    const novoBackup: BackupSistema = {
      id: Date.now().toString(),
      nome,
      descricao,
      configuracao,
      criadoEm: new Date().toISOString(),
      criadoPor: user?.nome || "Sistema",
    };

    setBackups((prev) => [novoBackup, ...prev]);
    adicionarLog(
      "Backup Criado",
      `Backup "${nome}" foi criado com sucesso`,
      "success",
    );
  };

  const restaurarBackup = (backupId: string): Configuracao | null => {
    const backup = backups.find((b) => b.id === backupId);
    if (backup) {
      adicionarLog(
        "Backup Restaurado",
        `Backup "${backup.nome}" foi restaurado`,
        "warning",
      );
      return backup.configuracao;
    }
    return null;
  };

  const limparLogs = () => {
    setLogs([]);
    adicionarLog(
      "Logs Limpos",
      "Todos os logs foram removidos do sistema",
      "warning",
    );
  };

  const exportarLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-sistema-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    adicionarLog(
      "Logs Exportados",
      "Logs foram exportados com sucesso",
      "info",
    );
  };

  const criarTemplate = (
    template: Omit<TemplateSistema, "id" | "criadoEm" | "criadoPor">,
  ) => {
    const novoTemplate: TemplateSistema = {
      ...template,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      criadoPor: user?.nome || "Sistema",
    };

    setTemplates((prev) => [novoTemplate, ...prev]);
    adicionarLog(
      "Template Criado",
      `Template "${template.nome}" foi criado`,
      "success",
    );
  };

  const aplicarTemplate = (templateId: string): any[] => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      adicionarLog(
        "Template Aplicado",
        `Template "${template.nome}" foi aplicado`,
        "info",
      );
      return template.campos.map((campo: any) => ({
        ...campo,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ativo: true,
        ordem: 0,
      }));
    }
    return [];
  };

  const adicionarNotificacao = (
    titulo: string,
    mensagem: string,
    tipo: "info" | "success" | "warning" | "error",
  ) => {
    const novaNotificacao: NotificacaoSistema = {
      id: Date.now().toString(),
      titulo,
      mensagem,
      tipo,
      lida: false,
      criadaEm: new Date().toISOString(),
    };

    setNotificacoes((prev) => {
      const novasNotificacoes = [novaNotificacao, ...prev];
      // Manter apenas as últimas 50 notificações
      return novasNotificacoes.slice(0, 50);
    });
  };

  const marcarNotificacaoLida = (notificacaoId: string) => {
    setNotificacoes((prev) =>
      prev.map((notificacao) =>
        notificacao.id === notificacaoId
          ? { ...notificacao, lida: true }
          : notificacao,
      ),
    );
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  return (
    <SistemaContext.Provider
      value={{
        logs,
        backups,
        notificacoes,
        templates,
        adicionarLog,
        criarBackup,
        restaurarBackup,
        limparLogs,
        exportarLogs,
        criarTemplate,
        aplicarTemplate,
        adicionarNotificacao,
        marcarNotificacaoLida,
        limparNotificacoes,
      }}
    >
      {children}
    </SistemaContext.Provider>
  );
}

export function useSistema() {
  const context = useContext(SistemaContext);
  if (context === undefined) {
    throw new Error("useSistema deve ser usado dentro de um SistemaProvider");
  }
  return context;
}
