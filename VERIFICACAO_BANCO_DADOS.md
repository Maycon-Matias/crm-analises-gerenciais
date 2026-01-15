# Verificação da Configuração do Banco de Dados

## ✅ Configuração Atual

### 1. **Conexão MongoDB** (`lib/mongodb.ts`)
- **URI**: `mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred`
- **Banco de Dados**: `crm`
- **Coleções Usadas**:
  - `clientes` - Armazena os clientes
  - `metas` - Armazena as metas dos vendedores
  - `webhooks` - Armazena configurações de webhooks

### 2. **Configurações de Conexão**
- ✅ Pool de conexões: máximo 10 conexões
- ✅ Timeouts configurados:
  - Server selection: 30 segundos
  - Socket: 45 segundos
  - Conexão inicial: 30 segundos
- ✅ Retry habilitado para leituras e escritas
- ✅ Write concern: majority

### 3. **Variável de Ambiente**
- ⚠️ **Problema**: `MONGODB_URI` está definida no `vercel.json` (não recomendado)
- ✅ **Solução**: Configurar no painel do Vercel (Settings → Environment Variables)
- ✅ Fallback: String padrão definida no código (apenas para desenvolvimento)

## 🔍 Verificações Realizadas

### ✅ Estrutura do Código
- Todas as rotas da API usam `client.db("crm")` corretamente
- Conexão reutilizada via `clientPromise` (padrão Next.js)
- Health check disponível em `/api/health`

### ✅ Uso Consistente
- Todas as rotas seguem o mesmo padrão:
  ```typescript
  const client = await clientPromise;
  const db = client.db("crm");
  const collection = db.collection("clientes");
  ```

## ⚠️ Problemas Identificados

### 1. **Variável de Ambiente no Código**
- **Problema**: URI do MongoDB está hardcoded no `vercel.json` e no código
- **Risco**: Credenciais expostas no repositório
- **Solução**: 
  1. Remover do `vercel.json`
  2. Configurar no painel do Vercel
  3. Usar apenas `process.env.MONGODB_URI` no código

### 2. **Aviso de MONGODB_URI não definida**
- **Problema**: Logs mostram aviso durante o build
- **Causa**: Variável não está configurada no Vercel
- **Impacto**: Funciona com fallback, mas não é ideal para produção

## 🔧 Recomendações

### 1. **Configurar Variável no Vercel**
1. Acesse o painel do Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred`
   - **Environments**: Production, Preview, Development

### 2. **Remover URI do Código (Segurança)**
Após configurar no Vercel, remover do `vercel.json`:
```json
{
  "env": {
    // Remover MONGODB_URI daqui
  }
}
```

### 3. **Testar Conexão**
Use o endpoint de health check:
```bash
curl https://seu-dominio.vercel.app/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

## ✅ Status Geral

- ✅ Configuração do código: **Correta**
- ✅ Estrutura do banco: **Correta**
- ✅ Uso nas rotas: **Consistente**
- ⚠️ Variável de ambiente: **Precisa ser configurada no Vercel**
- ⚠️ Segurança: **URI exposta no código (remover após configurar no Vercel)**

## 📝 Próximos Passos

1. ✅ Configurar `MONGODB_URI` no painel do Vercel
2. ⚠️ Remover URI do `vercel.json` após configurar
3. ✅ Testar conexão via endpoint `/api/health`
4. ✅ Verificar se os avisos desaparecem nos logs
