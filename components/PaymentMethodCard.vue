<template>
  <div class="payment-method-card">
    <div class="card-header">
      <h3>Método de Pagamento</h3>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="loadPaymentMethods" class="retry-button">
        Tentar Novamente
      </button>
    </div>

    <div v-else-if="paymentMethods.length > 0" class="payment-methods-list">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        class="payment-method-item"
        :class="{ 'is-default': method.is_default }"
      >
        <div class="method-icon">
          <span class="card-brand-icon">{{
            getCardBrandIcon(method.card.brand)
          }}</span>
        </div>

        <div class="method-details">
          <div class="card-brand">{{ formatCardBrand(method.card.brand) }}</div>
          <div class="card-number">•••• •••• •••• {{ method.card.last4 }}</div>
          <div class="card-expiry">
            Válido até
            {{ formatExpDate(method.card.exp_month, method.card.exp_year) }}
          </div>
        </div>

        <div v-if="method.is_default" class="badge default-badge">Padrão</div>
      </div>
    </div>

    <div v-else class="no-payment-methods">
      <div class="no-methods-icon">💳</div>
      <p>Nenhum método de pagamento cadastrado</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  customerId: {
    type: [String, Number],
    required: true,
  },
});

const paymentMethods = ref([]);
const loading = ref(true);
const error = ref(null);

// Carregar métodos de pagamento
const loadPaymentMethods = async () => {
  if (!props.customerId) {
    error.value = "ID do customer não fornecido";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("apollo:default.token");

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch(
      `http://api.volleytrack.local/v1/customers/payment-methods?customer_id=${props.customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Erro ao carregar métodos de pagamento"
      );
    }

    const data = await response.json();

    if (data.success) {
      paymentMethods.value = data.data.payment_methods || [];
      console.log("✅ Métodos de pagamento carregados:", paymentMethods.value);
    } else {
      throw new Error(data.message || "Erro ao carregar métodos de pagamento");
    }
  } catch (err) {
    console.error("❌ Erro ao carregar métodos de pagamento:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Formatar marca do cartão
const formatCardBrand = (brand) => {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
};

// Obter ícone da marca
const getCardBrandIcon = (brand) => {
  const icons = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
    diners: "💳",
    jcb: "💳",
  };
  return icons[brand] || "💳";
};

// Formatar data de expiração
const formatExpDate = (month, year) => {
  const monthStr = month.toString().padStart(2, "0");
  return `${monthStr}/${year}`;
};

onMounted(() => {
  loadPaymentMethods();
});
</script>

<style scoped>
.payment-method-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 20px;
  text-align: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 16px;
}

.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.payment-method-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.payment-method-item.is-default {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.method-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.card-brand-icon {
  display: block;
}

.method-details {
  flex: 1;
}

.card-brand {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 4px;
}

.card-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #374151;
  letter-spacing: 2px;
  margin: 8px 0;
  font-family: "Courier New", monospace;
}

.card-expiry {
  font-size: 0.9rem;
  color: #6b7280;
}

.default-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 8px;
}

.no-payment-methods {
  text-align: center;
  padding: 40px 20px;
}

.no-methods-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-payment-methods p {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .payment-method-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .method-icon {
    align-self: center;
  }
}
</style>
