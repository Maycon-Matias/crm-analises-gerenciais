# Documentação de Webhooks

## Visão Geral

O sistema de webhooks permite que você receba notificações em tempo real quando eventos específicos acontecem no CRM. Isso é útil para integrações com sistemas externos como WhatsApp, Telegram, sistemas de contabilidade, etc.

## Eventos Disponíveis

### 1. `cliente.criado`
Disparado quando um novo cliente é cadastrado no sistema.

**Payload:**
```json
{
  "evento": "cliente.criado",
  "dados": {
    "id": "507f1f77bcf86cd799439011",
    "cliente": "João Silva",
    "produto": "Margem",
    "banco": "Porã Cred",
    "fonte": "Balcão",
    "valor": "R$ 5.000,00",
    "data": "2024-01-15",
    "mes": "janeiro",
    "usuarios": "Beatriz",
    "status": "pendente",
    "cpf": "123.456.789-00",
    "telefone": "(11) 99999-9999",
    "criadoPor": "user123",
    "observacoes": "Cliente interessado em margem"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "id": "507f1f77bcf86cd799439011"
}
```

### 2. `cliente.atualizado`
Disparado quando um cliente é atualizado.

**Payload:**
```json
{
  "evento": "cliente.atualizado",
  "dados": {
    "id": "507f1f77bcf86cd799439011",
    "cliente": "João Silva",
    "produto": "Margem",
    "banco": "Porã Cred",
    "fonte": "Balcão",
    "valor": "R$ 5.000,00",
    "data": "2024-01-15",
    "mes": "janeiro",
    "usuarios": "Beatriz",
    "status": "pago",
    "data_pagamento": "2024-01-20",
    "cpf": "123.456.789-00",
    "telefone": "(11) 99999-9999",
    "criadoPor": "user123",
    "observacoes": "Pagamento confirmado"
  },
  "timestamp": "2024-01-20T14:45:00.000Z",
  "id": "507f1f77bcf86cd799439011"
}
```

### 3. `cliente.excluido`
Disparado quando um cliente é excluído.

**Payload:**
```json
{
  "evento": "cliente.excluido",
  "dados": {
    "id": "507f1f77bcf86cd799439011",
    "cliente": "João Silva",
    "produto": "Margem",
    "banco": "Porã Cred",
    "fonte": "Balcão",
    "valor": "R$ 5.000,00",
    "data": "2024-01-15",
    "mes": "janeiro",
    "usuarios": "Beatriz",
    "status": "pendente",
    "cpf": "123.456.789-00",
    "telefone": "(11) 99999-9999",
    "criadoPor": "user123",
    "observacoes": "Cliente cancelou"
  },
  "timestamp": "2024-01-25T09:15:00.000Z",
  "id": "507f1f77bcf86cd799439011"
}
```

### 4. `cliente.pago`
Disparado quando um cliente é marcado como pago.

**Payload:**
```json
{
  "evento": "cliente.pago",
  "dados": {
    "id": "507f1f77bcf86cd799439011",
    "cliente": "João Silva",
    "produto": "Margem",
    "banco": "Porã Cred",
    "fonte": "Balcão",
    "valor": "R$ 5.000,00",
    "data": "2024-01-15",
    "mes": "janeiro",
    "usuarios": "Beatriz",
    "status": "pago",
    "data_pagamento": "2024-01-20",
    "cpf": "123.456.789-00",
    "telefone": "(11) 99999-9999",
    "criadoPor": "user123",
    "observacoes": "Pagamento confirmado"
  },
  "timestamp": "2024-01-20T14:45:00.000Z",
  "id": "507f1f77bcf86cd799439011"
}
```

## Configuração de Webhooks

### 1. Acesse as Configurações
- Vá para **Configurações** > **Webhooks**
- Clique em **Adicionar Novo Webhook**

### 2. Preencha os Campos

#### Campos Obrigatórios:
- **Nome**: Nome descritivo do webhook (ex: "Notificação WhatsApp")
- **URL**: URL do endpoint que receberá as notificações
- **Eventos**: Selecione quais eventos deseja receber

#### Campos Opcionais:
- **Headers**: Headers HTTP adicionais (JSON)
- **Timeout**: Tempo limite em segundos (padrão: 30)
- **Tentativas**: Número de tentativas em caso de falha (padrão: 3)
- **Ativo**: Se o webhook está ativo ou não

### 3. Exemplo de Configuração

```json
{
  "nome": "Notificação WhatsApp",
  "url": "https://api.whatsapp.com/webhook",
  "eventos": ["cliente.criado", "cliente.pago"],
  "ativo": true,
  "headers": {
    "Authorization": "Bearer seu_token_aqui",
    "Content-Type": "application/json"
  },
  "timeout": 30,
  "tentativas": 3
}
```

## Testando Webhooks

### 1. Teste Individual
- Na lista de webhooks, clique no botão **Testar**
- O sistema enviará um payload de teste para verificar se a URL está funcionando

### 2. Teste Manual
Você pode testar manualmente enviando uma requisição POST:

```bash
curl -X POST https://api.exemplo.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "teste",
    "dados": {
      "mensagem": "Teste de webhook",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "id": "teste"
  }'
```

## Tratamento de Erros

### 1. Timeout
Se o webhook não responder dentro do tempo limite configurado, a requisição será cancelada.

### 2. Tentativas
Se o webhook falhar, o sistema tentará novamente conforme o número de tentativas configurado, com delay exponencial.

### 3. Logs
Todas as tentativas de webhook são registradas nos logs do sistema para auditoria.

## Exemplos de Uso

### 1. Integração com WhatsApp
```json
{
  "nome": "WhatsApp Notifications",
  "url": "https://api.whatsapp.com/send",
  "eventos": ["cliente.criado", "cliente.pago"],
  "headers": {
    "Authorization": "Bearer seu_token_whatsapp"
  }
}
```

### 2. Integração com Sistema de Contabilidade
```json
{
  "nome": "Sistema Contábil",
  "url": "https://contabilidade.exemplo.com/api/vendas",
  "eventos": ["cliente.pago"],
  "headers": {
    "X-API-Key": "sua_chave_api"
  }
}
```

### 3. Notificações por Email
```json
{
  "nome": "Email Notifications",
  "url": "https://email-service.exemplo.com/webhook",
  "eventos": ["cliente.criado", "cliente.atualizado", "cliente.pago"],
  "headers": {
    "X-Service-Key": "sua_chave_servico"
  }
}
```

## Segurança

### 1. HTTPS
Sempre use URLs HTTPS para webhooks em produção.

### 2. Autenticação
Use headers de autenticação para proteger seus endpoints.

### 3. Validação
Sempre valide os dados recebidos no seu endpoint.

## Monitoramento

### 1. Logs do Sistema
Verifique os logs do sistema para monitorar o funcionamento dos webhooks.

### 2. Status de Resposta
O sistema registra o status de resposta de cada webhook.

### 3. Métricas
Monitore o tempo de resposta e taxa de sucesso dos webhooks.

## Troubleshooting

### 1. Webhook não está sendo disparado
- Verifique se o webhook está ativo
- Confirme se o evento está selecionado
- Verifique os logs do sistema

### 2. Webhook falhando
- Teste a URL manualmente
- Verifique se o endpoint está acessível
- Confirme se os headers estão corretos
- Verifique o timeout configurado

### 3. Dados incorretos
- Verifique o formato do payload
- Confirme se todos os campos necessários estão presentes
- Teste com dados de exemplo

## Suporte

Para dúvidas ou problemas com webhooks, consulte:
- Logs do sistema
- Documentação da API
- Suporte técnico
