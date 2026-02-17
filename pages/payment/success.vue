<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Pagamento Realizado com Sucesso!</h1>
          <p class="page-subtitle">
            Obrigado pela sua compra. Você receberá um email de confirmação em
            breve.
          </p>
        </div>
      </div>
    </div>

    <!-- Success Card -->
    <div class="success-card">
      <div class="success-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="#10b981"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner" />
        <p v-if="syncLoading">
          Sincronizando assinatura com o banco de dados...
        </p>
        <p v-else>Carregando detalhes da assinatura...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-section">
        <div class="error-icon">⚠️</div>
        <p>Erro ao carregar detalhes: {{ error }}</p>
        <p class="error-note">
          Mas não se preocupe, seu pagamento foi processado com sucesso!
        </p>
      </div>

      <!-- Sync Success State -->
      <div v-if="syncData && !syncError" class="sync-success-section">
        <div class="sync-success-icon">✅</div>
        <p>Assinatura sincronizada com sucesso!</p>
        <p class="sync-success-note">
          Seus dados foram registrados no banco de dados e estão prontos para
          uso.
        </p>
      </div>

      <!-- Sync Error State -->
      <div v-if="syncError" class="sync-error-section">
        <div class="sync-error-icon">⚠️</div>
        <p>Aviso: Erro na sincronização: {{ syncError }}</p>
        <p class="sync-error-note">
          Seu pagamento foi processado, mas pode haver um atraso na ativação.
        </p>
      </div>

      <!-- Subscription Details -->
      <div v-else class="subscription-details">
        <h3>Detalhes da Assinatura</h3>
        <div class="detail-item">
          <span class="label">Status:</span>
          <span class="value success">Ativa</span>
        </div>
        <div class="detail-item">
          <span class="label">Data de Ativação:</span>
          <span class="value">{{ currentDate }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Próxima Cobrança:</span>
          <span class="value">{{ nextBillingDate }}</span>
        </div>

        <!-- Dados da sessão se disponíveis -->
        <div v-if="sessionData" class="session-details">
          <h4>Informações do Pagamento</h4>
          <div class="detail-item">
            <span class="label">Modo:</span>
            <span class="value">{{
              sessionData.mode === "subscription"
                ? "Assinatura"
                : "Pagamento Único"
            }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Valor Total:</span>
            <span class="value price">
              R$ {{ formatPrice(sessionData.amount_total) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="label">Status do Pagamento:</span>
            <span class="value" :class="sessionData.payment_status">
              {{ getPaymentStatusText(sessionData.payment_status) }}
            </span>
          </div>
          <div v-if="sessionData.customer_email" class="detail-item">
            <span class="label">Email:</span>
            <span class="value">{{ sessionData.customer_email }}</span>
          </div>
        </div>

        <!-- Dados de sincronização se disponíveis -->
        <div v-if="syncData" class="sync-details">
          <h4>Status da Sincronização</h4>
          <div class="detail-item">
            <span class="label">Sincronização:</span>
            <span class="value success">✅ Concluída</span>
          </div>
          <div v-if="syncData.subscription" class="detail-item">
            <span class="label">ID da Assinatura:</span>
            <span class="value">{{ syncData.subscription.stripe_id }}</span>
          </div>
          <div v-if="syncData.subscription" class="detail-item">
            <span class="label">Status da Assinatura:</span>
            <span class="value" :class="syncData.subscription.status">
              {{ getSubscriptionStatusText(syncData.subscription.status) }}
            </span>
          </div>
          <div v-if="syncData.customer_id" class="detail-item">
            <span class="label">ID do Cliente:</span>
            <span class="value">{{ syncData.customer_id }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <NuxtLink to="/payment" class="btn btn-primary">
          Pagamentos
        </NuxtLink>
        <NuxtLink to="/billing" class="btn btn-secondary">
          Faturamentos
        </NuxtLink>
      </div>

      <div class="help-section">
        <p>Precisa de ajuda? Entre em contato conosco:</p>
        <div class="contact-info">
          <span>📧 support@volleytrack.com</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getCheckoutSession,
  getCurrentSessionId,
  syncCheckoutSession,
  clearPendingCheckoutSessionId,
} from "~/services/stripeCheckoutService.js";

// Head
useHead({
  title: "Pagamento Confirmado - VoleiClub",
});

// Estado da aplicação
const currentDate = ref("");
const nextBillingDate = ref("");
const sessionData = ref(null);
const syncData = ref(null);
const loading = ref(true);
const syncLoading = ref(false);
const error = ref(null);
const syncError = ref(null);

// Função para formatar data
const formatDate = (date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Função para formatar data ISO (não utilizada no momento)
// const formatISODate = (dateString) => {
//   if (!dateString) return "N/A";
//   return formatDate(new Date(dateString));
// };

// Função para calcular próxima cobrança baseada no período
const calculateNextBilling = (sessionData) => {
  if (!sessionData) {
    // Fallback: 30 dias
    const next = new Date();
    next.setDate(next.getDate() + 30);
    return next;
  }

  // Se for subscription, calcular baseado no período
  if (sessionData.mode === "subscription" && sessionData.subscription) {
    const currentPeriodEnd = new Date(
      sessionData.subscription.current_period_end * 1000
    );
    return currentPeriodEnd;
  }

  // Se for payment único, não há próxima cobrança
  if (sessionData.mode === "payment") {
    return null;
  }

  // Fallback: 30 dias
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return next;
};

// Sincronizar dados da sessão com o banco de dados
const syncSessionData = async (sessionId) => {
  try {
    console.log("🔄 Sincronizando sessão com o banco de dados:", sessionId);
    syncLoading.value = true;
    syncError.value = null;

    const result = await syncCheckoutSession(sessionId);

    if (result.success) {
      syncData.value = result.data;
      console.log("✅ Sessão sincronizada com sucesso:", syncData.value);
      clearPendingCheckoutSessionId();

      // Se temos dados de sincronização, usar eles para atualizar as informações
      if (syncData.value.subscription) {
        const nextBilling = new Date(
          syncData.value.subscription.current_period_end
        );
        nextBillingDate.value = formatDate(nextBilling);
      }

      // Mostrar mensagem de sucesso da sincronização
      console.log("🎉 Assinatura registrada com sucesso no banco de dados!");
    } else {
      console.warn("⚠️ Erro na sincronização:", result.error);
      syncError.value = result.error;
    }
  } catch (err) {
    console.error("❌ Erro ao sincronizar sessão:", err);
    syncError.value = err.message;
    // Não bloquear a UI por erro de sincronização
  } finally {
    syncLoading.value = false;
  }
};

// Carregar dados da sessão
const loadSessionData = async () => {
  try {
    loading.value = true;
    error.value = null;
    syncError.value = null;

    // Obter session ID da URL
    const sessionId = getCurrentSessionId();

    if (!sessionId) {
      console.warn("⚠️ Session ID não encontrado na URL");
      // Usar dados padrão se não houver session ID
      currentDate.value = formatDate(new Date());
      nextBillingDate.value = formatDate(calculateNextBilling());
      return;
    }

    console.log("🔍 Session ID encontrado:", sessionId);

    // PRIORIDADE 1: Sincronizar imediatamente com o banco de dados
    console.log("🚀 Iniciando sincronização automática da assinatura...");
    await syncSessionData(sessionId);

    // PRIORIDADE 2: Consultar dados da sessão (opcional, para exibição)
    console.log("🔍 Consultando dados da sessão para exibição...");
    const result = await getCheckoutSession(sessionId);

    if (result.success) {
      sessionData.value = result.data;
      console.log("✅ Dados da sessão carregados:", sessionData.value);
    } else {
      console.warn("⚠️ Erro ao consultar dados da sessão:", result.error);
      // Não bloquear por erro na consulta, pois a sincronização já foi feita
    }

    // Definir data atual
    currentDate.value = formatDate(new Date());

    // Calcular próxima cobrança baseada nos dados da sessão ou sincronização
    const nextBilling = calculateNextBilling(sessionData.value);
    if (nextBilling) {
      nextBillingDate.value = formatDate(nextBilling);
    } else {
      nextBillingDate.value = "Pagamento único";
    }

    console.log("✅ Processo de carregamento concluído");
  } catch (err) {
    console.error("❌ Erro ao carregar dados da sessão:", err);
    error.value = err.message;

    // Usar dados padrão em caso de erro
    currentDate.value = formatDate(new Date());
    nextBillingDate.value = formatDate(calculateNextBilling());
  } finally {
    loading.value = false;
  }
};

// Funções auxiliares
const formatPrice = (amount) => {
  if (!amount) return "0,00";
  return (amount / 100).toFixed(2).replace(".", ",");
};

const getPaymentStatusText = (status) => {
  const statusMap = {
    paid: "Pago",
    unpaid: "Não Pago",
    no_payment_required: "Pagamento Não Necessário",
  };
  return statusMap[status] || status;
};

const getSubscriptionStatusText = (status) => {
  const statusMap = {
    active: "Ativa",
    canceled: "Cancelada",
    incomplete: "Incompleta",
    incomplete_expired: "Expirada",
    past_due: "Em Atraso",
    trialing: "Período de Teste",
    unpaid: "Não Paga",
  };
  return statusMap[status] || status;
};

onMounted(async () => {
  console.log("🚀 Carregando página de sucesso...");
  await loadSessionData();
  console.log("✅ Página de sucesso carregada");
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

.success-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.success-icon {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.success-icon svg {
  filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
}

.subscription-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: left;
}

.subscription-details h3 {
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.3rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
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

.detail-item .value.success {
  color: #10b981;
}

.detail-item .value.paid {
  color: #10b981;
}

.detail-item .value.unpaid {
  color: #ef4444;
}

.detail-item .value.price {
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 700;
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
  border-top: 3px solid #10b981;
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

.error-note {
  color: #059669;
  font-weight: 500;
  margin-top: 10px;
}

.sync-error-section {
  background: #fef3cd;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #92400e;
  margin-bottom: 20px;
}

.sync-error-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.sync-error-note {
  color: #059669;
  font-weight: 500;
  margin-top: 8px;
  font-size: 0.9rem;
}

.sync-success-section {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  margin-bottom: 20px;
  padding: 15px;
  text-align: center;
}

.sync-success-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.sync-success-note {
  color: #059669;
  font-weight: 500;
  margin-top: 8px;
  font-size: 0.9rem;
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

.sync-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  background: #f0f9ff;
  border-radius: 8px;
  padding: 15px;
}

.sync-details h4 {
  color: #0ea5e9;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.contact-info span {
  color: #667eea;
  font-weight: 500;
  font-size: 0.9rem;
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

  .success-card {
    padding: 30px 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
