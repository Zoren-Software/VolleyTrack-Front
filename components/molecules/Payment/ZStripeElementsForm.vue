<template>
  <div class="stripe-elements-form">
    <div class="payment-card">
      <div class="card-header">
        <h3>Pagamento com Stripe Elements</h3>
      </div>

      <div class="card-body">
        <div v-if="loading" class="loading">
          <p>Carregando formulário de pagamento...</p>
        </div>

        <div v-else>
          <!-- Formulário de pagamento usando Stripe Elements -->
          <div id="card-element" class="card-element"></div>

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

          <!-- Informações do produto -->
          <div class="product-info">
            <h4>Resumo do Pedido</h4>
            <div class="product-item">
              <span>Produto: {{ productName }}</span>
              <span class="price">{{ formatCurrency(amount) }}</span>
            </div>
            <div class="total">
              <strong>Total: {{ formatCurrency(amount) }}</strong>
            </div>
          </div>

          <!-- Mensagens de status -->
          <div v-if="statusMessage" :class="['status-message', statusType]">
            {{ statusMessage }}
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
  clientSecret: { type: String, required: true },
  productName: { type: String, default: "Produto" },
  stripeKey: { type: String, required: true },
});

const emit = defineEmits(["payment-success", "payment-error"]);
const loading = ref(true);
const processing = ref(false);
const statusMessage = ref("");
const statusType = ref("");
const stripe = ref(null);
const elements = ref(null);
const cardElement = ref(null);

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
  statusMessage.value = "";

  try {
    const { error } = await stripe.value.confirmPayment({
      elements: elements.value,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      statusMessage.value = error.message || "Erro ao processar pagamento.";
      statusType.value = "error";
      emit("payment-error", error);
    } else {
      statusMessage.value = "Pagamento realizado com sucesso!";
      statusType.value = "success";
      emit("payment-success", { amount: props.amount });
    }
  } catch (error) {
    statusMessage.value = "Erro ao processar pagamento.";
    statusType.value = "error";
    emit("payment-error", error);
  } finally {
    processing.value = false;
  }
};

onMounted(async () => {
  try {
    // Inicializar Stripe
    if (typeof window !== "undefined" && window.Stripe) {
      stripe.value = window.Stripe(props.stripeKey);
    } else {
      throw new Error("Stripe não foi carregado");
    }

    // Configurar Elements
    const appearance = {
      theme: "flat",
      variables: {
        colorPrimaryText: "#262626",
        colorPrimary: "#667eea",
      },
    };

    elements.value = stripe.value.elements({
      clientSecret: props.clientSecret,
      appearance,
    });

    // Criar elemento de cartão
    cardElement.value = elements.value.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    });

    // Montar elemento na tela
    cardElement.value.mount("#card-element");

    loading.value = false;
  } catch (error) {
    console.error("Erro ao inicializar Stripe Elements:", error);
    statusMessage.value = "Erro ao carregar formulário de pagamento.";
    statusType.value = "error";
    loading.value = false;
  }
});
</script>

<style scoped>
.stripe-elements-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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

.card-element {
  margin-bottom: 24px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  min-height: 60px;
}

.payment-actions {
  text-align: center;
  margin-bottom: 24px;
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
  width: 100%;
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

.product-info {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-info h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.price {
  font-weight: 600;
  color: #667eea;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0 0;
  font-size: 18px;
  color: #333;
}

.status-message {
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
