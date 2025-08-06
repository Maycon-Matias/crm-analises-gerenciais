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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Edit, Trash2, Target } from "lucide-react";
import type { Meta } from "@/types/analytics";
import { SidebarLayout } from "@/components/sidebar-layout";

export default function MetasPage() {
  const { metas, adicionarMeta, atualizarMeta, removerMeta } = useAnalytics();
  const { users } = useAuth();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [metaEditando, setMetaEditando] = useState<Meta | null>(null);
  const [formData, setFormData] = useState({
    usuario: "",
    mes: "",
    ano: 2024,
    valorMeta: "",
  });

  const vendedores = users.filter((user) => user.role === "user");

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valorMeta = Number.parseFloat(
      formData.valorMeta.replace(/[^\d,]/g, "").replace(",", "."),
    );

    if (metaEditando) {
      atualizarMeta({
        ...metaEditando,
        usuario: formData.usuario,
        mes: formData.mes,
        ano: formData.ano,
        valorMeta,
      });
    } else {
      adicionarMeta({
        usuario: formData.usuario,
        mes: formData.mes,
        ano: formData.ano,
        valorMeta,
      });
    }

    setDialogAberto(false);
    setMetaEditando(null);
    setFormData({ usuario: "", mes: "", ano: 2024, valorMeta: "" });
  };

  const handleEditar = (meta: Meta) => {
    setMetaEditando(meta);
    setFormData({
      usuario: meta.usuario,
      mes: meta.mes,
      ano: meta.ano,
      valorMeta: meta.valorMeta.toString(),
    });
    setDialogAberto(true);
  };

  const handleNovaMeta = () => {
    setMetaEditando(null);
    setFormData({ usuario: "", mes: "", ano: 2024, valorMeta: "" });
    setDialogAberto(true);
  };

  return (
    <ProtectedLayout adminOnly>
      <div className="min-h-screen bg-gray-50">
        <SidebarLayout>
          <main className="container py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Gerenciar Metas
                </h1>
                <p className="text-gray-600 mt-1">
                  Configure e acompanhe as metas dos vendedores
                </p>
              </div>
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleNovaMeta}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Meta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {metaEditando ? "Editar Meta" : "Nova Meta"}
                    </DialogTitle>
                    <DialogDescription>
                      {metaEditando
                        ? "Atualize os dados da meta"
                        : "Configure uma nova meta para o vendedor"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="usuario">Vendedor</Label>
                      <Select
                        value={formData.usuario}
                        onValueChange={(value) =>
                          setFormData({ ...formData, usuario: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendedores.map((vendedor) => (
                            <SelectItem key={vendedor.id} value={vendedor.nome}>
                              {vendedor.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mes">Mês</Label>
                      <Select
                        value={formData.mes}
                        onValueChange={(value) =>
                          setFormData({ ...formData, mes: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mês" />
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

                    <div>
                      <Label htmlFor="ano">Ano</Label>
                      <Select
                        value={formData.ano.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ano: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="valorMeta">Valor da Meta</Label>
                      <Input
                        id="valorMeta"
                        placeholder="R$ 0,00"
                        value={formData.valorMeta}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valorMeta: e.target.value,
                          })
                        }
                        required
                      />
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
                        {metaEditando ? "Atualizar" : "Criar"} Meta
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Metas Cadastradas
                </CardTitle>
                <CardDescription>
                  Lista de todas as metas configuradas para os vendedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor da Meta</TableHead>
                        <TableHead>Criada em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metas.map((meta) => (
                        <TableRow key={meta.id}>
                          <TableCell className="font-medium">
                            {meta.usuario}
                          </TableCell>
                          <TableCell>
                            {meta.mes} {meta.ano}
                          </TableCell>
                          <TableCell>
                            {meta.valorMeta.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(meta.criadaEm + 'T00:00:00').toLocaleDateString(
                              "pt-BR",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditar(meta)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removerMeta(meta.id)}
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
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Nenhuma meta cadastrada ainda
                    </p>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleNovaMeta}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Criar Primeira Meta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarLayout>
      </div>
    </ProtectedLayout>
  );
}
