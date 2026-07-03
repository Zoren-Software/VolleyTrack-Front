<template>
  <ZListPageContainer :failure="pageFailureMode">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 v-if="!pageFailureMode" class="page-title">
            Pagamento realizado com sucesso!
          </h1>
          <h1 v-else class="page-title page-title--failure">
            {{ failurePageTitle }}
          </h1>
          <p v-if="!pageFailureMode" class="page-subtitle">
            Obrigado pela sua compra. Você receberá um e-mail de confirmação em
            breve.
          </p>
          <p v-else class="page-subtitle page-subtitle--failure">
            {{ failurePageSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Success Card -->
    <div
      class="success-card"
      :class="{ 'success-card--failure': pageFailureMode }"
    >
      <template v-if="!loading">
        <div
          v-if="pageFailureMode"
          class="hero-icon hero-icon--failure"
          aria-hidden="true"
        >
          <svg
            class="hero-failure-mark"
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="48"
              cy="48"
              r="40"
              class="hero-failure-mark__ring"
            />
            <path
              class="hero-failure-mark__x"
              d="M38 38L58 58M58 38L38 58"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div v-else class="hero-icon hero-icon--success">
          <svg
            class="hero-success-mark"
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
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner" />
        <p v-if="syncLoading">
          Sincronizando assinatura com o banco de dados...
        </p>
        <p v-else>Carregando detalhes da assinatura...</p>
      </div>

      <!-- Error State (falha ao carregar sessão) -->
      <div v-else-if="error" class="failure-panel failure-panel--load">
        <span class="failure-panel__badge">Erro ao carregar</span>
        <h2 class="failure-panel__title">Não foi possível exibir os detalhes</h2>
        <p class="failure-panel__text failure-panel__text--detail">
          {{ error }}
        </p>
        <p class="failure-panel__text failure-panel__text--muted">
          Se o pagamento foi concluído no Stripe, aguarde o e-mail de confirmação
          ou atualize esta página.
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

      <!-- Cartão / região Brasil (422 br_declared_non_br_card) -->
      <div
        v-if="syncError && regionalPricingBlocked"
        class="failure-panel failure-panel--regional"
        role="alert"
      >
        <span class="failure-panel__badge">Pagamento não concluído</span>
        <h2 class="failure-panel__title">
          Cartão não aceito para planos com preço no Brasil
        </h2>
        <p class="failure-panel__text">
          Para assinaturas em real (R$), só aceitamos cartão emitido por bancos
          <strong>no Brasil</strong>, alinhado à política de preços regionais.
        </p>
        <p class="failure-panel__text failure-panel__text--muted">
          O valor foi estornado (ou será em breve). O retorno ao cartão depende
          do seu banco — em geral, alguns dias úteis.
        </p>
        <div class="failure-panel__footer">
          <span class="failure-panel__footer-label">Precisa de ajuda?</span>
          <a
            class="failure-panel__link"
            href="mailto:support@volleytrack.com"
          >support@volleytrack.com</a>
        </div>
      </div>

      <!-- Outros erros de sincronização -->
      <div v-else-if="syncError" class="failure-panel failure-panel--sync">
        <span class="failure-panel__badge failure-panel__badge--soft">Sincronização</span>
        <h2 class="failure-panel__title">
          Não conseguimos finalizar a atualização da sua conta
        </h2>
        <p class="failure-panel__text failure-panel__text--detail">
          {{ syncError }}
        </p>
        <p class="failure-panel__text failure-panel__text--muted">
          Se o pagamento consta no Stripe, a ativação pode ocorrer em instantes.
          Caso contrário, fale com o suporte.
        </p>
      </div>

      <!-- Subscription Details (somente sem erro de sync nem de carregamento) -->
      <div v-if="!loading && !error && !syncError" class="subscription-details">
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
        <NuxtLink to="/payment" class="btn btn-primary"> Pagamentos </NuxtLink>
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
  </ZListPageContainer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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
const syncErrorCode = ref(null);

/** Pagamento estornado por política de região (cartão não emitido no BR). */
const regionalPricingBlocked = computed(
  () => syncErrorCode.value === "br_declared_non_br_card",
);

/** Falha visível após carregar (sync ou detalhes da sessão). */
const pageFailureMode = computed(
  () => !loading.value && (!!syncError.value || !!error.value),
);

const failurePageTitle = computed(() => {
  if (regionalPricingBlocked.value) {
    return "Não foi possível ativar o plano";
  }
  if (syncError.value) {
    return "Não foi possível concluir a ativação";
  }
  return "Não foi possível carregar esta página";
});

const failurePageSubtitle = computed(() => {
  if (regionalPricingBlocked.value) {
    return "A cobrança foi estornada. Para preços em real (R$), use um cartão emitido no Brasil — ou entre em contato com o suporte.";
  }
  if (syncError.value) {
    return "Veja os detalhes abaixo. Se o pagamento apareceu no Stripe, aguarde alguns instantes ou fale com o suporte.";
  }
  return "Recarregue a página ou tente novamente em alguns minutos.";
});

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
      sessionData.subscription.current_period_end * 1000,
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
    syncErrorCode.value = null;

    const result = await syncCheckoutSession(sessionId);

    if (result.success) {
      syncData.value = result.data;
      console.log("✅ Sessão sincronizada com sucesso:", syncData.value);
      clearPendingCheckoutSessionId();

      // Se temos dados de sincronização, usar eles para atualizar as informações
      if (syncData.value.subscription) {
        const nextBilling = new Date(
          syncData.value.subscription.current_period_end,
        );
        nextBillingDate.value = formatDate(nextBilling);
      }

      // Mostrar mensagem de sucesso da sincronização
      console.log("🎉 Assinatura registrada com sucesso no banco de dados!");
    } else {
      console.warn("⚠️ Erro na sincronização:", result.error);
      syncError.value = result.error;
      syncErrorCode.value = result.errorCode ?? null;
    }
  } catch (err) {
    console.error("❌ Erro ao sincronizar sessão:", err);
    syncError.value = err.message;
    syncErrorCode.value = err.code ?? null;
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
    syncErrorCode.value = null;

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

.page-title--failure {
  color: #b91c1c;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.page-subtitle--failure {
  color: #57534e;
  max-width: 38rem;
}

.success-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid transparent;
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.success-card--failure {
  border-color: #fecaca;
  box-shadow:
    0 4px 24px rgba(220, 38, 38, 0.12),
    0 0 0 1px rgba(254, 202, 202, 0.6);
}

.hero-icon {
  margin-bottom: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-icon--failure {
  animation: failure-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.hero-failure-mark {
  filter: drop-shadow(0 10px 28px rgba(220, 38, 38, 0.28));
}

.hero-failure-mark__ring {
  fill: #fef2f2;
  stroke: #fca5a5;
  stroke-width: 2;
}

.hero-failure-mark__x {
  stroke: #dc2626;
  stroke-width: 3.2;
}

.hero-success-mark {
  filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.35));
}

@keyframes failure-pop {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.failure-panel {
  text-align: left;
  border-radius: 14px;
  padding: 1.35rem 1.4rem 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid #fecaca;
  background: linear-gradient(145deg, #fff1f2 0%, #fffbfb 55%, #ffffff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.failure-panel--regional {
  border-color: #f87171;
  background: linear-gradient(160deg, #ffe4e6 0%, #fff5f5 45%, #ffffff 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 8px 32px rgba(185, 28, 28, 0.1);
}

.failure-panel--sync,
.failure-panel--load {
  border-color: #fecaca;
}

.failure-panel__badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fef2f2;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  margin-bottom: 0.85rem;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.failure-panel__badge--soft {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
  box-shadow: 0 2px 8px rgba(127, 29, 29, 0.25);
}

.failure-panel__title {
  margin: 0 0 0.65rem 0;
  font-size: 1.22rem;
  font-weight: 700;
  color: #7f1d1d;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.failure-panel__text {
  margin: 0 0 0.65rem 0;
  font-size: 0.98rem;
  line-height: 1.55;
  color: #44403c;
}

.failure-panel__text--muted {
  color: #78716c;
  font-size: 0.92rem;
  margin-bottom: 0;
}

.failure-panel__text--detail {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  background: rgba(254, 226, 226, 0.65);
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  color: #57534e;
  word-break: break-word;
}

.failure-panel__footer {
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(252, 165, 165, 0.65);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem 0.6rem;
  text-align: center;
}

.failure-panel__footer-label {
  font-size: 0.9rem;
  color: #57534e;
}

.failure-panel__link {
  font-size: 0.95rem;
  font-weight: 600;
  color: #7c3aed;
  text-decoration: none;
}

.failure-panel__link:hover {
  text-decoration: underline;
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

.loading-section {
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
  .page-header {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-title--failure {
    font-size: 22px;
  }

  .failure-panel {
    padding: 1.1rem 1rem;
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
