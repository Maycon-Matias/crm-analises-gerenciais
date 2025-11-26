# Sistema de Notificações por Usuário

## Problema Identificado

O sistema de notificações estava exibindo informações gerais do sistema para todos os usuários, incluindo:
- Total de clientes pendentes do sistema
- Valor total de vendas do sistema
- Metas gerais do sistema

Isso causava confusão pois cada usuário via dados que não eram específicos para ele.

## Soluções Implementadas

### 1. NotificationSystem (components/notification-system.tsx)

**Antes:** Gerava notificações baseadas em todos os clientes do sistema
**Depois:** Filtra clientes por usuário logado antes de gerar notificações

```typescript
// Filtrar clientes apenas do usuário logado (exceto admins)
const clientesDoUsuario = user?.role === "admin" 
  ? clientes 
  : clientes.filter(c => c.criadoPor === user?.id);

// Notificações baseadas em dados do usuário
const clientesPendentes = clientesDoUsuario.filter(c => c.status === "pendente");
const clientesPagos = clientesDoUsuario.filter(c => c.status === "pago");
```

**Metas Personalizadas:**
- **Admin:** Meta de R$ 1.000.000 e 50 clientes/mês
- **Usuário comum:** Meta de R$ 100.000 e 20 clientes/mês

**Novas Notificações:**
- Meta próxima (80-99% do objetivo)
- Performance mensal personalizada

### 2. NotificationCenter (components/notification-center.tsx)

**Antes:** Exibia todas as notificações do sistema
**Depois:** Filtra notificações por usuário logado

```typescript
// Filtrar notificações apenas do usuário logado (exceto admins)
const notificacoesDoUsuario = user?.role === "admin" 
  ? notificacoes 
  : notificacoes.filter(n => n.usuarioId === user?.id || !n.usuarioId);
```

### 3. useSistema Hook (hooks/use-sistema.tsx)

**Antes:** Notificações não tinham identificação de usuário
**Depois:** Cada notificação inclui o ID do usuário que a criou

```typescript
const novaNotificacao: NotificacaoSistema = {
  id: Date.now().toString(),
  titulo,
  mensagem,
  tipo,
  lida: false,
  criadaEm: new Date().toISOString(),
  usuarioId: user?.id, // Adicionar ID do usuário
};
```

## Benefícios das Mudanças

1. **Privacidade:** Cada usuário vê apenas suas próprias notificações
2. **Relevância:** Notificações são específicas para o usuário logado
3. **Metas Personalizadas:** Diferentes metas para admins e usuários comuns
4. **Performance:** Filtros aplicados no frontend para melhor responsividade
5. **Escalabilidade:** Sistema preparado para múltiplos usuários

## Comportamento por Tipo de Usuário

### Administrador (Admin)
- Vê todas as notificações do sistema
- Metas mais altas (R$ 1M, 50 clientes/mês)
- Acesso completo a dados gerais

### Usuário Comum
- Vê apenas suas próprias notificações
- Metas personalizadas (R$ 100K, 20 clientes/mês)
- Dados filtrados por `criadoPor`

## Estrutura de Dados

```typescript
interface NotificacaoSistema {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "info" | "warning" | "error" | "success";
  lida: boolean;
  criadaEm: string;
  usuarioId?: string; // Novo campo para filtrar por usuário
}
```

## Como Testar

1. **Login como usuário comum:**
   - Verificar se as notificações mostram apenas dados pessoais
   - Confirmar que metas são de 20 clientes/mês

2. **Login como admin:**
   - Verificar se todas as notificações são exibidas
   - Confirmar que metas são de 50 clientes/mês

3. **Verificar filtros:**
   - Clientes pendentes devem ser apenas do usuário logado
   - Valores totais devem ser específicos do usuário
   - Metas devem ser personalizadas por tipo de usuário
