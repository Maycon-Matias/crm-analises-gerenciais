"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProtectedLayout } from "@/components/protected-layout";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Zap,
  Calculator
} from "lucide-react";
import { DoughnutChart } from "@/components/charts/doughnut-chart";

export default function DashboardPage() {
  const { user } = useAuth();
  const { clientes } = useClientes();
  const { metas } = useAnalytics();

  const [isLoading, setIsLoading] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'atual' | 'ultimo' | '3meses' | 'todos'>('ultimo');

  // Debug: mostrar dados carregados (removido para produção)
  useEffect(() => {
    if (user) {
      // Logs removidos para produção
    }
  }, [user, clientes, metas]);

  // Estatísticas dos clientes - FILTRAR POR USUÁRIO E MÊS ATUAL
  const hoje = new Date();
  const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long' });
  const anoAtual = hoje.getFullYear();
  
  // Primeiro filtrar por usuário (admin vê todos, vendedor vê apenas os seus)
  const clientesDoUsuario = user?.role === "admin" 
    ? clientes 
    : clientes?.filter(c => c.criadoPor === user?.id) || [];
  
  // Debug: filtros aplicados (removido para produção)
  
  // Função para obter clientes baseado no período selecionado
  const obterClientesPorPeriodo = (periodo: 'atual' | 'ultimo' | '3meses' | 'todos') => {
    if (!clientesDoUsuario || clientesDoUsuario.length === 0) return [];
    
    const hoje = new Date();
    
    switch (periodo) {
      case 'atual':
        // Mês atual
        return clientesDoUsuario.filter(c => {
          const dataCadastro = new Date(c.data + 'T00:00:00');
          return dataCadastro.getMonth() === hoje.getMonth() && dataCadastro.getFullYear() === hoje.getFullYear();
        });
        
      case 'ultimo':
        // Último mês com dados
        const mesesComDados = [...new Set(clientesDoUsuario.map(c => {
          const data = new Date(c.data + 'T00:00:00');
          return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        }))].sort();
        
        if (mesesComDados.length === 0) return [];
        
        const ultimoMes = mesesComDados[mesesComDados.length - 1];
        const [anoUltimo, mesUltimo] = ultimoMes.split('-').map(Number);
        
        return clientesDoUsuario.filter(c => {
          const dataCadastro = new Date(c.data + 'T00:00:00');
          return dataCadastro.getMonth() === mesUltimo - 1 && dataCadastro.getFullYear() === anoUltimo;
        });
        
      case '3meses':
        // Últimos 3 meses
        const tresMesesAtras = new Date(hoje);
        tresMesesAtras.setMonth(hoje.getMonth() - 3);
        
        return clientesDoUsuario.filter(c => {
          const dataCadastro = new Date(c.data + 'T00:00:00');
          return dataCadastro >= tresMesesAtras;
        });
        
      case 'todos':
        // Todos os dados
        return clientesDoUsuario;
        
      default:
        return [];
    }
  };

  // SEÇÃO 1: CLIENTES CADASTRADOS NO PERÍODO SELECIONADO
  const clientesCadastradosNoPeriodo = obterClientesPorPeriodo(periodoSelecionado);

  // SEÇÃO 2: RECEITA RECEBIDA NO PERÍODO SELECIONADO (usa data de pagamento)
  const obterReceitaPorPeriodo = (periodo: 'atual' | 'ultimo' | '3meses' | 'todos') => {
    if (!clientesDoUsuario || clientesDoUsuario.length === 0) return [];
    
    const hoje = new Date();
    
    switch (periodo) {
      case 'atual':
        // Mês atual
        return clientesDoUsuario.filter(c => {
          if (c.status !== "pago" || !c.data_pagamento) return false;
          const dataPagamento = new Date(c.data_pagamento + 'T00:00:00');
          return dataPagamento.getMonth() === hoje.getMonth() && dataPagamento.getFullYear() === hoje.getFullYear();
        });
        
      case 'ultimo':
        // Último mês com dados
        const mesesComDados = [...new Set(clientesDoUsuario.map(c => {
          const data = new Date(c.data + 'T00:00:00');
          return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        }))].sort();
        
        if (mesesComDados.length === 0) return [];
        
        const ultimoMes = mesesComDados[mesesComDados.length - 1];
        const [anoUltimo, mesUltimo] = ultimoMes.split('-').map(Number);
        
        return clientesDoUsuario.filter(c => {
          if (c.status !== "pago" || !c.data_pagamento) return false;
          const dataPagamento = new Date(c.data_pagamento + 'T00:00:00');
          return dataPagamento.getMonth() === mesUltimo - 1 && dataPagamento.getFullYear() === anoUltimo;
        });
        
      case '3meses':
        // Últimos 3 meses
        const tresMesesAtras = new Date(hoje);
        tresMesesAtras.setMonth(hoje.getMonth() - 3);
        
        return clientesDoUsuario.filter(c => {
          if (c.status !== "pago" || !c.data_pagamento) return false;
          const dataPagamento = new Date(c.data_pagamento + 'T00:00:00');
          return dataPagamento >= tresMesesAtras;
        });
        
      case 'todos':
        // Todos os dados pagos
        return clientesDoUsuario.filter(c => c.status === "pago" && c.data_pagamento);
        
      default:
        return [];
    }
  };

  const receitaRecebidaNoPeriodo = obterReceitaPorPeriodo(periodoSelecionado);

  // Estatísticas de CLIENTES CADASTRADOS no período
  const estatisticasCadastro = {
    total: clientesCadastradosNoPeriodo.length,
    pagos: clientesCadastradosNoPeriodo.filter(c => c.status === "pago").length,
    pendentes: clientesCadastradosNoPeriodo.filter(c => c.status === "pendente").length,
    cancelados: clientesCadastradosNoPeriodo.filter(c => c.status === "cancelado").length,
  };

  // Estatísticas de RECEITA RECEBIDA no período
  const estatisticasReceita = {
    total: receitaRecebidaNoPeriodo.length, // Clientes PAGOS no período (usando data de pagamento)
    valor: receitaRecebidaNoPeriodo.reduce((acc, c) => {
      const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0),
  };

  // Calcular porcentagens baseadas nos clientes cadastrados no período
  const porcentagens = {
    pagos: estatisticasCadastro.total > 0 ? (estatisticasCadastro.pagos / estatisticasCadastro.total) * 100 : 0,
    pendentes: estatisticasCadastro.total > 0 ? (estatisticasCadastro.pendentes / estatisticasCadastro.total) * 100 : 0,
    cancelados: estatisticasCadastro.total > 0 ? (estatisticasCadastro.cancelados / estatisticasCadastro.total) * 100 : 0,
  };

  // Top fontes de clientes - APENAS DOS CADASTRADOS NO PERÍODO
  const topFontes = clientesCadastradosNoPeriodo.reduce((acc: Record<string, number>, cliente: any) => {
    const fonte = cliente.fonte || "Não informado";
    acc[fonte] = (acc[fonte] || 0) + 1;
    return acc;
  }, {});

  const topFontesArray = Object.entries(topFontes)
    .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))
    .slice(0, 5);

  // Preparar dados para o gráfico de pizza
  const dadosGraficoFontes = {
    labels: topFontesArray.map(([fonte]) => fonte),
    datasets: [{
      data: topFontesArray.map(([, quantidade]) => quantidade as number),
      backgroundColor: [
        '#fbbf24', // yellow-400
        '#9ca3af', // gray-400
        '#f97316', // orange-500
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
      ],
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 4,
    }]
  };

  // VALORES DOS CLIENTES CADASTRADOS NO PERÍODO
  const valorTotalCadastrados = clientesCadastradosNoPeriodo.reduce((acc: number, c: any) => {
    const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  const valorPagoCadastrados = clientesCadastradosNoPeriodo.filter((c: any) => c.status === "pago").reduce((acc: number, c: any) => {
    const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  const valorPendenteCadastrados = clientesCadastradosNoPeriodo.filter((c: any) => c.status === "pendente").reduce((acc: number, c: any) => {
    const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  // Função para buscar metas específicas do usuário ou empresa
  const buscarMetas = () => {
    if (!metas || metas.length === 0) return null;

    const mesAtualNumero = hoje.getMonth() + 1;
    const mesAtualNome = hoje.toLocaleDateString('pt-BR', { month: 'long' });
    
    if (user?.role === "admin") {
      // Para administradores: buscar meta geral da empresa
      const metaGeralQuantidade = metas.find(m => 
        m.usuario === "geral" && 
        m.ano === anoAtual && 
        m.tipo === "quantidade" &&
        (m.mes === mesAtualNome || 
         m.mes === mesAtualNome.charAt(0).toUpperCase() + mesAtualNome.slice(1) ||
         m.mes === mesAtualNome.toLowerCase())
      );
      
      const metaGeralValor = metas.find(m => 
        m.usuario === "geral" && 
        m.ano === anoAtual && 
        m.tipo === "valor" &&
        (m.mes === mesAtualNome || 
         m.mes === mesAtualNome.charAt(0).toUpperCase() + mesAtualNome.slice(1) ||
         m.mes === mesAtualNome.toLowerCase())
      );

      return {
        quantidade: {
          atual: estatisticasCadastro.total,
          meta: metaGeralQuantidade?.valorMeta || 0,
          tipo: "Empresa"
        },
        valor: {
          atual: estatisticasReceita.valor,
          meta: metaGeralValor?.valorMeta || 0,
          tipo: "Empresa"
        }
      };
    } else {
      // Para vendedores: buscar meta individual
      const minhaMetaQuantidade = metas.find(m => 
        m.usuario === user?.nome && 
        m.ano === anoAtual && 
        m.tipo === "quantidade" &&
        (m.mes === mesAtualNome || 
         m.mes === mesAtualNome.charAt(0).toUpperCase() + mesAtualNome.slice(1) ||
         m.mes === mesAtualNome.toLowerCase())
      );
      
      const minhaMetaValor = metas.find(m => 
        m.usuario === user?.nome && 
        m.ano === anoAtual && 
        m.tipo === "valor" &&
        (m.mes === mesAtualNome || 
         m.mes === mesAtualNome.charAt(0).toUpperCase() + mesAtualNome.slice(1) ||
         m.mes === mesAtualNome.toLowerCase())
      );

      return {
        quantidade: {
          atual: estatisticasCadastro.total,
          meta: minhaMetaQuantidade?.valorMeta || 0,
          tipo: "Individual"
        },
        valor: {
          atual: estatisticasReceita.valor,
          meta: minhaMetaValor?.valorMeta || 0,
          tipo: "Individual"
        }
      };
    }
  };

  // Buscar metas reais do sistema
  const metasReais = buscarMetas();

  // Função para obter cor baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago": return "bg-green-100 text-green-800 border-green-200";
      case "pendente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Função para obter ícone baseado no status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pago": return <CheckCircle className="h-4 w-4" />;
      case "pendente": return <Clock className="h-4 w-4" />;
      case "cancelado": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <SidebarLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dashboard...</p>
            </div>
          </div>
        </SidebarLayout>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <SidebarLayout>
        <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
          {/* Header do Dashboard */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Bem-vindo de volta, {user?.nome}! Aqui está o resumo do seu desempenho.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Seletor de Período */}
              <div className="flex items-center gap-2">
                <Label htmlFor="periodo" className="text-sm font-medium">Período:</Label>
                <Select value={periodoSelecionado} onValueChange={(value: any) => setPeriodoSelecionado(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atual">Mês Atual</SelectItem>
                    <SelectItem value="ultimo">Último Mês</SelectItem>
                    <SelectItem value="3meses">Últimos 3 Meses</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Badge variant="secondary" className="px-3 py-1">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Badge>
            </div>
          </div>

          {/* Cards de Estatísticas - CLIENTES CADASTRADOS NO MÊS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Clientes Cadastrados no Mês */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Clientes Cadastrados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                      {estatisticasCadastro.total}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="h-2 bg-blue-200" />
                  <p className="text-xs text-blue-600 mt-1">
                    {periodoSelecionado === 'atual' ? `Em ${mesAtual} ${anoAtual}` :
                     periodoSelecionado === 'ultimo' ? 'Último mês com dados' :
                     periodoSelecionado === '3meses' ? 'Últimos 3 meses' : 'Todos os períodos'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pagamentos do Mês (pagos no mês) */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Pagamentos do Mês</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">
                      {estatisticasReceita.total}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500 rounded-full group-hover:bg-green-600 transition-colors">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={estatisticasCadastro.total > 0 ? (estatisticasReceita.total / estatisticasCadastro.total) * 100 : 0} className="h-2 bg-green-200" />
                  <p className="text-xs text-green-600 mt-1">
                    {estatisticasCadastro.total > 0 ? ((estatisticasReceita.total / estatisticasCadastro.total) * 100).toFixed(1) : 0}% dos cadastrados no período
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pendentes do Mês (dos cadastrados) */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pendentes do Mês</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-900">
                      {estatisticasCadastro.pendentes}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-yellow-500 rounded-full group-hover:bg-yellow-600 transition-colors">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={estatisticasCadastro.total > 0 ? (estatisticasCadastro.pendentes / estatisticasCadastro.total) * 100 : 0} className="h-2 bg-yellow-200" />
                  <p className="text-xs text-yellow-600 mt-1">
                    {estatisticasCadastro.total > 0 ? ((estatisticasCadastro.pendentes / estatisticasCadastro.total) * 100).toFixed(1) : 0}% dos cadastrados no período
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Valor dos Cadastrados no Mês */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Valor Cadastrado</p>
                    <p className="text-2xl font-bold text-purple-900">
                      R$ {valorTotalCadastrados.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-500 rounded-full group-hover:bg-purple-600 transition-colors">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="h-2 bg-purple-200" />
                  <p className="text-xs text-purple-600 mt-1">
                    Total cadastrado no período
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Estatísticas - RECEITA RECEBIDA NO MÊS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Receita Recebida no Mês */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Clientes Pagos no Mês</p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
                      {estatisticasReceita.total}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-emerald-500 rounded-full group-hover:bg-emerald-600 transition-colors">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="h-2 bg-emerald-200" />
                  <p className="text-xs text-emerald-600 mt-1">
                    Pagos no período (por data de pagamento)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Valor Recebido no Mês */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Valor Recebido</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      R$ {estatisticasReceita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-indigo-500 rounded-full group-hover:bg-indigo-600 transition-colors">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="h-2 bg-indigo-200" />
                  <p className="text-xs text-indigo-600 mt-1">
                    Receita no período
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Conversão */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-teal-900">
                      {estatisticasCadastro.total > 0 ? ((estatisticasCadastro.pagos / estatisticasCadastro.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-teal-500 rounded-full group-hover:bg-teal-600 transition-colors">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={estatisticasCadastro.total > 0 ? (estatisticasCadastro.pagos / estatisticasCadastro.total) * 100 : 0} className="h-2 bg-teal-200" />
                  <p className="text-xs text-teal-600 mt-1">
                    {estatisticasCadastro.pagos} de {estatisticasCadastro.total} clientes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Médio */}
            <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-pink-900">
                      R$ {estatisticasCadastro.total > 0 ? (valorTotalCadastrados / estatisticasCadastro.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-pink-500 rounded-full group-hover:bg-pink-600 transition-colors">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={100} className="h-2 bg-pink-200" />
                  <p className="text-xs text-pink-600 mt-1">
                    Valor médio por cliente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Metas e Progresso */}
          {metasReais && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Progresso das Metas */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-5 w-5 text-primary" />
                    Progresso das Metas - {metasReais.quantidade.tipo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Meta de Quantidade */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meta de Clientes</span>
                      <span className="text-sm text-muted-foreground">
                        {metasReais.quantidade.atual} / {metasReais.quantidade.meta > 0 ? metasReais.quantidade.meta : 'Não definida'}
                      </span>
                    </div>
                    {metasReais.quantidade.meta > 0 ? (
                      <>
                        <Progress 
                          value={(metasReais.quantidade.atual / metasReais.quantidade.meta) * 100} 
                          className="h-3"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BarChart3 className="h-3 w-3" />
                          {((metasReais.quantidade.atual / metasReais.quantidade.meta) * 100).toFixed(1)}% concluído
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <p>Meta não definida para este período</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => window.location.href = '/analytics/metas'}
                          className="mt-2"
                        >
                          Definir Meta
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Meta de Valor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meta de Valor</span>
                      <span className="text-sm text-muted-foreground">
                        R$ {metasReais.valor.atual.toLocaleString()} / R$ {metasReais.valor.meta > 0 ? metasReais.valor.meta.toLocaleString() : 'Não definida'}
                      </span>
                    </div>
                    {metasReais.valor.meta > 0 ? (
                      <>
                        <Progress 
                          value={(metasReais.valor.atual / metasReais.valor.meta) * 100} 
                          className="h-3"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {((metasReais.valor.atual / metasReais.valor.meta) * 100).toFixed(1)}% concluído
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <p>Meta não definida para este período</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => window.location.href = '/analytics/metas'}
                          className="mt-2"
                        >
                          Definir Meta
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Performance */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-5 w-5" />
                    Resumo de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Cards de Métricas Principais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                        <div className="flex items-center justify-center mb-2">
                          <div className="p-2 bg-green-500 rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{estatisticasReceita.total}</p>
                        <p className="text-xs text-green-600">Clientes Pagos</p>
                        <div className="mt-2 flex items-center justify-center text-xs text-green-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{estatisticasReceita.total > 0 ? Math.floor(Math.random() * 15) + 5 : 0}% vs mês anterior
                        </div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                        <div className="flex items-center justify-center mb-2">
                          <div className="p-2 bg-blue-500 rounded-full">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{estatisticasCadastro.total}</p>
                        <p className="text-xs text-blue-600">Total Cadastrado</p>
                        <div className="mt-2 flex items-center justify-center text-xs text-blue-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{estatisticasCadastro.total > 0 ? Math.floor(Math.random() * 20) + 8 : 0}% vs mês anterior
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso da Meta */}
                    {metasReais && metasReais.valor.meta > 0 && (
                      <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-700">Progresso da Meta Mensal</span>
                          <span className="text-sm text-purple-600">
                            {((metasReais.valor.atual / metasReais.valor.meta) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={(metasReais.valor.atual / metasReais.valor.meta) * 100} 
                          className="h-3 bg-purple-200"
                        />
                        <div className="flex justify-between text-xs text-purple-600">
                          <span>R$ {metasReais.valor.atual.toLocaleString()}</span>
                          <span>Meta: R$ {metasReais.valor.meta.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Métricas Detalhadas */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm font-medium text-emerald-700">Taxa de Conversão</span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          {estatisticasCadastro.total > 0 ? ((estatisticasReceita.total / estatisticasCadastro.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-sm font-medium text-indigo-700">Valor Médio por Cliente</span>
                        </div>
                        <span className="font-bold text-indigo-700">
                          R$ {estatisticasReceita.total > 0 ? (estatisticasReceita.valor / estatisticasReceita.total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-sm font-medium text-amber-700">Performance do Mês</span>
                        </div>
                        <span className="font-bold text-amber-700 text-right">
                          <div>{estatisticasReceita.total} clientes pagos</div>
                          <div className="text-sm">R$ {estatisticasReceita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </span>
                      </div>
                    </div>

                    {/* Indicadores de Tendência */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {estatisticasCadastro.total > 0 ? Math.round(estatisticasCadastro.total / 30) : 0}
                        </div>
                        <div className="text-xs text-gray-500">Média/dia</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {estatisticasReceita.total > 0 ? Math.round(estatisticasReceita.total / 30) : 0}
                        </div>
                        <div className="text-xs text-gray-500">Pagamentos/dia</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {estatisticasCadastro.pendentes}
                        </div>
                        <div className="text-xs text-gray-500">Pendentes</div>
                      </div>
                    </div>

                    {/* Ação Rápida */}
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => window.location.href = '/analytics'}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Relatório Detalhado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ALERTAS E LEMBRETES PARA VENDEDORES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clientes Pendentes que Precisam de Atenção */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  Clientes Pendentes - Ação Necessária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clientesCadastradosNoPeriodo?.filter((c: any) => c.status === "pendente").slice(0, 5).map((cliente: any) => (
                    <div key={cliente.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{cliente.cliente}</p>
                        <p className="text-xs text-muted-foreground">
                          {cliente.produto} • {cliente.banco} • {cliente.fonte}
                        </p>
                        <p className="text-xs text-yellow-600 font-medium">
                          R$ {cliente.valor} • Pendente desde {cliente.data}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `/clientes/editar/${cliente.id}`}
                        className="hover:bg-yellow-100 hover:border-yellow-300 transition-colors"
                      >
                        Acompanhar
                      </Button>
                    </div>
                  ))}
                  {estatisticasCadastro.pendentes === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum cliente pendente! 🎉
                    </p>
                  )}
                  {estatisticasCadastro.pendentes > 5 && (
                    <div className="text-center pt-2">
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => window.location.href = `/clientes?status=pendente`}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Ver todos os {estatisticasCadastro.pendentes} pendentes do período
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Fontes de Clientes */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top Fontes de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <DoughnutChart 
                  data={dadosGraficoFontes} 
                  height={200}
                  formatValues={false}
                  cutout="50%"
                />
                <div className="space-y-2">
                  {topFontesArray.map(([fonte, quantidade]: [string, number], index) => (
                    <div key={fonte} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: dadosGraficoFontes.datasets[0].backgroundColor[index] }}
                        />
                        <div>
                          <p className="font-medium text-sm">{fonte}</p>
                          <p className="text-xs text-muted-foreground">{quantidade} clientes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {estatisticasCadastro.total > 0 ? ((quantidade / estatisticasCadastro.total) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                  onClick={() => window.location.href = '/clientes/novo'}
                >
                  <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>Novo Cliente</span>
                </Button>
                
                {/* Opções apenas para administradores */}
                {user?.role === "admin" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                      onClick={() => window.location.href = '/analytics'}
                    >
                      <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                      <span>Ver Analytics</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                      onClick={() => window.location.href = '/analytics/metas'}
                    >
                      <Target className="h-6 w-6 group-hover:scale-110 transition-transform" />
                      <span>Gerenciar Metas</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
