# CRM Porã Cred

Sistema de gerenciamento de clientes para a empresa Porã Cred, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e MongoDB.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **MongoDB** - Banco de dados
- **Radix UI** - Componentes de interface
- **Chart.js** - Gráficos e visualizações
- **React Hook Form** - Formulários
- **Zod** - Validação de dados

## 📋 Funcionalidades

### 👥 Gestão de Clientes
- Cadastro, edição e exclusão de clientes
- Filtros avançados por data, status, usuário, produto, banco
- Importação de clientes via CSV
- Exportação de dados

### 📊 Dashboard e Analytics
- Dashboard com métricas em tempo real
- Gráficos de performance
- Análise de comissões
- Acompanhamento de metas

### 🔐 Sistema de Autenticação
- Login de usuários
- Controle de permissões (admin/usuário)
- Proteção de rotas

### 📈 Gestão de Metas
- Definição de metas por vendedor
- Acompanhamento de progresso
- Relatórios de performance

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd CRM_FINAL_V2-main
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local`:
```env
MONGODB_URI=sua_string_de_conexao_mongodb
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🚀 Deploy no Vercel

O projeto está configurado para deploy no Vercel:

1. **Conecte seu repositório ao Vercel**
2. **Configure a variável de ambiente**:
   - `MONGODB_URI`: String de conexão do MongoDB
3. **Deploy automático** será realizado

## 📁 Estrutura do Projeto

```
├── app/                    # Páginas e rotas (App Router)
│   ├── admin/             # Área administrativa
│   ├── analytics/         # Analytics e relatórios
│   ├── clientes/          # Gestão de clientes
│   ├── dashboard/         # Dashboard principal
│   └── api/              # API Routes
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base
│   └── charts/           # Componentes de gráficos
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
├── types/                # Definições de tipos TypeScript
└── data/                 # Dados estáticos
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa build de produção
- `npm run lint` - Executa verificação de código

## 📊 Status do Projeto

✅ **Funcionalidades principais implementadas**  
✅ **Sistema de autenticação funcionando**  
✅ **Gestão de clientes completa**  
✅ **Dashboard e analytics**  
✅ **Filtros e busca avançados**  
✅ **Importação/exportação de dados**  
✅ **Configuração para deploy**  

## 🐛 Problemas Conhecidos

- Warnings do ESLint sobre variáveis não utilizadas (não críticos)
- Problemas com SWC no Windows (já configurado para ignorar)

## 📝 Licença

Este projeto é privado e pertence à Porã Cred.

---

**Desenvolvido com ❤️ para Porã Cred** 