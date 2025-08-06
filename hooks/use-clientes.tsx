"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Cliente } from "@/types/cliente";
import { opcoesPredefinidas } from "@/types/cliente";

type ClientesContextType = {
  clientes: Cliente[];
  adicionarCliente: (cliente: Omit<Cliente, "id" | "criadoPor" | "status">) => Promise<void>;
  atualizarCliente: (cliente: Cliente) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  marcarComoPago: (id: string, data_pagamento: string) => Promise<void>;
  marcarComoCancelado: (id: string) => Promise<void>;
  exportarParaCSV: () => void;
  opcoesPredefinidas: typeof opcoesPredefinidas;
};

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

export function ClientesProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const { user } = useAuth();

  const refetchClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(data);
    } catch {
      setClientes([]);
    }
  };

  useEffect(() => {
    refetchClientes();
  }, []);

  const adicionarCliente = async (
    cliente: Omit<Cliente, "id" | "criadoPor" | "status">
  ): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado");

    const novoCliente = {
      ...cliente,
      usuarios: user.nome,
      criadoPor: user.id,
      status: "pendente",
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

    const res = await fetch(`/api/clientes?id=${cliente.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao atualizar cliente.");
    }

    await refetchClientes();
  };

  const removerCliente = async (id: string) => {
    // Verificar permissões antes de remover
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    // Verificar se o usuário tem permissão para remover este cliente
    if (user?.role !== "admin" && cliente.criadoPor !== user?.id) {
      throw new Error("Você não tem permissão para remover este cliente.");
    }

    const res = await fetch(`/api/clientes?id=${id}`, { method: "DELETE" });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.error || "Erro ao remover cliente.");
    }

    await refetchClientes();
  };

  const marcarComoPago = async (id: string, data_pagamento: string) => {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;

    // Verificar se o usuário tem permissão para marcar como pago
    if (user?.role !== "admin" && cliente.criadoPor !== user?.id) {
      throw new Error("Você não tem permissão para alterar este cliente.");
    }

    const atualizado = { ...cliente, status: "pago", data_pagamento };

    const res = await fetch(`/api/clientes?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado),
    });

    if (!res.ok) throw new Error("Erro ao atualizar para pago.");

    await refetchClientes();
  };

  const marcarComoCancelado = async (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;

    // Verificar se o usuário tem permissão para marcar como cancelado
    if (user?.role !== "admin" && cliente.criadoPor !== user?.id) {
      throw new Error("Você não tem permissão para alterar este cliente.");
    }

    const atualizado = { ...cliente, status: "cancelado" };

    const res = await fetch(`/api/clientes?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atualizado),
    });

    if (!res.ok) throw new Error("Erro ao atualizar para cancelado.");

    await refetchClientes();
  };

  const exportarParaCSV = () => {
    // Função para limpar e normalizar texto
    const limparTexto = (texto: string): string => {
      if (!texto) return "";
      return texto
        .replace(/"/g, '""') // Escapar aspas duplas
        .replace(/\n/g, ' ') // Remover quebras de linha
        .replace(/\r/g, ' ') // Remover retornos de carro
        .trim();
    };

    // BOM (Byte Order Mark) para UTF-8 - garante que Excel reconheça acentos
    const BOM = '\uFEFF';
    
    const headers = ["Cliente", "Produto", "Banco", "Fonte", "Valor", "Data", "Mês", "Usuário", "Status"];
    const csvRows = [headers.join(";")]; // Usar ; em vez de , para melhor compatibilidade

    for (const c of clientes) {
      csvRows.push(
        [
          `"${limparTexto(c.cliente)}"`,
          `"${limparTexto(c.produto)}"`,
          `"${limparTexto(c.banco)}"`,
          `"${limparTexto(c.fonte)}"`,
          `"${limparTexto(c.valor)}"`,
          `"${limparTexto(c.data)}"`,
          `"${limparTexto(c.mes)}"`,
          `"${limparTexto(c.usuarios)}"`,
          `"${limparTexto(c.status)}"`,
        ].join(";")
      );
    }

    const csvContent = BOM + csvRows.join("\n");
    const blob = new Blob([csvContent], { 
      type: "text/csv;charset=utf-8;"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_pora_cred_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        adicionarCliente,
        atualizarCliente,
        removerCliente,
        marcarComoPago,
        marcarComoCancelado,
        exportarParaCSV,
        opcoesPredefinidas,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error("useClientes deve ser usado dentro de um ClientesProvider");
  }
  return context;
}
