"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedLayout } from "@/components/protected-layout";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useClientes } from "@/hooks/use-clientes";
import { isFontePrincipal } from "@/lib/fontes-config";
import { Target, TrendingUp, Calendar, DollarSign, Users } from "lucide-react";

export default function MinhasMetasPage() {
  const { user } = useAuth();
  const { metas } = useAnalytics();
  const { clientes } = useClientes();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const mesAtual = meses[selectedMonth - 1];

  // Buscar meta do vendedor para o período selecionado
  const minhaMeta = metas.find(
    (meta) => meta.usuario === user?.nome && 
              (meta.mes === mesAtual || 
               meta.mes === mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1) || 
               meta.mes === mesAtual.toLowerCase()) && 
              meta.ano === selectedYear
  );

  // Filtrar clientes do vendedor para o período selecionado
  const meusClientes = clientes.filter((cliente) => {
    // Filtrar apenas clientes de fontes principais (não corretores)
    if (!isFontePrincipal(cliente.fonte)) {
      return false;
    }
    
    if (cliente.criadoPor !== user?.id) return false;
    
    // Para clientes PAGOS: usar data_pagamento para cálculo de receita
    if (cliente.status === "pago" && cliente.data_pagamento) {
      const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
      return dataPagamento.getMonth() + 1 === selectedMonth && 
             dataPagamento.getFullYear() === selectedYear;
    }
    
    // Para clientes PENDENTES/CANCELADOS: usar data de cadastro para contagem
    const dataCadastro = new Date(cliente.data + 'T00:00:00');
    return dataCadastro.getMonth() + 1 === selectedMonth && 
           dataCadastro.getFullYear() === selectedYear;
  });

  // Calcular progresso
  const calcularProgresso = () => {
    if (!minhaMeta) return null;

    // Somar apenas clientes PAGOS para o valor da meta (usando data de pagamento)
    const clientesPagosDoMes = meusClientes.filter(cliente => 
      cliente.status === "pago" && cliente.data_pagamento
    );

    const valorAtual = clientesPagosDoMes.reduce((acc, cliente) => {
      const valor = Number(cliente.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    const percentual = (valorAtual / minhaMeta.valorMeta) * 100;
    const clientesPagos = clientesPagosDoMes.length;
    const clientesPendentes = meusClientes.filter(c => c.status === "pendente").length;

    return {
      valorAtual,
      valorMeta: minhaMeta.valorMeta,
      percentual: Math.min(percentual, 100),
      clientesPagos,
      clientesPendentes
    };
  };

  const progresso = calcularProgresso();

  // Determinar status da meta
  const getStatusMeta = () => {
    if (!progresso) return { status: "sem-meta", label: "Sem meta definida", color: "bg-gray-100 text-gray-600" };
    
    if (progresso.percentual >= 100) {
      return { status: "concluida", label: "Meta atingida!", color: "bg-green-100 text-green-800" };
    } else if (progresso.percentual >= 75) {
      return { status: "proximo", label: "Próximo da meta", color: "bg-blue-100 text-blue-800" };
    } else if (progresso.percentual >= 50) {
      return { status: "andamento", label: "Em andamento", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "atrasado", label: "Precisa acelerar", color: "bg-red-100 text-red-800" };
    }
  };

  const statusMeta = getStatusMeta();

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50">
        <SidebarLayout>
          <main className="container py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="h-8 w-8 text-primary" />
                  Minhas Metas
                </h1>
                <p className="text-gray-600 mt-1">
                  Acompanhe seu progresso em relação às metas definidas
                </p>
              </div>
              
              <div className="flex gap-4 mt-4 md:mt-0">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {minhaMeta ? (
              <div className="space-y-6">
                {/* Status da Meta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Status da Meta - {mesAtual}/{selectedYear}</span>
                      <Badge className={statusMeta.color}>
                        {statusMeta.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Meta definida: {minhaMeta.valorMeta.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progresso */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progresso</span>
                          <span className="text-sm text-gray-600">
                            {progresso?.percentual.toFixed(1)}% concluído
                          </span>
                        </div>
                        <Progress value={progresso?.percentual} className="h-3" />
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Valor Atual</p>
                            <p className="text-lg font-bold text-blue-600">
                              {progresso?.valorAtual.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL"
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Clientes Pagos</p>
                            <p className="text-lg font-bold text-green-600">
                              {progresso?.clientesPagos} / {progresso?.totalClientes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Faltam</p>
                            <p className="text-lg font-bold text-purple-600">
                              {((minhaMeta.valorMeta - (progresso?.valorAtual || 0)) / 1000).toFixed(1)}k
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Clientes do Período */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Clientes - {mesAtual}/{selectedYear}</CardTitle>
                    <CardDescription>
                      Clientes cadastrados no período selecionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meusClientes.length > 0 ? (
                      <div className="space-y-3">
                        {meusClientes.map((cliente, index) => (
                          <div key={cliente.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{cliente.cliente}</p>
                              <p className="text-sm text-gray-600">
                                {cliente.produto} • {cliente.banco} • {cliente.valor}
                              </p>
                            </div>
                            <Badge variant={cliente.status === "pago" ? "default" : "secondary"}>
                              {cliente.status === "pago" ? "Pago" : "Pendente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Nenhum cliente cadastrado neste período</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Nenhuma meta definida
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Não há metas configuradas para {mesAtual}/{selectedYear}
                  </p>
                  <p className="text-sm text-gray-400">
                    Entre em contato com o administrador para definir suas metas
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarLayout>
      </div>
    </ProtectedLayout>
  );
} 