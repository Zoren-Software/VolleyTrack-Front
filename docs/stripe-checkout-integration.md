# Integração Stripe Checkout - VoleiClub

## Visão Geral

Esta documentação descreve a implementação da integração com o Stripe Checkout usando o novo endpoint do backend Laravel. A integração mantém o fluxo existente mas agora utiliza o endpoint `/v1/checkout-session` para criar sessões de checkout.

## Arquivos Modificados

### 1. Service Layer
- **`services/stripeCheckoutService.js`** - Novo service para gerenciar chamadas da API

### 2. Páginas Atualizadas
- **`pages/payment/index.vue`** - Página principal de pagamento
- **`pages/payment/success.vue`** - Página de sucesso
- **`pages/payment/cancel.vue`** - Página de cancelamento

### 3. Componente Opcional
- **`components/StripeCheckout.vue`** - Componente para checkout inline (opcional)

## Fluxo de Integração

### 1. Criação de Sessão de Checkout

```javascript
// Dados necessários para criar sessão
const checkoutData = {
  price_id: "price_1234567890", // ID do preço do Stripe
  customer_email: "user@example.com",
  success_url: "https://app.volleytrack.com/payment/success",
  cancel_url: "https://app.volleytrack.com/payment/cancel",
  mode: "subscription" // ou "payment"
};

// Criar sessão
const result = await createCheckoutSession(checkoutData);
if (result.success) {
  // Redirecionar para checkout
  await redirectToCheckout(stripe, result.sessionId);
}
```

### 2. Consulta de Sessão

```javascript
// Consultar dados da sessão
const sessionResult = await getCheckoutSession(sessionId);
if (sessionResult.success) {
  console.log('Dados da sessão:', sessionResult.data);
}
```

## Endpoints da API

### POST /v1/checkout-session
Cria uma nova sessão de checkout no Stripe.

**Request:**
```json
{
  "price_id": "price_1234567890",
  "customer_email": "user@example.com",
  "success_url": "https://app.volleytrack.com/payment/success",
  "cancel_url": "https://app.volleytrack.com/payment/cancel",
  "mode": "subscription"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "cs_test_1234567890",
    "url": "https://checkout.stripe.com/c/pay/cs_test_1234567890",
    "mode": "subscription",
    "amount_total": 2999,
    "customer_email": "user@example.com",
    "payment_status": "unpaid"
  }
}
```

### GET /v1/checkout-session/{sessionId}
Consulta dados de uma sessão de checkout.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cs_test_1234567890",
    "mode": "subscription",
    "amount_total": 2999,
    "customer_email": "user@example.com",
    "payment_status": "paid",
    "subscription": {
      "id": "sub_1234567890",
      "current_period_end": 1640995200
    }
  }
}
```

## Configuração

### Variáveis de Ambiente

```env
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NUXT_PUBLIC_STRIPE_SECRET_KEY=sk_test_...
```

### URLs de Redirecionamento

As URLs de sucesso e cancelamento são configuradas automaticamente:

- **Sucesso:** `${window.location.origin}/payment/success`
- **Cancelamento:** `${window.location.origin}/payment/cancel`

## Tratamento de Erros

### Validação de Dados
```javascript
const validation = validateCheckoutData(checkoutData);
if (!validation.isValid) {
  console.error('Erros de validação:', validation.errors);
}
```

### Tratamento de Erros da API
```javascript
try {
  const result = await createCheckoutSession(checkoutData);
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  console.error('Erro ao criar sessão:', error.message);
}
```

## Estados de Loading

### Página de Pagamento
- `subscriptionLoading` - Durante criação da sessão
- `stripeLoading` - Durante redirecionamento

### Página de Sucesso
- `loading` - Durante consulta da sessão
- `error` - Em caso de erro na consulta

### Página de Cancelamento
- `loading` - Durante consulta da sessão
- `error` - Em caso de erro na consulta

## Logs de Debug

A integração inclui logs detalhados para facilitar o debugging:

```javascript
console.log('🔍 Criando sessão de checkout:', checkoutData);
console.log('✅ Sessão criada:', result.data);
console.log('🔍 Consultando sessão:', sessionId);
```

## Testes

### Teste Manual
1. Acesse `/payment`
2. Selecione um plano
3. Clique em "Assinar"
4. Complete o checkout no Stripe
5. Verifique redirecionamento para página de sucesso

### Teste de Cancelamento
1. Acesse `/payment`
2. Selecione um plano
3. Clique em "Assinar"
4. Cancele o checkout no Stripe
5. Verifique redirecionamento para página de cancelamento

## Troubleshooting

### Erro: "Chave do Stripe não configurada"
- Verifique se `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` está definida
- Reinicie o servidor de desenvolvimento

### Erro: "Erro ao criar sessão de checkout"
- Verifique se o backend está rodando
- Verifique se o endpoint `/v1/checkout-session` está acessível
- Verifique logs do backend para detalhes do erro

### Erro: "Session ID não encontrado na URL"
- Verifique se as URLs de redirecionamento estão corretas
- Verifique se o Stripe está redirecionando com o parâmetro `session_id`

## Melhorias Futuras

1. **Cache de Sessões** - Implementar cache para consultas de sessão
2. **Retry Logic** - Adicionar lógica de retry para falhas de rede
3. **Analytics** - Adicionar tracking de eventos de checkout
4. **Webhooks** - Implementar webhooks para atualizações em tempo real
5. **Testes Automatizados** - Adicionar testes unitários e de integração

## Suporte

Para dúvidas ou problemas com a integração, entre em contato com a equipe de desenvolvimento ou consulte a documentação oficial do Stripe:

- [Stripe Checkout Documentation](https://stripe.com/docs/checkout)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
