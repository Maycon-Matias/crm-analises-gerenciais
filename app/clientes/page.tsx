"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, PlusCircle, Search, Trash2, Filter, X, Eye, User } from "lucide-react";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedLayout } from "@/components/protected-layout";
import { SidebarLayout } from "@/components/sidebar-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClientesPage() {
  const { clientes, removerCliente } = useClientes();
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [mesFiltro, setMesFiltro] = useState("todos");
  const [dataEspecifica, setDataEspecifica] = useState("");
  const [dataPagamentoEspecifica, setDataPagamentoEspecifica] = useState("");
  const [mesPagamentoFiltro, setMesPagamentoFiltro] = useState("todos");
  const [usuarioFiltro, setUsuarioFiltro] = useState("todos");
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtrosRenderizados, setFiltrosRenderizados] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Obter lista de meses únicos para filtros
  const mesesUnicos = [...new Set(clientes.map(c => c.mes))].sort();
  const mesesPagamentoUnicos = [...new Set(clientes
    .filter(c => c.status === "pago" && c.data_pagamento)
    .map(c => {
      const dataPagamento = new Date(c.data_pagamento! + 'T00:00:00');
      return dataPagamento.toLocaleDateString('pt-BR', { month: 'long' });
    })
  )].sort();
  const usuariosUnicos = [...new Set(clientes.map(c => c.usuarios))].sort();

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

  const clientesFiltrados = clientes.filter(
    (cliente) => {
      const pertenceAoUsuario = user?.role === "admin" || cliente.criadoPor === user?.id;
      
      // Filtro de busca
      const buscaMatch =
        cliente.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.produto.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.banco.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.fonte.toLowerCase().includes(busca.toLowerCase());
      
      // Filtro de status
      const statusMatch = statusFiltro === "todos" || cliente.status === statusFiltro;
      
      // Filtro de mês de cadastro
      const mesMatch = mesFiltro === "todos" || cliente.mes === mesFiltro;
      
      // Filtro de data específica de cadastro
      const dataMatch = !dataEspecifica || cliente.data === dataEspecifica;
      
      // Filtro de data específica de pagamento
      const dataPagamentoMatch = !dataPagamentoEspecifica || 
        (cliente.status === "pago" && cliente.data_pagamento === dataPagamentoEspecifica);
      
      // Filtro de mês de pagamento
      const mesPagamentoMatch = mesPagamentoFiltro === "todos" || 
        (cliente.status === "pago" && cliente.data_pagamento && 
         new Date(cliente.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long' }) === mesPagamentoFiltro);
      
      // Filtro de usuário - apenas para administradores
      const usuarioMatch = user?.role === "admin" 
        ? (usuarioFiltro === "todos" || cliente.usuarios === usuarioFiltro)
        : true; // Para vendedores, sempre true pois só veem seus próprios clientes
      
      return pertenceAoUsuario && buscaMatch && statusMatch && mesMatch && 
             dataMatch && dataPagamentoMatch && mesPagamentoMatch && usuarioMatch;
    }
  );

  const limparFiltros = () => {
    setBusca("");
    setStatusFiltro("todos");
    setMesFiltro("todos");
    setDataEspecifica("");
    setDataPagamentoEspecifica("");
    setMesPagamentoFiltro("todos");
    // Só resetar filtro de usuário para administradores
    if (user?.role === "admin") {
      setUsuarioFiltro("todos");
    }
  };

  const abrirModalCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  // Função para converter valor string (ex: 'R$ 2.901,90') para número
  function parseValor(valor: string) {
    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      return Number(valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
    }
    return 0;
  }

  // Totais baseados nos clientes filtrados (não todos os clientes)
  const totalPago = clientesFiltrados
    .filter(c => c.status === "pago")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);
  const totalPendente = clientesFiltrados
    .filter(c => c.status === "pendente")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);
  const totalCancelado = clientesFiltrados
    .filter(c => c.status === "cancelado")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);

  return (
    <ProtectedLayout>
      <SidebarLayout>
        <div className="container mx-auto py-10 px-4">
          {/* Cards de resumo para todos os usuários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-lg p-6 flex flex-col items-start">
              <span className="text-gray-500 mb-2">Total Pago</span>
              <span className="text-green-600 text-2xl font-bold flex items-center gap-2">
                <span>✔️</span>
                {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="border rounded-lg p-6 flex flex-col items-start">
              <span className="text-gray-500 mb-2">Total Pendente</span>
              <span className="text-yellow-600 text-2xl font-bold flex items-center gap-2">
                <span>⏰</span>
                {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="border rounded-lg p-6 flex flex-col items-start">
              <span className="text-gray-500 mb-2">Total Cancelado</span>
              <span className="text-red-600 text-2xl font-bold flex items-center gap-2">
                <span>❌</span>
                {totalCancelado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-primary/10">
              <CardTitle className="text-2xl text-primary">Gerenciar Clientes</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
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
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
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
                    {/* Mês de Cadastro */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Mês de Cadastro</label>
                      <Select value={mesFiltro} onValueChange={setMesFiltro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os meses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os meses</SelectItem>
                          {mesesUnicos.map(mes => (
                            <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Data Específica de Cadastro */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Data de Cadastro</label>
                      <Input
                        type="date"
                        value={dataEspecifica}
                        onChange={(e) => setDataEspecifica(e.target.value)}
                        placeholder="dd/mm/aaaa"
                      />
                    </div>

                    {/* Data Específica de Pagamento */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Data de Pagamento</label>
                      <Input
                        type="date"
                        value={dataPagamentoEspecifica}
                        onChange={(e) => setDataPagamentoEspecifica(e.target.value)}
                        placeholder="dd/mm/aaaa"
                      />
                    </div>

                    {/* Mês de Pagamento */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Mês de Pagamento</label>
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

                    {/* Usuário - Apenas para Administradores */}
                    {user?.role === "admin" && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Usuário</label>
                        <Select value={usuarioFiltro} onValueChange={setUsuarioFiltro}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os usuários" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os usuários</SelectItem>
                            {usuariosUnicos.map(usuario => (
                              <SelectItem key={usuario} value={usuario}>{usuario}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Botão Limpar Filtros */}
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={limparFiltros}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Limpar Filtros
                      </Button>
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
                          {user?.role === "admin" && <TableHead>CPF</TableHead>}
                          {user?.role === "admin" && <TableHead>Telefone</TableHead>}
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
                            {user?.role === "admin" && (
                              <TableCell>
                                {cliente.cpf ? (
                                  <span className="text-sm text-gray-600">{cliente.cpf}</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </TableCell>
                            )}
                            {user?.role === "admin" && (
                              <TableCell>
                                {cliente.telefone ? (
                                  <span className="text-sm text-gray-600">{cliente.telefone}</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              {user?.role === "admin" ? (
                                cliente.observacoes ? (
                                  <div className="max-w-xs">
                                    <p className="text-sm text-gray-600 truncate" title={cliente.observacoes}>
                                      {cliente.observacoes}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {user?.role && user.role.toLowerCase() === "admin" ? (
                                <div className="flex justify-end gap-2">
                                  <Link href={`/clientes/editar/${cliente.id}`}>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="border-primary text-primary hover:bg-primary/10"
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removerCliente(cliente.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remover</span>
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => abrirModalCliente(cliente)}
                                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver dados</span>
                                  </Button>
                                </div>
                              )}
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

        {/* Modal para visualizar dados do cliente */}
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </DialogTitle>
              <DialogDescription>
                Informações detalhadas do cliente selecionado
              </DialogDescription>
            </DialogHeader>
            
            {clienteSelecionado && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cliente</label>
                    <p className="text-sm text-gray-900">{clienteSelecionado.cliente}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Produto</label>
                    <p className="text-sm text-gray-900">{clienteSelecionado.produto}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Banco</label>
                    <p className="text-sm text-gray-900">{clienteSelecionado.banco}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fonte</label>
                    <p className="text-sm text-gray-900">{clienteSelecionado.fonte}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Valor</label>
                    <p className="text-sm text-gray-900">
                      {(!isNaN(Number(clienteSelecionado.valor)) && clienteSelecionado.valor !== "") 
                        ? Number(clienteSelecionado.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
                        : clienteSelecionado.valor}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm text-gray-900 capitalize">{clienteSelecionado.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data</label>
                    <p className="text-sm text-gray-900">
                      {new Date(clienteSelecionado.data + 'T00:00:00').toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mês</label>
                    <p className="text-sm text-gray-900">{clienteSelecionado.mes}</p>
                  </div>
                </div>

                {clienteSelecionado.data_pagamento && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data do Pagamento</label>
                    <p className="text-sm text-gray-900">
                      {new Date(clienteSelecionado.data_pagamento + 'T00:00:00').toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Informações de Contato</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">CPF</label>
                      {clienteSelecionado.cpf ? (
                        <p className="text-sm text-gray-900">{clienteSelecionado.cpf}</p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Não informado</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Telefone</label>
                      {clienteSelecionado.telefone ? (
                        <p className="text-sm text-gray-900">{clienteSelecionado.telefone}</p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Não informado</p>
                      )}
                    </div>
                  </div>
                </div>

                {clienteSelecionado.observacoes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-700">Observações</label>
                    <p className="text-sm text-gray-900 mt-1">{clienteSelecionado.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
