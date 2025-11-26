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
  const { user, users } = useAuth();
  
  const [metaQuantidade, setMetaQuantidade] = useState(20);
  const [metaValor, setMetaValor] = useState(50); // Em milhares
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = user?.role === "admin";

  // Buscar metas existentes (considerando variações de capitalização)
  const metaQuantidadeGeral = metas.find(
    (m) => (m.usuario === undefined || m.usuario === "geral") && 
            (m.mes === mes || m.mes === mes.charAt(0).toUpperCase() + mes.slice(1) || m.mes === mes.toLowerCase()) && 
            m.ano === ano && m.tipo === "quantidade"
  );
  
  const metaValorGeral = metas.find(
    (m) => (m.usuario === undefined || m.usuario === "geral") && 
            (m.mes === mes || m.mes === mes.charAt(0).toUpperCase() + mes.slice(1) || m.mes === mes.toLowerCase()) && 
            m.ano === ano && m.tipo === "valor"
  );

  // Debug: mostrar informações sobre as metas
  console.log("GoalTracker Debug:", {
    mes,
    ano,
    isAdmin,
    totalMetas: metas.length,
    metas,
    metaQuantidadeGeral,
    metaValorGeral,
    metaQuantidade,
    metaValor
  });

  useEffect(() => {
    if (metaQuantidadeGeral) {
      setMetaQuantidade(metaQuantidadeGeral.valorMeta);
    }
    if (metaValorGeral) {
      setMetaValor(metaValorGeral.valorMeta);
    }
  }, [metaQuantidadeGeral, metaValorGeral]);

  // Criar metas padrão se não existirem (apenas para administradores)
  useEffect(() => {
    const criarMetasPadrao = async () => {
      if (!isAdmin) return;
      
      try {
        // Verificar se já existem metas para este mês/ano
        const metasExistentes = metas.filter(
          (m) => m.mes === mes && m.ano === ano && (m.usuario === "geral" || m.usuario === undefined)
        );

        console.log("Metas existentes para", mes, ano, ":", metasExistentes);

        // Se não existem metas, criar as padrão
        if (metasExistentes.length === 0) {
          console.log("Criando metas padrão para", mes, ano);
          
          // Criar meta de quantidade
          await adicionarMeta({
            usuario: "geral",
            mes: mes.charAt(0).toUpperCase() + mes.slice(1), // Garantir capitalização correta
            ano,
            valorMeta: 50, // Meta padrão: 50 clientes
            tipo: "quantidade",
          });

          // Criar meta de valor
          await adicionarMeta({
            usuario: "geral",
            mes: mes.charAt(0).toUpperCase() + mes.slice(1), // Garantir capitalização correta
            ano,
            valorMeta: 100, // Meta padrão: R$ 100k
            tipo: "valor",
          });

          console.log("Metas padrão criadas com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao criar metas padrão:", error);
      }
    };

    // Aguardar um pouco para as metas carregarem antes de tentar criar
    const timer = setTimeout(criarMetasPadrao, 1000);
    return () => clearTimeout(timer);
  }, [isAdmin, mes, ano, metas, adicionarMeta]);

  // Calcular progresso atual
  const calcularProgresso = () => {
    let clientesFiltrados;
    let metaQuantidadeAtual;
    let metaValorAtual;

    if (isAdmin) {
      // Para administradores: somar todos os vendedores e usar meta da empresa
      clientesFiltrados = clientes;
      metaQuantidadeAtual = metaQuantidade;
      metaValorAtual = metaValor * 1000; // Converter para milhares
    } else {
      // Para vendedores: apenas seus próprios clientes e suas metas individuais
      clientesFiltrados = clientes.filter(c => c.criadoPor === user?.id);
      
      // Buscar meta individual do vendedor
      const metaIndividual = metas.find(
        (m) => m.usuario === user?.nome && 
               m.mes === mes && 
               m.ano === ano
      );
      
      metaQuantidadeAtual = metaIndividual?.valorMeta || 0;
      metaValorAtual = metaIndividual?.valorMeta || 0;
    }

    // Filtrar clientes do período - CORREÇÃO: usar lógica mais robusta
    const clientesDoMes = clientesFiltrados.filter((cliente) => {
      try {
        // Para clientes PAGOS: usar data_pagamento para cálculo
        if (cliente.status === "pago" && cliente.data_pagamento) {
          const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
          const mesPagamento = dataPagamento.getMonth() + 1;
          const anoPagamento = dataPagamento.getFullYear();
          
          // Debug
          console.log(`Cliente ${cliente.cliente}: data_pagamento=${cliente.data_pagamento}, mes=${mesPagamento}, ano=${anoPagamento}, target=${getMesNumero(mes)}, ${ano}`);
          
          return mesPagamento === getMesNumero(mes) && anoPagamento === ano;
        }
        
        // Para clientes PENDENTES/CANCELADOS: usar data de cadastro apenas para contagem
        const dataCadastro = new Date(cliente.data + 'T00:00:00');
        const mesCadastro = dataCadastro.getMonth() + 1;
        const anoCadastro = dataCadastro.getFullYear();
        
        // Debug
        console.log(`Cliente ${cliente.cliente}: data=${cliente.data}, mes=${mesCadastro}, ano=${anoCadastro}, target=${getMesNumero(mes)}, ${ano}`);
        
        return mesCadastro === getMesNumero(mes) && anoCadastro === ano;
      } catch (error) {
        console.error(`Erro ao processar cliente ${cliente.cliente}:`, error);
        return false;
      }
    });

    // Somar apenas clientes PAGOS para o valor da meta
    const clientesPagosDoMes = clientesDoMes.filter(cliente => 
      cliente.status === "pago" && cliente.data_pagamento
    );

    const valorAtual = clientesPagosDoMes.reduce((acc, cliente) => {
      try {
        const valor = Number(cliente.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
        return acc + (isNaN(valor) ? 0 : valor);
      } catch (error) {
        console.error(`Erro ao processar valor do cliente ${cliente.cliente}:`, error);
        return acc;
      }
    }, 0);

    console.log("Progresso calculado:", {
      mes,
      ano,
      clientesFiltrados: clientesFiltrados.length,
      clientesDoMes: clientesDoMes.length,
      clientesPagosDoMes: clientesPagosDoMes.length,
      valorAtual,
      metaQuantidadeAtual,
      metaValorAtual,
      getMesNumero: getMesNumero(mes)
    });

    return {
      quantidade: {
        atual: clientesDoMes.length, // Total de clientes (pagos + pendentes)
        meta: metaQuantidadeAtual,
        percentual: metaQuantidadeAtual > 0 ? (clientesDoMes.length / metaQuantidadeAtual) * 100 : 0
      },
      valor: {
        atual: valorAtual, // Apenas valor dos pagos
        meta: metaValorAtual,
        percentual: metaValorAtual > 0 ? (valorAtual / metaValorAtual) * 100 : 0
      }
    };
  };

  const getMesNumero = (mes: string) => {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const mesIndex = meses.findIndex(m => 
      m.toLowerCase() === mes.toLowerCase() || 
      m === mes || 
      m.charAt(0).toUpperCase() + m.slice(1).toLowerCase() === mes.toLowerCase()
    );
    
    // Debug
    console.log(`getMesNumero: mes="${mes}", index=${mesIndex}, resultado=${mesIndex + 1}`);
    
    return mesIndex + 1;
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
          mes: mes.charAt(0).toUpperCase() + mes.slice(1), // Garantir capitalização correta
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
          mes: mes.charAt(0).toUpperCase() + mes.slice(1), // Garantir capitalização correta
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

  // Título dinâmico baseado no papel do usuário
  const getTitulo = () => {
    if (isAdmin) {
      return `Metas da Empresa (${mes}/${ano})`;
    }
    return `Minhas Metas (${mes}/${ano})`;
  };

  // Descrição dinâmica baseada no papel do usuário
  const getDescricao = () => {
    if (isAdmin) {
      return "Visão consolidada de todas as vendas da empresa";
    }
    return "Suas metas e progresso individual";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{getTitulo()}</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {mes}/{ano}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{getDescricao()}</p>
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

        {/* Controles de Edição - Apenas para administradores */}
        {isAdmin && (
          isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Meta de Quantidade da Empresa</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <Input
                      type="number"
                      value={metaQuantidade}
                      onChange={(e) => setMetaQuantidade(Number(e.target.value))}
                      min="1"
                      placeholder="Quantidade total de clientes"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Meta de Valor da Empresa (milhares)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <Input
                      type="number"
                      value={metaValor}
                      onChange={(e) => setMetaValor(Number(e.target.value))}
                      min="1"
                      placeholder="Valor total em milhares (R$)"
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 w-full">
                Salvar Metas da Empresa
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Metas da empresa configuradas</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
            </div>
          )
        )}

        {/* Tabs para mostrar progresso - Versão consolidada para admins */}
        {isAdmin ? (
          // Visualização consolidada para administradores
          <div className="space-y-6">
            {/* Resumo Geral das Metas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta de Quantidade */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-gray-800">Meta de Quantidade</h3>
                </div>
                
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
              </div>

              {/* Meta de Valor */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-gray-800">Meta de Valor</h3>
                </div>
                
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
              </div>
            </div>

            {/* Resumo Consolidado */}
            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-800 mb-3 text-center">Resumo Consolidado da Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {progresso.quantidade.atual}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Clientes</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Meta: {progresso.quantidade.meta}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {(progresso.valor.atual / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-muted-foreground">Valor Total Empresa</div>
                  <div className="text-xs text-green-600 mt-1">
                    Meta: R$ {(progresso.valor.meta / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Tabs originais para usuários comuns
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
        )}

        {/* Resumo Rápido - Apenas para usuários comuns */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progresso.quantidade.atual}
              </div>
              <div className="text-xs text-muted-foreground">
                Meus Clientes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {(progresso.valor.atual / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-muted-foreground">
                Meu Valor Total
              </div>
            </div>
          </div>
        )}

        {/* Informação adicional para administradores */}
        {isAdmin && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground text-center">
              <p>💡 Esta visão consolida as vendas de todos os vendedores da empresa</p>
              <p>As metas são configuradas para toda a empresa, não individualmente</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 