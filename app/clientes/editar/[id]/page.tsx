"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProtectedLayout } from "@/components/protected-layout";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import type { Cliente } from "@/types/cliente";
import { SidebarLayout } from "@/components/sidebar-layout";

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do CPF
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

// Função para formatar CPF
function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, "");
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Função para formatar telefone
function formatarTelefone(telefone: string): string {
  telefone = telefone.replace(/[^\d]/g, "");
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { clientes, atualizarCliente, opcoesPredefinidas } = useClientes();
  const { user, users } = useAuth();
  const [formData, setFormData] = useState<Cliente | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const carregarCliente = async () => {
      const resolvedParams = await params;
      const cliente = clientes.find((c) => c.id === resolvedParams.id);
      if (cliente) {
        setFormData(cliente);

        // Verificar se o usuário tem permissão para editar este cliente
        // Administradores podem editar qualquer cliente, usuários comuns só podem editar seus próprios clientes
        const canEdit = user?.role === "admin" || cliente.criadoPor === user?.id;
        setIsAuthorized(canEdit);

        if (!canEdit) {
          // Mostrar mensagem de erro e redirecionar
          alert("Você não tem permissão para editar este cliente.");
          router.push(user?.role === "admin" ? "/admin/clientes" : "/dashboard");
        }
      } else {
        alert("Cliente não encontrado.");
        router.push(user?.role === "admin" ? "/admin/clientes" : "/dashboard");
      }
    };

    carregarCliente();
  }, [clientes, params, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formatação automática apenas para CPF e telefone
    if (name === "cpf") {
      formattedValue = formatarCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatarTelefone(value);
    }
    
    setFormData((prev) => (prev ? { ...prev, [name]: formattedValue } : null));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  function formatarValor(valor: string) {
    if (!valor) return "";
    // Remove R$, espaços e tudo que não for número, vírgula ou ponto
    let v = valor.replace(/R\$|\s/g, "");
    if (v.includes(",")) {
      v = v.replace(/\./g, ""); // remove pontos dos milhares
      v = v.replace(",", "."); // troca vírgula decimal por ponto
    }
    const num = Number(v);
    if (isNaN(num)) return "R$ 0,00";
    return "R$ " + num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && isAuthorized) {
      // Se status for pago, data_pagamento deve estar preenchida
      if (formData.status === "pago" && !formData.data_pagamento) {
        alert("Por favor, selecione a data do pagamento.");
        return;
      }

      // Validar CPF se fornecido
      if (formData.cpf && !validarCPF(formData.cpf)) {
        alert("CPF inválido. Por favor, corrija o CPF.");
        return;
      }

      atualizarCliente({ ...formData, valor: formatarValor(String(formData.valor)) });
      router.push(user?.role === "admin" ? "/admin/clientes" : "/dashboard");
    }
  };

  if (!formData || !isAuthorized) {
    return <div className="container mx-auto py-10 px-4">Carregando...</div>;
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-50">
        <SidebarLayout>
          <div className="container mx-auto py-10 px-4 max-w-4xl">
            <Card>
              <CardHeader className="bg-primary/10">
                <CardTitle className="text-2xl text-primary">
                  Editar Cliente
                </CardTitle>
                <CardDescription>Atualize os dados do cliente</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados do Cliente */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dados do Cliente</h3>

                      <div className="space-y-2">
                        <Label htmlFor="cliente">Cliente</Label>
                        <Input
                          id="cliente"
                          name="cliente"
                          placeholder="Nome do cliente"
                          required
                          value={formData.cliente}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor</Label>
                        <Input
                          id="valor"
                          name="valor"
                          placeholder="R$ 0,00"
                          required
                          value={formatarValor(formData.valor)}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <Input
                          id="data"
                          name="data"
                          type="date"
                          required
                          value={formData.data}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mes">Mês</Label>
                        <Input
                          id="mes"
                          name="mes"
                          value={formData.mes}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Campo de Data de Pagamento */}
                      {formData.status === "pago" && (
                        <div className="space-y-2">
                          <Label htmlFor="data_pagamento">Data do Pagamento</Label>
                          <Input
                            id="data_pagamento"
                            name="data_pagamento"
                            type="date"
                            required
                            value={formData.data_pagamento || ""}
                            onChange={handleChange}
                          />
                        </div>
                      )}

                      {/* Campo de Observações - Apenas para Admin */}
                      {user?.role === "admin" && (
                        <div className="space-y-2">
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea
                            id="observacoes"
                            name="observacoes"
                            placeholder="Observações adicionais sobre o cliente..."
                            value={formData.observacoes || ""}
                            onChange={handleChange}
                            rows={3}
                          />
                        </div>
                      )}

                      {/* Campos CPF e Telefone - Apenas para Admin */}
                      {user?.role === "admin" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input
                              id="cpf"
                              name="cpf"
                              placeholder="000.000.000-00"
                              value={formData.cpf || ""}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                              id="telefone"
                              name="telefone"
                              placeholder="(00) 00000-0000"
                              value={formData.telefone || ""}
                              onChange={handleChange}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Opções Pré-definidas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Opções Pré-definidas
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="produto">Produto</Label>
                        <Select
                          value={formData.produto}
                          onValueChange={(value) =>
                            handleSelectChange(value, "produto")
                          }
                          required
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

                      <div className="space-y-2">
                        <Label htmlFor="banco">Banco</Label>
                        <Select
                          value={formData.banco}
                          onValueChange={(value) =>
                            handleSelectChange(value, "banco")
                          }
                          required
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

                      <div className="space-y-2">
                        <Label htmlFor="fonte">Fonte</Label>
                        <Select
                          value={formData.fonte}
                          onValueChange={(value) =>
                            handleSelectChange(value, "fonte")
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a fonte" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcoesPredefinidas.fontes.map((fonte) => (
                              <SelectItem key={fonte} value={fonte}>
                                {fonte}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="usuarios">Usuário</Label>
                        <Select
                          value={formData.usuarios}
                          onValueChange={(value) => handleSelectChange(value, "usuarios")}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o vendedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter(u => u.role === "user").map((u) => (
                              <SelectItem key={u.nome} value={u.nome}>{u.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {user?.role === "admin" && (
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) =>
                              handleSelectChange(
                                value as "pendente" | "pago",
                                "status",
                              )
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="pago">Pago</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        user?.role === "admin"
                          ? "/admin/clientes"
                          : "/dashboard",
                      )
                    }
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Salvar
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </SidebarLayout>
      </div>
    </ProtectedLayout>
  );
}
