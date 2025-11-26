"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Edit, PlusCircle, Search, Trash2, Filter, X, Eye } from "lucide-react";
import { getPercentualMeta, isFonteCorretor } from "@/lib/fontes-config";
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
} from "@/components/ui/dialog";

export default function ClientesPage() {
  console.log("🚀 Componente ClientesPage sendo renderizado");
  
  const { clientes, removerCliente, exportarParaCSV, exportarParaHTML, exportarClientesComPrevisao } = useClientes();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const searchParams = useSearchParams();
  
  // Função para verificar se o vendedor pode ver dados sensíveis do cliente
  const podeVerDadosSensiveis = (cliente: any) => {
    if (isAdmin) return true;
    if (user && user.role === "user") {
      // Vendedor pode ver apenas seus próprios clientes
      return cliente.usuarios === user.nome || cliente.criadoPor === user.nome;
    }
    return false;
  };
  
  console.log("📊 Estado inicial:", { 
    totalClientes: clientes.length, 
    isAdmin, 
    userId: user?.id 
  });

  // Debug removido para produção

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [mesFiltro, setMesFiltro] = useState("todos");
  const [dataEspecifica, setDataEspecifica] = useState("");
  const [dataPagamentoEspecifica, setDataPagamentoEspecifica] = useState("");
  const [mesPagamentoFiltro, setMesPagamentoFiltro] = useState("todos");
  const [usuarioFiltro, setUsuarioFiltro] = useState("todos");
  const [fonteFiltro, setFonteFiltro] = useState("todos");
  const [tipoFonteFiltro, setTipoFonteFiltro] = useState("todos");
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtrosRenderizados, setFiltrosRenderizados] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Ler parâmetros de URL para filtros automáticos
  useEffect(() => {
    const statusFromURL = searchParams.get('status');
    if (statusFromURL) {
      setStatusFiltro(statusFromURL);
      console.log("🔗 Filtro de status aplicado da URL:", statusFromURL);
    }
  }, [searchParams]);

  // Obter lista de meses únicos para filtros
  const mesesUnicos = [...new Set(clientes.map(c => c.mes))].sort();
  
  // Meses de pagamento (apenas para clientes pagos)
  const mesesPagamentoUnicos = [...new Set(clientes
    .filter(c => c.status === "pago" && c.data_pagamento)
    .map(c => {
      const dataPagamento = new Date(c.data_pagamento! + 'T00:00:00');
      return dataPagamento.toLocaleDateString('pt-BR', { month: 'long' });
    })
  )].sort();
  
  const usuariosUnicos = [...new Set(clientes.map(c => c.usuarios))].sort();
  const fontesUnicas = [...new Set(clientes.map(c => c.fonte))];

  // Controlar renderização dos filtros avançados
  useEffect(() => {
    if (mostrarFiltrosAvancados) {
      setFiltrosRenderizados(true);
    } else {
      const timer = setTimeout(() => {
        setFiltrosRenderizados(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mostrarFiltrosAvancados]);

  // DEBUG: Monitorar quando clientes são carregados
  useEffect(() => {
    console.log("📥 Clientes carregados:", clientes.length);
    if (clientes.length > 0) {
      console.log("🔍 Primeiro cliente:", clientes[0]);
    }
  }, [clientes]);

  // Função de busca SIMPLES e DIRETA
  const buscarCliente = (cliente: any, termoBusca: string) => {
    if (!termoBusca || termoBusca.trim() === '') return true;
    
    const busca = termoBusca.toLowerCase().trim();
    
    // DEBUG: Log detalhado para cada cliente
    console.log("🔍 Verificando cliente:", {
      nome: cliente.cliente,
      busca: busca,
      temCliente: !!cliente.cliente,
      tipoCliente: typeof cliente.cliente,
      match: cliente.cliente && cliente.cliente.toLowerCase().includes(busca)
    });
    
    // Busca direta no nome do cliente
    if (cliente.cliente && cliente.cliente.toLowerCase().includes(busca)) {
      console.log("✅ Match encontrado para:", cliente.cliente);
      return true;
    }
    
    // Busca no produto
    if (cliente.produto && cliente.produto.toLowerCase().includes(busca)) {
      console.log("✅ Match encontrado no produto:", cliente.produto);
      return true;
    }
    
    // Busca no banco
    if (cliente.banco && cliente.banco.toLowerCase().includes(busca)) {
      console.log("✅ Match encontrado no banco:", cliente.banco);
      return true;
    }
    
    // Busca na fonte
    if (cliente.fonte && cliente.fonte.toLowerCase().includes(busca)) {
      console.log("✅ Match encontrado na fonte:", cliente.fonte);
      return true;
    }
    
    console.log("❌ Nenhum match encontrado para:", cliente.cliente);
    return false;
  };

  // Filtragem SIMPLIFICADA
  const clientesFiltrados = clientes.filter((cliente) => {
    // DEBUG: Log para ver quantos clientes estão sendo processados
    if (busca && busca.trim() !== '') {
      console.log("🔍 Processando cliente:", cliente.cliente, "| Total de clientes:", clientes.length);
    }
    
    // 1. Verificar se pertence ao usuário (SIMPLIFICADO PARA TESTE)
    let pertenceAoUsuario = true;
    if (!isAdmin) {
      // Teste de comparação mais detalhado
      const comparacao = cliente.criadoPor === user?.id;
      console.log(`🔍 Cliente ${cliente.cliente}:`, {
        criadoPor: cliente.criadoPor,
        userId: user?.id,
        comparacao,
        tipoCriadoPor: typeof cliente.criadoPor,
        tipoUserId: typeof user?.id
      });
      
      pertenceAoUsuario = comparacao;
    }
    
    if (!pertenceAoUsuario) {
      console.log(`❌ Cliente ${cliente.cliente} não pertence ao usuário ${user?.id}. CriadoPor: ${cliente.criadoPor}`);
      return false;
    }
    console.log(`✅ Cliente ${cliente.cliente} pertence ao usuário ${user?.id}`);
    
    // 2. Verificar busca
    const buscaMatch = buscarCliente(cliente, busca);
    if (!buscaMatch) return false;
    
    // 3. Verificar outros filtros
    if (statusFiltro !== "todos" && cliente.status !== statusFiltro) return false;
    if (mesFiltro !== "todos" && cliente.mes !== mesFiltro) return false;
    if (dataEspecifica && cliente.data !== dataEspecifica) return false;
    if (dataPagamentoEspecifica && (!cliente.data_pagamento || cliente.data_pagamento !== dataPagamentoEspecifica)) return false;
    if (mesPagamentoFiltro !== "todos" && (!cliente.data_pagamento || new Date(cliente.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long' }) !== mesPagamentoFiltro)) return false;
    if (usuarioFiltro !== "todos" && cliente.usuarios !== usuarioFiltro) return false;
    if (fonteFiltro !== "todos" && cliente.fonte !== fonteFiltro) return false;
    if (tipoFonteFiltro !== "todos") {
      if (tipoFonteFiltro === "principal") {
        // Incluir fontes principais E corretores (que contam 50% para metas)
        return true; // Todos os clientes passam quando filtro é "principal"
      }
      if (tipoFonteFiltro === "corretor" && !cliente.fonte.includes("Corretor")) return false;
    }
    
    return true;
  });

  // DEBUG: Monitorar mudanças na busca (movido para depois da declaração)
  useEffect(() => {
    console.log("🔄 Busca mudou para:", busca);
    console.log("📊 Total de clientes filtrados:", clientesFiltrados.length);
  }, [busca, clientesFiltrados.length]);

  // DEBUG: Monitorar carregamento de clientes
  useEffect(() => {
    console.log("👤 Usuário atual:", user);
    console.log("📋 Total de clientes carregados:", clientes.length);
    console.log("🔍 Clientes filtrados:", clientesFiltrados.length);
    console.log("👥 É admin?", isAdmin);
    
    if (clientes.length > 0) {
      console.log("📝 Primeiro cliente:", clientes[0]);
      console.log("🏷️ Clientes por criador:", clientes.map(c => ({ cliente: c.cliente, criadoPor: c.criadoPor })));
      
      // Debug específico para comparação de IDs
      console.log("🔍 Debug IDs:", {
        userId: user?.id,
        userType: typeof user?.id,
        primeiroClienteCriadoPor: clientes[0].criadoPor,
        primeiroClienteCriadoPorType: typeof clientes[0].criadoPor,
        comparacao: user?.id === clientes[0].criadoPor
      });
      
      // Teste de comparação de IDs
      const testeIds = clientes.slice(0, 5).map(c => ({
        cliente: c.cliente,
        criadoPor: c.criadoPor,
        userId: user?.id,
        comparacao: c.criadoPor === user?.id,
        tipoCriadoPor: typeof c.criadoPor,
        tipoUserId: typeof user?.id
      }));
      console.log("🧪 Teste de comparação de IDs:", testeIds);
    }
  }, [clientes, clientesFiltrados, user, isAdmin]);

  // Debug removido para produção

  const limparFiltros = () => {
    setBusca("");
    setStatusFiltro("todos");
    setMesFiltro("todos");
    setDataEspecifica("");
    setDataPagamentoEspecifica("");
    setMesPagamentoFiltro("todos");
    setFonteFiltro("todos");
    setTipoFonteFiltro("todos");
    if (isAdmin) {
      setUsuarioFiltro("todos");
    }
  };

  const abrirModalCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  // Função para converter valor string para número
  function parseValor(valor: string) {
    try {
      if (typeof valor === "number") return valor;
      if (typeof valor === "string") {
        const valorLimpo = valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
        const numero = Number(valorLimpo);
        return isNaN(numero) ? 0 : numero;
      }
      return 0;
    } catch (error) {
      console.error("Erro ao parsear valor:", valor, error);
      return 0;
    }
  }

  // Totais baseados nos clientes filtrados
  const totalPago = clientesFiltrados
    .filter(c => c.status === "pago")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);
  const totalPendente = clientesFiltrados
    .filter(c => c.status === "pendente")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);
  const totalCancelado = clientesFiltrados
    .filter(c => c.status === "cancelado")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);

  // Calcular valores dos corretores (50%)
  const clientesCorretores = clientesFiltrados.filter(c => isFonteCorretor(c.fonte));
  const valorBrutoCorretores = clientesCorretores
    .filter(c => c.status === "pago")
    .reduce((acc, c) => acc + parseValor(c.valor), 0);
  const valorContadoCorretores = clientesCorretores
    .filter(c => c.status === "pago")
    .reduce((acc, c) => {
      const valor = parseValor(c.valor);
      const peso = getPercentualMeta(c.fonte);
      return acc + (valor * (isNaN(peso) ? 0 : peso));
    }, 0);

  // Total pago exibido: quando tipoFonteFiltro === "principal", ponderar corretores (50%)
  const totalPagoPonderado = clientesFiltrados
    .filter(c => c.status === "pago")
    .reduce((acc, c) => {
      const valor = parseValor(c.valor);
      const peso = getPercentualMeta(c.fonte);
      return acc + (isNaN(valor) ? 0 : valor * (isNaN(peso) ? 0 : peso));
    }, 0);
  const totalPagoExibido = tipoFonteFiltro === "principal" ? totalPagoPonderado : totalPago;

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
                {totalPagoExibido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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

          {/* Card de resumo por tipo de fonte - VERSÃO LIMPA */}
          <div className="mb-6">
            <Card className="bg-blue-50 border border-blue-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 flex items-center justify-center gap-2">
                    📊 Resumo por Tipo de Fonte
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {clientesFiltrados.length}
                      </div>
                      <div className="text-sm text-blue-700">Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {clientesFiltrados.filter(c => c.fonte && !c.fonte.includes("Corretor")).length}
                      </div>
                      <div className="text-sm text-green-700">Principais</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {clientesFiltrados.filter(c => c.fonte && c.fonte.includes("Corretor")).length}
                      </div>
                      <div className="text-sm text-amber-700">Corretores</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card de detalhamento dos corretores (50%) */}
          {clientesCorretores.length > 0 && (
            <div className="mb-6">
              <Card className="bg-amber-50 border border-amber-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-amber-900 flex items-center justify-center gap-2">
                      🏢 Corretores (50% para metas)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-2xl font-bold text-amber-600">
                          {clientesCorretores.length}
                        </div>
                        <div className="text-sm text-amber-700">Total Clientes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {valorBrutoCorretores.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                        <div className="text-sm text-orange-700">Valor Bruto</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {valorContadoCorretores.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                        <div className="text-sm text-green-700">Contou (50%)</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-amber-700">
                      💡 Corretores contribuem com 50% do valor para metas de vendas
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Card adicional para ADMIN - Estatísticas Gerais do Sistema */}
          {isAdmin && (
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <h3 className="text-lg font-semibold text-purple-900">
                      👑 Visão Geral do Sistema (Admin)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-900">
                        {clientes.length}
                      </div>
                      <div className="text-sm text-purple-700">
                        Total Geral
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-900">
                        {clientes.filter(c => c.fonte && !c.fonte.includes("Corretor")).length}
                      </div>
                      <div className="text-sm text-green-700">
                        Principais Geral
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-amber-900">
                        {clientes.filter(c => c.fonte && c.fonte.includes("Corretor")).length}
                      </div>
                      <div className="text-sm text-amber-700">
                        Corretores Geral
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-900">
                        {[...new Set(clientes.map(c => c.criadoPor))].length}
                      </div>
                      <div className="text-sm text-blue-700">
                        Vendedores Ativos
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-primary/10">
              <CardTitle className="text-2xl text-primary">
                Gerenciar Clientes {!isAdmin && "(Seus)"} {isAdmin && "(Todos)"}
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
                {clientesFiltrados.length > 0 && (
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => exportarParaCSV(clientesFiltrados)}
                  >
                    📊 Exportar CSV
                  </Button>
                )}
                {clientesFiltrados.length > 0 && (
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => exportarParaHTML(clientesFiltrados)}
                  >
                    🌐 Exportar HTML
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  onClick={exportarClientesComPrevisao}
                >
                  📅 Exportar com Previsão
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
                    onChange={(e) => {
                      const valor = e.target.value;
                      console.log("🔄 Input onChange chamado:", valor);
                      setBusca(valor);
                    }}
                  />
                  {/* Indicador de busca */}
                  {busca && (
                    <div className="absolute right-2 top-2 text-xs text-gray-500">
                      {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                {/* Indicador de busca ativa */}
                {busca && (
                  <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                    🔍 Busca ativa: "{busca}" - {clientesFiltrados.length} cliente(s) encontrado(s)
                  </div>
                )}
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

               {/* Indicador de debug da busca - REMOVIDO */}
               {/* {busca && (
                 <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                   <p className="text-sm text-yellow-800">
                     <strong>🔍 Busca Ativa:</strong> "{busca}" | 
                     Total de clientes: {clientes.length} | 
                     Filtrados: {clientesFiltrados.length} | 
                     Admin: {isAdmin ? "Sim" : "Não"} |
                     Renderizações: {renderCount}
                   </p>
                   <div className="mt-2 p-2 bg-white rounded border">
                     <p className="text-xs text-gray-600">
                       <strong>Teste Direto:</strong><br/>
                       Clientes com "{busca}" no nome: {
                         clientes.filter(c => buscarCliente(c, busca)).length
                       }<br/>
                       Primeiros 3 clientes: {
                         clientes.slice(0, 3).map(c => c.cliente).join(", ")
                       }
                     </p>
                   </div>
                   
                   <div className="mt-2 p-2 bg-blue-50 rounded border">
                     <p className="text-xs text-blue-600">
                       <strong>Estado da Busca:</strong><br/>
                       Valor atual: "{busca}"<br/>
                       Tipo: {typeof busca}<br/>
                       Comprimento: {busca.length}<br/>
                       É string vazia: {busca === "" ? "Sim" : "Não"}
                     </p>
                   </div>
                 </div>
               )} */}


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
                    {isAdmin && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Vendedor</label>
                        <Select value={usuarioFiltro} onValueChange={setUsuarioFiltro}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os vendedores" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">👥 Todos os vendedores</SelectItem>
                            {usuariosUnicos.map(usuario => (
                              <SelectItem key={usuario} value={usuario}>
                                👤 {usuario}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Filtro de Fonte (fontes individuais) */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Fonte</label>
                      <Select value={fonteFiltro} onValueChange={setFonteFiltro}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as fontes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as fontes</SelectItem>
                          {fontesUnicas.map(fonte => (
                            <SelectItem key={fonte} value={fonte}>{fonte}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro de Tipo de Fonte (Principais vs Corretores) - VERSÃO ATUALIZADA */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        {isAdmin ? "🔍 Tipo de Fontes" : "Tipo de Fontes"}
                      </label>
                      <Select value={tipoFonteFiltro} onValueChange={(value) => {
                        setTipoFonteFiltro(value);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">🌐 Todos os tipos</SelectItem>
                          <SelectItem value="principal">🎯 Principais + Corretores (contam para metas)</SelectItem>
                          <SelectItem value="corretor">⚠️ Corretores (não contam para metas)</SelectItem>
                          {isAdmin && (
                            <>
                              <SelectItem value="corretor-sim">⚠️ Apenas Corretores</SelectItem>
                              <SelectItem value="corretor-nao">🎯 Apenas Principais</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {/* Debug info */}
                      <div className="text-xs text-gray-500 mt-1">
                        Tipo atual: {tipoFonteFiltro} | isAdmin: {isAdmin ? "✅" : "❌"}
                      </div>
                    </div>

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
                          {(isAdmin || clientesFiltrados.some(c => podeVerDadosSensiveis(c))) && <TableHead>CPF</TableHead>}
                          {(isAdmin || clientesFiltrados.some(c => podeVerDadosSensiveis(c))) && <TableHead>Telefone</TableHead>}
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
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  cliente.fonte && cliente.fonte.includes("Corretor")
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-green-100 text-green-800 border border-green-200"
                                }`}>
                                  {cliente.fonte && cliente.fonte.includes("Corretor") ? "⚠️ Corretor" : "🎯 Principal"}
                                </span>
                                {cliente.fonte}
                              </div>
                            </TableCell>
                            <TableCell>{cliente.valor}</TableCell>
                            <TableCell>{cliente.data}</TableCell>
                            <TableCell>{cliente.mes}</TableCell>
                            <TableCell>{cliente.usuarios || cliente.criadoPor}</TableCell>
                            {podeVerDadosSensiveis(cliente) && <TableCell>{cliente.cpf || "-"}</TableCell>}
                            {podeVerDadosSensiveis(cliente) && <TableCell>{cliente.telefone || "-"}</TableCell>}
                            <TableCell>{cliente.observacoes || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => abrirModalCliente(cliente)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {isAdmin && (
                                  <>
                                    <Link href={`/clientes/editar/${cliente.id}`}>
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm("Tem certeza que deseja remover este cliente?")) {
                                          removerCliente(cliente.id);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    {fonteFiltro !== "todos" && `Filtrado por: ${fonteFiltro}`}
                    {fonteFiltro === "todos" && `Mostrando ${clientesFiltrados.length} cliente${clientesFiltrados.length !== 1 ? 's' : ''}`}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum cliente encontrado com os filtros aplicados.</p>
                  <Button variant="outline" onClick={limparFiltros} className="mt-2">
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal de Detalhes do Cliente */}
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Cliente</DialogTitle>
                <DialogDescription>
                  Informações completas sobre o cliente selecionado.
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
                    <div>
                      <label className="text-sm font-medium text-gray-700">Banco</label>
                      <p className="text-sm text-gray-900">{clienteSelecionado.banco}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Valor</label>
                      <p className="text-sm text-gray-900">{clienteSelecionado.valor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="text-sm text-gray-900">{clienteSelecionado.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Data</label>
                      <p className="text-sm text-gray-900">{clienteSelecionado.data}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mês</label>
                      <p className="text-sm text-gray-900">{clienteSelecionado.mes}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fonte</label>
                      <p className="text-sm text-gray-900">{clienteSelecionado.fonte}</p>
                    </div>
                    {podeVerDadosSensiveis(clienteSelecionado) && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-700">CPF</label>
                          <p className="text-sm text-gray-900">{clienteSelecionado.cpf || "-"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Telefone</label>
                          <p className="text-sm text-gray-900">{clienteSelecionado.telefone || "-"}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Observações</label>
                    <p className="text-sm text-gray-900">{clienteSelecionado.observacoes || "Nenhuma observação"}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarLayout>
    </ProtectedLayout>
  );
}