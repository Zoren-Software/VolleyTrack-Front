<template>
  <div class="plan-swap-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <h1>Trocar Plano</h1>
        <p>Altere seu plano atual para um novo plano</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando informações do plano...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">❌</div>
        <h3>Erro ao carregar informações</h3>
        <p>{{ error }}</p>
        <button @click="goBack" class="retry-button">Voltar para Planos</button>
      </div>

      <!-- Swap Form -->
      <div v-else-if="previewData" class="swap-container">
        <!-- Current Plan -->
        <div class="plan-section">
          <h3>Plano Atual</h3>
          <div class="plan-card current-plan">
            <div class="plan-header">
              <h4>{{ currentPlan.name }}</h4>
              <div class="plan-price">
                <span class="amount">{{
                  formatCurrency(currentPlan.amount)
                }}</span>
                <span class="period">{{ getPlanPeriod(currentPlan) }}</span>
              </div>
            </div>
            <div class="plan-status">
              <span class="status-badge active">Ativo</span>
            </div>
          </div>
        </div>

        <!-- New Plan -->
        <div class="plan-section">
          <h3>Novo Plano</h3>
          <div class="plan-card new-plan">
            <div class="plan-header">
              <h4>{{ newPlan.name }}</h4>
              <div class="plan-price">
                <span class="amount">{{ formatCurrency(newPlan.amount) }}</span>
                <span class="period">{{ getPlanPeriod(newPlan) }}</span>
              </div>
            </div>
            <div class="plan-status">
              <span class="status-badge new">Novo</span>
            </div>
          </div>
        </div>

        <!-- Proration Details -->
        <div class="proration-section">
          <h3>Detalhes da Troca</h3>
          <div class="proration-card">
            <div class="proration-item">
              <span class="label">Crédito do plano atual:</span>
              <span class="value credit"
                >-{{ formatCurrency(previewData.credit_amount) }}</span
              >
            </div>
            <div class="proration-item">
              <span class="label">Cobrança do novo plano:</span>
              <span class="value charge"
                >+{{ formatCurrency(previewData.charge_amount) }}</span
              >
            </div>
            <div class="proration-divider"></div>
            <div class="proration-item total">
              <span class="label">Total a ser cobrado:</span>
              <span class="value total">{{
                formatCurrency(previewData.total_amount)
              }}</span>
            </div>
            <div class="proration-item">
              <span class="label">Dias restantes no período:</span>
              <span class="value"
                >{{ previewData.days_remaining || 0 }} dias</span
              >
            </div>
            <div class="proration-item">
              <span class="label">Próxima cobrança:</span>
              <span class="value">{{
                formatDate(previewData.next_billing_date)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button @click="goBack" class="cancel-button" :disabled="swapping">
            Cancelar
          </button>
          <button
            @click="confirmSwap"
            class="confirm-button"
            :disabled="swapping"
          >
            <span v-if="swapping">Processando...</span>
            <span v-else>Confirmar Troca</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import planSwapService from "~/services/planSwapService";

// Composables
const route = useRoute();
const router = useRouter();

// Estado da aplicação
const loading = ref(true);
const error = ref(null);
const previewData = ref(null);
const currentPlan = ref(null);
const newPlan = ref(null);
const swapping = ref(false);

// Obter price_id e customer_id da URL
const priceId = route.query.price_id;
const customerIdFromUrl = route.query.customer_id;

// Função para voltar
const goBack = () => {
  router.push("/payment");
};

// Formatar moeda
const formatCurrency = (amountInCents) => {
  if (!amountInCents || isNaN(amountInCents)) {
    return "R$ 0,00";
  }
  return planSwapService.formatCurrency(amountInCents);
};

// Formatar data
const formatDate = (dateString) => {
  if (!dateString) {
    return "Data não disponível";
  }
  return planSwapService.formatDate(dateString);
};

// Obter período do plano
const getPlanPeriod = (plan) => {
  if (plan.interval === "month") {
    return plan.interval_count === 1
      ? "/mês"
      : `/ ${plan.interval_count} meses`;
  } else if (plan.interval === "year") {
    return plan.interval_count === 1 ? "/ano" : `/ ${plan.interval_count} anos`;
  }
  return "";
};

// Carregar preview da troca
const loadPreview = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!priceId) {
      throw new Error("ID do preço não fornecido");
    }

    // Obter customer_id da URL primeiro, depois do localStorage
    let customerId = customerIdFromUrl;

    if (!customerId) {
      console.log(
        "🔍 Customer ID não encontrado na URL, tentando localStorage..."
      );
      customerId = getCustomerId();
    } else {
      console.log("✅ Customer ID encontrado na URL:", customerId);
    }

    // Se não encontrou customer_id, tentar obter da API
    if (!customerId) {
      console.log(
        "🔍 Customer ID não encontrado no localStorage, tentando obter da API..."
      );

      try {
        // Importar getActivePlan para obter dados do customer
        const { getActivePlan } = await import(
          "~/services/stripeCheckoutService.js"
        );

        // Obter token de autenticação
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("apollo:default.token");
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        // Obter dados do plano ativo (que contém customer_id)
        const tenantId = getTenantId();
        console.log("🔍 tenant_id obtido:", tenantId);
        console.log(
          "🔍 token obtido:",
          token ? "✅ Token encontrado" : "❌ Token não encontrado"
        );

        const activePlanResponse = await getActivePlan(token, tenantId);

        if (activePlanResponse.success && activePlanResponse.data) {
          // Tentar extrair customer_id da resposta
          const responseData =
            activePlanResponse.data.data || activePlanResponse.data;
          console.log("🔍 Estrutura da resposta da API:", responseData);

          // Extrair customer_id da nova estrutura da API
          customerId = responseData.customer_id;

          if (customerId) {
            console.log("✅ Customer ID obtido da API:", customerId);
            // Salvar no localStorage para próximas vezes
            localStorage.setItem("customer_id", customerId);
          } else {
            console.log("❌ Customer ID não encontrado na resposta da API");
            console.log("🔍 Estrutura da resposta:", responseData);
            console.log(
              "🔍 Propriedades disponíveis:",
              Object.keys(responseData)
            );
            console.log("🔍 subscription object:", responseData.subscription);
            console.log(
              "🔍 subscription properties:",
              responseData.subscription
                ? Object.keys(responseData.subscription)
                : "subscription is null/undefined"
            );
          }
        } else {
          console.log(
            "❌ Erro ao obter dados da API:",
            activePlanResponse.error
          );
        }
      } catch (apiError) {
        console.error("❌ Erro ao obter customer_id da API:", apiError);
      }
    }

    if (!customerId) {
      throw new Error("ID do customer não encontrado. Faça login novamente.");
    }

    console.log("🔄 Carregando preview da troca:", {
      customerId,
      priceId,
    });

    // Carregar preview da troca
    const result = await planSwapService.previewPlanSwap(customerId, priceId);

    if (!result.success) {
      throw new Error(result.error || "Erro ao carregar preview da troca");
    }

    previewData.value = result.data;
    currentPlan.value = result.data.current_plan;
    newPlan.value = result.data.new_plan;

    console.log("✅ Preview carregado com sucesso:", result.data);
    console.log("🔍 previewData.value:", previewData.value);
    console.log("🔍 currentPlan.value:", currentPlan.value);
    console.log("🔍 newPlan.value:", newPlan.value);
    console.log("🔍 Estrutura dos dados de preview:", {
      credit_amount: previewData.value?.credit_amount,
      charge_amount: previewData.value?.charge_amount,
      total_amount: previewData.value?.total_amount,
      days_remaining: previewData.value?.days_remaining,
      next_billing_date: previewData.value?.next_billing_date,
    });

    // Mapear dados da estrutura atual da API para o formato esperado
    if (previewData.value && previewData.value.swap_summary) {
      const currentAmount = currentPlan.value?.amount || 0;
      const newAmount = newPlan.value?.amount || 0;
      const immediateCharge =
        previewData.value.swap_summary.immediate_charge || 0;

      // Calcular valores baseados na diferença dos planos
      previewData.value.credit_amount = -currentAmount;
      previewData.value.charge_amount = newAmount;
      previewData.value.total_amount =
        immediateCharge || newAmount - currentAmount;
      previewData.value.days_remaining = 30; // Valor padrão temporário
      previewData.value.next_billing_date =
        previewData.value.swap_summary.next_billing_date;

      console.log("🔧 Dados mapeados temporariamente:", {
        credit_amount: previewData.value.credit_amount,
        charge_amount: previewData.value.charge_amount,
        total_amount: previewData.value.total_amount,
        days_remaining: previewData.value.days_remaining,
        next_billing_date: previewData.value.next_billing_date,
      });
    }
  } catch (err) {
    console.error("❌ Erro ao carregar preview:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Obter tenant_id (salvo pelo middleware Apollo)
const getTenantId = () => {
  if (process.client) {
    const storedTenant = localStorage.getItem("tenant_id");
    if (storedTenant) {
      return storedTenant;
    }
    return "default";
  }
  return "default";
};

// Obter customer_id
const getCustomerId = () => {
  console.log("🔍 Iniciando busca por customer_id...");

  // Debug: mostrar todos os dados do localStorage
  console.log("🔍 localStorage completo:", {
    customer_id: localStorage.getItem("customer_id"),
    activePlanData: localStorage.getItem("activePlanData"),
    userToken: localStorage.getItem("userToken"),
    apolloToken: localStorage.getItem("apollo:default.token"),
    tenant_id: localStorage.getItem("tenant_id"),
  });

  // Tentar obter do localStorage primeiro
  const storedCustomerId = localStorage.getItem("customer_id");
  if (storedCustomerId) {
    console.log(
      "✅ Customer ID encontrado no localStorage direto:",
      storedCustomerId
    );
    return storedCustomerId;
  }

  // Tentar obter do activePlanData se estiver disponível no localStorage
  try {
    const activePlanData = localStorage.getItem("activePlanData");
    if (activePlanData) {
      console.log("🔍 activePlanData encontrado, parseando...");
      const parsed = JSON.parse(activePlanData);
      console.log("🔍 activePlanData parseado:", parsed);

      // Tentar diferentes propriedades possíveis
      const customerId = parsed.customer_id || parsed.customer?.id || parsed.id;
      if (customerId) {
        console.log("✅ Customer ID encontrado no activePlanData:", customerId);
        return customerId;
      } else {
        console.log(
          "❌ Customer ID não encontrado no activePlanData. Propriedades disponíveis:",
          Object.keys(parsed)
        );
      }
    } else {
      console.log("❌ activePlanData não encontrado no localStorage");
    }
  } catch (err) {
    console.warn("❌ Erro ao parsear activePlanData do localStorage:", err);
  }

  // Fallback: tentar obter do userToken (se contiver customer_id)
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    try {
      console.log("🔍 Tentando extrair customer_id do userToken...");
      // Se o token contém informações do customer, extrair
      // (isso depende de como o token é estruturado)
      const tokenData = JSON.parse(atob(userToken.split(".")[1]));
      console.log("🔍 Token data:", tokenData);

      if (tokenData.customer_id) {
        console.log(
          "✅ Customer ID encontrado no token:",
          tokenData.customer_id
        );
        return tokenData.customer_id;
      } else {
        console.log(
          "❌ Customer ID não encontrado no token. Propriedades disponíveis:",
          Object.keys(tokenData)
        );
      }
    } catch (err) {
      console.warn("❌ Erro ao extrair customer_id do token:", err);
    }
  } else {
    console.log("❌ userToken não encontrado no localStorage");
  }

  console.log("❌ Customer ID não encontrado em nenhuma fonte");
  return null;
};

// Confirmar troca
const confirmSwap = async () => {
  try {
    swapping.value = true;

    // Usar customer_id da URL primeiro, depois do localStorage
    let customerId = customerIdFromUrl;
    if (!customerId) {
      customerId = getCustomerId();
    }

    if (!customerId) {
      throw new Error("ID do customer não encontrado");
    }

    console.log("🔄 Confirmando troca de plano:", {
      customerId,
      priceId,
    });

    const result = await planSwapService.swapPlan(customerId, priceId);

    if (!result.success) {
      throw new Error(result.error || "Erro ao trocar plano");
    }

    console.log("✅ Plano trocado com sucesso:", result.data);

    // Mostrar sucesso e redirecionar
    alert("Plano trocado com sucesso!");
    router.push("/payment");
  } catch (err) {
    console.error("❌ Erro ao trocar plano:", err);
    alert(`Erro ao trocar plano: ${err.message}`);
  } finally {
    swapping.value = false;
  }
};

// Inicialização
onMounted(() => {
  loadPreview();
});
</script>

<style scoped>
.plan-swap-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
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

.error-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-container h3 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.error-container p {
  margin-bottom: 20px;
  opacity: 0.9;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.swap-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.plan-section {
  margin-bottom: 30px;
}

.plan-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.plan-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-card.current-plan {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4, #ffffff);
}

.plan-card.new-plan {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.plan-header h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.plan-price .currency {
  font-size: 1rem;
  color: #667eea;
  font-weight: 600;
}

.plan-price .amount {
  font-size: 2rem;
  color: #667eea;
  font-weight: 700;
}

.plan-price .period {
  font-size: 0.9rem;
  color: #666;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #10b981;
  color: white;
}

.status-badge.new {
  background: #3b82f6;
  color: white;
}

.proration-section {
  margin-bottom: 30px;
}

.proration-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.proration-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.proration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.proration-item:last-child {
  border-bottom: none;
}

.proration-item.total {
  font-weight: 700;
  font-size: 1.1rem;
  border-top: 2px solid #333;
  margin-top: 10px;
  padding-top: 15px;
}

.proration-divider {
  height: 1px;
  background: #333;
  margin: 10px 0;
}

.proration-item .label {
  color: #666;
}

.proration-item .value {
  font-weight: 600;
}

.proration-item .value.credit {
  color: #10b981;
}

.proration-item .value.charge {
  color: #3b82f6;
}

.proration-item .value.total {
  color: #333;
  font-size: 1.2rem;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.cancel-button,
.confirm-button {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.cancel-button {
  background: #6b7280;
  color: white;
}

.cancel-button:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-2px);
}

.confirm-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.confirm-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.cancel-button:disabled,
.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsividade */
@media (max-width: 768px) {
  .plan-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .actions-section {
    flex-direction: column;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
