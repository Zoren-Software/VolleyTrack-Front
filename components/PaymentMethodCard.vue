<template>
  <div class="payment-method-card">
    <header class="pm-header">
      <div class="pm-header-title">
        <h2 class="pm-title">Métodos de pagamento</h2>
        <va-popover placement="bottom" trigger="click">
          <button type="button" class="pm-info-trigger" aria-label="Sobre segurança">
            <va-icon name="info_outline" size="small" color="secondary" />
          </button>
          <template #title>
            <span class="pm-popover-title">Segurança dos dados</span>
          </template>
          <template #body>
            <p class="pm-popover-text">
              Seus dados de cartão são armazenados com segurança
              <strong>exclusivamente pela Stripe</strong>.
            </p>
            <p class="pm-popover-text">
              Não armazenamos informações sensíveis do cartão em nossos servidores.
            </p>
          </template>
        </va-popover>
      </div>
      <button
        v-if="paymentMethods.length > 0 && !loading && !error"
        type="button"
        class="pm-edit-link"
        :disabled="changingCard"
        @click="handleChangeCard"
      >
        Editar
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner" />
      <p>Carregando...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon" aria-hidden="true">⚠️</div>
      <p>{{ error }}</p>
      <button type="button" class="retry-button" @click="loadPaymentMethods">
        Tentar novamente
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
          <div
            class="pm-thumb"
            :class="`pm-thumb--${cardBrandKey(method.card?.brand)}`"
            aria-hidden="true"
          >
            <span class="pm-thumb__brand">{{ cardBrandShort(method.card?.brand) }}</span>
          </div>

          <div class="method-details">
            <p class="pm-line-primary">
              <span class="pm-line-brand">{{ formatCardBrand(method.card.brand) }}</span>:
              <strong class="pm-line-last4">{{ method.card.last4 }}</strong>
            </p>
            <p class="pm-line-expiry">
              Validade:
              <strong>{{ formatExpDateShort(method.card.exp_month, method.card.exp_year) }}</strong>
            </p>
          </div>

          <span v-if="method.is_default" class="badge default-badge">Padrão</span>
        </div>

        <div v-if="paymentMethods.length > 1" class="method-actions">
          <button
            v-if="!method.is_default"
            type="button"
            class="set-default-button"
            :disabled="changingCard"
            @click="setAsDefault(method.id)"
          >
            Definir padrão
          </button>
          <button
            v-if="!method.is_default"
            type="button"
            class="remove-card-button"
            :disabled="changingCard"
            @click="removeCard(method.id)"
          >
            Remover
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-payment-methods">
      <div class="no-methods-icon" aria-hidden="true">💳</div>
      <p>Nenhum método de pagamento cadastrado</p>
    </div>

    <div class="card-actions">
      <button
        type="button"
        class="change-card-button"
        :disabled="changingCard"
        @click="handleChangeCard"
      >
        {{
          changingCard
            ? "Processando..."
            : paymentMethods.length > 0
              ? "Atualizar método de pagamento"
              : "Adicionar método de pagamento"
        }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getApiBaseUrl } from "~/utils/apiBaseUrl";

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
      `${getApiBaseUrl()}/v1/customers/payment-methods?customer_id=${props.customerId}`,
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

      paymentMethods.value = methods.sort((a, b) => {
        if (a.is_default) return -1;
        if (b.is_default) return 1;
        return 0;
      });
    } else {
      throw new Error(data.message || "Erro ao carregar métodos de pagamento");
    }
  } catch (err) {
    console.error("Erro ao carregar métodos de pagamento:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatCardBrand = (brand) => {
  if (!brand) return "Cartão";
  const b = brand.toLowerCase();
  if (b === "amex") return "American Express";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
};

const cardBrandKey = (brand) => {
  const b = (brand || "").toLowerCase();
  if (b.includes("visa")) return "visa";
  if (b.includes("master")) return "mastercard";
  if (b.includes("amex")) return "amex";
  if (b.includes("elo")) return "elo";
  return "generic";
};

const cardBrandShort = (brand) => {
  const k = cardBrandKey(brand);
  if (k === "visa") return "VISA";
  if (k === "mastercard") return "MC";
  if (k === "amex") return "AMEX";
  if (k === "elo") return "ELO";
  return "CARD";
};

const formatExpDateShort = (month, year) => {
  const monthStr = String(month).padStart(2, "0");
  const y = String(year);
  const yy = y.length >= 2 ? y.slice(-2) : y;
  return `${monthStr}/${yy}`;
};

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

    const response = await fetch(
      `${getApiBaseUrl()}/v1/customers/payment-method-setup`,
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar sessão de setup");
    }

    const data = await response.json();

    if (data.success && data.data.url) {
      window.location.href = data.data.url;
    } else {
      throw new Error("URL de setup não retornada");
    }
  } catch (err) {
    console.error("Erro ao trocar cartão:", err);
    alert(`Erro ao trocar cartão: ${err.message}`);
  } finally {
    changingCard.value = false;
  }
};

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
      `${getApiBaseUrl()}/v1/customers/payment-methods/default`,
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
      await loadPaymentMethods();

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
    console.error("Erro ao definir cartão padrão:", err);
    alert(`Erro: ${err.message}`);
  } finally {
    changingCard.value = false;
  }
};

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
      `${getApiBaseUrl()}/v1/customers/payment-methods/${paymentMethodId}`,
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
      await loadPaymentMethods();

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
    console.error("Erro ao remover cartão:", err);
    alert(`Erro: ${err.message}`);
  } finally {
    changingCard.value = false;
  }
};

