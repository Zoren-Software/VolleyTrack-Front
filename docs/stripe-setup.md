# 🚀 Configuração do Stripe para VoleiClub

## 📋 Pré-requisitos

1. **Conta no Stripe**: [Criar conta](https://dashboard.stripe.com/register)
2. **Chaves de API**: Obter do dashboard do Stripe
3. **Node.js**: Versão 16+ instalada

## 🔑 Configuração das Chaves

### 1. Obter Chaves do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers** → **API keys**
3. Copie as chaves:
   - **Publishable key** (começa com `pk_test_` ou `pk_live_`)
   - **Secret key** (começa com `sk_test_` ou `sk_live_`)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui

# Environment
NODE_ENV=development
```

### 3. Configurar Nuxt

No `nuxt.config.ts`, as configurações já estão prontas:

```typescript
runtimeConfig: {
  public: {
    stripePublishableKey: '', // NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    stripeSecretKey: '', // NUXT_PUBLIC_STRIPE_SECRET_KEY
  }
}
```

## 🧪 Testando a Integração

### 1. Cartões de Teste

Use estes cartões para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 2. Acessar Páginas

- **Página Principal**: `/payment`
- **Página de Teste**: `/payment-test`

## ⚠️ Problemas Comuns

### Erro: "clientSecret required"

**Causa**: O PaymentElement precisa de um PaymentIntent do backend.

**Solução**: Para demonstração, use o modo `payment` sem clientSecret:

```typescript
elements.value = $stripe.elements({
  mode: 'payment',
  amount: props.amount,
  currency: props.currency.toLowerCase(),
});
```

### Erro: "Stripe não foi inicializado"

**Causa**: Plugin não carregou ou chave inválida.

**Solução**: 
1. Verificar se `.env` está configurado
2. Verificar console para erros
3. Reiniciar o servidor

## 🔄 Próximos Passos

### 1. Backend Integration

Para produção, implemente:

```typescript
// 1. Criar PaymentIntent no backend
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000, // em centavos
  currency: 'brl',
});

// 2. Passar clientSecret para o frontend
elements.value = $stripe.elements({
  clientSecret: paymentIntent.client_secret,
});
```

### 2. Webhooks

Configure webhooks para:
- Confirmação de pagamentos
- Falhas de pagamento
- Reembolsos

### 3. Validações

Adicione validações:
- Verificação de CEP
- Validação de CPF
- Verificação de limite de cartão

## 📚 Recursos Úteis

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/stripe-js/elements)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)

## 🆘 Suporte

Se encontrar problemas:

1. Verificar console do navegador
2. Verificar logs do servidor
3. Consultar documentação do Stripe
4. Verificar se as chaves estão corretas
