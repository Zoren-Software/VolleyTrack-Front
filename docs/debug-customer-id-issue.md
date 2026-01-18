# Debug: Problema com Customer ID na Página de Troca

## Problema Identificado

A página `/payment/swap` está retornando erro "ID do customer não encontrado. Faça login novamente." mesmo quando o usuário tem um plano ativo.

## Possíveis Causas

### 1. **Customer ID não está sendo salvo no localStorage**
- O `ActivePlanChecker` pode não estar salvando o `customer_id` corretamente
- A estrutura de dados da API pode ter mudado

### 2. **Estrutura de dados aninhada**
- O `customer_id` pode estar em uma propriedade diferente da esperada
- Pode estar em `data.customer.id` em vez de `data.customer_id`

### 3. **Timing de carregamento**
- O `ActivePlanChecker` pode não ter carregado ainda quando a página de troca é acessada
- O localStorage pode estar vazio no momento do acesso

## Soluções Implementadas

### 1. **Logs Detalhados de Debug**
```javascript
// Na função getCustomerId()
console.log("🔍 localStorage completo:", {
  customer_id: localStorage.getItem("customer_id"),
  activePlanData: localStorage.getItem("activePlanData"),
  userToken: localStorage.getItem("userToken"),
  apolloToken: localStorage.getItem("apollo:default.token")
});
```

### 2. **Múltiplas Estratégias de Busca**
```javascript
// Tentar diferentes propriedades possíveis
const customerId = parsed.customer_id || parsed.customer?.id || parsed.id;
```

### 3. **Fallback para API**
```javascript
// Se não encontrar no localStorage, buscar na API
if (!customerId) {
  const activePlanResponse = await getActivePlan(token);
  customerId = activePlanResponse.data.customer_id || 
              activePlanResponse.data.customer?.id || 
              activePlanResponse.data.id;
}
```

## Como Debugar

### 1. **Abrir Console do Navegador**
- F12 → Console
- Acessar `/payment/swap?price_id=...`
- Verificar logs de debug

### 2. **Verificar localStorage**
```javascript
// No console do navegador
console.log("localStorage completo:", {
  customer_id: localStorage.getItem("customer_id"),
  activePlanData: localStorage.getItem("activePlanData"),
  userToken: localStorage.getItem("userToken")
});
```

### 3. **Verificar Estrutura da API**
```javascript
// No console do navegador
const activePlanData = JSON.parse(localStorage.getItem("activePlanData"));
console.log("Estrutura do activePlanData:", activePlanData);
console.log("Propriedades disponíveis:", Object.keys(activePlanData));
```

## Logs Esperados

### **Sucesso:**
```
🔍 Iniciando busca por customer_id...
🔍 localStorage completo: {customer_id: "123", activePlanData: "{...}", ...}
✅ Customer ID encontrado no localStorage direto: 123
🔄 Carregando preview da troca: {customerId: "123", priceId: "price_123"}
✅ Preview carregado com sucesso: {...}
```

### **Fallback para API:**
```
🔍 Iniciando busca por customer_id...
❌ activePlanData não encontrado no localStorage
🔍 Customer ID não encontrado no localStorage, tentando obter da API...
✅ Customer ID obtido da API: 123
🔄 Carregando preview da troca: {customerId: "123", priceId: "price_123"}
```

### **Erro:**
```
🔍 Iniciando busca por customer_id...
❌ activePlanData não encontrado no localStorage
❌ userToken não encontrado no localStorage
❌ Customer ID não encontrado em nenhuma fonte
❌ Erro ao carregar preview: ID do customer não encontrado. Faça login novamente.
```

## Próximos Passos

1. **Testar a página** com os logs de debug
2. **Verificar console** para identificar onde está falhando
3. **Ajustar estratégia** baseada nos logs
4. **Implementar solução definitiva** baseada na estrutura real dos dados

## Estruturas de Dados Possíveis

### **Estrutura 1 (Esperada):**
```javascript
{
  has_active_plan: true,
  customer_id: "123",
  product: {...},
  price: {...},
  subscription: {...}
}
```

### **Estrutura 2 (Aninhada):**
```javascript
{
  has_active_plan: true,
  customer: {
    id: "123",
    email: "user@example.com"
  },
  product: {...},
  price: {...},
  subscription: {...}
}
```

### **Estrutura 3 (Diferente):**
```javascript
{
  has_active_plan: true,
  id: "123", // customer_id como id principal
  product: {...},
  price: {...},
  subscription: {...}
}
```


