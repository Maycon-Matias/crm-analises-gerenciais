import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar data atual no formato YYYY-MM-DD sem problemas de fuso horário
export function getDataAtualFormatada(): string {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const dia = String(dataAtual.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Função para formatar data no formato brasileiro DD/MM/YYYY
export function formatarDataBR(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR');
}

// Função para converter data do formato brasileiro para YYYY-MM-DD
export function converterDataBRParaISO(dataBR: string): string {
  const partes = dataBR.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return dataBR;
}

export function getDashboardMessage({
  clientesDoMes,
  metaMensal,
  clientesHoje,
  mesAtual,
}: {
  clientesDoMes: any[];
  metaMensal: number;
  clientesHoje: number;
  mesAtual: string;
}) {
  if (clientesDoMes.length === 0) {
    return `Nenhum cliente cadastrado este mês. Vamos começar?`;
  }
  if (clientesHoje > 0) {
    return `${clientesHoje} cliente${clientesHoje > 1 ? 's' : ''} cadastrado${clientesHoje > 1 ? 's' : ''} hoje. Bom trabalho!`;
  }
  const progresso = Math.round((clientesDoMes.length / metaMensal) * 100);
  if (progresso < 100) {
    return `Você está ${100 - progresso}% abaixo da meta de ${mesAtual}.`;
  }
  return `Parabéns! Meta de ${mesAtual} atingida!`;
}
