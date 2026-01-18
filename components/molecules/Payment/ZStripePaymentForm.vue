<template>
  <div class="stripe-payment-form">
    <div class="payment-card">
      <div class="card-header">
        <h3>Informações de Pagamento</h3>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading">
          <p>Carregando formulário de pagamento...</p>
        </div>
        <div v-else>
          <!-- Elemento de pagamento do Stripe -->
          <div id="payment-element" class="payment-element"></div>

          <!-- Botão de pagamento -->
          <div class="payment-actions">
            <button
              :disabled="processing || !stripe || !elements"
              @click="handleSubmit"
              class="payment-button"
            >
              <span v-if="processing">Processando...</span>
              <span v-else>Pagar {{ formatCurrency(amount) }}</span>
            </button>
          </div>

          <!-- Mensagens de erro -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  amount: { type: Number, required: true },
  currency: { type: String, default: "BRL" },
  clientSecret: { type: String, required: true }, // Adicionando clientSecret como prop obrigatória
});

const emit = defineEmits(["payment-success", "payment-error"]);
const { $stripe } = useNuxtApp();
const loading = ref(true);
const processing = ref(false);
const errorMessage = ref("");
const stripe = ref(null);
const elements = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: props.currency,
  }).format(value / 100);
};

const handleSubmit = async () => {
  if (!stripe.value || !elements.value) {
    return;
  }

  processing.value = true;
  errorMessage.value = "";

  try {
    const { error } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      errorMessage.value = error.message || "Erro ao processar pagamento.";
      emit("payment-error", error);
    } else {
      emit("payment-success", { amount: props.amount });
    }
  } catch (error) {
    errorMessage.value = "Erro ao processar pagamento.";
    emit("payment-error", error);
  } finally {
    processing.value = false;
  }
};

onMounted(async () => {
  try {
    if (!$stripe) {
      throw new Error("Stripe não foi inicializado");
    }

    stripe.value = $stripe;

    // Configuração conforme documentação do Stripe.js
    const appearance = {
      theme: "flat",
      variables: {
        colorPrimaryText: "#262626",
        colorPrimary: "#667eea",
      },
    };

    elements.value = $stripe.elements({
      clientSecret: props.clientSecret,
      appearance,
    });

    // Criar o Payment Element
    const paymentElement = elements.value.create("payment");
    paymentElement.mount("#payment-element");

    loading.value = false;
  } catch (error) {
    console.error("Erro ao inicializar Stripe Elements:", error);
    errorMessage.value = "Erro ao carregar formulário de pagamento.";
    loading.value = false;
  }
});
</script>

<style scoped>
.stripe-payment-form {
  width: 100%;
}

.payment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  text-align: center;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.card-body {
  padding: 32px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.payment-element {
  margin-bottom: 24px;
  min-height: 200px;
}

.payment-actions {
  text-align: center;
}

.payment-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.payment-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.payment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  text-align: center;
  border: 1px solid #fcc;
}
</style>
