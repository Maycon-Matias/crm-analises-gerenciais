"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ProtectedLayout } from "@/components/protected-layout";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import {
  Edit,
  FileSpreadsheet,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  CheckCircle,
  X,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";
import type { FiltrosCliente } from "@/types/cliente";

export default function AdminClientesPage() {
  const {
    clientes,
    removerCliente,
    marcarComoPago,
    marcarComoCancelado,
    exportarParaCSV,
  } = useClientes();
  const { users } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<FiltrosCliente>({
    mes: "todos",
    dia: "",
    usuario: "todos",
    status: "todos",
  });
  const [dataPagamentoEspecifica, setDataPagamentoEspecifica] = useState("");
  const [mesPagamentoFiltro, setMesPagamentoFiltro] = useState("todos");
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtrosRenderizados, setFiltrosRenderizados] = useState(false);
  const [produtoFiltro, setProdutoFiltro] = useState("todos");
  const [bancoFiltro, setBancoFiltro] = useState("todos");
  const [fonteFiltro, setFonteFiltro] = useState("todos");
  const [valorMinimo, setValorMinimo] = useState("");
  const [valorMaximo, setValorMaximo] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [dataPagamentoInicial, setDataPagamentoInicial] = useState("");
  const [dataPagamentoFinal, setDataPagamentoFinal] = useState("");

  const vendedores = users.filter((user) => user.role === "user");

  // Controlar renderização dos filtros avançados
  useEffect(() => {
    if (mostrarFiltrosAvancados) {
      setFiltrosRenderizados(true);
    } else {
      // Delay para permitir animação de saída
      const timer = setTimeout(() => {
        setFiltrosRenderizados(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mostrarFiltrosAvancados]);

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

  // Obter listas únicas para filtros
  const produtosUnicos = [...new Set(clientes.map(c => c.produto))].sort();
  const bancosUnicos = [...new Set(clientes.map(c => c.banco))].sort();
  const fontesUnicos = [...new Set(clientes.map(c => c.fonte))].sort();

  // Obter meses de pagamento únicos
  const mesesPagamentoUnicos = useMemo(() => {
    return [...new Set(clientes
      .filter(c => c.status === "pago" && c.data_pagamento)
      .map(c => {
        const dataPagamento = new Date(c.data_pagamento! + 'T00:00:00');
        return dataPagamento.toLocaleDateString('pt-BR', { month: 'long' });
      })
    )].sort();
  }, [clientes]);

  // Função para converter valor string para número
  const parseValor = (valor: string) => {
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      return Number(valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
    }
    return 0;
  };

  // Aplicar filtros
  const clientesFiltrados = useMemo(() => {
    let resultado = clientes;

    // Aplicar filtros apenas se não forem "todos"
    if (filtros.mes && filtros.mes !== "todos") {
      resultado = resultado.filter((cliente) => {
        // Para pagos, usar data_pagamento se disponível, senão usar data de cadastro
        const dataCliente = cliente.status === "pago" && cliente.data_pagamento 
          ? new Date(cliente.data_pagamento + 'T00:00:00')
          : new Date(cliente.data + 'T00:00:00');
        const mesCliente = dataCliente.toLocaleDateString("pt-BR", {
          month: "long",
        });
        return mesCliente.toLowerCase() === filtros.mes?.toLowerCase();
      });
    }

    if (filtros.dia) {
      resultado = resultado.filter((cliente) => {
        // Para pagos, usar data_pagamento se disponível, senão usar data de cadastro
        const dataCliente = cliente.status === "pago" && cliente.data_pagamento 
          ? cliente.data_pagamento
          : cliente.data;
        return dataCliente === filtros.dia;
      });
    }

    // Filtro de data específica de pagamento
    if (dataPagamentoEspecifica) {
      resultado = resultado.filter((cliente) => {
        return cliente.status === "pago" && cliente.data_pagamento === dataPagamentoEspecifica;
      });
    }

    // Filtro de mês de pagamento
    if (mesPagamentoFiltro !== "todos") {
      resultado = resultado.filter((cliente) => {
        return cliente.status === "pago" && cliente.data_pagamento && 
               new Date(cliente.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long' }) === mesPagamentoFiltro;
      });
    }

    // Filtro de produto
    if (produtoFiltro !== "todos") {
      resultado = resultado.filter((cliente) => {
        return cliente.produto === produtoFiltro;
      });
    }

    // Filtro de banco
    if (bancoFiltro !== "todos") {
      resultado = resultado.filter((cliente) => {
        return cliente.banco === bancoFiltro;
      });
    }

    // Filtro de fonte
    if (fonteFiltro !== "todos") {
      resultado = resultado.filter((cliente) => {
        return cliente.fonte === fonteFiltro;
      });
    }

    // Filtro de valor mínimo
    if (valorMinimo) {
      resultado = resultado.filter((cliente) => {
        const valorCliente = parseValor(cliente.valor);
        return valorCliente >= parseValor(valorMinimo);
      });
    }

    // Filtro de valor máximo
    if (valorMaximo) {
      resultado = resultado.filter((cliente) => {
        const valorCliente = parseValor(cliente.valor);
        return valorCliente <= parseValor(valorMaximo);
      });
    }

    // Filtro de período de cadastro
    if (dataInicial) {
      resultado = resultado.filter((cliente) => {
        const dataCliente = new Date(cliente.data);
        const dataInicialObj = new Date(dataInicial);
        return dataCliente >= dataInicialObj;
      });
    }

    if (dataFinal) {
      resultado = resultado.filter((cliente) => {
        const dataCliente = new Date(cliente.data);
        const dataFinalObj = new Date(dataFinal);
        return dataCliente <= dataFinalObj;
      });
    }

    // Filtro de período de pagamento
    if (dataPagamentoInicial) {
      resultado = resultado.filter((cliente) => {
        return cliente.status === "pago" && cliente.data_pagamento && 
               new Date(cliente.data_pagamento) >= new Date(dataPagamentoInicial);
      });
    }

    if (dataPagamentoFinal) {
      resultado = resultado.filter((cliente) => {
        return cliente.status === "pago" && cliente.data_pagamento && 
               new Date(cliente.data_pagamento) <= new Date(dataPagamentoFinal);
      });
    }

    if (filtros.usuario && filtros.usuario !== "todos") {
      resultado = resultado.filter(
        (cliente) => cliente.usuarios.toLowerCase() === filtros.usuario?.toLowerCase(),
      );
    }

    if (filtros.status && filtros.status !== "todos") {
      resultado = resultado.filter(
        (cliente) => cliente.status === filtros.status,
      );
    }

    // Aplicar busca por texto
    if (busca) {
      resultado = resultado.filter(
        (cliente) =>
          cliente.cliente.toLowerCase().includes(busca.toLowerCase()) ||
          cliente.produto.toLowerCase().includes(busca.toLowerCase()) ||
          cliente.banco.toLowerCase().includes(busca.toLowerCase()) ||
          cliente.fonte.toLowerCase().includes(busca.toLowerCase()),
      );
    }

    return resultado;
  }, [clientes, filtros, busca, dataPagamentoEspecifica, mesPagamentoFiltro, produtoFiltro, bancoFiltro, fonteFiltro, valorMinimo, valorMaximo, dataInicial, dataFinal, dataPagamentoInicial, dataPagamentoFinal]);

  // Calcular totais
  const totais = useMemo(() => {
    const totalPago = clientesFiltrados
      .filter((c) => c.status === "pago")
      .reduce((acc, cliente) => {
        const valor = Number.parseFloat(
          cliente.valor
            .replace("R$", "")
            .replace(".", "")
            .replace(",", ".")
            .trim(),
        );
        return isNaN(valor) ? acc : acc + valor;
      }, 0);

    const totalPendente = clientesFiltrados
      .filter((c) => c.status === "pendente")
      .reduce((acc, cliente) => {
        const valor = Number.parseFloat(
          cliente.valor
            .replace("R$", "")
            .replace(".", "")
            .replace(",", ".")
            .trim(),
        );
        return isNaN(valor) ? acc : acc + valor;
      }, 0);

    const totalCancelado = clientesFiltrados
      .filter((c) => c.status === "cancelado")
      .reduce((acc, cliente) => {
        const valor = Number.parseFloat(
          cliente.valor
            .replace("R$", "")
            .replace(".", "")
            .replace(",", ".")
            .trim(),
        );
        return isNaN(valor) ? acc : acc + valor;
      }, 0);

    return { totalPago, totalPendente, totalCancelado };
  }, [clientesFiltrados]);

  const limparFiltros = () => {
    setFiltros({
      mes: "todos",
      dia: "",
      usuario: "todos",
      status: "todos",
    });
    setBusca("");
    setDataPagamentoEspecifica("");
    setMesPagamentoFiltro("todos");
    setProdutoFiltro("todos");
    setBancoFiltro("todos");
    setFonteFiltro("todos");
    setValorMinimo("");
    setValorMaximo("");
    setDataInicial("");
    setDataFinal("");
    setDataPagamentoInicial("");
    setDataPagamentoFinal("");
  };

  return (
    <ProtectedLayout adminOnly>
      <SidebarLayout>
        <div className="container mx-auto py-10 px-4">
          {/* Cards de Totais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {totais.totalPago.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <div className="text-2xl font-bold text-amber-600">
                    {totais.totalPendente.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Cancelado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div className="text-2xl font-bold text-red-600">
                    {totais.totalCancelado.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-primary/10">
              <CardTitle className="text-2xl text-primary">
                Gerenciar Clientes
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={exportarParaCSV}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Link href="/clientes/novo">
                  <Button className="bg-primary hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Cliente
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Filtros Básicos */}
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar clientes..."
                    className="pl-8"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros Avançados */}
              {filtrosRenderizados && (
                <div className={`mb-6 p-4 bg-gray-50 rounded-lg border transition-all duration-200 ${
                  mostrarFiltrosAvancados ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Seção 1: Filtros de Cadastro */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700 border-b pb-2">Filtros de Cadastro</h3>
                      
                      {/* Mês de Cadastro */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Mês de Cadastro</Label>
                        <Select value={filtros.mes} onValueChange={(value) => setFiltros(prev => ({ ...prev, mes: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os meses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os meses</SelectItem>
                            {meses.map(mes => (
                              <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Data Específica de Cadastro */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Data de Cadastro</Label>
                        <Input
                          type="date"
                          value={filtros.dia}
                          onChange={(e) => setFiltros(prev => ({ ...prev, dia: e.target.value }))}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>

                      {/* Período de Cadastro */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Data Inicial</Label>
                          <Input
                            type="date"
                            value={dataInicial}
                            onChange={(e) => setDataInicial(e.target.value)}
                            placeholder="dd/mm/aaaa"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Data Final</Label>
                          <Input
                            type="date"
                            value={dataFinal}
                            onChange={(e) => setDataFinal(e.target.value)}
                            placeholder="dd/mm/aaaa"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção 2: Filtros de Pagamento */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700 border-b pb-2">Filtros de Pagamento</h3>
                      
                      {/* Data Específica de Pagamento */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Data de Pagamento</Label>
                        <Input
                          type="date"
                          value={dataPagamentoEspecifica}
                          onChange={(e) => setDataPagamentoEspecifica(e.target.value)}
                          placeholder="dd/mm/aaaa"
                        />
                      </div>

                      {/* Mês de Pagamento */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Mês de Pagamento</Label>
                        <Select value={mesPagamentoFiltro} onValueChange={setMesPagamentoFiltro}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os meses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os meses</SelectItem>
                            {mesesPagamentoUnicos.map(mes => (
                              <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Período de Pagamento */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Data Pagto. Inicial</Label>
                          <Input
                            type="date"
                            value={dataPagamentoInicial}
                            onChange={(e) => setDataPagamentoInicial(e.target.value)}
                            placeholder="dd/mm/aaaa"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Data Pagto. Final</Label>
                          <Input
                            type="date"
                            value={dataPagamentoFinal}
                            onChange={(e) => setDataPagamentoFinal(e.target.value)}
                            placeholder="dd/mm/aaaa"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção 3: Filtros de Negócio */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700 border-b pb-2">Filtros de Negócio</h3>
                      
                      {/* Produto */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Produto</Label>
                        <Select value={produtoFiltro} onValueChange={setProdutoFiltro}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os produtos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os produtos</SelectItem>
                            {produtosUnicos.map(produto => (
                              <SelectItem key={produto} value={produto}>{produto}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Banco */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Banco</Label>
                        <Select value={bancoFiltro} onValueChange={setBancoFiltro}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os bancos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os bancos</SelectItem>
                            {bancosUnicos.map(banco => (
                              <SelectItem key={banco} value={banco}>{banco}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fonte */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Fonte</Label>
                        <Select value={fonteFiltro} onValueChange={setFonteFiltro}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as fontes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todas as fontes</SelectItem>
                            {fontesUnicos.map(fonte => (
                              <SelectItem key={fonte} value={fonte}>{fonte}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Seção 4: Filtros de Valor e Usuário */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700 border-b pb-2">Filtros Adicionais</h3>
                      
                      {/* Faixa de Valores */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Valor Mínimo</Label>
                          <Input
                            type="text"
                            value={valorMinimo}
                            onChange={(e) => setValorMinimo(e.target.value)}
                            placeholder="R$ 0,00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Valor Máximo</Label>
                          <Input
                            type="text"
                            value={valorMaximo}
                            onChange={(e) => setValorMaximo(e.target.value)}
                            placeholder="R$ 999.999,99"
                          />
                        </div>
                      </div>

                      {/* Usuário */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-1 block">Usuário</Label>
                        <Select value={filtros.usuario} onValueChange={(value) => setFiltros(prev => ({ ...prev, usuario: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os usuários" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os usuários</SelectItem>
                            {vendedores.map(vendedor => (
                              <SelectItem key={vendedor.id} value={vendedor.nome}>{vendedor.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Botão Limpar Filtros */}
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          onClick={limparFiltros}
                          className="flex items-center gap-2 w-full"
                        >
                          <X className="h-4 w-4" />
                          Limpar Todos os Filtros
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {clientesFiltrados.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary/5">
                          <TableHead>Cliente</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Banco</TableHead>
                          <TableHead>Fonte</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Mês</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Observações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientesFiltrados.map((cliente) => (
                          <TableRow key={cliente.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                              <span
                                title={cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                                className={`inline-block w-3 h-3 rounded-full
                                  ${cliente.status === "pago" ? "bg-green-500" : ""}
                                  ${cliente.status === "pendente" ? "bg-yellow-400" : ""}
                                  ${cliente.status === "cancelado" ? "bg-red-500" : ""}
                                `}
                              />
                              {cliente.cliente}
                            </TableCell>
                            <TableCell>{cliente.produto}</TableCell>
                            <TableCell>{cliente.banco}</TableCell>
                            <TableCell>{cliente.fonte}</TableCell>
                            <TableCell>{(!isNaN(Number(cliente.valor)) && cliente.valor !== "") ? Number(cliente.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : cliente.valor}</TableCell>
                            <TableCell>
                              {cliente.status === "pago"
                                ? (cliente.data_pagamento
                                    ? new Date(cliente.data_pagamento + 'T00:00:00').toLocaleDateString("pt-BR")
                                    : new Date(cliente.data + 'T00:00:00').toLocaleDateString("pt-BR") + " (s/ data pagto)" )
                                : new Date(cliente.data + 'T00:00:00').toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>{cliente.mes}</TableCell>
                            <TableCell>{cliente.usuarios || "-"}</TableCell>
                            <TableCell>
                              {cliente.cpf ? (
                                <span className="text-sm text-gray-600">{cliente.cpf}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {cliente.telefone ? (
                                <span className="text-sm text-gray-600">{cliente.telefone}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {cliente.observacoes ? (
                                <div className="max-w-xs">
                                  <p className="text-sm text-gray-600 truncate" title={cliente.observacoes}>
                                    {cliente.observacoes}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/clientes/editar/${cliente.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                  {cliente.status === "pendente" && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const hoje = new Date();
                                        const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
                                        marcarComoPago(cliente.id, dataHoje);
                                      }}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Marcar como pago
                                    </DropdownMenuItem>
                                  )}
                                  {cliente.status === "pendente" && (
                                    <DropdownMenuItem
                                      onClick={() => marcarComoCancelado(cliente.id)}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancelar
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => removerCliente(cliente.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Mostrando {clientesFiltrados.length} de {clientes.length} clientes
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum cliente encontrado com os filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
