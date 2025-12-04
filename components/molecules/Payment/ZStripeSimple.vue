<template>
  <div class="stripe-simple">
    <div class="payment-card">
      <div class="card-header">
        <h3>Pagamento Rápido</h3>
      </div>

      <div class="card-body">
        <div class="payment-info">
          <p>
            Valor: <strong>{{ formatCurrency(amount) }}</strong>
          </p>
        </div>

        <!-- Campo do cartão -->
        <div class="card-input">
          <label>Número do Cartão</label>
          <div id="card-element" class="card-element"></div>
          <div id="card-errors" class="card-errors"></div>
        </div>

        <!-- Botão de pagamento -->
        <div class="payment-button">
          <button
            :disabled="loading || !stripe"
            @click="handlePayment"
            class="pay-button"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Pagar Agora</span>
          </button>
        </div>

        <!-- Status -->
        <div v-if="status" :class="['status', status.type]">
          {{ status.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Props
const props = defineProps({
  amount: {
    type: Number,
    default: 9900, // R$ 99,00
  },
});

// Estado
const loading = ref(false);
const status = ref(null);
const cardElement = ref(null);
const stripe = ref(null);

// Composables
const { $stripe } = useNuxtApp();

// Métodos
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};

const handlePayment = async () => {
  if (!cardElement.value || !stripe.value) return;

  loading.value = true;
  status.value = null;

  try {
    const { error, paymentMethod } = await stripe.value.createPaymentMethod({
      type: "card",
      card: cardElement.value,
    });

    if (error) {
      status.value = {
        type: "error",
        message: error.message,
      };
    } else {
      status.value = {
        type: "success",
        message: "Pagamento processado com sucesso!",
      };

      // Aqui você enviaria o paymentMethod.id para seu backend
      console.log("PaymentMethod:", paymentMethod);
    }
  } catch (error) {
    status.value = {
      type: "error",
      message: "Erro ao processar pagamento",
    };
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  if (!$stripe) {
    status.value = {
      type: "error",
      message: "Stripe não foi inicializado",
    };
    return;
  }

  stripe.value = $stripe;

  // Cria o elemento do cartão
  const elements = $stripe.elements();
  cardElement.value = elements.create("card", {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": { color: "#aab7c4" },
      },
      invalid: { color: "#9e2146" },
    },
  });

  // Monta o elemento
  cardElement.value.mount("#card-element");

  // Listener para erros
  cardElement.value.on("change", ({ error }) => {
    const displayError = document.getElementById("card-errors");
    if (error) {
      displayError.textContent = error.message;
    } else {
      displayError.textContent = "";
    }
  });
});
</script>

<style scoped>
.stripe-simple {
  max-width: 400px;
  margin: 0 auto;
}

.payment-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.card-body {
  padding: 24px;
}

.payment-info {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.payment-info p {
  margin: 0;
  font-size: 18px;
}

.card-input {
  margin-bottom: 24px;
}

.card-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.card-element {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  min-height: 40px;
}

.card-errors {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 8px;
  min-height: 20px;
}

.payment-button {
  text-align: center;
  margin-bottom: 16px;
}

.pay-button {
  min-width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pay-button:hover:not(:disabled) {
  background: #1565c0;
}

.pay-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status {
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.status.success {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status.error {
  background: #ffebee;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}
</style>
