# Correção: Filtro de Corretores nas Metas

## Problema Identificado
As metas de cada vendedor e a meta geral que o admin tem acesso ainda estavam contando os corretores, causando distorção nos cálculos de performance e metas.

## Solução Implementada
Foi implementado um filtro sistemático em todas as funções de cálculo de metas, comissões e analytics para excluir clientes de fontes de corretores.

## Arquivos Modificados

### 1. `hooks/use-analytics.tsx`
- **Import adicionado**: `import { isFontePrincipal } from "@/lib/fontes-config"`
- **Funções corrigidas**:
  - `obterProgressoMetas()` - Filtra apenas clientes de fontes principais
  - `calcularComissoes()` - Filtra apenas clientes de fontes principais
  - `obterVendasPorPeriodo()` - Filtra apenas clientes de fontes principais
  - `obterVendasPorProduto()` - Filtra apenas clientes de fontes principais
  - `obterEstatisticasGerais()` - Filtra apenas clientes de fontes principais
  - `obterTendencias()` - Filtra apenas clientes de fontes principais
  - `exportarDados()` - Filtra apenas clientes de fontes principais

### 2. `components/vendedor-meta-resumo.tsx`
- **Import adicionado**: `import { isFontePrincipal } from "@/lib/fontes-config"`
- **Filtro aplicado**: Na função de filtro de clientes do vendedor

### 3. `app/minhas-metas/page.tsx`
- **Import adicionado**: `import { isFontePrincipal } from "@/lib/fontes-config"`
- **Filtro aplicado**: Na função de filtro de clientes do vendedor

### 4. `components/goal-tracker.tsx`
- **Import adicionado**: `import { isFontePrincipal } from "@/lib/fontes-config"`
- **Filtro aplicado**: No cálculo de progresso das metas (tanto para admin quanto para vendedores)

### 5. `components/advanced-stats.tsx`
- **Import adicionado**: `import { isFontePrincipal } from "@/lib/fontes-config"`
- **Filtros aplicados**:
  - Cálculo de clientes hoje/ontem
  - Cálculo de valor total
  - Cálculo de ticket médio
  - Cálculo de taxa de conversão

### 6. `app/analytics/metas/page.tsx`
- **Import adicionado**: `import { useToast } from "@/hooks/use-toast"`
- **Hook adicionado**: `const { toast } = useToast();`

## Como Funciona o Filtro

### Fontes Principais (Contam nas Metas)
- Indicação(RO)
- URA
- Trafego
- Rede Social
- Balcão
- Discador
- Cliente Fixo
- Indicação

### Fontes de Corretor (NÃO Contam nas Metas)
- Corretor(TI)
- Corretor(RA)
- Corretor(JO)
- Corretor(GI)
- Corretor(WE)
- Corretor(GE)
- Corretor(CA)
- Corretor(BI)
- Corretor(SA)

## Resultado
Agora todas as métricas, metas e comissões consideram apenas clientes de fontes principais, excluindo completamente os corretores dos cálculos de performance dos vendedores.

## Verificação
Para confirmar que a correção está funcionando:
1. Verifique que as metas dos vendedores não incluem clientes de corretores
2. Verifique que a meta geral da empresa não inclui clientes de corretores
3. Verifique que as comissões são calculadas apenas sobre clientes de fontes principais
4. Verifique que os gráficos de analytics mostram apenas dados de fontes principais

## Impacto
- **Positivo**: Metas mais precisas e justas para os vendedores
- **Positivo**: Comissões calculadas corretamente
- **Positivo**: Analytics mais precisos para tomada de decisão
- **Neutro**: Corretores continuam sendo registrados no sistema, mas não afetam metas
