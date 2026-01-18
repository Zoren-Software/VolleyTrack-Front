# Debug: Detecção de Plano Ativo para Troca

## Problema Identificado

O sistema não está detectando corretamente quando o usuário tem um plano ativo, fazendo com que ele tente criar uma nova sessão de checkout em vez de redirecionar para a página de troca.

## Logs de Debug Adicionados

### 1. **Na função `handleSubscriptionAction`**
```javascript
console.log("🔍 handleSubscriptionAction chamada");
console.log("🔍 activePlanData.value:", activePlanData.value);
console.log("🔍 activePlanData.value?.customer_id:", activePlanData.value?.customer_id);
console.log("🔍 selectedPlan.value:", selectedPlan.value);
```

### 2. **Na função `onActivePlanLoaded`**
```javascript
console.log("📋 Plano ativo carregado:", planData);
console.log("🔍 Estrutura completa do planData:", JSON.stringify(planData, null, 2));
console.log("🔍 planData.customer_id:", planData?.customer_id);
console.log("🔍 planData.has_active_plan:", planData?.has_active_plan);
```

## Como Testar

### 1. **Abrir Console do Navegador**
- F12 → Console
- Acessar `/payment`
- Verificar logs de debug

### 2. **Verificar Logs Esperados**

#### **Se o usuário TEM plano ativo:**
```
📋 Plano ativo carregado: {has_active_plan: true, customer_id: "123", ...}
🔍 Estrutura completa do planData: {...}
🔍 planData.customer_id: 123
🔍 planData.has_active_plan: true
✅ Cliente possui plano ativo: Plano Pro Mensal
🔍 customer_id disponível: 123
```

#### **Quando clicar no botão "Trocar":**
```
🔍 handleSubscriptionAction chamada
🔍 activePlanData.value: {has_active_plan: true, customer_id: "123", ...}
🔍 activePlanData.value?.customer_id: 123
🔍 selectedPlan.value: {id: "prod_123", name: "Plano Clubes Anual", ...}
🔍 priceId encontrado: price_456
🔄 Usuário tem plano ativo, redirecionando para troca de planos: /payment/swap?price_id=price_456
```

#### **Se o usuário NÃO tem plano ativo:**
```
📋 Plano ativo carregado: null
ℹ️ Cliente não possui plano ativo
```

#### **Quando clicar no botão "Assinar":**
```
🔍 handleSubscriptionAction chamada
🔍 activePlanData.value: null
🔍 activePlanData.value?.customer_id: undefined
🔍 selectedPlan.value: {id: "prod_123", name: "Plano Pro Mensal", ...}
🔄 Usuário não tem plano ativo, fazendo checkout normal
🔍 Motivo: activePlanData.value = null
🔍 Motivo: customer_id = undefined
```

## Possíveis Problemas

### 1. **`activePlanData.value` é `null`**
- **Causa**: `ActivePlanChecker` não está carregando o plano ativo
- **Solução**: Verificar se a API `/v1/customers/active-plan` está retornando dados

### 2. **`activePlanData.value` existe mas `customer_id` é `undefined`**
- **Causa**: Estrutura de dados da API não contém `customer_id`
- **Solução**: Verificar estrutura de resposta da API e ajustar mapeamento

### 3. **`selectedPlan.value` é `null`**
- **Causa**: Usuário não selecionou um plano
- **Solução**: Verificar se o usuário clicou em um plano antes de clicar no botão

## Estruturas de Dados Esperadas

### **Resposta da API `/v1/customers/active-plan`:**
```javascript
{
  "success": true,
  "data": {
    "has_active_plan": true,
    "customer_id": "123",
    "product": {
      "name": "Plano Pro Mensal",
      "description": "Plano profissional"
    },
    "price": {
      "unit_amount": 5000,
      "recurring": {
        "interval": "month",
        "interval_count": 1
      }
    },
    "subscription": {
      "id": "sub_123",
      "status": "active",
      "price_id": "price_456",
      "current_period_end": "2024-02-15T00:00:00Z"
    }
  }
}
```

### **Dados do Plano Selecionado:**
```javascript
{
  "id": "prod_789",
  "name": "Plano Clubes Anual",
  "prices": {
    "data": [
      {
        "id": "price_789",
        "unit_amount": 29900,
        "recurring": {
          "interval": "year",
          "interval_count": 1
        }
      }
    ]
  }
}
```

## Próximos Passos

1. **Testar com os logs** para identificar onde está falhando
2. **Verificar estrutura da API** se `customer_id` não estiver presente
3. **Ajustar mapeamento** se necessário
4. **Implementar fallback** se a estrutura for diferente

## Comandos de Debug no Console

```javascript
// Verificar dados do plano ativo
console.log("activePlanData:", activePlanData.value);

// Verificar plano selecionado
console.log("selectedPlan:", selectedPlan.value);

// Verificar localStorage
console.log("localStorage:", {
  customer_id: localStorage.getItem("customer_id"),
  activePlanData: localStorage.getItem("activePlanData")
});

// Forçar recarregamento do plano ativo
// (se o ActivePlanChecker tiver método público)
// activePlanChecker.value.checkActivePlan();
```


