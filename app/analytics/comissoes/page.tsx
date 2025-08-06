"use client";

import type React from "react";

import { useState } from "react";
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
import { SidebarLayout } from "@/components/sidebar-layout";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { opcoesPredefinidas } from "@/types/cliente";
import { PlusCircle, Edit, Trash2, Percent, Building2 } from "lucide-react";
import type { RegraComissao, RegraComissaoBanco } from "@/types/analytics";

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
  } = useAnalytics();

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

  return (
    <ProtectedLayout adminOnly>
      <SidebarLayout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Configurar Comissões
              </h1>
              <p className="text-gray-600 mt-1">
                Configure as regras de comissionamento por produto e banco
              </p>
            </div>
          </div>

          <Tabs defaultValue="produtos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="produtos">Comissões por Produto</TabsTrigger>
              <TabsTrigger value="bancos">Comissões por Banco</TabsTrigger>
            </TabsList>

            <TabsContent value="produtos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Regras de Comissão por Produto
                    </CardTitle>
                    <CardDescription>
                      Configure os percentuais de comissão para cada tipo de
                      produto
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
          </Tabs>
        </div>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
