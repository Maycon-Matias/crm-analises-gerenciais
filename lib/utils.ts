import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para gerar ID único que funciona em todos os ambientes
export function generateId(): string {
  // Verificar se crypto.randomUUID está disponível
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para navegadores mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Função para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Função para parsear valores monetários
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove R$, espaços e converte vírgula para ponto
  const cleanValue = value
    .replace(/R\$\s*/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

// Função para obter mensagem aleatória do dashboard
export function getRandomDashboardMessage(): string {
  const messages = [
    "Bem-vindo ao seu CRM! 🚀",
    "Organize seus clientes de forma eficiente! 📊",
    "Acompanhe suas vendas em tempo real! 💰",
    "Gerencie suas metas com facilidade! 🎯",
    "Sistema otimizado para seu sucesso! ⚡",
  ];
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
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
