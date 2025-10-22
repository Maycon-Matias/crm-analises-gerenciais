// Interface para o modelo Cliente (compatível com MongoDB nativo)
export interface ICliente {
  _id?: string;
  cliente: string;
  produto: string;
  banco: string;
  fonte: string;
  valor: string;
  data: string;
  mes: string;
  usuarios: string;
  status: 'pendente' | 'pago' | 'cancelado';
  criadoPor: string;
  data_previsao_pagamento?: string;
  data_pagamento?: string;
  cpf?: string;
  telefone?: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Função para validar dados do cliente
export function validateCliente(cliente: any): ICliente {
  return {
    cliente: cliente.cliente?.trim() || "",
    produto: cliente.produto?.trim() || "",
    banco: cliente.banco?.trim() || "",
    fonte: cliente.fonte?.trim() || "",
    valor: cliente.valor?.trim() || "R$ 0,00",
    data: cliente.data || "",
    mes: cliente.mes || "",
    usuarios: cliente.usuarios?.trim() || "",
    status: cliente.status || "pendente",
    criadoPor: cliente.criadoPor || "",
    data_previsao_pagamento: cliente.data_previsao_pagamento || "",
    data_pagamento: cliente.data_pagamento || "",
    cpf: cliente.cpf?.trim() || "",
    telefone: cliente.telefone?.trim() || "",
    observacoes: cliente.observacoes?.trim() || ""
  };
}

// Função para formatar cliente para resposta da API
export function formatClienteForResponse(doc: any): ICliente {
  return {
    id: doc._id?.toString() || "",
    cliente: doc.cliente?.trim() || doc["cliente "]?.trim() || "",
    produto: doc.produto?.trim() || doc["produto "]?.trim() || "",
    banco: doc.banco?.trim() || doc["banco "]?.trim() || "",
    fonte: doc.fonte?.trim() || doc["fonte "]?.trim() || "",
    valor: doc.valor?.trim() || doc["valor "]?.trim() || doc["vale.."]?.trim() || "R$ 0,00",
    data: doc.data || doc["data "] || "",
    mes: doc.mes || doc["me.."] || "",
    usuarios: doc.usuarios?.trim() || doc["usuários"]?.trim() || "",
    status: doc.status?.trim() || doc["status "]?.trim() || "pendente",
    cpf: doc.cpf?.trim() || "",
    telefone: doc.telefone?.trim() || "",
    criadoPor: doc.criadoPor || "",
    data_previsao_pagamento: doc.data_previsao_pagamento || "",
    data_pagamento: doc.data_pagamento || "",
    observacoes: doc.observacoes?.trim() || ""
  };
}

export default { validateCliente, formatClienteForResponse };
