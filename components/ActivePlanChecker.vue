<template>
  <div class="active-plan-checker">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Verificando plano ativo...</p>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <p>Erro ao verificar plano: {{ error }}</p>
      <button @click="checkActivePlan" class="btn-retry">
        Tentar Novamente
      </button>
    </div>

    <div v-else-if="activePlan" class="active-plan">
      <div class="plan-header">
        <h3>Seu Plano Ativo</h3>
        <div class="status-badge" :class="activePlan.subscription?.status">
          {{ getSubscriptionStatusText(activePlan.subscription?.status) }}
        </div>
      </div>

      <div class="plan-details">
        <div class="plan-info">
          <h4>{{ activePlan.product?.name || "Plano Ativo" }}</h4>
          <p v-if="activePlan.product?.description" class="plan-description">
            {{ activePlan.product.description }}
          </p>
        </div>

        <div class="plan-stats">
          <div class="stat-item">
            <span class="stat-label">Valor:</span>
            <span class="stat-value price">
              R$ {{ formatPrice(activePlan.price?.unit_amount) }}
              <span
                v-if="activePlan.price?.type === 'recurring'"
                class="recurring"
              >
                /
                {{
                  getRecurringInterval(activePlan.price?.recurring?.interval)
                }}
              </span>
            </span>
          </div>

          <div
            v-if="activePlan.subscription?.current_period_end"
            class="stat-item"
          >
            <span class="stat-label" :class="{ 'canceled-label': isCanceled }"
              >Próxima cobrança:</span
            >
            <span
              class="stat-value"
              :class="{ 'canceled-value': isCanceled }"
              >{{
                formatDate(activePlan.subscription.current_period_end)
              }}</span
            >
          </div>
        </div>

        <!-- Aviso de Cancelamento -->
        <div v-if="isCanceled" class="cancellation-notice">
          <div class="notice-header">
            <span class="notice-icon">⚠️</span>
            <h4 class="notice-title">Sua assinatura foi cancelada</h4>
          </div>
          <p class="notice-text">
            Você continuará com acesso até
            <strong
              >{{
                formatDate(activePlan.subscription?.current_period_end)
              }}.</strong
            >
            Não haverá novas cobranças após esta data.
          </p>
        </div>

        <div class="plan-actions">
          <button
            @click="manageSubscription"
            class="btn btn-secondary"
            :disabled="isCanceled"
            :class="{ 'btn-disabled': isCanceled }"
          >
            {{ isCanceled ? "Assinatura Cancelada" : "Cancelar Assinatura" }}
          </button>
          <button
            @click="upgradePlan"
            class="btn btn-primary upgrade-btn"
            :class="{ 'upgrade-animation': props.showUpgradeAnimations }"
          >
            <span class="upgrade-text">{{
              props.showUpgradeAnimations ? "Parar Animações" : "Fazer Upgrade"
            }}</span>
            <span class="upgrade-sparkle" v-if="props.showUpgradeAnimations"
              >✨</span
            >
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="active-plan free-plan"
      :class="{ 'trial-expired': trialInfo && !trialInfo.in_trial }"
    >
      <div class="plan-header">
        <h3>Seu Plano Ativo</h3>
        <div class="status-badge free-plan-badge">
          {{ trialInfo?.in_trial ? "TRIAL ATIVO" : "GRÁTIS" }}
        </div>
      </div>

      <div class="plan-details">
        <div class="plan-info">
          <h4>
            {{
              trialInfo?.in_trial
                ? "Trial Gratuito (14 dias)"
                : "Sem Plano Ativo"
            }}
          </h4>
          <p class="plan-description">
            {{ formattedTrialMessage }}
          </p>
        </div>

        <div class="plan-stats">
          <div class="stat-item">
            <span class="stat-label">Valor:</span>
            <span class="stat-value price free-price"> R$ 0,00 </span>
          </div>

          <div v-if="trialInfo?.in_trial" class="stat-item trial-countdown">
            <span class="stat-label">Tempo restante:</span>
            <span v-if="timeRemaining" class="stat-value countdown-display">
              {{ timeRemaining.days }}d {{ timeRemaining.hours }}h
              {{ timeRemaining.minutes }}m {{ timeRemaining.seconds }}s
            </span>
            <span v-else class="stat-value free-period trial-days">
              Calculando...
            </span>
          </div>

          <div v-if="trialInfo?.in_trial" class="stat-item">
            <span class="stat-label">Trial expira em:</span>
            <span class="stat-value trial-date">
              {{ formatDate(trialInfo.trial_ends_at) }}
            </span>
          </div>

          <div v-if="trialInfo && !trialInfo.in_trial" class="stat-item">
            <span class="stat-label">Status:</span>
            <span class="stat-value trial-expired-badge"> Trial Expirado </span>
          </div>
        </div>

        <!-- Barra de progresso do trial -->
        <div v-if="trialInfo?.in_trial" class="trial-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${
                  (trialInfo.days_remaining / trialInfo.total_trial_days) * 100
                }%`,
              }"
            ></div>
          </div>
          <span class="progress-text">
            {{
              Math.ceil(trialInfo.total_trial_days - trialInfo.days_remaining)
            }}
            de {{ trialInfo.total_trial_days }} dias usados
          </span>
        </div>

        <div class="plan-actions">
          <button
            @click="upgradePlan"
            class="btn btn-primary upgrade-btn"
            :class="{ 'upgrade-animation': props.showUpgradeAnimations }"
          >
            <span class="upgrade-text">{{
              props.showUpgradeAnimations ? "Parar Animações" : "Fazer Upgrade"
            }}</span>
            <span class="upgrade-sparkle" v-if="props.showUpgradeAnimations"
              >✨</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { getActivePlan } from "~/services/stripeCheckoutService.js";
import Swal from "sweetalert2";

// Props
const props = defineProps({
  autoRefresh: {
    type: Boolean,
    default: true,
  },
  refreshInterval: {
    type: Number,
    default: 30000, // 30 segundos
  },
  tenantId: {
    type: String,
    default: null,
  },
  showUpgradeAnimations: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits([
  "plan-loaded",
  "plan-error",
  "plan-updated",
  "upgrade-clicked",
]);

// Estado da aplicação
const activePlan = ref(null);
const loading = ref(true);
const error = ref(null);
const refreshTimer = ref(null);
const trialInfo = ref(null);
const timeRemaining = ref(null); // Para contagem regressiva

// Verificar se o plano está cancelado
const isCanceled = computed(() => {
  return (
    activePlan.value?.subscription?.cancel_at_period_end === true &&
    activePlan.value?.subscription?.canceled_at !== null
  );
});

// Formatar mensagem do trial com dias arredondados
const formattedTrialMessage = computed(() => {
  if (!trialInfo.value?.message) {
    return "Plano de avaliação gratuito por 14 dias";
  }

  // Extrair números decimais da mensagem e arredondar para cima
  const message = trialInfo.value.message;
  const match = message.match(/(\d+\.\d+)/);

  if (match) {
    const daysDecimal = parseFloat(match[1]);
    const daysRounded = Math.ceil(daysDecimal);
    return message.replace(/\d+\.\d+/, daysRounded.toString());
  }

  return message;
});

// Contagem regressiva do trial
const startTrialCountdown = () => {
  if (
    !trialInfo.value ||
    !trialInfo.value.in_trial ||
    !trialInfo.value.trial_ends_at
  ) {
    return;
  }

  const updateCountdown = () => {
    const now = new Date();
    const trialEnd = new Date(trialInfo.value.trial_ends_at);
    const diff = trialEnd - now;

    if (diff <= 0) {
      timeRemaining.value = null;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timeRemaining.value = {
      days,
      hours,
      minutes,
      seconds,
    };
  };

  // Atualizar imediatamente
  updateCountdown();

  // Atualizar a cada segundo
  const countdownInterval = setInterval(() => {
    updateCountdown();

    // Se o trial expirou, limpar intervalo
    if (!timeRemaining.value) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // Limpar intervalo ao desmontar
  onUnmounted(() => {
    clearInterval(countdownInterval);
  });
};

// Obter token de autenticação
const getAuthToken = () => {
  if (process.client) {
    const userToken = localStorage.getItem("userToken");
    const apolloToken = localStorage.getItem("apollo:default.token");
    return userToken || apolloToken;
  }
  return null;
};

// Verificar plano ativo
const checkActivePlan = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error(
        "Token de autenticação não encontrado. Faça login novamente."
      );
    }

    const response = await getActivePlan(token, props.tenantId);

    console.log("🔍 Resposta completa do getActivePlan:", response);

    if (response.success) {
      console.log("🔍 response.data:", response.data);
      console.log(
        "🔍 response.data.has_active_plan:",
        response.data.has_active_plan
      );
      console.log(
        "🔍 Tipo de response.data.has_active_plan:",
        typeof response.data.has_active_plan
      );
      console.log(
        "🔍 Comparação response.data.has_active_plan === true:",
        response.data.has_active_plan === true
      );
      console.log(
        "🔍 Comparação response.data.has_active_plan == true:",
        response.data.has_active_plan == true
      );
      console.log(
        "🔍 Comparação Boolean(response.data.has_active_plan):",
        Boolean(response.data.has_active_plan)
      );

      if (response.data.has_active_plan === true) {
        activePlan.value = response.data;

        // Extrair customer_id da nova estrutura da API
        const customerId = response.data.customer_id;

        console.log("🔍 Tentando extrair customer_id:", {
          "response.data.customer_id": response.data.customer_id,
          "customerId final": customerId,
        });

        // Salvar customer_id no localStorage para uso na página de troca
        if (customerId) {
          localStorage.setItem("customer_id", customerId);
          console.log("💾 Customer ID salvo no localStorage:", customerId);
          console.log("💾 Tipo do customerId salvo:", typeof customerId);
          console.log("💾 customerId === 1:", customerId === 1);
          console.log("💾 customerId === '1':", customerId === "1");

          // Adicionar customer_id ao objeto que será emitido
          activePlan.value.customer_id = customerId;
          console.log(
            "💾 activePlan.value.customer_id definido como:",
            activePlan.value.customer_id
          );
        } else {
          console.log("❌ Customer ID não encontrado na resposta");
          console.log("🔍 Estrutura completa da resposta:", response.data);
        }

        // Salvar dados completos do plano ativo no localStorage
        localStorage.setItem("activePlanData", JSON.stringify(response.data));
        console.log("💾 Dados do plano ativo salvos no localStorage");

        emit("plan-loaded", activePlan.value);
        console.log("✅ Plano ativo carregado:", activePlan.value);
      } else {
        activePlan.value = null;

        // Extrair informações de trial se disponível
        if (response.data.trial_info) {
          trialInfo.value = response.data.trial_info;
          console.log("📋 Informações de trial encontradas:", trialInfo.value);

          // Iniciar contagem regressiva se trial está ativo
          if (trialInfo.value.in_trial && trialInfo.value.trial_ends_at) {
            startTrialCountdown();
            console.log("⏱️ Contagem regressiva iniciada para trial");
          }
        } else {
          trialInfo.value = null;
        }

        // Limpar dados do localStorage quando não há plano ativo
        localStorage.removeItem("customer_id");
        localStorage.removeItem("activePlanData");
        console.log("🧹 Dados do plano ativo removidos do localStorage");

        emit("plan-loaded", null);
        console.log(
          "ℹ️ Nenhum plano ativo encontrado - has_active_plan:",
          response.data.has_active_plan
        );
      }
    } else {
      throw new Error(response.error || "Erro ao consultar plano ativo");
    }
  } catch (err) {
    console.error("❌ Erro ao verificar plano ativo:", err);
    error.value = err.message;
    emit("plan-error", err);
  } finally {
    loading.value = false;
  }
};

// Configurar auto-refresh
const setupAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer.value = setInterval(() => {
      console.log("🔄 Atualizando plano ativo automaticamente...");
      checkActivePlan();
      emit("plan-updated");
    }, props.refreshInterval);
  }
};

// Limpar timer
const clearRefreshTimer = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
};

// Funções auxiliares
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatPrice = (amount) => {
  if (!amount) return "0,00";
  return (amount / 100).toFixed(2).replace(".", ",");
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
  return statusMap[status] || status || "Desconhecido";
};

const getRecurringInterval = (interval) => {
  const intervalMap = {
    day: "dia",
    week: "semana",
    month: "mês",
    year: "ano",
  };
  return intervalMap[interval] || interval || "período";
};

// Ações do usuário
const manageSubscription = async () => {
  console.log("🔄 Iniciando cancelamento de assinatura...");

  // Confirmar cancelamento com SweetAlert2
  const { value: confirmed } = await Swal.fire({
    title: "Cancelar Assinatura?",
    html: `
      <div style="text-align: left; padding: 10px 0;">
        <p style="margin-bottom: 15px;">
          Tem certeza que deseja cancelar sua assinatura?
        </p>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">
            ⚠️ Seu acesso será mantido até o fim do período atual.
          </p>
          <p style="margin: 5px 0 0 0; color: #78350f; font-size: 0.9rem;">
            Você continuará tendo acesso ao plano até o fim do ciclo atual.
          </p>
        </div>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, cancelar assinatura",
    cancelButtonText: "Não, manter assinatura",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#10b981",
    width: "600px",
  });

  if (!confirmed) {
    console.log("❌ Cancelamento cancelado pelo usuário");
    return;
  }

  try {
    console.log("🔄 Processando cancelamento...");

    // Obter customer_id
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      throw new Error("ID do customer não encontrado");
    }

    // Obter token
    const token = getAuthToken();
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    // Chamar API de cancelamento
    const response = await fetch(
      "http://api.volleytrack.local/v1/subscriptions/cancel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          cancel_at_period_end: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao cancelar assinatura");
    }

    const data = await response.json();
    console.log("✅ Assinatura cancelada com sucesso:", data);

    // Mostrar sucesso
    Swal.fire({
      icon: "success",
      title: "Assinatura Cancelada",
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <p style="font-size: 1.1rem; margin-bottom: 15px; color: #333;">
            <strong>✅ Sua assinatura foi cancelada com sucesso!</strong>
          </p>
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 600;">
              Você continuará com acesso até o fim do período atual.
            </p>
          </div>
          <p style="margin: 15px 0 0 0; font-size: 0.95rem; color: #666;">
            Não haverá novas cobranças após o fim do período atual.
          </p>
        </div>
      `,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#10b981",
      width: "600px",
    });

    // Recarregar dados do plano
    await checkActivePlan();
  } catch (error) {
    console.error("❌ Erro ao cancelar assinatura:", error);

    Swal.fire({
      icon: "error",
      title: "Erro ao Cancelar Assinatura",
      text:
        error.message ||
        "Ocorreu um erro ao processar o cancelamento. Por favor, tente novamente.",
      confirmButtonText: "Fechar",
      confirmButtonColor: "#dc2626",
    });
  }
};

const upgradePlan = () => {
  console.log("🔄 Botão Fazer Upgrade clicado!");
  console.log("🔍 showUpgradeAnimations atual:", props.showUpgradeAnimations);

  // Emitir evento para toggle das animações nos planos
  emit("upgrade-clicked");

  console.log("✅ Evento 'upgrade-clicked' emitido");
};

// Lifecycle
onMounted(async () => {
  console.log("🚀 Inicializando ActivePlanChecker...");
  await checkActivePlan();
  setupAutoRefresh();
  console.log("✅ ActivePlanChecker inicializado");
});

// Cleanup
onUnmounted(() => {
  clearRefreshTimer();
});
</script>

<style scoped>
.active-plan-checker {
  max-width: 600px;
  margin: 0 auto;
}

.loading,
.error,
.no-plan {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 15px;
}

.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 15px;
  transition: background-color 0.3s ease;
}

.btn-retry:hover {
  background: #b91c1c;
}

.active-plan {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.plan-header h3 {
  color: #1f2937;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.trialing {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.past_due {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.canceled {
  background: #fee2e2;
  color: #991b1b;
}

.plan-info {
  margin-bottom: 25px;
}

.plan-info h4 {
  color: #1f2937;
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.plan-description {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.plan-stats {
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.stat-value.price {
  color: #10b981;
  font-size: 1.1rem;
}

.recurring {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 400;
}

.plan-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Botão de Upgrade com Animação */
.upgrade-btn {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.upgrade-animation {
  animation: upgradePulse 0.6s ease-in-out infinite alternate;
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4) !important;
}

@keyframes upgradePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  }
  100% {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(245, 158, 11, 0.7);
  }
}

.upgrade-text {
  position: relative;
  z-index: 2;
  font-weight: 700;
  font-size: 1rem;
}

.upgrade-sparkle {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1.2rem;
  animation: sparkle 1s ease-in-out infinite;
  z-index: 3;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

.no-plan {
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  color: #6b7280;
}

.no-plan-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.no-plan h3 {
  color: #374151;
  margin: 0 0 15px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.no-plan p {
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.no-plan-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:disabled,
.btn-disabled {
  background: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.btn-secondary:disabled:hover,
.btn-disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* Estilos para plano cancelado */
.canceled-label,
.canceled-value {
  text-decoration: line-through;
  color: #9ca3af;
}

/* Aviso de cancelamento - Melhorado */
.cancellation-notice {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-left: 6px solid #d97706;
  border-radius: 16px;
  padding: 24px 28px;
  margin: 24px 0;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.notice-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.notice-title {
  margin: 0;
  color: #92400e;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.notice-text {
  margin: 0;
  color: #78350f;
  font-size: 0.95rem;
  line-height: 1.6;
  padding-left: 40px;
}

.notice-text strong {
  color: #1e40af;
  font-weight: 700;
  font-size: 1.05rem;
}

/* Estilos para plano gratuito */
.free-plan {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px dashed #d1d5db;
  opacity: 0.85;
}

.free-plan .plan-header {
  border-bottom: 1px solid #e5e7eb;
}

.free-plan .plan-header h3 {
  color: #6b7280;
}

.free-plan-badge {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  color: white;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.free-plan .plan-info h4 {
  color: #6b7280;
}

.free-plan .plan-description {
  color: #9ca3af;
}

.free-price {
  color: #9ca3af;
  font-weight: 600;
}

.free-period {
  color: #6b7280;
  font-weight: 600;
}

.free-plan .plan-stats .stat-label {
  color: #9ca3af;
}

.free-plan .btn-primary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
}

.free-plan .btn-primary:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
}

/* Estilos para Trial */
.trial-days {
  color: #10b981;
  font-weight: 700;
}

.trial-date {
  color: #3b82f6;
  font-weight: 600;
}

.trial-expired-badge {
  color: #dc2626;
  font-weight: 700;
}

.free-plan.trial-expired {
  border-color: #dc2626;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

/* Barra de progresso do trial */
.trial-progress {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.progress-text {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

/* Contagem regressiva */
.trial-countdown {
  margin: 10px 0;
}

.countdown-display {
  font-family: "Courier New", monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: #374151;
  letter-spacing: 1px;
}

/* Responsividade */
@media (max-width: 768px) {
  .active-plan-checker {
    padding: 15px;
  }

  .active-plan {
    padding: 20px;
  }

  .plan-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .plan-actions,
  .no-plan-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  /* Animações responsivas */
  .upgrade-animation {
    animation: upgradePulseMobile 0.8s ease-in-out infinite alternate;
  }

  @keyframes upgradePulseMobile {
    0% {
      transform: scale(1);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    }
    100% {
      transform: scale(1.02);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
    }
  }

  .top-tier-badge {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .upgrade-sparkle {
    font-size: 1rem;
  }
}
</style>
