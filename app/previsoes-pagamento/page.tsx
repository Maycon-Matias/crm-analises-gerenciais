"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import { Calendar, DollarSign, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Download } from "lucide-react";

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

export default function PrevisoesPagamentoPage() {
  const { user } = useAuth();
  const { exportarClientesComPrevisao } = useClientes();
  const [notificacoes, setNotificacoes] = useState<NotificacaoPrevisao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [usuarioFiltro, setUsuarioFiltro] = useState<string>("todos");
  const [periodo, setPeriodo] = useState<string>("hoje");

  // Função para formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  // Função para formatar valor
  const formatarValor = (valor: string) => {
    if (!valor) return "R$ 0,00";
    return valor;
  };

  // Função para obter status do cliente
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return <Badge variant="default" className="bg-green-500">Pago</Badge>;
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Função para buscar notificações
  const buscarNotificacoes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (usuarioFiltro && usuarioFiltro !== "todos") params.append("usuario", usuarioFiltro);
      if (dataSelecionada) params.append("data", dataSelecionada);

      const response = await fetch(`/api/notificacoes/previsoes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotificacoes([data]);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar previsões por período
  const buscarPrevisoesPorPeriodo = async () => {
    setLoading(true);
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
        case "3meses":
          dataInicio.setMonth(hoje.getMonth() - 3);
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
        if (usuarioFiltro && usuarioFiltro !== "todos") params.append("usuario", usuarioFiltro);
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
    } catch (error) {
      console.error("Erro ao buscar previsões por período:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar notificações ao montar componente
  useEffect(() => {
    if (periodo === "hoje") {
      buscarNotificacoes();
    } else {
      buscarPrevisoesPorPeriodo();
    }
  }, [periodo, dataSelecionada, usuarioFiltro]);

  // Calcular estatísticas gerais
  const estatisticasGerais = {
    totalClientes: notificacoes.reduce((acc, n) => acc + n.totalClientes, 0),
    totalPrevisto: notificacoes.reduce((acc, n) => {
      const valor = Number(n.totalPrevisto.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0),
    diasComPrevisao: notificacoes.length
  };

  return (
    <ProtectedLayout adminOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <SidebarLayout>
          <div className="container mx-auto py-10 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Previsões de Pagamento
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Acompanhe e gerencie as previsões de pagamento dos clientes
                    </p>
                  </div>
                </div>
                <Button
                  onClick={exportarClientesComPrevisao}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="periodo">Período</Label>
                    <Select value={periodo} onValueChange={setPeriodo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Última Semana</SelectItem>
                        <SelectItem value="mes">Último Mês</SelectItem>
                        <SelectItem value="3meses">Últimos 3 Meses</SelectItem>
                        <SelectItem value="proximos7dias">Próximos 7 Dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {periodo === "hoje" && (
                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input
                        type="date"
                        value={dataSelecionada}
                        onChange={(e) => setDataSelecionada(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="usuario">Usuário</Label>
                    <Select value={usuarioFiltro} onValueChange={setUsuarioFiltro}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os usuários" />
                      </SelectTrigger>
                                             <SelectContent>
                         <SelectItem value="todos">Todos os usuários</SelectItem>
                         <SelectItem value="Beatriz">Beatriz</SelectItem>
                         <SelectItem value="Fernanda">Fernanda</SelectItem>
                         <SelectItem value="Diego">Diego</SelectItem>
                         <SelectItem value="Ana">Ana</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={periodo === "hoje" ? buscarNotificacoes : buscarPrevisoesPorPeriodo}>
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasGerais.totalClientes}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes com previsão no período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Previsto</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {estatisticasGerais.totalPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor total das previsões
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dias com Previsão</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticasGerais.diasComPrevisao}</div>
                  <p className="text-xs text-muted-foreground">
                    Dias que têm previsões
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Previsões */}
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando previsões...</p>
                  </div>
                </CardContent>
              </Card>
            ) : notificacoes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Nenhuma previsão encontrada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Não há clientes com previsão de pagamento para o período selecionado.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {notificacoes.map((notificacao, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Previsões para {formatarData(notificacao.data)}
                          </CardTitle>
                          <CardDescription>
                            {notificacao.totalClientes} cliente(s) • {notificacao.totalPrevisto} previstos
                          </CardDescription>
                        </div>
                                                 <Badge variant="outline" className="text-sm">
                           {usuarioFiltro === "todos" ? "Todos os usuários" : usuarioFiltro}
                         </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {notificacao.clientes.map((cliente) => (
                          <div
                            key={cliente.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {cliente.cliente}
                                </h4>
                                {getStatusBadge(cliente.status)}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div>
                                  <span className="font-medium">Produto:</span> {cliente.produto}
                                </div>
                                <div>
                                  <span className="font-medium">Valor:</span> {formatarValor(cliente.valor)}
                                </div>
                                <div>
                                  <span className="font-medium">Vendedor:</span> {cliente.usuarios}
                                </div>
                                <div>
                                  <span className="font-medium">Previsão:</span> {formatarData(cliente.data_previsao_pagamento)}
                                </div>
                              </div>
                              {cliente.observacoes && (
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">Obs:</span> {cliente.observacoes}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar Pago
                              </Button>
                              <Button variant="outline" size="sm">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Atrasado
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SidebarLayout>
      </div>
    </ProtectedLayout>
  );
}
