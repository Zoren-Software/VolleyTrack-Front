<template>
  <div class="payment-method-card">
    <div class="card-header">
      <h3>
        Método de Pagamento
        <va-popover placement="right" trigger="click">
          <va-icon
            name="info_outline"
            size="small"
            color="secondary"
            class="info-icon"
          />

          <template #title>
            <i>Segurança dos Dados</i>
          </template>

          <template #body>
            <p>
              Seus dados de cartão são armazenados com segurança
              <strong>exclusivamente pela Stripe</strong>.
            </p>
            <p>
              Não armazenamos informações sensíveis do cartão em nossos
              servidores.
            </p>
          </template>
        </va-popover>
      </h3>
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
        <div class="payment-method-content">
          <div class="method-icon">
            <span class="card-brand-icon">{{
              getCardBrandIcon(method.card.brand)
            }}</span>
          </div>

          <div class="method-details">
            <div class="card-brand">
              {{ formatCardBrand(method.card.brand) }}
            </div>
            <div class="card-number">
              •••• •••• •••• {{ method.card.last4 }}
            </div>
            <div class="card-expiry">
              Válido até
              {{ formatExpDate(method.card.exp_month, method.card.exp_year) }}
            </div>
          </div>

          <div v-if="method.is_default" class="badge default-badge">PADRÃO</div>
        </div>

        <!-- Ações do cartão -->
        <div class="method-actions" v-if="paymentMethods.length > 1">
          <button
            v-if="!method.is_default"
            @click="setAsDefault(method.id)"
            class="set-default-button"
            :disabled="changingCard"
          >
            Definir Padrão
          </button>
          <button
            v-if="!method.is_default"
            @click="removeCard(method.id)"
            class="remove-card-button"
            :disabled="changingCard"
          >
            Remover
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-payment-methods">
      <div class="no-methods-icon">💳</div>
      <p>Nenhum método de pagamento cadastrado</p>
    </div>

    <!-- Botão para trocar/adicionar cartão -->
    <div class="card-actions">
      <button
        @click="handleChangeCard"
        :disabled="changingCard"
        class="change-card-button"
      >
        {{
          changingCard
            ? "Processando..."
            : paymentMethods.length > 0
            ? "Trocar Cartão"
            : "Adicionar Cartão"
        }}
      </button>
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
const changingCard = ref(false);

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
      const methods = data.data.payment_methods || [];

      // Ordenar: cartão padrão primeiro
      paymentMethods.value = methods.sort((a, b) => {
        if (a.is_default) return -1;
        if (b.is_default) return 1;
        return 0;
      });

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

// Trocar cartão de crédito
const handleChangeCard = async () => {
  changingCard.value = true;

  try {
    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("apollo:default.token");

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const requestBody = {
      customer_id: props.customerId,
      success_url: `${window.location.origin}/payment?success=true`,
      cancel_url: `${window.location.origin}/payment?cancel=true`,
      currency: "brl",
      payment_method_types: ["card"],
    };

    console.log("🔍 Request body:", requestBody);

    const response = await fetch(
      `http://api.volleytrack.local/v1/customers/payment-method-setup`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("🔍 Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar sessão de setup");
    }

    const data = await response.json();

    if (data.success && data.data.url) {
      console.log("✅ Redirecionando para Stripe Checkout:", data.data.url);
      window.location.href = data.data.url;
    } else {
      throw new Error("URL de setup não retornada");
    }
  } catch (err) {
    console.error("❌ Erro ao trocar cartão:", err);
    alert(`Erro ao trocar cartão: ${err.message}`);
  } finally {
    changingCard.value = false;
  }
};

// Definir cartão como padrão
const setAsDefault = async (paymentMethodId) => {
  changingCard.value = true;

  try {
    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("apollo:default.token");

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch(
      `http://api.volleytrack.local/v1/customers/payment-methods/default`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          customer_id: props.customerId,
          payment_method_id: paymentMethodId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao definir cartão padrão");
    }

    const data = await response.json();

    if (data.success) {
      console.log("✅ Cartão definido como padrão:", data);

      // Recarregar lista de cartões
      await loadPaymentMethods();

      // Mostrar mensagem de sucesso
      if (window.Swal) {
        window.Swal.fire({
          icon: "success",
          title: "Cartão definido como padrão!",
          text: "Este cartão será usado para futuras cobranças.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  } catch (err) {
    console.error("❌ Erro ao definir cartão padrão:", err);
    alert(`Erro: ${err.message}`);
  } finally {
    changingCard.value = false;
  }
};

// Remover cartão
const removeCard = async (paymentMethodId) => {
  if (!confirm("Tem certeza que deseja remover este cartão?")) {
    return;
  }

  changingCard.value = true;

  try {
    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("apollo:default.token");

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const response = await fetch(
      `http://api.volleytrack.local/v1/customers/payment-methods/${paymentMethodId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          customer_id: props.customerId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao remover cartão");
    }

    const data = await response.json();

    if (data.success) {
      console.log("✅ Cartão removido:", data);

      // Recarregar lista de cartões
      await loadPaymentMethods();

      // Mostrar mensagem de sucesso
      if (window.Swal) {
        window.Swal.fire({
          icon: "success",
          title: "Cartão removido!",
          text: "O cartão foi removido com sucesso.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  } catch (err) {
    console.error("❌ Erro ao remover cartão:", err);
    alert(`Erro: ${err.message}`);
  } finally {
    changingCard.value = false;
  }
};

onMounted(() => {
  loadPaymentMethods();

  // Recarregar métodos de pagamento se veio da tela de sucesso do Stripe
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    console.log("✅ Retornando do Stripe Checkout - Recarregando cartões...");

    // Mostrar mensagem de sucesso
    if (window.Swal) {
      window.Swal.fire({
        icon: "success",
        title: "Cartão adicionado!",
        text: "Seu novo cartão foi adicionado com sucesso.",
        timer: 3000,
        showConfirmButton: false,
      });
    }

    // Remover o parâmetro da URL
    window.history.replaceState({}, "", window.location.pathname);

    // Recarregar cartões após 1 segundo
    setTimeout(() => {
      loadPaymentMethods();
    }, 1000);
  }
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
  height: 100%;
  min-height: 0;
  justify-content: space-between;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.info-icon {
  cursor: pointer;
  transition: all 0.2s ease;
  vertical-align: middle;
}

.info-icon:hover {
  color: #667eea !important;
  transform: scale(1.1);
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
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.payment-method-item.is-default {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.payment-method-content {
  display: flex;
  align-items: center;
  gap: 16px;
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
  min-width: 0;
}

.card-brand {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 4px;
}

.card-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
  letter-spacing: 1px;
  margin: 8px 0;
  font-family: "Courier New", monospace;
  word-break: keep-all;
  white-space: nowrap;
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

/* Botão para trocar/adicionar cartão */
.card-actions {
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
}

.change-card-button {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.change-card-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.change-card-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Ações dos cartões */
.method-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  flex-direction: row;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.set-default-button,
.remove-card-button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.set-default-button {
  background: #f3f4f6;
  color: #374151;
}

.set-default-button:hover:not(:disabled) {
  background: #e5e7eb;
}

.remove-card-button {
  background: #fee2e2;
  color: #dc2626;
}

.remove-card-button:hover:not(:disabled) {
  background: #fecaca;
}

.set-default-button:disabled,
.remove-card-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
