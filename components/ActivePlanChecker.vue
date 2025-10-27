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
            <span class="stat-label">Próxima cobrança:</span>
            <span class="stat-value">{{
              formatDate(activePlan.subscription.current_period_end)
            }}</span>
          </div>
        </div>

        <div class="plan-actions">
          <button @click="manageSubscription" class="btn btn-secondary">
            Gerenciar Assinatura
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

    <div v-else class="no-plan">
      <div class="no-plan-icon">📋</div>
      <h3>Nenhum Plano Ativo</h3>
      <p>Você não possui um plano ativo no momento.</p>
      <div class="no-plan-actions">
        <button @click="goToPlans" class="btn btn-primary">
          Ver Planos Disponíveis
        </button>
        <button @click="checkActivePlan" class="btn btn-secondary">
          Atualizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getActivePlan } from "~/services/stripeCheckoutService.js";

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
const manageSubscription = () => {
  // Implementar redirecionamento para gerenciamento de assinatura
  console.log("Gerenciar assinatura");
  // Exemplo: window.open('https://billing.stripe.com/p/login/...', '_blank')
};

const upgradePlan = () => {
  // Emitir evento para toggle das animações nos planos
  emit("upgrade-clicked");

  console.log("Toggle de animações ativado");
  // Implementar redirecionamento para upgrade
  // Exemplo: this.$router.push('/plans')
};

const goToPlans = () => {
  // Implementar redirecionamento para planos
  console.log("Ir para planos");
  // Exemplo: this.$router.push('/plans')
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
  padding: 20px;
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

.btn-secondary:hover {
  background: #e5e7eb;
  color: #1f2937;
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
