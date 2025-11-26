"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: React.ReactNode;
  color: "green" | "blue" | "orange" | "red" | "purple";
  onClick?: () => void;
  subtitle?: string;
  progress?: number;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  onClick,
  subtitle,
  progress
}: MetricCardProps) {
  const colorClasses = {
    green: "text-green-600 bg-green-100 dark:bg-green-900/20",
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
    red: "text-red-600 bg-red-100 dark:bg-red-900/20",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/20"
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        onClick ? "hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        
        {(change !== undefined || progress !== undefined) && (
          <div className="flex items-center gap-2 mt-2">
            {change !== undefined && (
              <>
                {changeType === "increase" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-xs font-medium ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}>
                  {change > 0 ? "+" : ""}{change}%
                </span>
              </>
            )}
            
            {progress !== undefined && (
              <div className="flex-1">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardCards() {
  const { user } = useAuth();
  const { clientes } = useClientes();

  // Filtrar clientes por usuário
  const clientesFiltrados = user?.role === "admin" 
    ? clientes 
    : clientes.filter(c => c.criadoPor === user?.id);

  // Calcular métricas
  const totalClientes = clientesFiltrados.length;
  const clientesPagos = clientesFiltrados.filter(c => c.status === "pago").length;
  const clientesPendentes = clientesFiltrados.filter(c => c.status === "pendente").length;
  const clientesCancelados = clientesFiltrados.filter(c => c.status === "cancelado").length;

  // Calcular valores
  const valorTotal = clientesFiltrados.reduce((acc, c) => {
    const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
    return acc + (isNaN(valor) ? 0 : valor);
  }, 0);

  const valorPago = clientesFiltrados
    .filter(c => c.status === "pago")
    .reduce((acc, c) => {
      const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

  const valorPendente = clientesFiltrados
    .filter(c => c.status === "pendente")
    .reduce((acc, c) => {
      const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

  // Calcular mudanças (simulado - em produção viria de dados históricos)
  const mudancaClientes = 12; // +12% vs mês anterior
  const mudancaValor = 8; // +8% vs mês anterior
  const mudancaPagamentos = -3; // -3% vs mês anterior

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total de Clientes"
        value={totalClientes}
        change={mudancaClientes}
        changeType="increase"
        icon={<Users className="h-4 w-4" />}
        color="blue"
        subtitle="Clientes cadastrados"
        onClick={() => window.location.href = "/clientes"}
      />

      <MetricCard
        title="Valor Total"
        value={`R$ ${valorTotal.toLocaleString("pt-BR")}`}
        change={mudancaValor}
        changeType="increase"
        icon={<DollarSign className="h-4 w-4" />}
        color="green"
        subtitle="Valor total dos clientes"
        progress={totalClientes > 0 ? (clientesPagos / totalClientes) * 100 : 0}
      />

      <MetricCard
        title="Clientes Pagos"
        value={clientesPagos}
        change={mudancaPagamentos}
        changeType="decrease"
        icon={<CheckCircle className="h-4 w-4" />}
        color="green"
        subtitle="Clientes com pagamento confirmado"
        progress={totalClientes > 0 ? (clientesPagos / totalClientes) * 100 : 0}
      />

      <MetricCard
        title="Clientes Pendentes"
        value={clientesPendentes}
        icon={<Clock className="h-4 w-4" />}
        color="orange"
        subtitle="Aguardando pagamento"
        progress={totalClientes > 0 ? (clientesPendentes / totalClientes) * 100 : 0}
      />
    </div>
  );
}

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Novo Cliente</h3>
              <p className="text-sm text-muted-foreground">Cadastrar novo cliente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Marcar como Pago</h3>
              <p className="text-sm text-muted-foreground">Atualizar status de pagamento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Relatórios</h3>
              <p className="text-sm text-muted-foreground">Gerar relatórios de vendas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 