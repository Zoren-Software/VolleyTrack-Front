# Sistema de Redirecionamento para Troca de Planos

## Visão Geral

O sistema foi modificado para detectar automaticamente quando um usuário já possui um plano ativo e redirecioná-lo para uma rota específica de troca de planos, em vez de mostrar um modal.

## Como Funciona

### 1. Detecção de Plano Ativo
- O sistema verifica se `activePlanData.value` existe e contém `customer_id`
- Se o usuário tem um plano ativo, o botão principal muda de "Assinar" para "🔄 Trocar para [Nome do Plano]"

### 2. Lógica do Botão Principal
```javascript
const handleSubscriptionAction = () => {
  // Se tem plano ativo, redirecionar para rota de troca
  if (activePlanData.value && activePlanData.value.customer_id) {
    const priceId = selectedPlan.value.prices?.data?.[0]?.id;
    if (priceId) {
      const swapUrl = `/payment/swap?price_id=${encodeURIComponent(priceId)}`;
      window.location.href = swapUrl;
    }
  } else {
    // Se não tem plano ativo, fazer checkout normal
    subscribeToPlan();
  }
};
```

### 3. Estados dos Botões

#### **Usuário SEM plano ativo:**
- Botão: "Assinar [Nome do Plano] - R$ [Valor]"
- Ação: Cria checkout normal do Stripe
- Cor: Azul (gradiente padrão)

#### **Usuário COM plano ativo:**
- Botão: "🔄 Trocar para [Nome do Plano] - R$ [Valor]"
- Ação: Redireciona para `/payment/swap?price_id=[ID]`
- Cor: Laranja (gradiente de troca)

### 4. Botões dos Planos
- **Plano Ativo**: "✅ Plano em Uso" (desabilitado)
- **Plano Selecionado**: "Selecionado"
- **Outros Planos**: "Selecionar Plano"

## Rota de Troca

A rota `/payment/swap` deve ser implementada para:
1. Receber o `price_id` como parâmetro
2. Mostrar preview da troca com pro-rata
3. Permitir confirmação da troca
4. Executar a troca via API

## Vantagens do Sistema

1. **UX Mais Clara**: Usuário entende imediatamente que pode trocar planos
2. **Separação de Responsabilidades**: Checkout normal vs. troca de planos
3. **URLs Amigáveis**: Fácil de compartilhar e bookmark
4. **Melhor SEO**: Páginas específicas para cada funcionalidade
5. **Debugging Mais Fácil**: Logs separados para cada fluxo

## Implementação Necessária

### Backend
- Implementar rota `/payment/swap` no frontend
- Endpoints de troca de planos já existem:
  - `POST /v1/subscriptions/preview-swap`
  - `POST /v1/subscriptions/swap-plan`

### Frontend
- Criar página `/payment/swap.vue`
- Implementar lógica de preview e confirmação
- Integrar com `planSwapService.js`

## Exemplo de Uso

1. Usuário com plano "Pro Mensal" ativo
2. Seleciona "Plano Clubes Anual"
3. Botão muda para "🔄 Trocar para Plano Clubes Anual - R$ 299,00/ano"
4. Clica no botão → redireciona para `/payment/swap?price_id=price_123`
5. Na página de troca, vê preview com pro-rata
6. Confirma a troca → executa via API
7. Retorna para página de planos com novo plano ativo


