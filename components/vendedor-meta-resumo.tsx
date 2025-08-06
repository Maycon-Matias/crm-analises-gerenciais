"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useClientes } from "@/hooks/use-clientes";
import { Target, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";

interface VendedorMetaResumoProps {
  mes: string;
  ano: number;
}

export function VendedorMetaResumo({ mes, ano }: VendedorMetaResumoProps) {
  const { user } = useAuth();
  const { metas } = useAnalytics();
  const { clientes } = useClientes();

  // Buscar meta do vendedor
  const minhaMeta = metas.find(
    (meta) => meta.usuario === user?.nome && 
              meta.mes === mes && 
              meta.ano === ano
  );

  // Filtrar clientes do vendedor para o período
  const meusClientes = clientes.filter((cliente) => {
    if (cliente.criadoPor !== user?.id) return false;
    
    // Para clientes PAGOS: usar data_pagamento para cálculo
    if (cliente.status === "pago" && cliente.data_pagamento) {
      const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
      const mesPagamento = dataPagamento.toLocaleDateString("pt-BR", { month: "long" });
      const anoPagamento = dataPagamento.getFullYear();
      return mesPagamento === mes && anoPagamento === ano;
    }
    
    // Para clientes PENDENTES/CANCELADOS: usar data de cadastro apenas para contagem
    const dataCadastro = new Date(cliente.data + 'T00:00:00');
    const mesCadastro = dataCadastro.toLocaleDateString("pt-BR", { month: "long" });
    const anoCadastro = dataCadastro.getFullYear();
    return mesCadastro === mes && anoCadastro === ano;
  });

  // Calcular progresso
  const calcularProgresso = () => {
    if (!minhaMeta) return null;

    // Somar apenas clientes PAGOS para o valor da meta
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
      clientesPendentes,
      totalClientes: meusClientes.length
    };
  };

  const progresso = calcularProgresso();

  // Determinar status da meta
  const getStatusMeta = () => {
    if (!progresso) return { status: "sem-meta", label: "Sem meta", color: "bg-gray-100 text-gray-600" };
    
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

  if (!minhaMeta) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Minhas Metas</h3>
                <p className="text-sm text-gray-600">Nenhuma meta definida para {mes}/{ano}</p>
              </div>
            </div>
            <Link href="/minhas-metas">
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Minhas Metas - {mes}/{ano}</h3>
              <p className="text-sm text-gray-600">
                Meta: {minhaMeta.valorMeta.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusMeta.color}>
              {statusMeta.label}
            </Badge>
            <Link href="/minhas-metas">
              <Button variant="outline" size="sm">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {/* Progresso */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm text-gray-600">
                {progresso?.percentual.toFixed(1)}% concluído
              </span>
            </div>
            <Progress value={progresso?.percentual} className="h-2" />
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">Atual</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {progresso?.valorAtual.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">Pagos</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {progresso?.clientesPagos}/{progresso?.totalClientes}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-gray-600">Faltam</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {((minhaMeta.valorMeta - (progresso?.valorAtual || 0)) / 1000).toFixed(1)}k
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 