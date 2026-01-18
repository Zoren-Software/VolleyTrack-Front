# Stripe Elements - Guia de Uso

## 📋 **Visão Geral**

Este componente (`ZStripeElementsForm`) implementa um formulário de pagamento completo usando o Stripe Elements, oferecendo uma interface personalizada e funcional para processar pagamentos.

## 🚀 **Como Usar**

### **1. Importar o Componente**

```vue
<template>
  <ZStripeElementsForm
    :amount="5000"
    :currency="BRL"
    :client-secret="clientSecret"
    :product-name="'Nome do Produto'"
    :stripe-key="stripeKey"
    @payment-success="handleSuccess"
    @payment-error="handleError"
  />
</template>
```

### **2. Props Obrigatórias**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `amount` | Number | Valor em centavos (ex: 5000 = R$ 50,00) |
| `clientSecret` | String | Client Secret do PaymentIntent do Stripe |
| `stripeKey` | String | Chave pública do Stripe (pk_test_... ou pk_live_...) |

### **3. Props Opcionais**

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `currency` | String | "BRL" | Moeda do pagamento |
| `productName` | String | "Produto" | Nome do produto/serviço |

### **4. Eventos**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `@payment-success` | `{ amount: number }` | Pagamento realizado com sucesso |
| `@payment-error` | `Error` | Erro durante o pagamento |

## ⚙️ **Configuração do Backend**

### **1. Criar PaymentIntent**

```javascript
// Node.js com Stripe
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // R$ 50,00
  currency: 'brl',
  automatic_payment_methods: {
    enabled: true,
  },
});

// Retornar clientSecret para o frontend
return { clientSecret: paymentIntent.client_secret };
```

### **2. Endpoint da API**

```javascript
// POST /api/create-payment-intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'brl' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🎨 **Personalização**

### **1. Cores e Tema**

```javascript
const appearance = {
  theme: "flat", // ou "stripe"
  variables: {
    colorPrimaryText: "#262626",
    colorPrimary: "#667eea",
  },
};
```

### **2. Estilos CSS**

```css
.card-element {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  min-height: 60px;
}

.payment-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* ... outros estilos */
}
```

## 🔒 **Segurança**

### **1. Chaves do Stripe**

- **Frontend**: Use apenas `pk_test_...` ou `pk_live_...` (chaves públicas)
- **Backend**: Use apenas `sk_test_...` ou `sk_live_...` (chaves secretas)
- **Nunca** exponha chaves secretas no frontend

### **2. Validação**

- Sempre valide o `amount` no backend
- Verifique o `clientSecret` antes de processar
- Implemente rate limiting para evitar abuso

## 🧪 **Teste**

### **1. Cartões de Teste**

| Número | Descrição |
|--------|-----------|
| `4242 4242 4242 4242` | Pagamento com sucesso |
| `4000 0000 0000 0002` | Pagamento recusado |
| `4000 0000 0000 9995` | Saldo insuficiente |

### **2. Códigos de Segurança**

- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

## 📱 **Responsividade**

O componente é totalmente responsivo e funciona em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile
- ✅ Todos os navegadores modernos

## 🚨 **Troubleshooting**

### **Erro: "Stripe não foi carregado"**
- Verifique se o script do Stripe.js está sendo carregado
- Certifique-se de que `window.Stripe` existe

### **Erro: "Client Secret inválido"**
- Verifique se o `clientSecret` está correto
- Confirme se o PaymentIntent ainda é válido

### **Erro: "Elemento não encontrado"**
- Verifique se a div `#card-element` existe no DOM
- Confirme se o componente foi montado corretamente

## 🔗 **Links Úteis**

- [Documentação oficial do Stripe](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/stripe-js/elements)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Teste de cartões](https://stripe.com/docs/testing#cards)
