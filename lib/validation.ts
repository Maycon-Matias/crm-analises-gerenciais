import { z } from 'zod';

// Schema para valores monetários
export const valorMonetarioSchema = z.string()
  .regex(/^R\$\s*\d{1,3}(\.\d{3})*(,\d{2})$/, 'Formato inválido. Use: R$ 1.234,56')
  .transform((valor) => {
    // Converter para número para validação
    const numero = Number(valor.replace(/R\$\s*|\./g, '').replace(',', '.'));
    if (isNaN(numero) || numero <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }
    return valor;
  });

// Schema para datas
export const dataSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use: YYYY-MM-DD')
  .transform((data) => {
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      throw new Error('Data inválida');
    }
    return data;
  });

// Schema para CPF
export const cpfSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato de CPF inválido. Use: 123.456.789-00')
  .optional();

// Schema para telefone
export const telefoneSchema = z.string()
  .regex(/^\(\d{2}\)\s*\d{4,5}-\d{4}$/, 'Formato de telefone inválido. Use: (11) 99999-9999')
  .optional();

// Schema para cliente
export const clienteSchema = z.object({
  cliente: z.string()
    .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do cliente deve ter no máximo 100 caracteres')
    .trim(),
  
  produto: z.string()
    .min(1, 'Produto é obrigatório')
    .max(50, 'Produto deve ter no máximo 50 caracteres'),
  
  banco: z.string()
    .min(1, 'Banco é obrigatório')
    .max(50, 'Banco deve ter no máximo 50 caracteres'),
  
  fonte: z.string()
    .min(1, 'Fonte é obrigatória')
    .max(50, 'Fonte deve ter no máximo 50 caracteres'),
  
  valor: valorMonetarioSchema,
  
  data: dataSchema,
  
  mes: z.string()
    .min(1, 'Mês é obrigatório')
    .max(20, 'Mês deve ter no máximo 20 caracteres'),
  
  usuarios: z.string()
    .min(1, 'Usuário é obrigatório')
    .max(50, 'Usuário deve ter no máximo 50 caracteres'),
  
  status: z.enum(['pendente', 'pago', 'cancelado'], {
    errorMap: () => ({ message: 'Status deve ser: pendente, pago ou cancelado' })
  }),
  
  cpf: cpfSchema,
  
  telefone: telefoneSchema,
  
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
  
  data_pagamento: dataSchema.optional(),
  
  criadoPor: z.string()
    .min(1, 'ID do criador é obrigatório'),
});

// Schema para meta
export const metaSchema = z.object({
  usuario: z.string()
    .min(1, 'Usuário é obrigatório')
    .max(50, 'Usuário deve ter no máximo 50 caracteres'),
  
  mes: z.string()
    .min(1, 'Mês é obrigatório')
    .max(20, 'Mês deve ter no máximo 20 caracteres'),
  
  ano: z.number()
    .int('Ano deve ser um número inteiro')
    .min(2020, 'Ano deve ser maior ou igual a 2020')
    .max(2030, 'Ano deve ser menor ou igual a 2030'),
  
  valorMeta: z.number()
    .positive('Meta deve ser um número positivo')
    .max(10000000, 'Meta deve ser menor que R$ 10.000.000'),
  
  tipo: z.enum(['quantidade', 'valor'], {
    errorMap: () => ({ message: 'Tipo deve ser: quantidade ou valor' })
  }).optional(),
});

// Schema para usuário
export const usuarioSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  senha: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter letra maiúscula, minúscula e número'),
  
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role deve ser: admin ou user' })
  }),
});

// Schema para filtros
export const filtrosClienteSchema = z.object({
  mes: z.string().optional(),
  dia: z.string().optional(),
  usuario: z.string().optional(),
  status: z.string().optional(),
});

// Schema para paginação
export const paginacaoSchema = z.object({
  pagina: z.number().int().min(1).default(1),
  limite: z.number().int().min(1).max(100).default(20),
  ordenacao: z.enum(['asc', 'desc']).default('desc'),
  campo: z.string().default('data'),
});

// Função para validar dados
export function validarDados<T>(schema: z.ZodSchema<T>, dados: unknown): T {
  try {
    return schema.parse(dados);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validação falhou: ${mensagens}`);
    }
    throw error;
  }
}

// Função para validar dados parcialmente
export function validarDadosParcial<T>(schema: z.ZodSchema<T>, dados: unknown): Partial<T> {
  try {
    return schema.partial().parse(dados);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mensagens = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validação falhou: ${mensagens}`);
    }
    throw error;
  }
}
