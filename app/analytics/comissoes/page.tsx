"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import { opcoesPredefinidas } from "@/types/cliente";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Percent, 
  Building2, 
  Calculator,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Eye,
  Settings,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import type { RegraComissao, RegraComissaoBanco, ComissaoCalculada } from "@/types/analytics";

export default function ComissoesPage() {
  const {
    regrasComissao,
    regrasComissaoBanco,
    adicionarRegraComissao,
    atualizarRegraComissao,
    removerRegraComissao,
    adicionarRegraComissaoBanco,
    atualizarRegraComissaoBanco,
    removerRegraComissaoBanco,
    calcularComissoes,
  } = useAnalytics();

  const { clientes } = useClientes();
  const { users } = useAuth();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [tipoRegra, setTipoRegra] = useState<"produto" | "banco">("produto");
  const [regraEditando, setRegraEditando] = useState<
    RegraComissao | RegraComissaoBanco | null
  >(null);
  const [formData, setFormData] = useState({
    produto: "",
    banco: "",
    percentual: "",
    valorMinimo: "",
    valorMaximo: "",
    ativa: true,
  });

  // Estados para calculadora
  const [calculadoraData, setCalculadoraData] = useState({
    valor: "",
    produto: "",
    banco: "",
    vendedor: "",
  });

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    mes: new Date().toLocaleString("pt-BR", { month: "long" }),
    ano: new Date().getFullYear(),
    vendedor: "",
  });

  // Calcular estatísticas de comissões
  const estatisticasComissoes = () => {
    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });
    const anoAtual = new Date().getFullYear();
    
    const comissoesCalculadas = calcularComissoes(mesAtual, anoAtual);
    
    const totalComissoes = comissoesCalculadas.reduce((acc, comissao) => 
      acc + comissao.totalComissao, 0
    );
    
    const totalVendas = comissoesCalculadas.reduce((acc, comissao) => 
      acc + comissao.totalVendas, 0
    );

    const vendedoresAtivos = comissoesCalculadas.length;
    const mediaComissao = vendedoresAtivos > 0 ? totalComissoes / vendedoresAtivos : 0;

    return {
      totalComissoes,
      totalVendas,
      vendedoresAtivos,
      mediaComissao,
      comissoesCalculadas
    };
  };

  // Calcular comissão na calculadora
  const calcularComissao = () => {
    const valor = parseFloat(calculadoraData.valor.replace(/[^\d,]/g, "").replace(",", "."));
    if (!valor || !calculadoraData.produto) return 0;

    const regraProduto = regrasComissao.find(r => 
      r.produto === calculadoraData.produto && r.ativa
    );

    const regraBanco = regrasComissaoBanco.find(r => 
      r.banco === calculadoraData.banco && r.ativa
    );

    let comissao = 0;
    
    if (regraProduto) {
      comissao += (valor * regraProduto.percentual) / 100;
    }
    
    if (regraBanco) {
      comissao += (valor * regraBanco.percentual) / 100;
    }

    return comissao;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const percentual = Number.parseFloat(formData.percentual.replace(",", "."));
    const valorMinimo = formData.valorMinimo
      ? Number.parseFloat(
          formData.valorMinimo.replace(/[^\d,]/g, "").replace(",", "."),
        )
      : undefined;
    const valorMaximo = formData.valorMaximo
      ? Number.parseFloat(
          formData.valorMaximo.replace(/[^\d,]/g, "").replace(",", "."),
        )
      : undefined;

    if (tipoRegra === "produto") {
      if (regraEditando && "produto" in regraEditando) {
        atualizarRegraComissao({
          ...regraEditando,
          produto: formData.produto,
          percentual,
          valorMinimo,
          valorMaximo,
          ativa: formData.ativa,
        });
      } else {
        adicionarRegraComissao({
          tipo: "produto",
          produto: formData.produto,
          percentual,
          valorMinimo,
          valorMaximo,
          ativa: formData.ativa,
        });
      }
    } else {
      if (regraEditando && "banco" in regraEditando) {
        atualizarRegraComissaoBanco({
          ...regraEditando,
          banco: formData.banco,
          percentual,
          valorMinimo,
          valorMaximo,
          ativa: formData.ativa,
        });
      } else {
        adicionarRegraComissaoBanco({
          banco: formData.banco,
          percentual,
          valorMinimo,
          valorMaximo,
          ativa: formData.ativa,
        });
      }
    }

    setDialogAberto(false);
    setRegraEditando(null);
    setFormData({
      produto: "",
      banco: "",
      percentual: "",
      valorMinimo: "",
      valorMaximo: "",
      ativa: true,
    });
  };

  const handleEditar = (
    regra: RegraComissao | RegraComissaoBanco,
    tipo: "produto" | "banco",
  ) => {
    setRegraEditando(regra);
    setTipoRegra(tipo);

    if ("produto" in regra) {
      setFormData({
        produto: regra.produto || "",
        banco: "",
        percentual: regra.percentual.toString(),
        valorMinimo: regra.valorMinimo?.toString() || "",
        valorMaximo: regra.valorMaximo?.toString() || "",
        ativa: regra.ativa,
      });
    } else {
      setFormData({
        produto: "",
        banco: regra.banco || "",
        percentual: regra.percentual.toString(),
        valorMinimo: regra.valorMinimo?.toString() || "",
        valorMaximo: regra.valorMaximo?.toString() || "",
        ativa: regra.ativa,
      });
    }

    setDialogAberto(true);
  };

  const handleNovaRegra = (tipo: "produto" | "banco") => {
    setRegraEditando(null);
    setTipoRegra(tipo);
    setFormData({
      produto: "",
      banco: "",
      percentual: "",
      valorMinimo: "",
      valorMaximo: "",
      ativa: true,
    });
    setDialogAberto(true);
  };

  const toggleAtivaProduto = (regra: RegraComissao) => {
    atualizarRegraComissao({ ...regra, ativa: !regra.ativa });
  };

  const toggleAtivaBanco = (regra: RegraComissaoBanco) => {
    atualizarRegraComissaoBanco({ ...regra, ativa: !regra.ativa });
  };

  const stats = estatisticasComissoes();
  const comissaoCalculada = calcularComissao();

  return (
    <ProtectedLayout adminOnly>
      <SidebarLayout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Sistema de Comissões
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie regras de comissionamento e acompanhe pagamentos
              </p>
            </div>
          </div>

          {/* Dashboard de Comissões */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.totalComissoes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.vendedoresAtivos} vendedores ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.totalVendas.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total das vendas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média por Vendedor</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.mediaComissao.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comissão média
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {regrasComissao.filter(r => r.ativa).length + regrasComissaoBanco.filter(r => r.ativa).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Regras configuradas
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
              <TabsTrigger value="produtos">Por Produto</TabsTrigger>
              <TabsTrigger value="bancos">Por Banco</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            {/* Dashboard de Comissões */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Vendedores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Vendedores
                    </CardTitle>
                    <CardDescription>
                      Vendedores com maiores comissões no período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.comissoesCalculadas
                        .sort((a, b) => b.totalComissao - a.totalComissao)
                        .slice(0, 5)
                        .map((comissao, index) => (
                          <div key={comissao.usuarioId} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <div>
                                <p className="font-medium">{comissao.usuario}</p>
                                <p className="text-sm text-muted-foreground">
                                  {comissao.vendas.length} vendas
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                R$ {comissao.totalComissao.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {((comissao.totalComissao / stats.totalComissoes) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo por Produto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Comissões por Produto
                    </CardTitle>
                    <CardDescription>
                      Distribuição das comissões por tipo de produto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {regrasComissao
                        .filter(r => r.ativa)
                        .map(regra => {
                          const vendasProduto = stats.comissoesCalculadas
                            .flatMap(c => c.vendas)
                            .filter(v => v.produto === regra.produto);
                          
                          const totalVendas = vendasProduto.reduce((acc, v) => acc + v.valorTotal, 0);
                          const totalComissao = vendasProduto.reduce((acc, v) => acc + v.comissao, 0);

                          return (
                            <div key={regra.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{regra.produto}</span>
                                <span className="text-sm text-muted-foreground">
                                  {regra.percentual}%
                                </span>
                              </div>
                              <Progress value={(totalComissao / stats.totalComissoes) * 100} />
                              <div className="flex justify-between text-sm">
                                <span>R$ {totalComissao.toLocaleString()}</span>
                                <span>{vendasProduto.length} vendas</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Calculadora de Comissões */}
            <TabsContent value="calculadora">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculadora de Comissões
                  </CardTitle>
                  <CardDescription>
                    Calcule comissões para diferentes cenários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="valor">Valor da Venda</Label>
                        <Input
                          id="valor"
                          placeholder="R$ 0,00"
                          value={calculadoraData.valor}
                          onChange={(e) => setCalculadoraData({
                            ...calculadoraData,
                            valor: e.target.value
                          })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="produto">Produto</Label>
                        <Select
                          value={calculadoraData.produto}
                          onValueChange={(value) => setCalculadoraData({
                            ...calculadoraData,
                            produto: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcoesPredefinidas.produtos.map((produto) => (
                              <SelectItem key={produto} value={produto}>
                                {produto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="banco">Banco</Label>
                        <Select
                          value={calculadoraData.banco}
                          onValueChange={(value) => setCalculadoraData({
                            ...calculadoraData,
                            banco: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o banco" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcoesPredefinidas.bancos.map((banco) => (
                              <SelectItem key={banco} value={banco}>
                                {banco}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Resultado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              R$ {comissaoCalculada.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Comissão calculada
                            </p>
                          </div>

                          {calculadoraData.produto && (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Produto: {calculadoraData.produto}</span>
                                <span className="font-medium">
                                  {regrasComissao.find(r => r.produto === calculadoraData.produto && r.ativa)?.percentual || 0}%
                                </span>
                              </div>
                              {calculadoraData.banco && (
                                <div className="flex justify-between">
                                  <span>Banco: {calculadoraData.banco}</span>
                                  <span className="font-medium">
                                    {regrasComissaoBanco.find(r => r.banco === calculadoraData.banco && r.ativa)?.percentual || 0}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações por Produto */}
            <TabsContent value="produtos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Regras de Comissão por Produto
                    </CardTitle>
                    <CardDescription>
                      Configure os percentuais de comissão para cada tipo de produto
                    </CardDescription>
                  </div>
                  <Dialog
                    open={dialogAberto && tipoRegra === "produto"}
                    onOpenChange={setDialogAberto}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleNovaRegra("produto")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Regra
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {regraEditando
                            ? "Editar Regra"
                            : "Nova Regra de Comissão por Produto"}
                        </DialogTitle>
                        <DialogDescription>
                          {regraEditando
                            ? "Atualize a regra de comissão"
                            : "Configure uma nova regra de comissionamento"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="produto">Produto</Label>
                          <Select
                            value={formData.produto}
                            onValueChange={(value) =>
                              setFormData({ ...formData, produto: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {opcoesPredefinidas.produtos.map((produto) => (
                                <SelectItem key={produto} value={produto}>
                                  {produto}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="percentual">
                            Percentual de Comissão (%)
                          </Label>
                          <Input
                            id="percentual"
                            placeholder="2.5"
                            value={formData.percentual}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                percentual: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="valorMinimo">
                            Valor Mínimo (opcional)
                          </Label>
                          <Input
                            id="valorMinimo"
                            placeholder="R$ 0,00"
                            value={formData.valorMinimo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                valorMinimo: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="valorMaximo">
                            Valor Máximo (opcional)
                          </Label>
                          <Input
                            id="valorMaximo"
                            placeholder="R$ 0,00"
                            value={formData.valorMaximo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                valorMaximo: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="ativa"
                            checked={formData.ativa}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, ativa: checked })
                            }
                          />
                          <Label htmlFor="ativa">Regra ativa</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogAberto(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90"
                          >
                            {regraEditando ? "Atualizar" : "Criar"} Regra
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {regrasComissao.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Percentual</TableHead>
                          <TableHead>Valor Mínimo</TableHead>
                          <TableHead>Valor Máximo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regrasComissao.map((regra) => (
                          <TableRow key={regra.id}>
                            <TableCell className="font-medium">
                              {regra.produto}
                            </TableCell>
                            <TableCell>{regra.percentual}%</TableCell>
                            <TableCell>
                              {regra.valorMinimo
                                ? regra.valorMinimo.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {regra.valorMaximo
                                ? regra.valorMaximo.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={regra.ativa}
                                  onCheckedChange={() =>
                                    toggleAtivaProduto(regra)
                                  }
                                />
                                <span
                                  className={
                                    regra.ativa
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  {regra.ativa ? "Ativa" : "Inativa"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditar(regra, "produto")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removerRegraComissao(regra.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        Nenhuma regra de comissão por produto cadastrada ainda
                      </p>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleNovaRegra("produto")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Primeira Regra
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações por Banco */}
            <TabsContent value="bancos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Regras de Comissão por Banco
                    </CardTitle>
                    <CardDescription>
                      Configure os percentuais de comissão para cada banco
                    </CardDescription>
                  </div>
                  <Dialog
                    open={dialogAberto && tipoRegra === "banco"}
                    onOpenChange={setDialogAberto}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleNovaRegra("banco")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Regra
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {regraEditando
                            ? "Editar Regra"
                            : "Nova Regra de Comissão por Banco"}
                        </DialogTitle>
                        <DialogDescription>
                          {regraEditando
                            ? "Atualize a regra de comissão"
                            : "Configure uma nova regra de comissionamento"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="banco">Banco</Label>
                          <Select
                            value={formData.banco}
                            onValueChange={(value) =>
                              setFormData({ ...formData, banco: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o banco" />
                            </SelectTrigger>
                            <SelectContent>
                              {opcoesPredefinidas.bancos.map((banco) => (
                                <SelectItem key={banco} value={banco}>
                                  {banco}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="percentual">
                            Percentual de Comissão (%)
                          </Label>
                          <Input
                            id="percentual"
                            placeholder="1.5"
                            value={formData.percentual}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                percentual: e.target.value,
                              })
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="valorMinimo">
                            Valor Mínimo (opcional)
                          </Label>
                          <Input
                            id="valorMinimo"
                            placeholder="R$ 0,00"
                            value={formData.valorMinimo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                valorMinimo: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="valorMaximo">
                            Valor Máximo (opcional)
                          </Label>
                          <Input
                            id="valorMaximo"
                            placeholder="R$ 0,00"
                            value={formData.valorMaximo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                valorMaximo: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="ativa"
                            checked={formData.ativa}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, ativa: checked })
                            }
                          />
                          <Label htmlFor="ativa">Regra ativa</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogAberto(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90"
                          >
                            {regraEditando ? "Atualizar" : "Criar"} Regra
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {regrasComissaoBanco.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Banco</TableHead>
                          <TableHead>Percentual</TableHead>
                          <TableHead>Valor Mínimo</TableHead>
                          <TableHead>Valor Máximo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {regrasComissaoBanco.map((regra) => (
                          <TableRow key={regra.id}>
                            <TableCell className="font-medium">
                              {regra.banco}
                            </TableCell>
                            <TableCell>{regra.percentual}%</TableCell>
                            <TableCell>
                              {regra.valorMinimo
                                ? regra.valorMinimo.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {regra.valorMaximo
                                ? regra.valorMaximo.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={regra.ativa}
                                  onCheckedChange={() =>
                                    toggleAtivaBanco(regra)
                                  }
                                />
                                <span
                                  className={
                                    regra.ativa
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  {regra.ativa ? "Ativa" : "Inativa"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditar(regra, "banco")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    removerRegraComissaoBanco(regra.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">
                        Nenhuma regra de comissão por banco cadastrada ainda
                      </p>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleNovaRegra("banco")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Primeira Regra
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Relatórios de Comissões */}
            <TabsContent value="relatorios">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Relatório Detalhado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Relatório Detalhado
                    </CardTitle>
                    <CardDescription>
                      Comissões calculadas por vendedor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.comissoesCalculadas.map((comissao) => (
                        <div key={comissao.usuarioId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{comissao.usuario}</h4>
                            <Badge variant="outline">
                              {comissao.vendas.length} vendas
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {comissao.vendas.map((venda, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{venda.produto} - {venda.banco}</span>
                                <span className="font-medium">
                                  R$ {venda.comissao.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between font-semibold">
                              <span>Total Comissão:</span>
                              <span className="text-green-600">
                                R$ {comissao.totalComissao.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Estatísticas Gerais
                    </CardTitle>
                    <CardDescription>
                      Resumo das comissões do período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Distribuição por Produto</h4>
                        <div className="space-y-3">
                          {regrasComissao
                            .filter(r => r.ativa)
                            .map(regra => {
                              const vendasProduto = stats.comissoesCalculadas
                                .flatMap(c => c.vendas)
                                .filter(v => v.produto === regra.produto);
                              
                              const totalComissao = vendasProduto.reduce((acc, v) => acc + v.comissao, 0);
                              const percentual = stats.totalComissoes > 0 ? (totalComissao / stats.totalComissoes) * 100 : 0;

                              return (
                                <div key={regra.id} className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>{regra.produto}</span>
                                    <span className="font-medium">
                                      {percentual.toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress value={percentual} className="h-2" />
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Performance dos Vendedores</h4>
                        <div className="space-y-3">
                          {stats.comissoesCalculadas
                            .sort((a, b) => b.totalComissao - a.totalComissao)
                            .map((comissao, index) => (
                              <div key={comissao.usuarioId} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-6 h-6 p-0">
                                    {index + 1}
                                  </Badge>
                                  <span className="text-sm">{comissao.usuario}</span>
                                </div>
                                <span className="text-sm font-medium">
                                  R$ {comissao.totalComissao.toLocaleString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
