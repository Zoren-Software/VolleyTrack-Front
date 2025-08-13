# Integração com Stripe.js

Este documento explica como configurar e usar a integração com Stripe.js no projeto VoleiClub.

## 📋 Pré-requisitos

- Conta no [Stripe](https://stripe.com)
- Chaves de API do Stripe (publishable e secret)
- Projeto Nuxt.js configurado

## 🚀 Instalação

### 1. Instalar dependências

```bash
pnpm add @stripe/stripe-js
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `stripe.config.example` para `.env` e preencha com suas chaves:

```bash
cp stripe.config.example .env
```

Edite o arquivo `.env`:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

### 3. Verificar configuração

O plugin `plugins/stripe.client.ts` será carregado automaticamente e disponibilizará o Stripe globalmente.

## 🎯 Componentes Disponíveis

### ZStripePaymentForm

Formulário completo de pagamento usando o Payment Element do Stripe.

**Props:**
- `amount` (Number, obrigatório): Valor em centavos
- `currency` (String, padrão: 'BRL'): Código da moeda
- `clientSecret` (String, obrigatório): Client Secret do PaymentIntent

**Events:**
- `@payment-success`: Emitido quando o pagamento é bem-sucedido
- `@payment-error`: Emitido quando há erro no pagamento

**Exemplo de uso:**

```vue
<template>
  <ZStripePaymentForm
    :amount="9900"
    :currency="BRL"
    :client-secret="clientSecret"
    @payment-success="handleSuccess"
    @payment-error="handleError"
  />
</template>
```

### ZStripeCardForm

Formulário simples para pagamento apenas com cartão de crédito.

**Props:**
- `amount` (Number, obrigatório): Valor em centavos
- `currency` (String, padrão: 'BRL'): Código da moeda

**Events:**
- `@payment-success`: Emitido quando o PaymentMethod é criado
- `@payment-error`: Emitido quando há erro

## 🔧 Utilitários

### stripeHelper.js

Arquivo com funções utilitárias para o Stripe:

- `formatCurrency(amount, currency)`: Formata valor em centavos
- `convertToCents(amount)`: Converte reais para centavos
- `convertFromCents(amount)`: Converte centavos para reais
- `isValidStripeKey(key)`: Valida chave do Stripe
- `getStripeEnvironment(key)`: Obtém ambiente (test/live)
- `createStripeStyles(customStyles)`: Cria estilos para elementos
- `getStripeErrorMessage(error)`: Trata erros do Stripe
- `createPaymentElementOptions(options)`: Cria opções do Payment Element

## 📱 Página de Exemplo

A página `/payment` demonstra como usar os componentes:

- Seleção entre diferentes métodos de pagamento
- Formulários de pagamento funcionais
- Resumo do pedido
- Tratamento de eventos

## 🔒 Segurança

### Chaves de API

- **NUNCA** exponha a chave secreta no frontend
- Use apenas a chave publicável (`STRIPE_PUBLISHABLE_KEY`)
- A chave secreta deve ser usada apenas no backend

### Validação

- Sempre valide dados no backend antes de processar pagamentos
- Use webhooks para confirmar transações
- Implemente rate limiting para evitar abusos

## 🧪 Testes

### Cartões de Teste

Use estes cartões para testar:

- **Sucesso:** 4242 4242 4242 4242
- **Falha:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

### Ambientes

- **Teste:** Use chaves que começam com `pk_test_` e `sk_test_`
- **Produção:** Use chaves que começam com `pk_live_` e `sk_live_`

## 📚 Recursos Adicionais

- [Documentação oficial do Stripe.js](https://docs.stripe.com/js)
- [Stripe Elements](https://stripe.com/docs/stripe-js/elements)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)

## 🐛 Solução de Problemas

### Erro: "Stripe não foi inicializado"

- Verifique se a chave `STRIPE_PUBLISHABLE_KEY` está configurada
- Confirme se o plugin está sendo carregado
- Verifique o console do navegador para erros

### Erro: "Invalid API key"

- Verifique se a chave está correta
- Confirme se está usando o ambiente correto (test/production)
- Verifique se não há espaços extras na chave

### Elementos não aparecem

- Verifique se o CSS está sendo carregado
- Confirme se o container tem dimensões adequadas
- Verifique se não há conflitos de CSS

## 📝 Notas Importantes

- O Stripe.js só funciona no lado cliente (browser)
- Sempre trate erros de pagamento adequadamente
- Implemente fallbacks para casos de falha
- Teste em diferentes dispositivos e navegadores
- Mantenha as dependências atualizadas
