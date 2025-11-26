"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
} from "lucide-react";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import { useSistema } from "@/hooks/use-sistema";
import { isFontePrincipal } from "@/lib/fontes-config";
import { useEffect, useState } from "react";

export function AdvancedStats() {
  const { clientes } = useClientes();
  const { users } = useAuth();
  const { logs } = useSistema();

  // Corrigir hydration mismatch: datas dinâmicas só no client
  const [hoje, setHoje] = useState<Date | null>(null);
  const [ontem, setOntem] = useState<Date | null>(null);
  useEffect(() => {
    const now = new Date();
    setHoje(now);
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    setOntem(yest);
  }, []);

  const clientesHoje = hoje
    ? clientes.filter(
        (c) => isFontePrincipal(c.fonte) && 
               new Date(c.data + 'T00:00:00').toDateString() === hoje.toDateString(),
      ).length
    : 0;

  const clientesOntem = ontem
    ? clientes.filter(
        (c) => isFontePrincipal(c.fonte) && 
               new Date(c.data + 'T00:00:00').toDateString() === ontem.toDateString(),
      ).length
    : 0;

  const crescimentoDiario =
    clientesOntem > 0
      ? ((clientesHoje - clientesOntem) / clientesOntem) * 100
      : clientesHoje > 0
        ? 100
        : 0;

  // Filtrar apenas clientes de fontes principais (não corretores)
  const clientesPrincipais = clientes.filter(c => isFontePrincipal(c.fonte));

  const valorTotal = clientesPrincipais.reduce((acc, cliente) => {
    const valor = Number.parseFloat(
      cliente.valor.replace("R$", "").replace(".", "").replace(",", ".").trim(),
    );
    return isNaN(valor) ? acc : acc + valor;
  }, 0);

  const ticketMedio = clientesPrincipais.length > 0 ? valorTotal / clientesPrincipais.length : 0;

  const taxaConversao =
    clientesPrincipais.length > 0
      ? (clientesPrincipais.filter((c) => c.status === "pago").length / clientesPrincipais.length) *
        100
      : 0;

  const usuariosAtivos = users.filter((u) => u.role === "user").length;
  const logsHoje = hoje
    ? logs.filter((l) => new Date(l.timestamp).toDateString() === hoje.toDateString()).length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Crescimento Diário
          </CardTitle>
          {crescimentoDiario >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {crescimentoDiario >= 0 ? "+" : ""}
            {crescimentoDiario.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {clientesHoje} clientes hoje vs {clientesOntem} ontem
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ticketMedio.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor médio por cliente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Conversão
          </CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taxaConversao.toFixed(1)}%</div>
          <Progress value={taxaConversao} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Clientes pagos vs total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Atividade do Sistema
          </CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{logsHoje}</div>
          <p className="text-xs text-muted-foreground">Ações realizadas hoje</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {usuariosAtivos} usuários ativos
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
