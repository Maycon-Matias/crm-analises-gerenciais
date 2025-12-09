"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProtectedLayout } from "@/components/protected-layout";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { getPercentualMeta, isFontePrincipal } from "@/lib/fontes-config";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import { PlusCircle, Edit, Trash2, Target, Users, DollarSign, Calendar, TrendingUp, CheckCircle, Plus } from "lucide-react";

export default function MetasPage() {
  const { metas, adicionarMeta, atualizarMeta, removerMeta } = useAnalytics();
  const { users } = useAuth();
  const { clientes } = useClientes();
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [metaEditando, setMetaEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    usuario: "",
    mes: "",
    ano: new Date().getFullYear(),
    valorMeta: 0,
    tipo: "valor" as "quantidade" | "valor"
  });

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  // Função para obter número do mês
  const getMesNumero = (mes: string): number => {
    const mesIndex = meses.findIndex(m => 
      m === mes || 
      m.charAt(0).toUpperCase() + mes.slice(1).toLowerCase() === mes.toLowerCase()
    );
    const resultado = mesIndex + 1;
    console.log(`🔍 getMesNumero: mes="${mes}", index=${mesIndex}, resultado=${resultado}`);
    return resultado;
  };

  // Função para calcular progresso de uma meta
  const calcularProgressoMeta = (meta: any) => {
    try {
      console.log("🔍 Calculando progresso para meta:", meta);
      
      let clientesFiltrados = clientes;
      
      // Filtrar por usuário (se não for meta geral)
      if (meta.usuario !== "geral") {
        const user = users?.find(u => u.nome === meta.usuario);
        console.log("🔍 Usuário encontrado:", user);
        if (user) {
          clientesFiltrados = clientes.filter(c => c.criadoPor === user.id);
          console.log("🔍 Clientes filtrados por usuário:", clientesFiltrados.length);
        }
      } else {
        console.log("🔍 Meta geral - usando todos os clientes");
      }

      // Filtrar por período
      const clientesDoMes = clientesFiltrados.filter((cliente) => {
        try {
          // Para clientes PAGOS: usar data_pagamento para cálculo
          if (cliente.status === "pago" && cliente.data_pagamento) {
            const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
            const mesPagamento = dataPagamento.getMonth() + 1;
            const anoPagamento = dataPagamento.getFullYear();
            const metaMes = getMesNumero(meta.mes);
            const resultado = mesPagamento === metaMes && anoPagamento === meta.ano;
            console.log(`🔍 Cliente ${cliente.cliente}: data_pagamento=${cliente.data_pagamento}, mes=${mesPagamento}, ano=${anoPagamento}, metaMes=${metaMes}, metaAno=${meta.ano}, resultado=${resultado}`);
            return resultado;
          }
          
          // Para clientes PENDENTES/CANCELADOS: usar data de cadastro apenas para contagem
          const dataCadastro = new Date(cliente.data + 'T00:00:00');
          const mesCadastro = dataCadastro.getMonth() + 1;
          const anoCadastro = dataCadastro.getFullYear();
          const metaMes = getMesNumero(meta.mes);
          const resultado = mesCadastro === metaMes && anoCadastro === meta.ano;
          console.log(`🔍 Cliente ${cliente.cliente}: data=${cliente.data}, mes=${mesCadastro}, ano=${anoCadastro}, metaMes=${metaMes}, metaAno=${meta.ano}, resultado=${resultado}`);
          return resultado;
        } catch (error) {
          console.error("🔍 Erro ao processar cliente:", error);
          return false;
        }
      });

      console.log("🔍 Clientes do mês filtrados:", clientesDoMes.length);

      if (meta.tipo === "quantidade") {
        // Meta de quantidade: contar apenas clientes de fontes principais no período
        const atual = clientesDoMes.filter(c => isFontePrincipal(c.fonte)).length;
        const valorMeta = meta.valorMeta;
        const percentual = valorMeta > 0 ? Math.min((atual / valorMeta) * 100, 100) : 0;
        
        console.log("🔍 Meta de quantidade:", { atual, valorMeta, percentual });
        
        return {
          atual,
          meta: valorMeta,
          percentual,
          faltante: Math.max(valorMeta - atual, 0)
        };
      } else {
        // Meta de valor: somar apenas clientes PAGOS, ponderando por fonte (50% para corretores)
        const clientesPagosDoMes = clientesDoMes.filter(cliente => 
          cliente.status === "pago" && cliente.data_pagamento
        );

        console.log("🔍 Clientes pagos do mês:", clientesPagosDoMes.length);

        let brutoCorretores = 0;
        let contadoCorretores = 0;
        const atual = clientesPagosDoMes.reduce((acc, cliente) => {
          try {
            const valor = Number(cliente.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
            const peso = getPercentualMeta(cliente.fonte);
            console.log(`🔍 Cliente ${cliente.cliente}: valor=${cliente.valor}, parseado=${valor}, peso=${peso}`);
            if (!isNaN(valor) && peso < 1) {
              brutoCorretores += valor;
              contadoCorretores += valor * (isNaN(peso) ? 0 : peso);
            }
            return acc + (isNaN(valor) ? 0 : valor * (isNaN(peso) ? 0 : peso));
          } catch (error) {
            console.error("🔍 Erro ao processar valor:", error);
            return acc;
          }
        }, 0);

        const valorMeta = meta.valorMeta;
        const percentual = valorMeta > 0 ? Math.min((atual / valorMeta) * 100, 100) : 0;
        
        console.log("🔍 Meta de valor:", { atual, valorMeta, percentual });
        
        return {
          atual,
          meta: valorMeta,
          percentual,
          faltante: Math.max(valorMeta - atual, 0),
          detalhamento: {
            corretores: {
              bruto: brutoCorretores,
              contado: contadoCorretores
            }
          }
        };
      }
    } catch (error) {
      console.error("🔍 Erro ao calcular progresso da meta:", error);
      return { atual: 0, meta: 0, percentual: 0, faltante: 0 };
    }
  };

  // Função para obter status da meta
  const getStatusMeta = (percentual: number) => {
    if (percentual >= 100) {
      return { 
        status: "concluida", 
        label: "Meta atingida!", 
        color: "green",
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Meta atingida!"
      };
    } else if (percentual >= 75) {
      return { 
        status: "proximo", 
        label: "Próximo da meta", 
        color: "blue",
        icon: <TrendingUp className="h-4 w-4" />,
        text: "Próximo da meta"
      };
    } else if (percentual >= 50) {
      return { 
        status: "andamento", 
        label: "Em andamento", 
        color: "yellow",
        icon: <TrendingUp className="h-4 w-4" />,
        text: "Em andamento"
      };
    } else {
      return { 
        status: "inicio", 
        label: "Iniciando", 
        color: "gray",
        icon: <Target className="h-4 w-4" />,
        text: "Iniciando"
      };
    }
  };

  const resetarFormulario = () => {
    setFormData({
      usuario: "",
      mes: "",
      ano: new Date().getFullYear(),
      valorMeta: 0,
      tipo: "valor"
    });
    setMetaEditando(null);
  };

  const abrirDialog = (meta?: any) => {
    if (meta) {
      setMetaEditando(meta);
      setFormData({
        usuario: meta.usuario,
        mes: meta.mes,
        ano: meta.ano,
        valorMeta: Number(meta.valorMeta) || 0,
        tipo: meta.tipo || "valor"
      });
    } else {
      resetarFormulario();
    }
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    resetarFormulario();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.usuario || !formData.mes || !formData.valorMeta) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const metaData = {
        usuario: formData.usuario,
        mes: formData.mes,
        ano: formData.ano,
        valorMeta: formData.valorMeta,
        tipo: formData.tipo
      };

      if (metaEditando) {
        await atualizarMeta({ ...metaEditando, ...metaData });
      } else {
        await adicionarMeta(metaData);
      }

      fecharDialog();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      alert("Erro ao salvar meta. Tente novamente.");
    }
  };

  const handleExcluir = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      try {
        await removerMeta(id);
      } catch (error) {
        console.error("Erro ao excluir meta:", error);
        alert("Erro ao excluir meta. Tente novamente.");
      }
    }
  };

  const getStatusColor = (tipo: string) => {
    return tipo === "quantidade" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
  };

  const getIcon = (tipo: string) => {
    return tipo === "quantidade" ? <Users className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />;
  };

  const handleEdit = (meta: any) => {
    abrirDialog(meta);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      try {
        await removerMeta(id);
      } catch (error) {
        console.error("Erro ao excluir meta:", error);
        alert("Erro ao excluir meta. Tente novamente.");
      }
    }
  };

  return (
    <ProtectedLayout adminOnly>
      <SidebarLayout>
        <main className="container py-10 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Gerenciar Metas
            </h1>
            <p className="text-gray-600 mt-1">
              Configure e acompanhe as metas dos vendedores
            </p>
          </div>

          {/* Botão para criar nova meta */}
          <div className="mb-6">
            <Button onClick={() => abrirDialog()} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>

          {/* Lista de metas existentes */}
          <div className="grid gap-6">
            {metas && metas.length > 0 ? (
              metas.map((meta) => {
                const progresso = calcularProgressoMeta(meta);
                const status = getStatusMeta(progresso.percentual);
                
                return (
                  <Card 
                    key={meta.id} 
                    className={`group hover:shadow-lg transition-all duration-300 border-2 ${
                      status.color === 'green' ? 'border-green-200 hover:border-green-300' :
                      status.color === 'blue' ? 'border-blue-200 hover:border-blue-300' :
                      status.color === 'yellow' ? 'border-yellow-200 hover:border-yellow-300' :
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Header da Meta */}
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${
                              status.color === 'green' ? 'bg-green-100 text-green-600' :
                              status.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              status.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {meta.tipo === 'quantidade' ? (
                                <Users className="h-5 w-5" />
                              ) : (
                                <DollarSign className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {meta.usuario === 'geral' ? 'Meta Geral da Empresa' : meta.usuario}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {meta.mes} {meta.ano}
                                <Badge variant="outline" className="ml-2">
                                  {meta.tipo === 'quantidade' ? 'Quantidade' : 'Valor'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Progresso da Meta */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Progresso</span>
                              <span className={`text-sm font-semibold ${
                                status.color === 'green' ? 'text-green-600' :
                                status.color === 'blue' ? 'text-blue-600' :
                                status.color === 'yellow' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {progresso.percentual.toFixed(1)}%
                              </span>
                            </div>
                            
                            <Progress 
                              value={progresso.percentual} 
                              className={`h-3 ${
                                status.color === 'green' ? 'bg-green-100' :
                                status.color === 'blue' ? 'bg-blue-100' :
                                status.color === 'yellow' ? 'bg-yellow-100' :
                                'bg-gray-100'
                              }`}
                            />
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-muted-foreground">Meta</p>
                                <p className="font-semibold">
                                  {meta.tipo === 'quantidade' 
                                    ? `${meta.valorMeta} clientes`
                                    : `R$ ${meta.valorMeta.toLocaleString()}`
                                  }
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-muted-foreground">Atual</p>
                                <p className="font-semibold">
                                  {meta.tipo === 'quantidade' 
                                    ? `${progresso.atual} clientes`
                                    : `R$ ${progresso.atual.toLocaleString()}`
                                  }
                                </p>
                              </div>
                            </div>

                          {/* Indicador visual do 50% de corretores para metas de valor */}
                          {meta.tipo === 'valor' && (
                            <div className="mt-3 space-y-2 rounded-md border p-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Corretores (50%) — contou</span>
                                <span className="font-medium">
                                  R$ {(progresso?.detalhamento?.corretores?.contado || 0).toLocaleString()}
                                </span>
                              </div>
                              <Progress 
                                value={
                                  meta.valorMeta > 0
                                    ? Math.min(((progresso?.detalhamento?.corretores?.contado || 0) / meta.valorMeta) * 100, 100)
                                    : 0
                                } 
                                className="h-2"
                              />
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>Bruto corretores</span>
                                <span>R$ {(progresso?.detalhamento?.corretores?.bruto || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                          </div>

                          {/* Status Motivacional */}
                          <div className={`p-3 rounded-lg border ${
                            status.color === 'green' ? 'bg-green-50 border-green-200' :
                            status.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                            status.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              {status.icon}
                              <span className={`text-sm font-medium ${
                                status.color === 'green' ? 'text-green-700' :
                                status.color === 'blue' ? 'text-blue-700' :
                                status.color === 'yellow' ? 'text-yellow-700' :
                                'text-gray-700'
                              }`}>
                                {status.text}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(meta)}
                            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(meta.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma meta encontrada
                </h3>
                <p className="text-gray-500 mb-6">
                  Comece criando sua primeira meta para acompanhar o progresso da equipe.
                </p>
                <Button onClick={() => abrirDialog()}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </Card>
            )}
          </div>

          {/* Dialog para criar/editar meta */}
          {dialogAberto && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    {metaEditando ? (
                      <>
                        <Edit className="h-5 w-5 text-primary" />
                        Editar Meta
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 text-primary" />
                        Nova Meta
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Usuário */}
                    <div className="space-y-2">
                      <Label htmlFor="usuario" className="text-sm font-medium">
                        Usuário
                      </Label>
                      <Select 
                        value={formData.usuario} 
                        onValueChange={(value) => setFormData({...formData, usuario: value})}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Meta Geral da Empresa</SelectItem>
                          {users?.map((user) => (
                            <SelectItem key={user.id} value={user.nome}>
                              {user.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mês e Ano */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mes" className="text-sm font-medium">
                          Mês
                        </Label>
                        <Select 
                          value={formData.mes} 
                          onValueChange={(value) => setFormData({...formData, mes: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Mês" />
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="ano" className="text-sm font-medium">
                          Ano
                        </Label>
                        <Select 
                          value={formData.ano.toString()} 
                          onValueChange={(value) => setFormData({...formData, ano: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {[2025, 2026, 2027, 2028, 2029].map((ano) => (
                              <SelectItem key={ano} value={ano.toString()}>
                                {ano}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tipo de Meta */}
                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-sm font-medium">
                        Tipo de Meta
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.tipo === 'quantidade' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({...formData, tipo: 'quantidade'})}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              formData.tipo === 'quantidade' ? 'bg-primary text-white' : 'bg-gray-100'
                            }`}>
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Quantidade</p>
                              <p className="text-sm text-muted-foreground">Número de clientes</p>
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.tipo === 'valor' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({...formData, tipo: 'valor'})}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              formData.tipo === 'valor' ? 'bg-primary text-white' : 'bg-gray-100'
                            }`}>
                              <DollarSign className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Valor</p>
                              <p className="text-sm text-muted-foreground">Em reais</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valor da Meta */}
                    <div className="space-y-2">
                      <Label htmlFor="valorMeta" className="text-sm font-medium">
                        {formData.tipo === 'quantidade' ? 'Quantidade de Clientes' : 'Valor da Meta (R$)'}
                      </Label>
                      <div className="relative">
                        {formData.tipo === 'valor' && (
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            R$
                          </span>
                        )}
                        <Input
                          id="valorMeta"
                          type="number"
                          value={formData.valorMeta}
                          onChange={(e) => setFormData({...formData, valorMeta: Number(e.target.value) || 0})}
                          min="1"
                          className={formData.tipo === 'valor' ? 'pl-12' : ''}
                          placeholder={formData.tipo === 'quantidade' ? 'Ex: 50' : 'Ex: 100000'}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formData.tipo === 'quantidade' 
                          ? 'Digite o número total de clientes desejados'
                          : 'Digite o valor total em reais (sem pontos ou vírgulas)'
                        }
                      </p>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={!formData.usuario || !formData.mes || !formData.ano || !formData.tipo || !formData.valorMeta}
                      >
                        {metaEditando ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Atualizar Meta
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Meta
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          fecharDialog();
                          setFormData({
                            usuario: "",
                            mes: "",
                            ano: 2025,
                            valorMeta: 0,
                            tipo: "quantidade"
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Debug das Metas (mantido para referência) */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Debug das Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>Metas carregadas:</strong> {metas?.length || 0}
                </div>
                <div>
                  <strong>Usuários carregados:</strong> {users?.length || 0}
                </div>
                <div>
                  <strong>Clientes carregados:</strong> {clientes?.length || 0}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    alert("🔍 Botão Debug clicado!");
                    console.log("🔍 Forçando recarregamento das metas...");
                    console.log("🔍 Metas atuais:", metas);
                    console.log("🔍 Users atuais:", users);
                    console.log("🔍 Clientes atuais:", clientes);
                  }}
                >
                  Debug Metas
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
