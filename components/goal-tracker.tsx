"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  BarChart3
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";

interface GoalTrackerProps {
  mes: string;
  ano: number;
}

export function GoalTracker({ mes, ano }: GoalTrackerProps) {
  const { metas, adicionarMeta, atualizarMeta } = useAnalytics();
  const { clientes } = useClientes();
  const { user } = useAuth();
  
  const [metaQuantidade, setMetaQuantidade] = useState(20);
  const [metaValor, setMetaValor] = useState(50); // Em milhares
  const [isEditing, setIsEditing] = useState(false);

  // Buscar metas existentes
  const metaQuantidadeGeral = metas.find(
    (m) => (m.usuario === undefined || m.usuario === "geral") && 
            m.mes === mes && m.ano === ano && m.tipo === "quantidade"
  );
  
  const metaValorGeral = metas.find(
    (m) => (m.usuario === undefined || m.usuario === "geral") && 
            m.mes === mes && m.ano === ano && m.tipo === "valor"
  );

  useEffect(() => {
    if (metaQuantidadeGeral) {
      setMetaQuantidade(metaQuantidadeGeral.valorMeta);
    }
    if (metaValorGeral) {
      setMetaValor(metaValorGeral.valorMeta);
    }
  }, [metaQuantidadeGeral, metaValorGeral]);

  // Calcular progresso atual
  const calcularProgresso = () => {
    const clientesFiltrados = user?.role === "admin" 
      ? clientes 
      : clientes.filter(c => c.criadoPor === user?.id);

    // Filtrar clientes do período
    const clientesDoMes = clientesFiltrados.filter((cliente) => {
      // Para clientes PAGOS: usar data_pagamento para cálculo
      if (cliente.status === "pago" && cliente.data_pagamento) {
        const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
        return dataPagamento.getMonth() + 1 === new Date(ano, getMesNumero(mes) - 1).getMonth() + 1 &&
               dataPagamento.getFullYear() === ano;
      }
      
      // Para clientes PENDENTES/CANCELADOS: usar data de cadastro apenas para contagem
      const dataCadastro = new Date(cliente.data + 'T00:00:00');
      return dataCadastro.getMonth() + 1 === new Date(ano, getMesNumero(mes) - 1).getMonth() + 1 &&
             dataCadastro.getFullYear() === ano;
    });

    // Somar apenas clientes PAGOS para o valor da meta
    const clientesPagosDoMes = clientesDoMes.filter(cliente => 
      cliente.status === "pago" && cliente.data_pagamento
    );

    const valorAtual = clientesPagosDoMes.reduce((acc, cliente) => {
      const valor = Number(cliente.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    return {
      quantidade: {
        atual: clientesDoMes.length, // Total de clientes (pagos + pendentes)
        meta: metaQuantidade,
        percentual: metaQuantidade > 0 ? (clientesDoMes.length / metaQuantidade) * 100 : 0
      },
      valor: {
        atual: valorAtual, // Apenas valor dos pagos
        meta: metaValor * 1000, // Converter para milhares
        percentual: metaValor > 0 ? (valorAtual / (metaValor * 1000)) * 100 : 0
      }
    };
  };

  const getMesNumero = (mes: string) => {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return meses.indexOf(mes) + 1;
  };

  const progresso = calcularProgresso();

  const handleSave = async () => {
    try {
      // Salvar meta de quantidade
      if (metaQuantidadeGeral) {
        await atualizarMeta({ ...metaQuantidadeGeral, valorMeta: metaQuantidade });
      } else {
        await adicionarMeta({
          usuario: "geral",
          mes,
          ano,
          valorMeta: metaQuantidade,
          tipo: "quantidade",
        });
      }

      // Salvar meta de valor
      if (metaValorGeral) {
        await atualizarMeta({ ...metaValorGeral, valorMeta: metaValor });
      } else {
        await adicionarMeta({
          usuario: "geral",
          mes,
          ano,
          valorMeta: metaValor,
          tipo: "valor",
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar metas:", error);
    }
  };

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return "text-green-600 bg-green-100 dark:bg-green-900/20";
    if (percentual >= 80) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    if (percentual >= 50) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    return "text-red-600 bg-red-100 dark:bg-red-900/20";
  };

  const getStatusIcon = (percentual: number) => {
    if (percentual >= 100) return <CheckCircle className="h-4 w-4" />;
    if (percentual >= 80) return <TrendingUp className="h-4 w-4" />;
    if (percentual >= 50) return <AlertTriangle className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getStatusMessage = (percentual: number) => {
    if (percentual >= 100) return "Meta atingida! Parabéns!";
    if (percentual >= 80) return "Quase lá! Continue assim!";
    if (percentual >= 50) return "Metade do caminho percorrido!";
    return "Ainda há muito trabalho pela frente!";
  };

  const getOverallStatus = () => {
    const mediaPercentual = (progresso.quantidade.percentual + progresso.valor.percentual) / 2;
    return {
      percentual: mediaPercentual,
      color: getStatusColor(mediaPercentual),
      icon: getStatusIcon(mediaPercentual),
      message: getStatusMessage(mediaPercentual)
    };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Metas Gerais ({mes}/{ano})</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {mes}/{ano}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className={`p-3 rounded-lg border ${overallStatus.color}`}>
          <div className="flex items-center gap-2">
            {overallStatus.icon}
            <span className="text-sm font-medium">
              {overallStatus.message}
            </span>
          </div>
        </div>

        {/* Controles de Edição */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Meta de Quantidade</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <Input
                    type="number"
                    value={metaQuantidade}
                    onChange={(e) => setMetaQuantidade(Number(e.target.value))}
                    min="1"
                    placeholder="Quantidade de clientes"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Meta de Valor (milhares)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <Input
                    type="number"
                    value={metaValor}
                    onChange={(e) => setMetaValor(Number(e.target.value))}
                    min="1"
                    placeholder="Valor em milhares (R$)"
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 w-full">
              Salvar Metas
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Metas configuradas</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
          </div>
        )}

        {/* Tabs para mostrar progresso */}
        <Tabs defaultValue="quantidade" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quantidade" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quantidade
            </TabsTrigger>
            <TabsTrigger value="valor" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quantidade" className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {progresso.quantidade.atual} / {progresso.quantidade.meta} clientes
              </span>
            </div>
            
            <Progress 
              value={Math.min(progresso.quantidade.percentual, 100)} 
              className="h-3"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {progresso.quantidade.percentual.toFixed(1)}% concluído
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(progresso.quantidade.percentual)}`}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(progresso.quantidade.percentual)}
                  {progresso.quantidade.percentual >= 100 ? "Concluído" : "Em andamento"}
                </div>
              </Badge>
            </div>
          </TabsContent>
          
          <TabsContent value="valor" className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                R$ {progresso.valor.atual.toLocaleString()} / R$ {progresso.valor.meta.toLocaleString()}
              </span>
            </div>
            
            <Progress 
              value={Math.min(progresso.valor.percentual, 100)} 
              className="h-3"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {progresso.valor.percentual.toFixed(1)}% concluído
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(progresso.valor.percentual)}`}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(progresso.valor.percentual)}
                  {progresso.valor.percentual >= 100 ? "Concluído" : "Em andamento"}
                </div>
              </Badge>
            </div>
          </TabsContent>
        </Tabs>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progresso.quantidade.atual}
            </div>
            <div className="text-xs text-muted-foreground">Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {(progresso.valor.atual / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-muted-foreground">Valor Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 