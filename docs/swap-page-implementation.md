# Página de Troca de Planos - `/payment/swap`

## Visão Geral

A página `/payment/swap` foi criada para permitir que usuários com planos ativos façam a troca para novos planos com cálculo de pro-rata automático.

## Funcionalidades

### 1. **Detecção Automática de Dados**
- Obtém `price_id` da URL (`/payment/swap?price_id=price_123`)
- Busca `customer_id` no localStorage (salvo pelo `ActivePlanChecker`)
- Carrega preview da troca automaticamente

### 2. **Preview da Troca**
- Mostra plano atual vs. novo plano
- Calcula pro-rata (crédito, cobrança, total)
- Exibe dias restantes no período
- Mostra próxima data de cobrança

### 3. **Confirmação da Troca**
- Botão de confirmação com loading state
- Executa troca via API do backend
- Redireciona de volta para página de planos após sucesso

## Estrutura da Página

### **Estados da Interface:**
1. **Loading**: Spinner enquanto carrega dados
2. **Error**: Mensagem de erro com botão para voltar
3. **Swap Form**: Formulário completo de troca

### **Seções:**
- **Header**: Título e descrição
- **Plano Atual**: Card com informações do plano atual
- **Novo Plano**: Card com informações do novo plano
- **Detalhes da Troca**: Cálculo de pro-rata
- **Ações**: Botões Cancelar e Confirmar

## Integração com Backend

### **Endpoints Utilizados:**
- `POST /v1/subscriptions/preview-swap` - Calcula preview
- `POST /v1/subscriptions/swap-plan` - Executa troca

### **Dados Enviados:**
```javascript
{
  customer_id: "123",
  new_price_id: "price_123",
  proration_behavior: "create_prorations"
}
```

### **Resposta Esperada (Preview):**
```javascript
{
  "success": true,
  "data": {
    "current_plan": {
      "name": "Plano Pro Mensal",
      "amount": 5000,
      "interval": "month",
      "interval_count": 1
    },
    "new_plan": {
      "name": "Plano Clubes Anual",
      "amount": 29900,
      "interval": "year",
      "interval_count": 1
    },
    "credit_amount": 2500,
    "charge_amount": 29900,
    "total_amount": 27400,
    "days_remaining": 15,
    "next_billing_date": "2024-02-15T00:00:00Z"
  }
}
```

## Obtenção do Customer ID

### **Estratégias (em ordem de prioridade):**
1. **localStorage 'customer_id'** - Salvo pelo `ActivePlanChecker`
2. **localStorage 'activePlanData'** - Dados completos do plano ativo
3. **userToken** - Extração do token JWT (se contiver customer_id)

### **Código de Obtenção:**
```javascript
const getCustomerId = () => {
  // 1. Tentar localStorage direto
  const storedCustomerId = localStorage.getItem('customer_id')
  if (storedCustomerId) return storedCustomerId

  // 2. Tentar activePlanData
  try {
    const activePlanData = localStorage.getItem('activePlanData')
    if (activePlanData) {
      const parsed = JSON.parse(activePlanData)
      if (parsed.customer_id) return parsed.customer_id
    }
  } catch (err) {
    console.warn('Erro ao parsear activePlanData:', err)
  }

  // 3. Tentar extrair do token
  const userToken = localStorage.getItem('userToken')
  if (userToken) {
    try {
      const tokenData = JSON.parse(atob(userToken.split('.')[1]))
      if (tokenData.customer_id) return tokenData.customer_id
    } catch (err) {
      console.warn('Erro ao extrair customer_id do token:', err)
    }
  }

  return null
}
```

## Fluxo de Uso

### **1. Usuário com Plano Ativo:**
1. Acessa página de planos
2. Seleciona novo plano
3. Clica "🔄 Trocar para [Plano]"
4. Redireciona para `/payment/swap?price_id=...`

### **2. Na Página de Troca:**
1. Carrega preview automaticamente
2. Mostra comparação de planos
3. Exibe cálculo de pro-rata
4. Usuário confirma troca
5. Executa troca via API
6. Redireciona para página de planos

## Tratamento de Erros

### **Erros Possíveis:**
- **Price ID não fornecido**: Erro de validação
- **Customer ID não encontrado**: Erro de autenticação
- **Preview falha**: Erro de API
- **Troca falha**: Erro de execução

### **Estados de Erro:**
- **Loading Error**: Erro ao carregar preview
- **Swap Error**: Erro ao executar troca
- **Network Error**: Problemas de conectividade

## Responsividade

### **Mobile (< 768px):**
- Cards de planos empilhados verticalmente
- Botões de ação em coluna
- Texto e espaçamentos ajustados

### **Desktop (≥ 768px):**
- Layout em grid com planos lado a lado
- Botões de ação em linha
- Espaçamentos generosos

## Próximos Passos

1. **Testar integração completa** com backend
2. **Implementar notificações** de sucesso/erro
3. **Adicionar loading states** mais detalhados
4. **Implementar validações** adicionais
5. **Adicionar histórico** de trocas

## Logs de Debug

### **Console do Navegador:**
```
🔄 Carregando preview da troca: {customerId: "123", priceId: "price_123"}
✅ Preview carregado com sucesso: {data: {...}}
🔄 Confirmando troca de plano: {customerId: "123", priceId: "price_123"}
✅ Plano trocado com sucesso: {data: {...}}
```

### **Service de Troca:**
```
🔍 Calculando preview da troca de planos: {customerId: "123", newPriceId: "price_123"}
✅ Preview da troca calculado com sucesso: {data: {...}}
🔄 Executando troca de planos: {customerId: "123", newPriceId: "price_123", prorationBehavior: "create_prorations"}
✅ Troca de planos executada com sucesso: {data: {...}}
```


