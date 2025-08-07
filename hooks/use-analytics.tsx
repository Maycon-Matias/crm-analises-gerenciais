"use client";

import type React from "react";

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { useClientes } from "@/hooks/use-clientes";
import { useAuth } from "@/hooks/use-auth";
import type {
  Meta,
  RegraComissao,
  ComissaoCalculada,
  VendaPorPeriodo,
  VendaPorProduto,
  ProgressoMeta,
  RegraComissaoBanco,
} from "@/types/analytics";

type AnalyticsContextType = {
  metas: Meta[];
  regrasComissao: RegraComissao[];
  regrasComissaoBanco: RegraComissaoBanco[];
  adicionarMeta: (meta: Omit<Meta, "id" | "criadaEm">) => void;
  atualizarMeta: (meta: Meta) => void;
  removerMeta: (id: string) => void;
  adicionarRegraComissao: (regra: Omit<RegraComissao, "id">) => void;
  atualizarRegraComissao: (regra: RegraComissao) => void;
  removerRegraComissao: (id: string) => void;
  adicionarRegraComissaoBanco: (regra: Omit<RegraComissaoBanco, "id">) => void;
  atualizarRegraComissaoBanco: (regra: RegraComissaoBanco) => void;
  removerRegraComissaoBanco: (id: string) => void;
  calcularComissoes: (mes: string, ano: number) => ComissaoCalculada[];
  obterVendasPorPeriodo: (
    periodo: "semanal" | "quinzenal" | "mensal",
  ) => VendaPorPeriodo[];
  obterVendasPorProduto: (mes?: string, ano?: number) => VendaPorProduto[];
  obterProgressoMetas: (mes: string, ano: number) => ProgressoMeta[];
  // Novas funcionalidades
  obterEstatisticasGerais: () => {
    totalVendas: number;
    totalClientes: number;
    ticketMedio: number;
    taxaConversao: number;
    vendasPorStatus: { status: string; quantidade: number; valor: number }[];
  };
  obterTendencias: () => {
    crescimentoMensal: number;
    produtosMaisVendidos: VendaPorProduto[];
    vendedoresTop: { usuario: string; vendas: number; valor: number }[];
  };
  exportarDados: (tipo: 'vendas' | 'metas' | 'comissoes') => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

// Função utilitária para parsear valores monetários
const parsearValor = (valor: string): number => {
  if (!valor) return 0;
  
  // Se já é um número, retornar diretamente
  if (typeof valor === 'number') return valor;
  
  // Limpar o valor
  let valorLimpo = valor.toString()
    .replace(/R\$\s*/g, "") // Remove R$ e espaços
    .replace(/\./g, "") // Remove pontos (separadores de milhares)
    .replace(",", ".") // Substitui vírgula por ponto
    .trim();
  
  const numero = Number.parseFloat(valorLimpo);
  

  
  return isNaN(numero) ? 0 : numero;
};

// Função utilitária para obter data do cliente
const obterDataCliente = (cliente: any): Date => {
  if (cliente.status === "pago" && cliente.data_pagamento) {
    return new Date(cliente.data_pagamento + 'T00:00:00');
  }
  return new Date(cliente.data + 'T00:00:00');
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [regrasComissao, setRegrasComissao] = useState<RegraComissao[]>([]);
  const [regrasComissaoBanco, setRegrasComissaoBanco] = useState<
    RegraComissaoBanco[]
  >([]);
  const { clientes } = useClientes();
  const { users } = useAuth();

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const metasSalvas = localStorage.getItem("metas");
      if (metasSalvas) {
        setMetas(JSON.parse(metasSalvas));
      } else {
        // Metas de exemplo
        const metasExemplo: Meta[] = [
          {
            id: "1",
            usuario: "Amanda",
            mes: "Janeiro",
            ano: 2024,
            valorMeta: 50000,
            criadaEm: "2024-01-01",
            tipo: "valor",
          },
          {
            id: "2",
            usuario: "Lais",
            mes: "Janeiro",
            ano: 2024,
            valorMeta: 45000,
            criadaEm: "2024-01-01",
            tipo: "valor",
          },
        ];
        setMetas(metasExemplo);
        localStorage.setItem("metas", JSON.stringify(metasExemplo));
      }

      const regrasSalvas = localStorage.getItem("regrasComissao");
      if (regrasSalvas) {
        setRegrasComissao(JSON.parse(regrasSalvas));
      } else {
        // Regras de comissão de exemplo
        const regrasExemplo: RegraComissao[] = [
          { id: "1", produto: "Margem", percentual: 2.5, ativa: true, tipo: "produto" },
          { id: "2", produto: "Cartão", percentual: 3.0, ativa: true, tipo: "produto" },
          { id: "3", produto: "Portabilidade", percentual: 2.0, ativa: true, tipo: "produto" },
          { id: "4", produto: "FGTS", percentual: 4.0, ativa: true, tipo: "produto" },
          { id: "5", produto: "Consignado Priv", percentual: 3.5, ativa: true, tipo: "produto" },
        ];
        setRegrasComissao(regrasExemplo);
        localStorage.setItem("regrasComissao", JSON.stringify(regrasExemplo));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do analytics:", error);
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    try {
      localStorage.setItem("metas", JSON.stringify(metas));
    } catch (error) {
      console.error("Erro ao salvar metas:", error);
    }
  }, [metas]);

  useEffect(() => {
    try {
      localStorage.setItem("regrasComissao", JSON.stringify(regrasComissao));
    } catch (error) {
      console.error("Erro ao salvar regras de comissão:", error);
    }
  }, [regrasComissao]);

  // Memoizar dados processados para melhor performance
  const dadosProcessados = useMemo(() => {
    const clientesPagos = clientes.filter(c => c.status === "pago");
    const clientesPendentes = clientes.filter(c => c.status === "pendente");
    const clientesCancelados = clientes.filter(c => c.status === "cancelado");

    return {
      clientesPagos,
      clientesPendentes,
      clientesCancelados,
      totalClientes: clientes.length,
      totalVendas: clientesPagos.reduce((acc, c) => acc + parsearValor(c.valor), 0),
    };
  }, [clientes]);

  const adicionarMeta = useCallback((meta: Omit<Meta, "id" | "criadaEm">) => {
    const novaMeta: Meta = {
      ...meta,
      id: crypto.randomUUID(),
      criadaEm: new Date().toISOString(),
      tipo: "valor",
    };
    setMetas((prev) => [...prev, novaMeta]);
  }, []);

  const atualizarMeta = useCallback((metaAtualizada: Meta) => {
    setMetas((prev) =>
      prev.map((meta) =>
        meta.id === metaAtualizada.id ? metaAtualizada : meta,
      ),
    );
  }, []);

  const removerMeta = useCallback((id: string) => {
    setMetas((prev) => prev.filter((meta) => meta.id !== id));
  }, []);

  const adicionarRegraComissao = useCallback((regra: Omit<RegraComissao, "id">) => {
    const novaRegra: RegraComissao = {
      ...regra,
      id: crypto.randomUUID(),
    };
    setRegrasComissao((prev) => [...prev, novaRegra]);
  }, []);

  const atualizarRegraComissao = useCallback((regraAtualizada: RegraComissao) => {
    setRegrasComissao((prev) =>
      prev.map((regra) =>
        regra.id === regraAtualizada.id ? regraAtualizada : regra,
      ),
    );
  }, []);

  const removerRegraComissao = useCallback((id: string) => {
    setRegrasComissao((prev) => prev.filter((regra) => regra.id !== id));
  }, []);

  const adicionarRegraComissaoBanco = useCallback((
    regra: Omit<RegraComissaoBanco, "id">,
  ) => {
    const novaRegra: RegraComissaoBanco = {
      ...regra,
      id: crypto.randomUUID(),
    };
    setRegrasComissaoBanco((prev) => [...prev, novaRegra]);
  }, []);

  const atualizarRegraComissaoBanco = useCallback((regraAtualizada: RegraComissaoBanco) => {
    setRegrasComissaoBanco((prev) =>
      prev.map((regra) =>
        regra.id === regraAtualizada.id ? regraAtualizada : regra,
      ),
    );
  }, []);

  const removerRegraComissaoBanco = useCallback((id: string) => {
    setRegrasComissaoBanco((prev) => prev.filter((regra) => regra.id !== id));
  }, []);

  const calcularComissoes = useCallback((mes: string, ano: number): ComissaoCalculada[] => {
    const vendedores = users.filter((user) => user.role === "user");
    const comissoes: ComissaoCalculada[] = [];

    for (const vendedor of vendedores) {
      const vendasVendedor = clientes.filter((cliente) => {
        const dataCliente = obterDataCliente(cliente);
        const mesCliente = dataCliente.toLocaleDateString("pt-BR", {
          month: "long",
        });
        const anoCliente = dataCliente.getFullYear();

        return (
          cliente.criadoPor === vendedor.id &&
          mesCliente === mes &&
          anoCliente === ano
        );
      });

      const vendasPorProduto = vendasVendedor.reduce(
        (acc, cliente) => {
          const valor = parsearValor(cliente.valor);
          if (valor === 0) return acc;

          const produtoExistente = acc.find(
            (v) => v.produto === cliente.produto && v.banco === cliente.banco,
          );
          if (produtoExistente) {
            produtoExistente.quantidade += 1;
            produtoExistente.valorTotal += valor;
          } else {
            acc.push({
              produto: cliente.produto,
              banco: cliente.banco,
              quantidade: 1,
              valorTotal: valor,
              comissao: 0,
            });
          }
          return acc;
        },
        [] as ComissaoCalculada["vendas"],
      );

      // Calcular comissões por produto e banco
      for (const venda of vendasPorProduto) {
        const regraProduto = regrasComissao.find(
          (r) => r.produto === venda.produto && r.ativa,
        );
        const regraBanco = regrasComissaoBanco.find(
          (r) => r.banco === venda.banco && r.ativa,
        );

        let comissaoTotal = 0;
        if (regraProduto) {
          comissaoTotal += (venda.valorTotal * regraProduto.percentual) / 100;
        }
        if (regraBanco) {
          comissaoTotal += (venda.valorTotal * regraBanco.percentual) / 100;
        }

        venda.comissao = comissaoTotal;
      }

      const totalVendas = vendasPorProduto.reduce(
        (acc, venda) => acc + venda.valorTotal,
        0,
      );
      const totalComissao = vendasPorProduto.reduce(
        (acc, venda) => acc + venda.comissao,
        0,
      );

      comissoes.push({
        usuarioId: vendedor.id,
        usuario: vendedor.nome,
        mes,
        ano,
        vendas: vendasPorProduto,
        totalVendas,
        totalComissao,
      });
    }

    return comissoes;
  }, [clientes, users, regrasComissao, regrasComissaoBanco]);

  const obterVendasPorPeriodo = useCallback((
    periodo: "semanal" | "quinzenal" | "mensal",
  ): VendaPorPeriodo[] => {
    const agora = new Date();
    const vendas: VendaPorPeriodo[] = [];

    // Determinar quantos períodos mostrar
    const numPeriodos =
      periodo === "semanal" ? 12 : periodo === "quinzenal" ? 8 : 6;

    for (let i = numPeriodos - 1; i >= 0; i--) {
      let dataInicio: Date;
      let dataFim: Date;
      let nomePeriodo: string;

      if (periodo === "semanal") {
        dataFim = new Date(agora);
        dataFim.setDate(agora.getDate() - i * 7);
        dataInicio = new Date(dataFim);
        dataInicio.setDate(dataFim.getDate() - 6);
        nomePeriodo = `${dataInicio.getDate()}/${dataInicio.getMonth() + 1} - ${dataFim.getDate()}/${
          dataFim.getMonth() + 1
        }`;
      } else if (periodo === "quinzenal") {
        dataFim = new Date(agora);
        dataFim.setDate(agora.getDate() - i * 15);
        dataInicio = new Date(dataFim);
        dataInicio.setDate(dataFim.getDate() - 14);
        nomePeriodo = `${dataInicio.getDate()}/${dataInicio.getMonth() + 1} - ${dataFim.getDate()}/${
          dataFim.getMonth() + 1
        }`;
      } else {
        dataFim = new Date(agora.getFullYear(), agora.getMonth() - i, 0);
        dataInicio = new Date(agora.getFullYear(), agora.getMonth() - i - 1, 1);
        nomePeriodo = dataInicio.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
      }

      const vendasPeriodo = clientes.filter((cliente) => {
        const dataCliente = obterDataCliente(cliente);
        return dataCliente >= dataInicio && dataCliente <= dataFim;
      });

      const valorTotal = vendasPeriodo.reduce((acc, cliente) => {
        return acc + parsearValor(cliente.valor);
      }, 0);

      const quantidade = vendasPeriodo.length;
      const ticketMedio = quantidade > 0 ? valorTotal / quantidade : 0;

      vendas.push({
        periodo: nomePeriodo,
        valor: valorTotal,
        quantidade,
        ticketMedio,
      });
    }

    return vendas;
  }, [clientes]);

  const obterVendasPorProduto = useCallback((
    mes?: string,
    ano?: number,
  ): VendaPorProduto[] => {
    let clientesFiltrados = clientes;

    if (mes && ano) {
      clientesFiltrados = clientes.filter((cliente) => {
        const dataCliente = obterDataCliente(cliente);
        const mesCliente = dataCliente.toLocaleDateString("pt-BR", {
          month: "long",
        });
        const anoCliente = dataCliente.getFullYear();
        return mesCliente === mes && anoCliente === ano;
      });
    }

    const vendasPorProduto = clientesFiltrados.reduce((acc, cliente) => {
      const valor = parsearValor(cliente.valor);
      if (valor === 0) return acc;

      const produtoExistente = acc.find((v) => v.produto === cliente.produto);
      if (produtoExistente) {
        produtoExistente.quantidade += 1;
        produtoExistente.valor += valor;
      } else {
        acc.push({
          produto: cliente.produto,
          quantidade: 1,
          valor,
          percentual: 0,
        });
      }
      return acc;
    }, [] as VendaPorProduto[]);

    const valorTotal = vendasPorProduto.reduce(
      (acc, venda) => acc + venda.valor,
      0,
    );

    // Calcular percentuais
    for (const venda of vendasPorProduto) {
      venda.percentual = valorTotal > 0 ? (venda.valor / valorTotal) * 100 : 0;
    }

    return vendasPorProduto.sort((a, b) => b.valor - a.valor);
  }, [clientes]);

  const obterProgressoMetas = useCallback((mes: string, ano: number): ProgressoMeta[] => {
    const progressos: ProgressoMeta[] = [];

    for (const meta of metas.filter((m) => m.mes === mes && m.ano === ano)) {
      const vendasUsuario = clientes.filter((cliente) => {
        // Para clientes PAGOS: usar data_pagamento para cálculo
        if (cliente.status === "pago" && cliente.data_pagamento) {
          const dataPagamento = new Date(cliente.data_pagamento + 'T00:00:00');
          const mesPagamento = dataPagamento.toLocaleDateString("pt-BR", {
            month: "long",
          });
          const anoPagamento = dataPagamento.getFullYear();
          const usuario = users.find((u) => u.id === cliente.criadoPor);

          return (
            usuario?.nome === meta.usuario &&
            mesPagamento === mes &&
            anoPagamento === ano
          );
        }
        
        // Para clientes PENDENTES/CANCELADOS: usar data de cadastro apenas para contagem
        const dataCadastro = new Date(cliente.data + 'T00:00:00');
        const mesCadastro = dataCadastro.toLocaleDateString("pt-BR", {
          month: "long",
        });
        const anoCadastro = dataCadastro.getFullYear();
        const usuario = users.find((u) => u.id === cliente.criadoPor);

        return (
          usuario?.nome === meta.usuario &&
          mesCadastro === mes &&
          anoCadastro === ano
        );
      });

      // Somar apenas clientes PAGOS para o valor da meta
      const clientesPagosDoMes = vendasUsuario.filter(cliente => 
        cliente.status === "pago" && cliente.data_pagamento
      );

      const vendido = clientesPagosDoMes.reduce((acc, cliente) => {
        return acc + parsearValor(cliente.valor);
      }, 0);

      const faltante = Math.max(0, meta.valorMeta - vendido);
      const percentualAlcancado = (vendido / meta.valorMeta) * 100;

      // Calcular dias restantes no mês
      const agora = new Date();
      const ultimoDiaMes = new Date(ano, agora.getMonth() + 1, 0).getDate();
      const diasRestantes = Math.max(0, ultimoDiaMes - agora.getDate());

      // Calcular média de vendas diária
      const diasDecorridos = agora.getDate();
      const mediaVendasDiaria =
        diasDecorridos > 0 ? vendido / diasDecorridos : 0;

      // Projeção para o final do mês
      const projecao = mediaVendasDiaria * ultimoDiaMes;

      progressos.push({
        usuario: meta.usuario,
        meta: meta.valorMeta,
        vendido,
        faltante,
        percentualAlcancado,
        diasRestantes,
        mediaVendasDiaria,
        projecao,
      });
    }

    return progressos;
  }, [clientes, metas, users]);

  // Novas funcionalidades
  const obterEstatisticasGerais = useCallback(() => {
    const totalVendas = dadosProcessados.totalVendas;
    const totalClientes = dadosProcessados.totalClientes;
    const ticketMedio = totalClientes > 0 ? totalVendas / totalClientes : 0;
    
    const clientesPagos = dadosProcessados.clientesPagos.length;
    const taxaConversao = totalClientes > 0 ? (clientesPagos / totalClientes) * 100 : 0;

    const vendasPorStatus = [
      {
        status: "Pago",
        quantidade: dadosProcessados.clientesPagos.length,
        valor: dadosProcessados.clientesPagos.reduce((acc, c) => acc + parsearValor(c.valor), 0)
      },
      {
        status: "Pendente",
        quantidade: dadosProcessados.clientesPendentes.length,
        valor: dadosProcessados.clientesPendentes.reduce((acc, c) => acc + parsearValor(c.valor), 0)
      },
      {
        status: "Cancelado",
        quantidade: dadosProcessados.clientesCancelados.length,
        valor: dadosProcessados.clientesCancelados.reduce((acc, c) => acc + parsearValor(c.valor), 0)
      }
    ];

    return {
      totalVendas,
      totalClientes,
      ticketMedio,
      taxaConversao,
      vendasPorStatus
    };
  }, [dadosProcessados]);

  const obterTendencias = useCallback(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    // Vendas do mês atual vs mês anterior
    const vendasMesAtual = clientes.filter(c => {
      const data = obterDataCliente(c);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).reduce((acc, c) => acc + parsearValor(c.valor), 0);

    const vendasMesAnterior = clientes.filter(c => {
      const data = obterDataCliente(c);
      const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
      const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
      return data.getMonth() === mesAnterior && data.getFullYear() === anoAnterior;
    }).reduce((acc, c) => acc + parsearValor(c.valor), 0);

    const crescimentoMensal = vendasMesAnterior > 0 
      ? ((vendasMesAtual - vendasMesAnterior) / vendasMesAnterior) * 100 
      : 0;

    // Produtos mais vendidos
    const produtosMaisVendidos = obterVendasPorProduto().slice(0, 5);

    // Vendedores top
    const vendedoresTop = users
      .filter(u => u.role === "user")
      .map(user => {
        const vendasUser = clientes.filter(c => c.criadoPor === user.id);
        const totalVendas = vendasUser.reduce((acc, c) => acc + parsearValor(c.valor), 0);
        return {
          usuario: user.nome,
          vendas: vendasUser.length,
          valor: totalVendas
        };
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    return {
      crescimentoMensal,
      produtosMaisVendidos,
      vendedoresTop
    };
  }, [clientes, users, obterVendasPorProduto]);

  const exportarDados = useCallback((tipo: 'vendas' | 'metas' | 'comissoes') => {
    try {
      let dados: any[] = [];
      let nomeArquivo = '';

      switch (tipo) {
        case 'vendas':
          dados = clientes.map(c => ({
            id: c.id,
            nome: c.cliente,
            produto: c.produto,
            banco: c.banco,
            valor: c.valor,
            status: c.status,
            data: c.data,
            data_pagamento: c.data_pagamento,
            vendedor: users.find(u => u.id === c.criadoPor)?.nome || 'N/A'
          }));
          nomeArquivo = `vendas_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'metas':
          dados = metas;
          nomeArquivo = `metas_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'comissoes':
          const comissoesAtuais = calcularComissoes('Janeiro', 2024);
          dados = comissoesAtuais;
          nomeArquivo = `comissoes_${new Date().toISOString().split('T')[0]}.json`;
          break;
      }

      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  }, [clientes, users, metas, calcularComissoes]);

  return (
    <AnalyticsContext.Provider
      value={{
        metas,
        regrasComissao,
        regrasComissaoBanco,
        adicionarMeta,
        atualizarMeta,
        removerMeta,
        adicionarRegraComissao,
        atualizarRegraComissao,
        removerRegraComissao,
        adicionarRegraComissaoBanco,
        atualizarRegraComissaoBanco,
        removerRegraComissaoBanco,
        calcularComissoes,
        obterVendasPorPeriodo,
        obterVendasPorProduto,
        obterProgressoMetas,
        obterEstatisticasGerais,
        obterTendencias,
        exportarDados,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error(
      "useAnalytics deve ser usado dentro de um AnalyticsProvider",
    );
  }
  return context;
}
