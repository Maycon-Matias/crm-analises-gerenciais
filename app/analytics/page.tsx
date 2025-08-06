"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { SidebarLayout } from "@/components/sidebar-layout";

export default function AnalyticsPage() {
  const {
    obterVendasPorPeriodo,
    obterVendasPorProduto,
    obterProgressoMetas,
    calcularComissoes,
  } = useAnalytics();

  const [periodoSelecionado, setPeriodoSelecionado] = useState<
    "semanal" | "quinzenal" | "mensal"
  >("mensal");
  const [mesSelecionado, setMesSelecionado] = useState("Janeiro");
  const [anoSelecionado, setAnoSelecionado] = useState(2024);

  const vendasPorPeriodo = obterVendasPorPeriodo(periodoSelecionado);
  const vendasPorProduto = obterVendasPorProduto(
    mesSelecionado,
    anoSelecionado,
  );
  const progressoMetas = obterProgressoMetas(mesSelecionado, anoSelecionado);
  const comissoes = calcularComissoes(mesSelecionado, anoSelecionado);

  // Dados para gráficos
  const dadosVendasPeriodo = {
    labels: vendasPorPeriodo.map((v) => v.periodo),
    datasets: [
      {
        label: "Vendas",
        data: vendasPorPeriodo.map((v) => v.valor),
        backgroundColor: "rgba(74, 222, 128, 0.5)",
        borderColor: "rgba(74, 222, 128, 1)",
        borderWidth: 1,
      },
    ],
  };

  const dadosTicketMedio = {
    labels: vendasPorPeriodo.map((v) => v.periodo),
    datasets: [
      {
        label: "Ticket Médio",
        data: vendasPorPeriodo.map((v) => v.ticketMedio),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const dadosVendasProduto = {
    labels: vendasPorProduto.map((v) => v.produto),
    datasets: [
      {
        data: vendasPorProduto.map((v) => v.valor),
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
    labels: progressoMetas.map((p) => p.usuario),
    datasets: [
      {
        label: "Meta",
        data: progressoMetas.map((p) => p.meta),
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
      {
        label: "Vendido",
        data: progressoMetas.map((p) => p.vendido),
        backgroundColor: "rgba(74, 222, 128, 0.5)",
        borderColor: "rgba(74, 222, 128, 1)",
        borderWidth: 1,
      },
      {
        label: "Projeção",
        data: progressoMetas.map((p) => p.projecao),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Calcular totais
  const totalVendas = vendasPorPeriodo.reduce((acc, v) => acc + v.valor, 0);
  const totalQuantidade = vendasPorPeriodo.reduce(
    (acc, v) => acc + v.quantidade,
    0,
  );
  const ticketMedioGeral =
    totalQuantidade > 0 ? totalVendas / totalQuantidade : 0;
  const totalComissoes = comissoes.reduce((acc, c) => acc + c.totalComissao, 0);

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
              <div className="mt-4 md:mt-0 flex gap-4">
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
              </div>
            </div>

            {/* Filtros */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Período
                    </label>
                    <Select
                      value={periodoSelecionado}
                      onValueChange={(value: any) =>
                        setPeriodoSelecionado(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Mês
                    </label>
                    <Select
                      value={mesSelecionado}
                      onValueChange={setMesSelecionado}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meses.map((mes) => (
                          <SelectItem key={mes} value={mes}>
                            {mes}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Ano
                    </label>
                    <Select
                      value={anoSelecionado.toString()}
                      onValueChange={(value) =>
                        setAnoSelecionado(Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">
                      {totalVendas.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Ticket Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="text-2xl font-bold">
                      {ticketMedioGeral.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Comissões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    <div className="text-2xl font-bold">
                      {totalComissoes.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Quantidade de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
                    <div className="text-2xl font-bold">{totalQuantidade}</div>
                  </div>
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
                      <BarChart data={dadosVendasPeriodo} height={300} />
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
                      <LineChart data={dadosTicketMedio} height={300} />
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
                        {vendasPorProduto.slice(0, 5).map((produto, index) => (
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
                        {progressoMetas.map((progresso) => (
                          <div
                            key={progresso.usuario}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">
                                {progresso.usuario}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  progresso.percentualAlcancado >= 100
                                    ? "bg-green-100 text-green-800"
                                    : progresso.percentualAlcancado >= 80
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {progresso.percentualAlcancado.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-primary h-2 rounded-full"
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
                    <CardTitle>Comissões por Vendedor</CardTitle>
                    <CardDescription>
                      Detalhamento das comissões calculadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {comissoes.map((comissao) => (
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
