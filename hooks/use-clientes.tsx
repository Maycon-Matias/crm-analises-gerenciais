"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Cliente, StatusCliente } from "@/types/cliente";
import { opcoesPredefinidas } from "@/types/cliente";
import { 
  isFontePrincipal, 
  isFonteCorretor, 
  getFonteCategoria,
  getFontesPrincipais,
  getFontesCorretor 
} from "@/lib/fontes-config";

type ClientesContextType = {
  clientes: Cliente[];
  adicionarCliente: (cliente: Omit<Cliente, "id" | "criadoPor" | "status">) => Promise<void>;
  atualizarCliente: (cliente: Cliente) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  marcarComoPago: (id: string, dataPagamento: string) => Promise<void>;
  marcarComoCancelado: (id: string) => Promise<void>;
  exportarParaCSV: (clientesParaExportar?: Cliente[]) => void;
  exportarParaHTML: (clientesParaExportar?: Cliente[]) => void;
  exportarClientesComPrevisao: () => void;
  opcoesPredefinidas: typeof opcoesPredefinidas;
  refetchClientes: () => Promise<void>;
  // NOVAS FUNÇÕES DE CATEGORIZAÇÃO
  getClientesPorCategoria: (categoria: 'principal' | 'corretor') => Cliente[];
  getVendasPrincipais: () => Cliente[];
  getVendasCorretor: () => Cliente[];
  getEstatisticasPorCategoria: () => {
    total: number;
    principal: number;
    corretor: number;
    valorTotal: number;
    valorPrincipal: number;
    valorCorretor: number;
  };
};

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

