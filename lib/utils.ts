import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data de forma robusta, lidando com diferentes formatos
 * @param dataString - String da data (pode ser ISO, timestamp, etc.)
 * @param options - Opções de formatação (opcional)
 * @returns String formatada da data ou "Data inválida" se falhar
 */
export function formatarDataRobusta(
  dataString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    let data: Date;
    
    if (dataString instanceof Date) {
      data = dataString;
    } else if (typeof dataString === 'string') {
      // Se já é uma string ISO válida
      if (dataString.includes('T') && (dataString.includes('Z') || dataString.includes('+') || dataString.includes('-'))) {
        data = new Date(dataString);
      } else {
        // Tentar adicionar T00:00:00 se não tiver
        data = new Date(dataString + 'T00:00:00');
      }
    } else {
      return "Data inválida";
    }
    
    if (isNaN(data.getTime())) {
      return "Data inválida";
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...options
    };
    
    return data.toLocaleDateString("pt-BR", defaultOptions);
  } catch (error) {
    console.error("Erro ao formatar data:", dataString, error);
    return "Data inválida";
  }
}

/**
 * Formata uma data com hora de forma robusta
 * @param dataString - String da data
 * @param options - Opções de formatação (opcional)
 * @returns String formatada da data com hora ou "Data inválida" se falhar
 */
export function formatarDataHoraRobusta(
  dataString: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    let data: Date;
    
    if (dataString instanceof Date) {
      data = dataString;
    } else if (typeof dataString === 'string') {
      // Se já é uma string ISO válida
      if (dataString.includes('T') && (dataString.includes('Z') || dataString.includes('+') || dataString.includes('-'))) {
        data = new Date(dataString);
      } else {
        // Tentar adicionar T00:00:00 se não tiver
        data = new Date(dataString + 'T00:00:00');
      }
    } else {
      return "Data inválida";
    }
    
    if (isNaN(data.getTime())) {
      return "Data inválida";
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options
    };
    
    return data.toLocaleString("pt-BR", defaultOptions);
  } catch (error) {
    console.error("Erro ao formatar data com hora:", dataString, error);
    return "Data inválida";
  }
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

// Função para formatar data atual no formato YYYY-MM-DD considerando fuso horário local
export function getDataAtualFormatada(): string {
  // Criar data considerando o fuso horário local
  const agora = new Date();
  
  // Obter componentes da data no fuso horário local
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
}

// Função para obter data atual no fuso horário local (alternativa mais robusta)
export function getDataAtualLocal(): string {
  const agora = new Date();
  
  // Usar toLocaleDateString para garantir fuso horário local
  const dataLocal = agora.toLocaleDateString('pt-BR', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Converter de DD/MM/YYYY para YYYY-MM-DD
  const [dia, mes, ano] = dataLocal.split('/');
  return `${ano}-${mes}-${dia}`;
}

// Função para obter data atual sem problemas de fuso horário (método mais seguro)
export function getDataAtualSemFusoHorario(): string {
  // Criar data usando UTC para evitar problemas de fuso horário
  const agora = new Date();
  
  // Debug: Log das datas para verificar o problema
  console.log("🔍 Debug de datas:");
  console.log("  - Data atual (new Date()):", agora);
  console.log("  - Fuso horário:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log("  - Offset em minutos:", agora.getTimezoneOffset());
  
  // Método 1: Usar toLocaleDateString com timezone local
  const dataLocal = agora.toLocaleDateString('pt-BR', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  console.log("  - Data local (pt-BR):", dataLocal);
  
  // Converter de DD/MM/YYYY para YYYY-MM-DD
  const [dia, mes, ano] = dataLocal.split('/');
  const dataFormatada = `${ano}-${mes}-${dia}`;
  
  console.log("  - Data formatada (YYYY-MM-DD):", dataFormatada);
  
  return dataFormatada;
}

// Função de debug para verificar datas
export function debugDataAtual(): void {
  const agora = new Date();
  const utc = new Date(agora.getTime() + (agora.getTimezoneOffset() * 60000));
  
  console.log("🔍 Debug completo de datas:");
  console.log("  - Data atual (local):", agora);
  console.log("  - Data UTC:", utc);
  console.log("  - Fuso horário:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log("  - Offset (minutos):", agora.getTimezoneOffset());
  console.log("  - getDate() local:", agora.getDate());
  console.log("  - getDate() UTC:", utc.getDate());
  console.log("  - getMonth() local:", agora.getMonth() + 1);
  console.log("  - getMonth() UTC:", utc.getMonth() + 1);
  console.log("  - getFullYear() local:", agora.getFullYear());
  console.log("  - getFullYear() UTC:", utc.getFullYear());
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