onMounted(() => {
  loadPaymentMethods();

  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    if (window.Swal) {
      window.Swal.fire({
        icon: "success",
        title: "Cartão adicionado!",
        text: "Seu novo cartão foi adicionado com sucesso.",
        timer: 3000,
        showConfirmButton: false,
      });
    }

    window.history.replaceState({}, "", window.location.pathname);

    setTimeout(() => {
      loadPaymentMethods();
    }, 1000);
  }
});
</script>

<style scoped>
.payment-method-card {
  background: #fff;
  border-radius: 16px;
  padding: 22px 24px 24px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid #e8eaed;
  display: flex;
  flex-direction: column;
  min-height: 0;
  justify-content: space-between;
}

.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 4px;
}

.pm-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.pm-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.pm-info-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: background 0.15s ease;
}

.pm-info-trigger:hover {
  background: #f1f5f9;
}

.pm-popover-title {
  font-style: normal;
  font-weight: 600;
}

.pm-popover-text {
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.45;
  color: #334155;
}

.pm-popover-text:last-child {
  margin-bottom: 0;
}

.pm-edit-link {
  flex-shrink: 0;
  margin: 0;
  padding: 6px 4px;
  border: none;
  background: none;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  border-radius: 4px;
}

.pm-edit-link:hover:not(:disabled) {
  text-decoration: underline;
}

.pm-edit-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 36px 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #ff4e1b;
  border-radius: 50%;
  animation: pm-spin 0.85s linear infinite;
  margin: 0 auto 14px;
}

@keyframes pm-spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.retry-button {
  background: #ff4e1b;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 14px;
}

.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.payment-method-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 14px 16px;
  background: #f3f4f6;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease;
}

.payment-method-item.is-default {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, #ecfdf5 0%, #f3f4f6 100%);
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.payment-method-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pm-thumb {
  flex-shrink: 0;
  width: 56px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 4px 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.pm-thumb__brand {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
}

.pm-thumb--visa {
  background: linear-gradient(135deg, #1a56db 0%, #1d4ed8 100%);
}

.pm-thumb--mastercard {
  background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%);
}

.pm-thumb--amex {
  background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
}

.pm-thumb--elo {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
}

.pm-thumb--generic {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.method-details {
  flex: 1;
  min-width: 0;
}

.pm-line-primary {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.35;
}

.pm-line-brand {
  font-weight: 500;
}

.pm-line-last4 {
  font-weight: 700;
  color: #0f172a;
}

.pm-line-expiry {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.pm-line-expiry strong {
  color: #374151;
  font-weight: 700;
}

.default-badge {
  flex-shrink: 0;
  align-self: center;
  background: #10b981;
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.no-payment-methods {
  text-align: center;
  padding: 32px 16px;
}

.no-methods-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.no-payment-methods p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.card-actions {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
}

.change-card-button {
  width: 100%;
  padding: 14px 20px;
  background: #ff4e1b;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 10px rgba(255, 78, 27, 0.3);
}

.change-card-button:hover:not(:disabled) {
  background: #e03d0f;
  box-shadow: 0 4px 16px rgba(255, 78, 27, 0.38);
}

.change-card-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.method-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.set-default-button,
.remove-card-button {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
}

.set-default-button {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.set-default-button:hover:not(:disabled) {
  background: #f9fafb;
}

.remove-card-button {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.remove-card-button:hover:not(:disabled) {
  background: #fee2e2;
}

.set-default-button:disabled,
.remove-card-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .payment-method-content {
    flex-wrap: wrap;
  }

  .default-badge {
    width: 100%;
    text-align: center;
    margin-top: 4px;
  }
}
</style>
