<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Pagamento Cancelado</h1>
          <p class="page-subtitle">
            Você cancelou o processo de pagamento. Nenhuma cobrança foi
            realizada.
          </p>
        </div>
      </div>
    </div>

    <!-- Cancel Card -->
    <div class="cancel-card">
      <div class="cancel-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6L18 18M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="#ef4444"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>Carregando informações...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section">
        <div class="error-icon">⚠️</div>
        <p>Erro ao carregar informações: {{ error }}</p>
      </div>

      <!-- Info Section -->
      <div v-else class="info-section">
        <h3>O que aconteceu?</h3>
        <ul>
          <li>Você cancelou o processo de pagamento</li>
          <li>Nenhuma cobrança foi realizada</li>
          <li>Sua conta permanece no plano atual</li>
          <li>Você pode tentar novamente a qualquer momento</li>
        </ul>

        <!-- Dados da sessão se disponíveis -->
        <div v-if="sessionData" class="session-details">
          <h4>Detalhes da Sessão Cancelada</h4>
          <div class="detail-item">
            <span class="label">Modo:</span>
            <span class="value">{{
              sessionData.mode === "subscription"
                ? "Assinatura"
                : "Pagamento Único"
            }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Valor:</span>
            <span class="value price"
              >R$ {{ formatPrice(sessionData.amount_total) }}</span
            >
          </div>
          <div class="detail-item">
            <span class="label">Status:</span>
            <span class="value cancelled">Cancelado</span>
          </div>
          <div v-if="sessionData.customer_email" class="detail-item">
            <span class="label">Email:</span>
            <span class="value">{{ sessionData.customer_email }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <NuxtLink to="/payment" class="btn btn-primary">
          Tentar Novamente
        </NuxtLink>
        <NuxtLink to="/" class="btn btn-secondary">
          Voltar ao Dashboard
        </NuxtLink>
      </div>

      <div class="help-section">
        <p>Precisa de ajuda ou tem dúvidas?</p>
        <div class="contact-info">
          <span>📧 support@volleytrack.com</span>
        </div>
        <p class="help-text">
          Nossa equipe está sempre pronta para ajudar você a escolher o plano
          ideal!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getCheckoutSession,
  getCurrentSessionId,
} from "~/services/stripeCheckoutService.js";

// Head
useHead({
  title: "Pagamento Cancelado - VoleiClub",
});

// Estado da aplicação
const sessionData = ref(null);
const loading = ref(true);
const error = ref(null);

// Carregar dados da sessão
const loadSessionData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Obter session ID da URL
    const sessionId = getCurrentSessionId();

    if (!sessionId) {
      console.warn("⚠️ Session ID não encontrado na URL");
      return;
    }

    console.log("🔍 Consultando sessão cancelada:", sessionId);

    // Consultar dados da sessão
    const result = await getCheckoutSession(sessionId);

    if (!result.success) {
      throw new Error(result.error || "Erro ao consultar sessão");
    }

    sessionData.value = result.data;
    console.log("✅ Dados da sessão carregados:", sessionData.value);
  } catch (err) {
    console.error("❌ Erro ao carregar dados da sessão:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Funções auxiliares
const formatPrice = (amount) => {
  if (!amount) return "0,00";
  return (amount / 100).toFixed(2).replace(".", ",");
};

// Função para obter texto do status (não utilizada no momento)
// const getPaymentStatusText = (status) => {
//   const statusMap = {
//     paid: "Pago",
//     unpaid: "Não Pago",
//     no_payment_required: "Pagamento Não Necessário",
//   };
//   return statusMap[status] || status;
// };

onMounted(async () => {
  console.log("🚀 Carregando página de cancelamento...");
  await loadSessionData();
  console.log("✅ Página de cancelamento carregada");
});
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.cancel-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cancel-icon {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.cancel-icon svg {
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
}

.info-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: left;
}

.info-section h3 {
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.3rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 10px 0;
  color: #555;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  padding-left: 25px;
}

.info-section li:last-child {
  border-bottom: none;
}

.info-section li::before {
  content: "•";
  color: #ef4444;
  font-weight: bold;
  font-size: 1.5rem;
  position: absolute;
  left: 0;
  top: 8px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #333;
}

.help-section {
  border-top: 1px solid #e9ecef;
  padding-top: 25px;
}

.help-section p {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.help-text {
  font-style: italic;
  color: #888;
  margin-top: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 15px;
}

.contact-info span {
  color: #667eea;
  font-weight: 500;
  font-size: 0.9rem;
}

.loading-section,
.error-section {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ef4444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.error-section {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.session-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.session-details h4 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
}

.detail-item .value {
  font-weight: 600;
  color: #333;
}

.detail-item .value.cancelled {
  color: #ef4444;
}

.detail-item .value.price {
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 700;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .list-page-container {
    padding: 0 16px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .cancel-card {
    padding: 30px 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
