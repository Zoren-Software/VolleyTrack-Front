# Testando o Sistema de Redirecionamento para Troca de Planos

## Cenários de Teste

### 1. Usuário SEM Plano Ativo
**Comportamento Esperado:**
- Botão principal: "Assinar [Nome do Plano] - R$ [Valor]"
- Cor: Azul (gradiente padrão)
- Ação: Cria checkout normal do Stripe

**Como Testar:**
1. Faça login com usuário que não tem plano ativo
2. Selecione um plano
3. Clique no botão "Assinar"
4. Deve redirecionar para checkout do Stripe

### 2. Usuário COM Plano Ativo (Detecção Frontend)
**Comportamento Esperado:**
- Botão principal: "🔄 Trocar para [Nome do Plano] - R$ [Valor]"
- Cor: Laranja (gradiente de troca)
- Ação: Redireciona para `/payment/swap?price_id=[ID]`

**Como Testar:**
1. Faça login com usuário que tem plano ativo
2. Selecione um plano diferente
3. Clique no botão "🔄 Trocar"
4. Deve redirecionar para `/payment/swap?price_id=...`

### 3. Usuário COM Plano Ativo (Fallback Backend)
**Comportamento Esperado:**
- Se a detecção frontend falhar, o backend retorna erro 400
- Sistema detecta automaticamente e redireciona para troca

**Como Testar:**
1. Faça login com usuário que tem plano ativo
2. Selecione um plano diferente
3. Clique no botão (pode ser "Assinar" se detecção falhar)
4. Sistema deve detectar erro 400 e redirecionar automaticamente

## Logs de Debug

### Console do Navegador
Procure por estas mensagens:

```
🔄 Usuário tem plano ativo, redirecionando para troca de planos: /payment/swap?price_id=...
🔄 Usuário não tem plano ativo, fazendo checkout normal
🔄 Customer já possui assinatura ativa, redirecionando para troca de planos
🔍 Verificando se é erro de subscription existente: {message: "...", isExistingSubscription: true}
```

### Service de Checkout
```
🔍 Verificando se é erro de subscription existente: {
  message: "Customer already has an active subscription. Use the plan swap endpoint instead.",
  isExistingSubscription: true
}
🔄 Erro 400 detectado como subscription existente, retornando flag
```

## Mensagens de Erro Detectadas

O sistema detecta estas mensagens como "subscription existente":
- "already has an active subscription"
- "subscription already exists"
- "já possui uma assinatura ativa"
- "use the plan swap endpoint instead"
- "customer already has an active subscription"

## Estrutura de Dados

### activePlanData (quando usuário tem plano)
```javascript
{
  customer_id: "123",
  subscription: {
    price_id: "price_123",
    status: "active"
  },
  product: {
    name: "Plano Pro Mensal"
  },
  price: {
    unit_amount: 5000
  }
}
```

### Resposta de Erro 400
```javascript
{
  "success": false,
  "message": "Customer already has an active subscription. Use the plan swap endpoint instead.",
  "data": {
    "existing_subscription": {
      "id": 1,
      "stripe_id": "sub_123",
      "price_id": "price_123",
      "status": "active"
    },
    "suggested_action": "Use POST /v1/subscriptions/swap-plan to change the plan"
  }
}
```

## Troubleshooting

### Problema: Botão não muda para "Trocar"
**Causa:** `activePlanData` não está sendo carregado
**Solução:** Verificar se `ActivePlanChecker` está funcionando

### Problema: Erro 400 não é detectado
**Causa:** Mensagem de erro não está na lista de detecção
**Solução:** Adicionar nova mensagem em `stripeCheckoutService.js`

### Problema: Redirecionamento não funciona
**Causa:** `price_id` não encontrado
**Solução:** Verificar estrutura do `selectedPlan.value.prices`

## Próximos Passos

1. Implementar página `/payment/swap.vue`
2. Testar integração completa
3. Adicionar loading states
4. Implementar tratamento de erros na página de troca


