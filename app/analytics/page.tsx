"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { useClientes } from "@/hooks/use-clientes";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  BarChart3,
  Settings,
  Download,
  Filter,
  RefreshCw,
  TrendingDown,
  Activity,
  Calendar,
  UserCheck,
  Percent,
  Bug,
} from "lucide-react";
import Link from "next/link";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { SimpleStatus } from "@/components/analytics/simple-status";

export default function AnalyticsPage() {
  const {
    metas,
    regrasComissao,
    obterVendasPorPeriodo,
    obterVendasPorProduto,
    obterProgressoMetas,
    calcularComissoes,
    obterEstatisticasGerais,
    obterTendencias,
    exportarDados,
  } = useAnalytics();
  const { users } = useAuth();
  const { clientes } = useClientes();

  const [periodoSelecionado, setPeriodoSelecionado] = useState<
    "semanal" | "quinzenal" | "mensal"
  >("mensal");
  const [mesSelecionado, setMesSelecionado] = useState("Janeiro");
  const [anoSelecionado, setAnoSelecionado] = useState(2024);
  const [vendedorFiltro, setVendedorFiltro] = useState<string>("");
  const [produtoFiltro, setProdutoFiltro] = useState<string>("");
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Controla se mostra debug ou não

  // Memoizar dados para melhor performance
  const dadosAnalytics = useMemo(() => {
    try {
      const vendasPorPeriodo = obterVendasPorPeriodo(periodoSelecionado);
      const vendasPorProduto = obterVendasPorProduto(
        mesSelecionado,
        anoSelecionado,
      );
      const progressoMetas = obterProgressoMetas(mesSelecionado, anoSelecionado);
      const comissoes = calcularComissoes(mesSelecionado, anoSelecionado);
      const estatisticas = obterEstatisticasGerais();
      const tendencias = obterTendencias();

      return {
        vendasPorPeriodo,
        vendasPorProduto,
        progressoMetas,
        comissoes,
        estatisticas,
        tendencias,
      };
    } catch (error) {
      console.error("Erro ao carregar dados do analytics:", error);
      return {
        vendasPorPeriodo: [],
        vendasPorProduto: [],
        progressoMetas: [],
        comissoes: [],
        estatisticas: {
          totalVendas: 0,
          totalClientes: 0,
          ticketMedio: 0,
          taxaConversao: 0,
          vendasPorStatus: []
        },
        tendencias: {
          crescimentoMensal: 0,
          produtosMaisVendidos: [],
          vendedoresTop: []
        }
      };
    }
  }, [
    periodoSelecionado,
    mesSelecionado,
    anoSelecionado,
    vendedorFiltro,
    produtoFiltro,
    statusFiltro,
    obterVendasPorPeriodo,
    obterVendasPorProduto,
    obterProgressoMetas,
    calcularComissoes,
    obterEstatisticasGerais,
    obterTendencias,
  ]);

  // Dados para gráficos
  const dadosVendasPeriodo = {
    labels: dadosAnalytics.vendasPorPeriodo.length > 0 
      ? dadosAnalytics.vendasPorPeriodo.map((v) => v.periodo)
      : ["Sem dados"],
    datasets: [
      {
        label: "Vendas",
        data: dadosAnalytics.vendasPorPeriodo.length > 0
          ? dadosAnalytics.vendasPorPeriodo.map((v) => v.valor)
          : [0],
        backgroundColor: "rgba(74, 222, 128, 0.5)",
        borderColor: "rgba(74, 222, 128, 1)",
        borderWidth: 1,
      },
    ],
  };



  const dadosTicketMedio = {
    labels: dadosAnalytics.vendasPorPeriodo.length > 0
      ? dadosAnalytics.vendasPorPeriodo.map((v) => v.periodo)
      : ["Sem dados"],
    datasets: [
      {
        label: "Ticket Médio",
        data: dadosAnalytics.vendasPorPeriodo.length > 0
          ? dadosAnalytics.vendasPorPeriodo.map((v) => v.ticketMedio)
          : [0],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dadosVendasProduto = {
    labels: dadosAnalytics.vendasPorProduto.length > 0
      ? dadosAnalytics.vendasPorProduto.map((v) => v.produto)
      : ["Sem dados"],
    datasets: [
      {
        data: dadosAnalytics.vendasPorProduto.length > 0
          ? dadosAnalytics.vendasPorProduto.map((v) => v.valor)
          : [0],
        backgroundColor: [
          "#4ade80",
          "#60a5fa",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4",
          "#84cc16",
          "#f97316",
          "#ec4899",
          "#6366f1",
        ],
      },
    ],
  };

  const dadosMetasVsVendas = {
    labels: dadosAnalytics.progressoMetas.length > 0
      ? dadosAnalytics.progressoMetas.map((p) => p.usuario)
      : ["Sem dados"],
    datasets: [
      {
        label: "Meta",
        data: dadosAnalytics.progressoMetas.length > 0
          ? dadosAnalytics.progressoMetas.map((p) => p.meta)
          : [0],
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
      {
        label: "Vendido",
        data: dadosAnalytics.progressoMetas.length > 0
          ? dadosAnalytics.progressoMetas.map((p) => p.vendido)
          : [0],
        backgroundColor: "rgba(74, 222, 128, 0.5)",
        borderColor: "rgba(74, 222, 128, 1)",
        borderWidth: 1,
      },
      {
        label: "Projeção",
        data: dadosAnalytics.progressoMetas.length > 0
          ? dadosAnalytics.progressoMetas.map((p) => p.projecao)
          : [0],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Calcular totais
  const totalVendas = dadosAnalytics.vendasPorPeriodo.reduce((acc, v) => acc + v.valor, 0);
  const totalQuantidade = dadosAnalytics.vendasPorPeriodo.reduce(
    (acc, v) => acc + v.quantidade,
    0,
  );
  const ticketMedioGeral =
    totalQuantidade > 0 ? totalVendas / totalQuantidade : 0;
  const totalComissoes = dadosAnalytics.comissoes.reduce((acc, c) => acc + c.totalComissao, 0);

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const vendedores = users.filter(u => u.role === "user").map(u => u.nome);
  const produtos = [...new Set(dadosAnalytics.vendasPorProduto.map(v => v.produto))];
  const statusOptions = ["pago", "pendente", "cancelado"];

  const handleExportar = (tipo: 'vendas' | 'metas' | 'comissoes') => {
    exportarDados(tipo);
  };

  const limparFiltros = () => {
    setVendedorFiltro("");
    setProdutoFiltro("");
    setStatusFiltro("");
  };

  return (
    <ProtectedLayout adminOnly>
      <div className="min-h-screen bg-gray-50">
        <SidebarLayout>
          <main className="container py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Dashboard Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Análise completa de vendas, metas e comissões
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportar('vendas')}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Vendas
                </Button>
                <Link href="/analytics/metas">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Gerenciar Metas
                  </Button>
                </Link>
                <Link href="/analytics/comissoes">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar Comissões
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Toggle Debug"
                >
                  <Bug className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Simples - Apenas em desenvolvimento */}
            {showDebug && (
              <SimpleStatus 
                clientes={clientes}
                users={users}
                isLoading={isLoading}
              />
            )}

            {/* Cards de Resumo Melhorados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalVendas.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Ticket Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ticketMedioGeral.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Comissões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalComissoes.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Quantidade de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalQuantidade}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs com Gráficos */}
            <Tabs defaultValue="vendas" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vendas">Vendas</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="metas">Metas</TabsTrigger>
                <TabsTrigger value="comissoes">Comissões</TabsTrigger>
              </TabsList>

              <TabsContent value="vendas" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vendas por Período</CardTitle>
                      <CardDescription>
                        Evolução das vendas ao longo do tempo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dadosAnalytics.vendasPorPeriodo.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                          <div className="text-center">
                            <div className="text-lg font-medium mb-2">Nenhum dado encontrado</div>
                            <div className="text-sm">Não há vendas registradas para o período selecionado</div>
                          </div>
                        </div>
                      ) : (
                        <BarChart data={dadosVendasPeriodo} height={300} />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ticket Médio</CardTitle>
                      <CardDescription>
                        Evolução do ticket médio por período
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dadosAnalytics.vendasPorPeriodo.length === 0 ? (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                          <div className="text-center">
                            <div className="text-lg font-medium mb-2">Nenhum dado encontrado</div>
                            <div className="text-sm">Não há vendas registradas para o período selecionado</div>
                          </div>
                        </div>
                      ) : (
                        <LineChart data={dadosTicketMedio} height={300} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="produtos" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vendas por Produto</CardTitle>
                      <CardDescription>
                        Distribuição de vendas por tipo de produto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DoughnutChart data={dadosVendasProduto} height={400} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ranking de Produtos</CardTitle>
                      <CardDescription>
                        Produtos mais vendidos no período
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dadosAnalytics.vendasPorProduto.slice(0, 5).map((produto, index) => (
                          <div
                            key={produto.produto}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {produto.produto}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {produto.quantidade} vendas
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {produto.valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {produto.percentual.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="metas" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Metas vs Vendas Realizadas</CardTitle>
                      <CardDescription>
                        Comparativo entre metas e vendas por vendedor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart data={dadosMetasVsVendas} height={300} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Progresso das Metas</CardTitle>
                      <CardDescription>
                        Acompanhamento detalhado do progresso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dadosAnalytics.progressoMetas.map((progresso) => (
                          <div
                            key={progresso.usuario}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">
                                {progresso.usuario}
                              </h4>
                              <Badge
                                variant={
                                  progresso.percentualAlcancado >= 100
                                    ? "default"
                                    : progresso.percentualAlcancado >= 80
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {progresso.percentualAlcancado.toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, progresso.percentualAlcancado)}%`,
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Meta:</span>{" "}
                                {progresso.meta.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                              <div>
                                <span className="text-gray-500">Vendido:</span>{" "}
                                {progresso.vendido.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                              <div>
                                <span className="text-gray-500">Faltante:</span>{" "}
                                {progresso.faltante.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                              <div>
                                <span className="text-gray-500">Projeção:</span>{" "}
                                {progresso.projecao.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comissoes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Comissões por Vendedor</CardTitle>
                        <CardDescription>
                          Detalhamento das comissões calculadas
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportar('comissoes')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dadosAnalytics.comissoes.map((comissao) => (
                        <div
                          key={comissao.usuarioId}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-lg">
                              {comissao.usuario}
                            </h4>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {comissao.totalComissao.toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  },
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Total vendas:{" "}
                                {comissao.totalVendas.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {comissao.vendas.map((venda) => (
                              <div
                                key={venda.produto}
                                className="bg-gray-50 rounded p-3"
                              >
                                <div className="font-medium">
                                  {venda.produto}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {venda.quantidade} vendas
                                </div>
                                <div className="text-sm">
                                  Valor:{" "}
                                  {venda.valorTotal.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </div>
                                <div className="text-sm font-medium text-primary">
                                  Comissão:{" "}
                                  {venda.comissao.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarLayout>
      </div>
    </ProtectedLayout>
  );
}
