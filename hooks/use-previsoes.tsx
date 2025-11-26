import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";

interface ClientePrevisao {
  id: string;
  cliente: string;
  produto: string;
  valor: string;
  usuarios: string;
  status: string;
  data_previsao_pagamento: string;
  observacoes: string;
}

interface NotificacaoPrevisao {
  data: string;
  usuario: string;
  totalClientes: number;
  totalPrevisto: string;
  clientes: ClientePrevisao[];
}

export function usePrevisoes() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<NotificacaoPrevisao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar notificações para uma data específica
  const buscarNotificacoes = useCallback(async (data: string, usuario?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (usuario) params.append("usuario", usuario);
      params.append("data", data);

      const response = await fetch(`/api/notificacoes/previsoes?${params}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar notificações");
      }

      const responseData = await response.json();
      setNotificacoes([responseData]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar previsões por período
  const buscarPrevisoesPorPeriodo = useCallback(async (periodo: string, usuario?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const hoje = new Date();
      let dataInicio = new Date();
      let dataFim = new Date();

      switch (periodo) {
        case "hoje":
          // Já está configurado
          break;
        case "semana":
          dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "mes":
          dataInicio.setMonth(hoje.getMonth() - 1);
          break;
        case "proximos7dias":
          dataFim = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
      }

      // Buscar previsões para cada dia do período
      const notificacoesPeriodo: NotificacaoPrevisao[] = [];
      const dataAtual = new Date(dataInicio);
      
      while (dataAtual <= dataFim) {
        const dataStr = dataAtual.toISOString().split('T')[0];
        const params = new URLSearchParams();
        if (usuario) params.append("usuario", usuario);
        params.append("data", dataStr);

        const response = await fetch(`/api/notificacoes/previsoes?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.totalClientes > 0) {
            notificacoesPeriodo.push(data);
          }
        }

        dataAtual.setDate(dataAtual.getDate() + 1);
      }

      setNotificacoes(notificacoesPeriodo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar previsões por período:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar notificações para hoje automaticamente
  useEffect(() => {
    if (user) {
      const hoje = new Date().toISOString().split('T')[0];
      const usuarioFiltro = user.role === "admin" ? undefined : user.nome;
      buscarNotificacoes(hoje, usuarioFiltro);
    }
  }, [user, buscarNotificacoes]);

  // Calcular estatísticas gerais
  const estatisticasGerais = {
    totalClientes: notificacoes.reduce((acc, n) => acc + n.totalClientes, 0),
    totalPrevisto: notificacoes.reduce((acc, n) => {
      const valor = Number(n.totalPrevisto.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0),
    diasComPrevisao: notificacoes.length
  };

  // Verificar se há notificações para hoje
  const temNotificacoesHoje = notificacoes.some(n => {
    const hoje = new Date().toISOString().split('T')[0];
    return n.data === hoje && n.totalClientes > 0;
  });

  // Verificar se há notificações para amanhã
  const temNotificacoesAmanha = notificacoes.some(n => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return n.data === amanha && n.totalClientes > 0;
  });

  // Verificar se há notificações para os próximos 3 dias
  const temNotificacoesProximos3Dias = notificacoes.some(n => {
    const hoje = new Date();
    const dataNotificacao = new Date(n.data);
    const diffTime = dataNotificacao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && n.totalClientes > 0;
  });

  return {
    notificacoes,
    loading,
    error,
    estatisticasGerais,
    temNotificacoesHoje,
    temNotificacoesAmanha,
    temNotificacoesProximos3Dias,
    buscarNotificacoes,
    buscarPrevisoesPorPeriodo,
    clearError: () => setError(null)
  };
}
