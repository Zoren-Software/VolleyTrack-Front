<template>
  <div class="stripe-card-form">
    <div class="payment-card">
      <div class="card-header">
        <h3>Pagamento com Cartão</h3>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- Campo do cartão -->
          <div class="form-group">
            <label for="card-element">Número do Cartão</label>
            <div id="card-element" class="card-element"></div>
            <div id="card-errors" class="card-errors" role="alert"></div>
          </div>

          <!-- Campos adicionais -->
          <div class="form-row">
            <div class="form-group">
              <label for="cardholder-name">Nome no Cartão</label>
              <input
                id="cardholder-name"
                v-model="cardholderName"
                type="text"
                placeholder="Nome como aparece no cartão"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Botão de pagamento -->
          <div class="form-actions">
            <button
              type="submit"
              :disabled="processing || !stripe"
              class="submit-button"
            >
              <span v-if="processing">Processando...</span>
              <span v-else>Pagar {{ formatCurrency(amount) }}</span>
            </button>
          </div>
        </form>
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
    required: true,
  },
  currency: {
    type: String,
    default: "BRL",
  },
});

// Emits
const emit = defineEmits(["payment-success", "payment-error"]);

// Composables
const { $stripe } = useNuxtApp();

// Estado local
const cardElement = ref(null);
const cardholderName = ref("");
const processing = ref(false);
const stripe = ref(null);

// Computed
const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: props.currency,
  }).format(value / 100);
};

// Métodos
const handleSubmit = async () => {
  if (!cardElement.value || !stripe.value) {
    return;
  }

  processing.value = true;

  try {
    const { error, paymentMethod } = await stripe.value.createPaymentMethod({
      type: "card",
      card: cardElement.value,
      billing_details: {
        name: cardholderName.value,
      },
    });

    if (error) {
      emit("payment-error", error);
    } else {
      // Aqui você enviaria o paymentMethod.id para seu backend
      console.log("PaymentMethod criado:", paymentMethod);
      emit("payment-success", paymentMethod);
    }
  } catch (error) {
    emit("payment-error", error);
  } finally {
    processing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  if (!$stripe) {
    console.error("Stripe não foi inicializado");
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
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  });

  // Monta o elemento
  cardElement.value.mount("#card-element");

  // Listener para erros de validação
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
.stripe-card-form {
  max-width: 500px;
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

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #00ff00;
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

.form-actions {
  text-align: center;
  margin-top: 24px;
}

.submit-button {
  min-width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: #00ff00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #1565c0;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
