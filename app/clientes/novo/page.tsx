"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { SidebarLayout } from "@/components/sidebar-layout";
import { ProtectedLayout } from "@/components/protected-layout";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import type { Cliente } from "@/types/cliente";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, User, DollarSign, Calendar, Building, Source } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDataAtualFormatada, getDataAtualSemFusoHorario, debugDataAtual } from "@/lib/utils";
import { getTodasFontes } from "@/lib/fontes-config";

// Função para obter o mês atual em português
function getMesAtual() {
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
  const dataAtual = new Date();
  return meses[dataAtual.getMonth()];
}

// Função para formatar a data atual como YYYY-MM-DD (usando método mais robusto)
function getDataAtual() {
  // Debug: Verificar as datas
  debugDataAtual();
  
  // Usar a função mais robusta que considera fuso horário local
  return getDataAtualSemFusoHorario();
}

// Função para obter fontes disponíveis
function getFontesDisponiveis() {
  return getTodasFontes();
}

// Função melhorada para formatar valor
function formatarValor(valor: string) {
  if (!valor) return "";
  
  // Remove tudo exceto números, vírgula e ponto
  let v = valor.replace(/[^\d,.]/g, "");
  
  // Se tem vírgula, assume formato brasileiro
  if (v.includes(",")) {
    v = v.replace(/\./g, ""); // remove pontos dos milhares
    v = v.replace(",", "."); // troca vírgula decimal por ponto
  }
  
  const num = Number(v);
  if (isNaN(num) || num === 0) return "";
  
  // Para valores válidos, formata
  return "R$ " + num.toLocaleString("pt-BR", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

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

export default function NovoClientePage() {
  const router = useRouter();
  const { adicionarCliente, opcoesPredefinidas } = useClientes();
  const { user, users } = useAuth();
  const [formData, setFormData] = useState<Partial<Cliente>>({
    data: "",
    mes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      data: getDataAtual(),
      mes: getMesAtual(),
    }));
  }, []);

  // Validação em tempo real
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    // Validação do cliente
    if (touched.cliente && !formData.cliente) {
      newErrors.cliente = "Nome do cliente é obrigatório";
    } else if (touched.cliente && formData.cliente && formData.cliente.length < 3) {
      newErrors.cliente = "Nome deve ter pelo menos 3 caracteres";
    }
    
    // Validação do valor
    if (touched.valor && !formData.valor) {
      newErrors.valor = "Valor é obrigatório";
    } else if (touched.valor && formData.valor) {
      // Remover formatação e converter para número
      let valorLimpo = formData.valor.replace(/[^\d,.]/g, "");
      
      // Se tem vírgula, converter para formato decimal
      if (valorLimpo.includes(",")) {
        valorLimpo = valorLimpo.replace(/\./g, ""); // remove pontos dos milhares
        valorLimpo = valorLimpo.replace(",", "."); // troca vírgula decimal por ponto
      }
      
      const valorNumerico = Number(valorLimpo);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        newErrors.valor = "Valor deve ser um número válido maior que zero";
      }
    }
    
    // Validação do CPF
    if (touched.cpf && formData.cpf && !validarCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }
    
    // Validação do telefone
    if (touched.telefone && formData.telefone && formData.telefone.replace(/[^\d]/g, "").length < 10) {
      newErrors.telefone = "Telefone deve ter pelo menos 10 dígitos";
    }

    // CORREÇÃO: Validação da data de previsão de pagamento
    if (touched.data_previsao_pagamento && formData.data_previsao_pagamento) {
      const dataAtual = getDataAtual();
      const dataPrevisao = formData.data_previsao_pagamento;
      
      if (dataPrevisao < dataAtual) {
        newErrors.data_previsao_pagamento = "A data de previsão não pode ser anterior à data atual";
      }
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formatação automática apenas para CPF e telefone
    if (name === "cpf") {
      formattedValue = formatarCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatarTelefone(value);
    }
    // Para valor, não formatar durante a digitação
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Formatar valor quando sair do campo
    if (name === "valor" && formData.valor) {
      const valorFormatado = formatarValor(formData.valor);
      setFormData((prev) => ({ ...prev, valor: valorFormatado }));
    }
  };

  const isFormValid = () => {
    const obrigatorios = ["cliente", "valor", "data", "mes", "produto", "banco", "fonte"];
    return obrigatorios.every(campo => formData[campo] && !errors[campo]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      if (!user) {
        setError("Você precisa estar logado para cadastrar um cliente.");
        setLoading(false);
        return;
      }

      // Marcar todos os campos como tocados para validação
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allTouched);

      // Aguardar um tick para a validação ser executada
      await new Promise(resolve => setTimeout(resolve, 0));

      if (!isFormValid()) {
        setError("Por favor, corrija os erros no formulário.");
        setLoading(false);
        return;
      }

      const novoCliente = {
        ...formData,
        usuarios: user?.role === "admin" ? formData.usuarios : user?.nome,
        valor: formData.valor ? formatarValor(String(formData.valor)) : "",
      } as Omit<Cliente, "id" | "criadoPor" | "status">;

      await adicionarCliente(novoCliente);
      setSuccess(true);
      setFormData({ data: getDataAtual(), mes: getMesAtual() });
      setTouched({});
      setErrors({});
      
      setTimeout(() => {
        setSuccess(false);
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <SidebarLayout>
          <div className="container mx-auto py-10 px-4 max-w-5xl">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">
                      Novo Cliente
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Preencha os dados para cadastrar um novo cliente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="pt-6">
                  {error && (
                    <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Cliente cadastrado com sucesso! Redirecionando...
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Dados do Cliente */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Dados do Cliente
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cliente" className="flex items-center gap-2">
                            Nome do Cliente
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          </Label>
                          <Input
                            id="cliente"
                            name="cliente"
                            placeholder="Digite o nome completo"
                            required
                            value={formData.cliente || ""}
                            onChange={handleChange}
                            onBlur={() => handleBlur("cliente")}
                            className={errors.cliente ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {errors.cliente && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.cliente}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cpf" className="flex items-center gap-2">
                            CPF
                            <Badge variant="secondary" className="text-xs">Opcional</Badge>
                          </Label>
                          <Input
                            id="cpf"
                            name="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf || ""}
                            onChange={handleChange}
                            onBlur={() => handleBlur("cpf")}
                            className={errors.cpf ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {errors.cpf && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.cpf}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telefone" className="flex items-center gap-2">
                            Telefone
                            <Badge variant="secondary" className="text-xs">Opcional</Badge>
                          </Label>
                          <Input
                            id="telefone"
                            name="telefone"
                            placeholder="(00) 00000-0000"
                            value={formData.telefone || ""}
                            onChange={handleChange}
                            onBlur={() => handleBlur("telefone")}
                            className={errors.telefone ? "border-red-500 focus:border-red-500" : ""}
                          />
                          {errors.telefone && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.telefone}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="valor" className="flex items-center gap-2">
                            Valor
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="valor"
                              name="valor"
                              placeholder="R$ 0,00"
                              required
                              value={formData.valor || ""}
                              onChange={handleChange}
                              onBlur={() => handleBlur("valor")}
                              className={`pl-10 ${errors.valor ? "border-red-500 focus:border-red-500" : ""}`}
                            />
                          </div>
                          {errors.valor && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.valor}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="data" className="flex items-center gap-2">
                              Data
                              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="data"
                                name="data"
                                type="date"
                                required
                                value={formData.data || ""}
                                onChange={handleChange}
                                onBlur={() => handleBlur("data")}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mes">Mês</Label>
                            <Input
                              id="mes"
                              name="mes"
                              value={formData.mes || ""}
                              onChange={handleChange}
                              onBlur={() => handleBlur("mes")}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="data_previsao_pagamento" className="flex items-center gap-2">
                            Data Prevista de Pagamento
                            <Badge variant="secondary" className="text-xs">Opcional</Badge>
                          </Label>
                          <Input
                            id="data_previsao_pagamento"
                            name="data_previsao_pagamento"
                            type="date"
                            min={getDataAtual()}
                            value={formData.data_previsao_pagamento || ""}
                            onChange={handleChange}
                            onBlur={() => handleBlur("data_previsao_pagamento")}
                            className={`${errors.data_previsao_pagamento ? "border-red-500 focus:border-red-500" : ""}`}
                          />
                          {errors.data_previsao_pagamento && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.data_previsao_pagamento}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Quando você espera receber este pagamento?
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="observacoes" className="flex items-center gap-2">
                            Observações
                            <Badge variant="secondary" className="text-xs">Opcional</Badge>
                          </Label>
                          <Textarea
                            id="observacoes"
                            name="observacoes"
                            placeholder="Observações adicionais sobre o cliente..."
                            value={formData.observacoes || ""}
                            onChange={handleChange}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Opções Pré-definidas */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Informações do Produto
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="produto" className="flex items-center gap-2">
                            Produto
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          </Label>
                          <Select
                            value={formData.produto || ""}
                            onValueChange={(value) => handleSelectChange(value, "produto")}
                            required
                          >
                            <SelectTrigger className={errors.produto ? "border-red-500 focus:border-red-500" : ""}>
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
                          {errors.produto && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.produto}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="banco" className="flex items-center gap-2">
                            Banco
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          </Label>
                          <Select
                            value={formData.banco || ""}
                            onValueChange={(value) => handleSelectChange(value, "banco")}
                            required
                          >
                            <SelectTrigger className={errors.banco ? "border-red-500 focus:border-red-500" : ""}>
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
                          {errors.banco && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.banco}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fonte" className="flex items-center gap-2">
                            Fonte
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          </Label>
                          <Select
                            value={formData.fonte || ""}
                            onValueChange={(value) => handleSelectChange(value, "fonte")}
                            required
                          >
                            <SelectTrigger className={errors.fonte ? "border-red-500 focus:border-red-500" : ""}>
                              <SelectValue placeholder="Selecione a fonte" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Fontes Principais */}
                              <div className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300">
                                🟢 Vendas Principais (contam para metas)
                              </div>
                              {getFontesDisponiveis()
                                .filter(fonte => 
                                  fonte === "Indicação(RO)" || 
                                  fonte === "URA" || 
                                  fonte === "Trafego" ||
                                  fonte === "Rede Social" ||
                                  fonte === "Balcão" ||
                                  fonte === "Discador" ||
                                  fonte === "Cliente Fixo" ||
                                  fonte === "Indicação"
                                )
                                .map((fonte) => (
                                  <SelectItem key={fonte} value={fonte}>
                                    {fonte}
                                  </SelectItem>
                                ))
                              }
                              
                              {/* Separador */}
                              <div className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 mt-2">
                                🟡 Vendas de Corretor (não contam para metas)
                              </div>
                              {getFontesDisponiveis()
                                .filter(fonte => fonte.startsWith("Corretor("))
                                .map((fonte) => (
                                  <SelectItem key={fonte} value={fonte}>
                                    {fonte}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          {errors.fonte && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.fonte}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.fonte && (
                              formData.fonte === "Indicação(RO)" || 
                              formData.fonte === "URA" || 
                              formData.fonte === "Trafego" ||
                              formData.fonte === "Rede Social" ||
                              formData.fonte === "Balcão" ||
                              formData.fonte === "Discador" ||
                              formData.fonte === "Cliente Fixo" ||
                              formData.fonte === "Indicação"
                                ? "✅ Esta fonte conta para suas metas do mês"
                                : "⚠️ Esta fonte não conta para suas metas do mês"
                            )}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="usuarios" className="flex items-center gap-2">
                            Vendedor
                            <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                          </Label>
                          {user?.role === "admin" ? (
                            <Select
                              value={formData.usuarios || ""}
                              onValueChange={(value) => handleSelectChange(value, "usuarios")}
                              required
                            >
                              <SelectTrigger className={errors.usuarios ? "border-red-500 focus:border-red-500" : ""}>
                                <SelectValue placeholder="Selecione o vendedor" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.filter(u => u.role === "user").map((u) => (
                                  <SelectItem key={u.nome} value={u.nome}>{u.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id="usuarios"
                              name="usuarios"
                              value={formData.usuarios || user?.nome || ""}
                              disabled
                              className="bg-gray-100 dark:bg-gray-700"
                            />
                          )}
                          {errors.usuarios && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.usuarios}</p>
                          )}
                        </div>
                      </div>

                      {/* Informações de Ajuda */}
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-1">Dicas para um cadastro completo:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• Preencha o CPF para melhor identificação</li>
                              <li>• Adicione o telefone para contato futuro</li>
                              <li>• Use observações para informações importantes</li>
                              <li>• A data de pagamento é opcional</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6 bg-gray-50 dark:bg-gray-800/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                    disabled={loading || !isFormValid()}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        Salvando...
                      </span>
                    ) : (
                      "Salvar Cliente"
                    )}
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
