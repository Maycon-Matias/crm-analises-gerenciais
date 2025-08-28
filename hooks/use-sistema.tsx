"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
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

  // CORREÇÃO: Carregar dados do localStorage apenas uma vez
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem("sistema-logs");
      const savedBackups = localStorage.getItem("sistema-backups");
      const savedNotificacoes = localStorage.getItem("sistema-notificacoes");
      const savedTemplates = localStorage.getItem("sistema-templates");

      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }

      if (savedBackups) {
        setBackups(JSON.parse(savedBackups));
      }

      if (savedNotificacoes) {
        setNotificacoes(JSON.parse(savedNotificacoes));
      }

      if (savedTemplates) {
        const loadedTemplates = JSON.parse(savedTemplates);
        setTemplates([
          ...TEMPLATES_PADRAO,
          ...loadedTemplates.filter(
            (t: TemplateSistema) =>
              !TEMPLATES_PADRAO.some((tp) => tp.id === t.id),
          ),
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
      // Em caso de erro, usar dados padrão
      setLogs([]);
      setBackups([]);
      setNotificacoes([]);
      setTemplates(TEMPLATES_PADRAO);
    }
  }, []); // Executar apenas uma vez

  // CORREÇÃO: Salvar no localStorage apenas quando necessário
  const saveToLocalStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }, []);

  const adicionarLog = useCallback((
    acao: string,
    detalhes: string,
    tipo: "info" | "success" | "warning" | "error",
  ) => {
    const novoLog: LogSistema = {
      id: Date.now().toString(),
      acao,
      detalhes,
      tipo,
      timestamp: new Date().toISOString(),
      usuario: user?.nome || "Sistema",
    };

    setLogs((prev) => {
      const novosLogs = [novoLog, ...prev].slice(0, 100); // Manter apenas os últimos 100
      saveToLocalStorage("sistema-logs", novosLogs);
      return novosLogs;
    });
  }, [user?.nome, saveToLocalStorage]);

  const criarBackup = useCallback((
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

    setBackups((prev) => {
      const novosBackups = [novoBackup, ...prev].slice(0, 50); // Manter apenas os últimos 50
      saveToLocalStorage("sistema-backups", novosBackups);
      return novosBackups;
    });

    adicionarLog("Backup Criado", `Backup "${nome}" foi criado`, "success");
  }, [user?.nome, adicionarLog, saveToLocalStorage]);

  const restaurarBackup = useCallback((backupId: string): Configuracao | null => {
    const backup = backups.find((b) => b.id === backupId);
    if (backup) {
      adicionarLog("Backup Restaurado", `Backup "${backup.nome}" foi restaurado`, "info");
      return backup.configuracao;
    }
    return null;
  }, [backups, adicionarLog]);

  const limparLogs = useCallback(() => {
    setLogs([]);
    saveToLocalStorage("sistema-logs", []);
    adicionarLog("Logs Limpos", "Todos os logs foram limpos", "info");
  }, [adicionarLog, saveToLocalStorage]);

  const exportarLogs = useCallback(() => {
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
  }, [logs, adicionarLog]);

  const criarTemplate = useCallback((
    template: Omit<TemplateSistema, "id" | "criadoEm" | "criadoPor">,
  ) => {
    const novoTemplate: TemplateSistema = {
      ...template,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      criadoPor: user?.nome || "Sistema",
    };

    setTemplates((prev) => {
      const novosTemplates = [novoTemplate, ...prev];
      saveToLocalStorage("sistema-templates", novosTemplates);
      return novosTemplates;
    });
    
    adicionarLog(
      "Template Criado",
      `Template "${template.nome}" foi criado`,
      "success",
    );
  }, [user?.nome, adicionarLog, saveToLocalStorage]);

  const aplicarTemplate = useCallback((templateId: string): any[] => {
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
  }, [templates, adicionarLog]);

  const adicionarNotificacao = useCallback((
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
      usuarioId: user?.id, // Adicionar ID do usuário que criou a notificação
    };

    setNotificacoes((prev) => {
      const novasNotificacoes = [novaNotificacao, ...prev];
      const notificacoesLimitadas = novasNotificacoes.slice(0, 50); // Manter apenas as últimas 50
      saveToLocalStorage("sistema-notificacoes", notificacoesLimitadas);
      return notificacoesLimitadas;
    });
  }, [user?.id, saveToLocalStorage]);

  const marcarNotificacaoLida = useCallback((notificacaoId: string) => {
    setNotificacoes((prev) => {
      const notificacoesAtualizadas = prev.map((notificacao) =>
        notificacao.id === notificacaoId
          ? { ...notificacao, lida: true }
          : notificacao,
      );
      saveToLocalStorage("sistema-notificacoes", notificacoesAtualizadas);
      return notificacoesAtualizadas;
    });
  }, [saveToLocalStorage]);

  const limparNotificacoes = useCallback(() => {
    setNotificacoes([]);
    saveToLocalStorage("sistema-notificacoes", []);
  }, [saveToLocalStorage]);

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
