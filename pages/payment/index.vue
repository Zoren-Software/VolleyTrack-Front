<template>
  <div class="payment-page">
    <div class="container">
      <h1>Página de Pagamento</h1>

      <!-- Seleção do método de pagamento -->
      <div class="payment-methods">
        <div class="payment-card">
          <h3>Método de Pagamento</h3>
          <p class="payment-description">
            Aceitamos apenas pagamentos com cartão de crédito
          </p>
        </div>
      </div>

      <!-- Formulário de pagamento -->
      <div class="payment-form">
        <!-- Formulário com Card Element -->
        <ZStripeCardForm
          :amount="amount"
          :currency="currency"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
        />
      </div>

      <!-- Resumo do pedido -->
      <div class="order-summary">
        <div class="summary-card">
          <h3>Resumo do Pedido</h3>

          <div class="summary-item">
            <span>Produto:</span>
            <span>Assinatura Premium</span>
          </div>
          <div class="summary-item">
            <span>Valor:</span>
            <span>{{ formatCurrency(amount) }}</span>
          </div>
          <div class="summary-item total">
            <span>Total:</span>
            <span>{{ formatCurrency(amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ZStripeCardForm from "~/components/molecules/Payment/ZStripeCardForm.vue";

// Configuração da página
definePageMeta({
  layout: "default",
  //middleware: ["auth"],
});

// Estado local
const amount = ref(9900); // R$ 99,00 em centavos
const currency = ref("BRL");

// Computed
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.value,
  }).format(value / 100);
};

// Event handlers
const handlePaymentSuccess = (data) => {
  console.log("Pagamento realizado com sucesso:", data);
  // Aqui você pode redirecionar para uma página de sucesso
  // ou mostrar uma mensagem de confirmação
};

const handlePaymentError = (error) => {
  console.error("Erro no pagamento:", error);
  // Aqui você pode mostrar uma mensagem de erro
  // ou redirecionar para uma página de erro
};
</script>

<style scoped>
.payment-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: #333;
}

.payment-methods {
  margin-bottom: 24px;
}

.payment-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.payment-description {
  color: #666;
  margin: 8px 0 0 0;
  font-size: 14px;
}

.payment-form {
  margin-bottom: 24px;
}

.order-summary {
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 600;
  font-size: 18px;
  color: #1976d2;
}
</style>
