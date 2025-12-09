export type StatusCliente = "pendente" | "pago" | "cancelado";

export type Cliente = {
  id: string;
  cliente: string;
  produto: string;
  banco: string;
  fonte: string;
  valor: string;
  data: string;
  mes: string;
  usuarios: string;
  status: StatusCliente;
  criadoPor: string;
  data_previsao_pagamento?: string; // Data prevista para pagamento (definida pelo vendedor)
  data_pagamento?: string; // Data em que o pagamento foi realizado (confirmada pelo admin)
  cpf?: string; // CPF do cliente (opcional)
  telefone?: string; // Telefone do cliente (opcional)
  observacoes?: string; // Observações adicionais (opcional)
};

export type FiltrosCliente = {
  mes?: string;
  dia?: string;
  usuario?: string;
  status?: string;
};

export const opcoesPredefinidas = {
  produtos: [
    "Margem",
    "Cartão",
    "Portabilidade",
    "Refin da Port",
    "Refinaciamento",
    "Cartão de Credito",
    "FGTS",
    "Bolsa familia",
    "INSS",
    "Consignado Priv",
    "SIAPE",
    "Seguro",
    "Governo",
    "Saque",
    "Car Equity",
  ],
  bancos: [
    "Presença Bank",
    "C6 Bank",
    "BMG",
    "Banco Pan",
    "Crefisa",
    "Finanto",
    "Facta",
    "Alcif Convenios",
    "BRB",
    "Daycoval",
    "Santander",
    "Porã Cred",
    "Digio",
    "Amigoz",
    "Digito",
    "Banco Parana",
    "Nossa Fintech",
    "ZiliCred",
  ],
  fontes: [
    "Corretor(TI)",
    "Corretor(RA)",
    "Corretor(JO)",
    "Corretor(GI)",
    "Corretor(RO)",
    "Corretor(WE)",
    "Corretor(GE)",
    "Corretor(CA)",
    "Corretor(BI)",
    "Corretor(SA)",
    "Corretor(KA)",
    "Corretor(JU)",
    "URA",
    "Trafego",
    "Rede Social",
    "Balcão",
    "Discador",
    "Cliente Fixo",
    "Indicação",
  ],
  usuarios: ["Amanda", "Lais", "Carlos", "Ana"],
};
