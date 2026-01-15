# Como Configurar Variáveis de Ambiente no Vercel

## ⚠️ Problema Atual
O sistema está mostrando o aviso:
```
⚠️ MONGODB_URI não definida. Usando string padrão (NÃO USE EM PRODUÇÃO)
```

Isso acontece porque a variável de ambiente não está configurada corretamente no Vercel.

## 🔧 Solução: Configurar no Painel do Vercel

### Passo 1: Acessar o Painel do Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto `CRM_FINAL_V2`

### Passo 2: Adicionar Variável de Ambiente
1. Vá em **Settings** (Configurações)
2. Clique em **Environment Variables** (Variáveis de Ambiente)
3. Clique em **Add New** (Adicionar Nova)
4. Adicione:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/crm?retryWrites=true&w=majority&appName=PoraCred`
   - **Environments**: Selecione:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
5. Clique em **Save**

### Passo 3: Fazer Novo Deploy
Após adicionar a variável, você precisa fazer um novo deploy:
1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para o GitHub

## 🔒 Segurança

**IMPORTANTE**: A URI do MongoDB está atualmente no arquivo `vercel.json`, o que não é seguro. Após configurar no painel do Vercel, você pode remover do `vercel.json` para não expor credenciais no código.

## 📝 Variáveis Necessárias

As seguintes variáveis devem estar configuradas no Vercel:

- `MONGODB_URI` - URI de conexão do MongoDB
- `JWT_SECRET` (se usado) - Segredo para JWT
- `NEXTAUTH_SECRET` (se usado) - Segredo para NextAuth
- `NEXTAUTH_URL` (se usado) - URL da aplicação

## ✅ Verificação

Após configurar, o aviso não deve mais aparecer nos logs do Vercel.
