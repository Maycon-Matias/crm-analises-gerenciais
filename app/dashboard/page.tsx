"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  PlusCircle,
  FileSpreadsheet,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Select } from "@/components/ui/select";
import { getDashboardMessage } from "@/lib/utils";
import { DashboardMessage } from "@/components/dashboard-message";
import { GoalTracker } from "@/components/goal-tracker";
import { VendedorMetaResumo } from "@/components/vendedor-meta-resumo";
import React from "react";

// Função utilitária para parsear datas em 'YYYY-MM-DD' ou 'DD/MM/YYYY'
function parseDataCliente(data: string): Date | null {
  if (!data) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    // Formato ISO
    return new Date(data);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    // Formato brasileiro DD/MM/YYYY
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { clientes, exportarParaCSV } = useClientes();
  const { metas } = useAnalytics();
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    pagos: 0,
    valorTotal: 0,
    meusClientes: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [valoresMes, setValoresMes] = useState({ pagos: 0, pendentes: 0 });
  const [now, setNow] = useState<Date | null>(null);

  const isAdmin = user?.role === "admin";

  // Filtro de clientes por usuário - simplificado para evitar crashes
  const clientesFiltrados = React.useMemo(() => {
    if (!user) return [];
    if (isAdmin) return clientes;
    return clientes.filter((c) => c.criadoPor === user.id);
  }, [clientes, user, isAdmin]);

  const mesAtual = new Date(selectedYear, selectedMonth - 1).toLocaleString("pt-BR", { month: "long" });

  useEffect(() => {
    try {
      // Sempre use todos os clientesFiltrados para os cards de resumo
      const total = clientesFiltrados.length;
      const pendentes = clientesFiltrados.filter((c) => c.status === "pendente").length;
      const pagos = clientesFiltrados.filter((c) => c.status === "pago").length;
      const valorTotal = clientesFiltrados.reduce((acc, cliente) => {
        try {
          const valor = Number.parseFloat(
            cliente.valor
              .replace("R$", "")
              .replace(".", "")
              .replace(",", ".")
              .trim(),
          );
          return isNaN(valor) ? acc : acc + valor;
        } catch {
          return acc;
        }
      }, 0);
      setStats({
        total,
        pendentes,
        pagos,
        valorTotal,
        meusClientes: total,
      });
    } catch (error) {
      console.error("Erro ao calcular stats:", error);
      setStats({
        total: 0,
        pendentes: 0,
        pagos: 0,
        valorTotal: 0,
        meusClientes: 0,
      });
    }
  }, [clientesFiltrados]);

  useEffect(() => {
    if (clientesFiltrados.length > 0) {
      const pagos = clientesFiltrados.filter((c) => {
        // Para pagos, usar data_pagamento se disponível, senão usar data de cadastro
        const dataParaFiltro = c.status === "pago" && c.data_pagamento 
          ? new Date(c.data_pagamento + 'T00:00:00') 
          : new Date(c.data + 'T00:00:00');
        return (
          c.status === "pago" &&
          dataParaFiltro.getMonth() + 1 === selectedMonth &&
          dataParaFiltro.getFullYear() === selectedYear
        );
      });
      const pendentes = clientesFiltrados.filter((c) => {
        const data = new Date(c.data + 'T00:00:00');
        return (
          c.status === "pendente" &&
          data.getMonth() + 1 === selectedMonth &&
          data.getFullYear() === selectedYear
        );
      });
      const soma = (arr: any[]): number =>
        arr.reduce((acc: number, cliente: any) => {
          const valor = Number.parseFloat(
            cliente.valor
              .replace("R$", "")
              .replace(".", "")
              .replace(",", ".")
              .trim(),
          );
          return isNaN(valor) ? acc : acc + valor;
        }, 0);
      setValoresMes({ pagos: soma(pagos), pendentes: soma(pendentes) });
    } else {
      setValoresMes({ pagos: 0, pendentes: 0 });
    }
  }, [clientesFiltrados, selectedMonth, selectedYear]);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Cálculo de clientes do mês e do dia
  const clientesDoMes = clientesFiltrados.filter((c) => {
    // Para pagos, usar data_pagamento se disponível, senão usar data de cadastro
    const dataParaFiltro = c.status === "pago" && c.data_pagamento 
      ? parseDataCliente(c.data_pagamento)
      : parseDataCliente(c.data);
    return (
      dataParaFiltro &&
      dataParaFiltro.getMonth() + 1 === selectedMonth &&
      dataParaFiltro.getFullYear() === selectedYear
    );
  });
  const clientesHoje = now
    ? clientesDoMes.filter((c) => {
        const data = new Date(c.data + 'T00:00:00');
        return (
          data.getDate() === now.getDate() &&
          data.getMonth() === now.getMonth() &&
          data.getFullYear() === now.getFullYear()
        );
      }).length
    : 0;
  // Exemplo de meta mensal (pode ser dinâmico futuramente)
  const metaMensal = 20; // Valor fixo para exemplo

  // Cálculo do progresso conforme tipo de meta
  const progressoMeta = metaMensal > 0 ? (clientesDoMes.length / metaMensal) * 100 : 0;
  let mensagem = "";
  if (progressoMeta < 100) {
    mensagem = `Você está ${100 - progressoMeta}% abaixo da meta de ${metaMensal} clientes em ${mesAtual}.`;
  } else {
    mensagem = `Parabéns! Meta de ${metaMensal} clientes em ${mesAtual} atingida!`;
  }

  return (
    <ProtectedLayout>
      <SidebarLayout>
        <main className="container py-10 px-4">
          {isAdmin && (
            <div className="mb-6">
              <GoalTracker mes={mesAtual} ano={selectedYear} />
            </div>
          )}
          
          {!isAdmin && (
            <div className="mb-6">
              <VendedorMetaResumo mes={mesAtual} ano={selectedYear} />
            </div>
          )}
          <DashboardMessage message={mensagem} />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo, {user?.nome}.{" "}
                {isAdmin
                  ? "Visualize e gerencie todos os clientes."
                  : "Cadastre novos clientes."}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
              <Link href="/clientes/novo">
                <Button className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin/clientes">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Ver Todos
                  </Button>
                </Link>
              )}
            </div>
          </div>

            <div className="mb-8">
              <Card className="bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md">
                <CardContent className="flex flex-col md:flex-row md:items-center justify-between py-6">
                  <div>
                    <div className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Resumo do Mês</div>
                    <div className="flex gap-8 items-center">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Pago</div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-200">
                          {valoresMes.pagos.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                      </div>
                      <div className="border-l border-gray-200 dark:border-gray-700 h-10 mx-4" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total Pendente</div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-200">
                          {valoresMes.pendentes.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <select
                      className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Total de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold dark:text-gray-100">
                      {isAdmin ? stats.total : stats.meusClientes}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    <div className="text-2xl font-bold dark:text-gray-100">{stats.pendentes}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Pagos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div className="text-2xl font-bold dark:text-gray-100">{stats.pagos}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300">
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="text-2xl font-bold dark:text-gray-100">
                      {stats.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Clientes Recentes</CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? "Clientes cadastrados recentemente por todos os usuários"
                      : "Seus clientes cadastrados recentemente"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientesFiltrados
                      .sort(
                        (a, b) =>
                          new Date(b.data + 'T00:00:00').getTime() -
                          new Date(a.data + 'T00:00:00').getTime(),
                      )
                      .slice(0, 5)
                      .map((cliente, idx) => (
                        <div
                          key={cliente.id || idx}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <div className="font-medium">{cliente.cliente}</div>
                            <div className="text-sm text-gray-500">
                              {cliente.produto} • {cliente.banco} •{" "}
                              {new Date(cliente.data + 'T00:00:00').toLocaleDateString(
                                "pt-BR",
                              )}
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              cliente.status === "pago"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {cliente.status === "pago" ? "Pago" : "Pendente"}
                          </div>
                        </div>
                      ))}

                    {clientesFiltrados.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Nenhum cliente cadastrado ainda.{" "}
                        <Link
                          href="/clientes/novo"
                          className="text-primary hover:underline"
                        >
                          Cadastrar cliente
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Acesse rapidamente as principais funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/clientes/novo" className="w-full">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Cadastrar Novo Cliente
                      </Button>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link href="/admin/clientes" className="w-full">
                          <Button className="w-full" variant="outline">
                            <Users className="mr-2 h-4 w-4" />
                            Gerenciar Todos os Clientes
                          </Button>
                        </Link>

                        <Link href="/analytics" className="w-full">
                          <Button className="w-full" variant="outline">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Dashboard Analytics
                          </Button>
                        </Link>

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={exportarParaCSV}
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          Exportar para Planilha
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarLayout>
      </ProtectedLayout>
    );
}