export function ClientesProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // CORREÇÃO: useCallback para evitar recriação da função
  const refetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Usar API diferente baseada no papel do usuário
      let apiUrl = "/api/clientes/todos";
      if (user?.role !== "admin" && user) {
        apiUrl = `/api/clientes/meus?userId=${user.id}&userRole=${user.role}`;
      }
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Verificar se a resposta tem a nova estrutura com paginação
      if (data.clientes && Array.isArray(data.clientes)) {
        // Nova estrutura: { clientes: [...], paginacao: {...}, filtros: {...} }
        setClientes(data.clientes);
      } else if (Array.isArray(data)) {
        // Estrutura antiga: array direto
        setClientes(data);
      } else {
        console.error("Formato de resposta inesperado:", data);
        setClientes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, user?.id]);

  // CORREÇÃO: useEffect otimizado com dependências corretas
  useEffect(() => {
    if (user) {
      refetchClientes();
    }
  }, [user?.id]); // Só recarrega quando o usuário muda

  // NOVAS FUNÇÕES DE CATEGORIZAÇÃO
  const getClientesPorCategoria = useCallback((categoria: 'principal' | 'corretor'): Cliente[] => {
    if (!user) return [];
    
    return clientes.filter(cliente => {
      if (categoria === 'principal') {
        return isFontePrincipal(cliente.fonte);
      } else {
        return isFonteCorretor(cliente.fonte);
      }
    });
  }, [clientes, user]);

  const getVendasPrincipais = useCallback((): Cliente[] => {
    return getClientesPorCategoria('principal');
  }, [getClientesPorCategoria]);

  const getVendasCorretor = useCallback((): Cliente[] => {
    return getClientesPorCategoria('corretor');
  }, [getClientesPorCategoria]);

  const getEstatisticasPorCategoria = useCallback(() => {
    const vendasPrincipais = getVendasPrincipais();
    const vendasCorretor = getVendasCorretor();
    
    // Função para calcular valor total de uma lista de clientes
    const calcularValorTotal = (clientes: Cliente[]): number => {
      return clientes.reduce((acc, cliente) => {
        try {
          const valor = Number.parseFloat(
            cliente.valor
              .replace("R$", "")
              .replace(/\./g, "")
              .replace(",", ".")
              .trim(),
          );
          return isNaN(valor) ? acc : acc + valor;
        } catch {
          return acc;
        }
      }, 0);
    };

    const total = clientes.length;
    const principal = vendasPrincipais.length;
    const corretor = vendasCorretor.length;
    const valorTotal = calcularValorTotal(clientes);
    const valorPrincipal = calcularValorTotal(vendasPrincipais);
    const valorCorretor = calcularValorTotal(vendasCorretor);

    return {
      total,
      principal,
      corretor,
      valorTotal,
      valorPrincipal,
      valorCorretor
    };
  }, [clientes, getVendasPrincipais, getVendasCorretor]);

  const adicionarCliente = async (
    cliente: Omit<Cliente, "id" | "criadoPor" | "status">
  ): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado");

    const novoCliente = {
      ...cliente,
      usuarios: user.nome,
      criadoPor: user.id,
      status: "pendente" as StatusCliente,
    };

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoCliente),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao cadastrar cliente.");
    }

    // CORREÇÃO: Refetch completo para garantir sincronização com o banco
    const clienteComId = await res.json();
    // Aguardar um pouco para garantir que o banco processou
    await new Promise(resolve => setTimeout(resolve, 500));
    // Refetch para garantir que os dados estão sincronizados
    await refetchClientes();
  };

  const atualizarCliente = async (cliente: Cliente) => {
    // Verificar permissões antes de atualizar
    const clienteOriginal = clientes.find((c) => c.id === cliente.id);
    if (!clienteOriginal) {
      throw new Error("Cliente não encontrado.");
    }

    // Verificar se o usuário tem permissão para editar este cliente
    if (user?.role !== "admin" && clienteOriginal.criadoPor !== user?.id) {
      throw new Error("Você não tem permissão para editar este cliente.");
    }

    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao atualizar cliente.");
    }

    // CORREÇÃO: Refetch completo para garantir sincronização
    await new Promise(resolve => setTimeout(resolve, 500));
    await refetchClientes();
  };

  const removerCliente = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    // Verificar permissões antes de remover
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    if (user.role !== "admin" && cliente.criadoPor !== user.id) {
      throw new Error("Você não tem permissão para remover este cliente.");
    }

    const res = await fetch(`/api/clientes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao remover cliente.");
    }

    // CORREÇÃO: Refetch completo para garantir sincronização
    await new Promise(resolve => setTimeout(resolve, 500));
    await refetchClientes();
  };

  const marcarComoPago = async (id: string, data_pagamento: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    if (user.role !== "admin" && cliente.criadoPor !== user.id) {
      throw new Error("Você não tem permissão para alterar este cliente.");
    }

    const res = await fetch(`/api/clientes/${id}/pago`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_pagamento }),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao marcar como pago.");
    }

    // Atualizar estado local
    setClientes(prev => prev.map(c => 
      c.id === id ? { ...c, status: "pago", data_pagamento } : c
    ));
  };

  const marcarComoCancelado = async (id: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    if (user.role !== "admin" && cliente.criadoPor !== user.id) {
      throw new Error("Você não tem permissão para alterar este cliente.");
    }

    const res = await fetch(`/api/clientes/${id}/cancelado`, {
      method: "PUT",
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao marcar como cancelado.");
    }

    // Atualizar estado local
    setClientes(prev => prev.map(c => 
      c.id === id ? { ...c, status: "cancelado" } : c
    ));
  };

  const exportarParaCSV = (clientesParaExportar?: Cliente[]) => {
    const clientesParaExportarFinal = clientesParaExportar || clientes;
    
    if (clientesParaExportarFinal.length === 0) {
      alert("Não há clientes para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Cliente",
      "Produto",
      "Banco",
      "Fonte",
      "Valor",
      "Status",
      "CPF",
      "Telefone",
      "Usuário",
      "Data de Cadastro",
      "Mês de Cadastro",
      "Data de Pagamento",
      "Observações"
    ];

    const csvContent = [
      headers.join(","),
      ...clientesParaExportarFinal.map(cliente => [
        cliente.id,
        `"${cliente.cliente || ''}"`,
        `"${cliente.produto || ''}"`,
        `"${cliente.banco || ''}"`,
        `"${cliente.fonte || ''}"`,
        `"${cliente.valor || ''}"`,
        cliente.status || '',
        `"${cliente.cpf || ''}"`,
        `"${cliente.telefone || ''}"`,
        `"${cliente.usuarios || ''}"`,
        cliente.data || '',
        cliente.mes || '',
        cliente.data_pagamento || '',
        `"${cliente.observacoes || ''}"`
      ].join(","))
    ].join("\n");

    const nomeArquivo = clientesParaExportar ? 'clientes_filtrados' : 'clientes';
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarParaHTML = (clientesParaExportar?: Cliente[]) => {
    const clientesParaExportarFinal = clientesParaExportar || clientes;
    
    if (clientesParaExportarFinal.length === 0) {
      alert("Não há clientes para exportar.");
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Clientes - ${new Date().toLocaleDateString('pt-BR')}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .filtro-info {
            background: #e0e7ff;
            color: #3730a3;
            padding: 15px 30px;
            text-align: center;
            border-bottom: 1px solid #c7d2fe;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8fafc;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .table-container {
            padding: 30px;
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 600;
            text-align: left;
            padding: 15px 12px;
            border-bottom: 2px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        tr:hover {
            background-color: #f1f5f9;
        }
        
        .status-pago {
            background: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-pendente {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-cancelado {
            background: #fee2e2;
            color: #991b1b;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .valor {
            font-weight: 600;
            color: #059669;
        }
        
        .fonte {
            background: #e0e7ff;
            color: #3730a3;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
            .header { background: #667eea !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Relatório de Clientes</h1>
            <p>Gerado em ${new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
        </div>
        
        ${clientesParaExportar ? `
        <div class="filtro-info">
            <strong>📋 Relatório Filtrado:</strong> ${clientesParaExportarFinal.length} cliente(s) encontrado(s) com os filtros aplicados
        </div>
        ` : ''}
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${clientesParaExportarFinal.length}</div>
                <div class="stat-label">Total de Clientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${clientesParaExportarFinal.filter(c => c.status === 'pago').length}</div>
                <div class="stat-label">Clientes Pagos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${clientesParaExportarFinal.filter(c => c.status === 'pendente').length}</div>
                <div class="stat-label">Clientes Pendentes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${clientesParaExportarFinal.filter(c => c.status === 'cancelado').length}</div>
                <div class="stat-label">Clientes Cancelados</div>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Produto</th>
                        <th>Banco</th>
                        <th>Fonte</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Usuário</th>
                        <th>Data Cadastro</th>
                        <th>Mês</th>
                        <th>Data Pagamento</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientesParaExportarFinal.map(cliente => `
                        <tr>
                            <td style="font-family: monospace; font-size: 0.8rem;">${cliente.id || ''}</td>
                            <td><strong>${cliente.cliente || ''}</strong></td>
                            <td>${cliente.produto || ''}</td>
                            <td>${cliente.banco || ''}</td>
                            <td><span class="fonte">${cliente.fonte || ''}</span></td>
                            <td class="valor">${cliente.valor || ''}</td>
                            <td><span class="status-${cliente.status || 'pendente'}">${cliente.status || 'pendente'}</span></td>
                            <td>${cliente.cpf || ''}</td>
                            <td>${cliente.telefone || ''}</td>
                            <td>${cliente.usuarios || ''}</td>
                            <td>${cliente.data || ''}</td>
                            <td>${cliente.mes || ''}</td>
                            <td>${cliente.data_pagamento || ''}</td>
                            <td>${cliente.observacoes || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Sistema CRM - Relatório gerado automaticamente</p>
        </div>
    </div>
</body>
</html>`;

    const nomeArquivo = clientesParaExportar ? 'relatorio_clientes_filtrados' : 'relatorio_clientes';
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarClientesComPrevisao = () => {
    // Filtrar apenas clientes que têm data_previsao_pagamento definida
    const clientesComPrevisao = clientes.filter(cliente => 
      cliente.data_previsao_pagamento && cliente.data_previsao_pagamento.trim() !== ''
    );
    
    if (clientesComPrevisao.length === 0) {
      alert("Não há clientes com previsão de pagamento para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Cliente",
      "Produto",
      "Banco",
      "Fonte",
      "Valor",
      "Status",
      "CPF",
      "Telefone",
      "Usuário",
      "Data de Cadastro",
      "Mês de Cadastro",
      "Data de Previsão de Pagamento",
      "Data de Pagamento",
      "Observações"
    ];

    const csvContent = [
      headers.join(","),
      ...clientesComPrevisao.map(cliente => [
        cliente.id,
        `"${cliente.cliente || ''}"`,
        `"${cliente.produto || ''}"`,
        `"${cliente.banco || ''}"`,
        `"${cliente.fonte || ''}"`,
        `"${cliente.valor || ''}"`,
        cliente.status || '',
        `"${cliente.cpf || ''}"`,
        `"${cliente.telefone || ''}"`,
        `"${cliente.usuarios || ''}"`,
        cliente.data || '',
        cliente.mes || '',
        cliente.data_previsao_pagamento || '',
        cliente.data_pagamento || '',
        `"${cliente.observacoes || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_com_previsao_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value: ClientesContextType = {
    clientes,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    marcarComoPago,
    marcarComoCancelado,
    exportarParaCSV,
    exportarParaHTML,
    exportarClientesComPrevisao,
    opcoesPredefinidas,
    refetchClientes,
    getClientesPorCategoria,
    getVendasPrincipais,
    getVendasCorretor,
    getEstatisticasPorCategoria,
  };

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (context === undefined) {
    throw new Error("useClientes deve ser usado dentro de um ClientesProvider");
  }
  return context;
}