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
import { isFontePrincipal, getPercentualMeta, isFonteCorretor } from "@/lib/fontes-config";

interface GoalTrackerProps {
  mes: string;
  ano: number;
}

export function GoalTracker({ mes, ano }: GoalTrackerProps) {
  const { metas, adicionarMeta, atualizarMeta } = useAnalytics();
  const { clientes } = useClientes();
  const { user, users } = useAuth();
  
  const [metaQuantidade, setMetaQuantidade] = useState(50);
  const [metaValor, setMetaValor] = useState(100000); // Em reais
  const [isEditing, setIsEditing] = useState(false);
  const [metasInicializadas, setMetasInicializadas] = useState(false);

  const isAdmin = user?.role === "admin";

  // Buscar metas existentes (considerando variações de capitalização)
  const metaQuantidadeGeral = metas.find(
    (m) => (m.usuario === "geral" || m.usuario === undefined) && 
            (m.mes === mes || m.mes === mes.charAt(0).toUpperCase() + mes.slice(1) || m.mes === mes.toLowerCase()) && 
            m.ano === ano && m.tipo === "quantidade"
  );
  
  const metaValorGeral = metas.find(
    (m) => (m.usuario === "geral" || m.usuario === undefined) && 
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
    metaValor,
    metasInicializadas
  });

  // Inicializar valores das metas apenas uma vez quando as metas são carregadas
  useEffect(() => {
    if (metas.length > 0 && !metasInicializadas) {
      if (metaQuantidadeGeral) {
        setMetaQuantidade(metaQuantidadeGeral.valorMeta);
      }
      if (metaValorGeral) {
        setMetaValor(metaValorGeral.valorMeta);
      }
      setMetasInicializadas(true);
    }
  }, [metas, metaQuantidadeGeral, metaValorGeral, metasInicializadas]);

  // Calcular progresso atual
  const calcularProgresso = () => {
    let clientesFiltrados;
    let metaQuantidadeAtual;
    let metaValorAtual;

    if (isAdmin) {
      // Para administradores: somar todos os vendedores e usar meta da empresa
      // Para quantidade: considerar apenas fontes principais
      clientesFiltrados = clientes.filter(c => isFontePrincipal(c.fonte));
      metaQuantidadeAtual = metaQuantidade;
      metaValorAtual = metaValor; // Usar valor direto da meta (já está em reais)
    } else {
      // Para vendedores: apenas seus próprios clientes e suas metas individuais
      // Para quantidade: considerar apenas fontes principais
      clientesFiltrados = clientes.filter(c => 
        c.criadoPor === user?.id && isFontePrincipal(c.fonte)
      );
      
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
    // Para cálculo de VALOR, considerar também clientes de corretores com peso (percentualMeta)
    // Montar lista de clientes pagos do mês sem restringir por fonte
    const clientesPagosDoMes = (isAdmin
      ? clientes
      : clientes.filter(c => c.criadoPor === user?.id)
    ).filter(cliente => {
      try {
        if (cliente.status !== "pago" || !cliente.data_pagamento) return false;
        const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
        const mesPagamento = dataPagamento.getMonth() + 1;
        const anoPagamento = dataPagamento.getFullYear();
        return mesPagamento === getMesNumero(mes) && anoPagamento === ano;
      } catch {
        return false;
      }
    });

    let valorCorretoresBruto = 0;
    let valorCorretoresContado = 0;
    const valorAtual = clientesPagosDoMes.reduce((acc, cliente) => {
      try {
        const valor = Number(cliente.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
        const peso = getPercentualMeta(cliente.fonte);
        if (isFonteCorretor(cliente.fonte)) {
          valorCorretoresBruto += isNaN(valor) ? 0 : valor;
          valorCorretoresContado += isNaN(valor) ? 0 : valor * (isNaN(peso) ? 0 : peso);
        }
        return acc + (isNaN(valor) ? 0 : valor * (isNaN(peso) ? 0 : peso));
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
      },
      detalhamento: {
        corretores: {
          bruto: valorCorretoresBruto,
          contado: valorCorretoresContado
        }
      }
    };
  };

  const getMesNumero = (mes: string) => {
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const mesIndex = meses.findIndex(m => 
      m.toLowerCase() === mes.toLowerCase() || 
      m === mes || 
      m.charAt(0).toUpperCase() + mes.slice(1).toLowerCase() === mes.toLowerCase()
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

  // Verificar se existem metas configuradas para este período
  const temMetasConfiguradas = metaQuantidadeGeral || metaValorGeral;

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
                  <Label className="text-sm font-medium">Meta de Valor da Empresa (reais)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <Input
                      type="number"
                      value={metaValor}
                      onChange={(e) => setMetaValor(Number(e.target.value))}
                      min="1"
                      placeholder="Valor total em reais (R$)"
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

        {/* Verificar se existem metas configuradas */}
        {!temMetasConfiguradas ? (
          <div className="text-center py-6 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">
              Nenhuma meta definida para {mes} {ano}.
            </p>
            {isAdmin && (
              <p className="text-xs text-gray-400 mt-2">
                Clique em "Editar" para configurar as metas da empresa
              </p>
            )}
          </div>
        ) : (
          <>
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
                        R$ {progresso.valor.atual.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Valor Total Empresa</div>
                      <div className="text-xs text-green-600 mt-1">
                        Meta: R$ {(progresso.valor.meta).toLocaleString()}
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

                  {/* Indicador visual Corretores (50%) */}
                  <div className="mt-3 space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Corretores (50%) — contou</span>
                      <span className="font-medium">
                        R$ {(progresso.detalhamento?.corretores?.contado || 0).toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={
                        progresso.valor.meta > 0
                          ? Math.min(((progresso.detalhamento?.corretores?.contado || 0) / progresso.valor.meta) * 100, 100)
                          : 0
                      }
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Bruto corretores</span>
                      <span>R$ {(progresso.detalhamento?.corretores?.bruto || 0).toLocaleString()}</span>
                    </div>
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
          </>
        )}
      </CardContent>
    </Card>
  );
} 