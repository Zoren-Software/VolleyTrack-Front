<template>
  <div class="subscription-plans-page">
    <div class="container">
      <h1>Planos de Assinatura</h1>
      <p>Escolha o plano ideal para o seu clube de vôlei</p>

      <!-- Seletor de Periodicidade -->
      <div class="billing-toggle">
        <span class="toggle-label">Planos:</span>
        <div class="toggle-buttons">
          <button
            @click="selectedBilling = 'monthly'"
            :class="{ active: selectedBilling === 'monthly' }"
            class="toggle-btn"
          >
            Mensal
          </button>
          <button
            @click="selectedBilling = 'yearly'"
            :class="{ active: selectedBilling === 'yearly' }"
            class="toggle-btn"
          >
            Anual
            <span class="discount-badge">-{{ getGeneralYearlyDiscount }}%</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando planos...</p>
      </div>

      <!-- Debug info -->
      <div v-if="showDebug" class="debug-info">
        <h4>Debug Info:</h4>
        <p><strong>Stripe Key:</strong> {{ stripeKey }}</p>
        <p><strong>Loading:</strong> {{ loading }}</p>
        <p><strong>Plans:</strong> {{ plans.length }} planos carregados</p>
        <p>
          <strong>Valid Plans:</strong> {{ displayedPlans.length }} planos
          válidos
        </p>
        <p>
          <strong>Selected Plan:</strong> {{ selectedPlan?.name || "Nenhum" }}
        </p>
        <p><strong>Billing:</strong> {{ selectedBilling }}</p>
        <p>
          <strong>General Yearly Discount:</strong>
          {{ getGeneralYearlyDiscount }}%
        </p>
        <div v-if="selectedPlan && selectedPlan.prices?.data?.[0]">
          <p><strong>Price ID:</strong> {{ selectedPlan.prices.data[0].id }}</p>
          <p>
            <strong>Price Amount:</strong> R$ {{ getPlanPrice(selectedPlan) }}
          </p>
          <p>
            <strong>Price Type:</strong> {{ selectedPlan.prices.data[0].type }}
          </p>
          <p v-if="selectedPlan.prices.data[0].recurring">
            <strong>Recurring:</strong>
            {{ selectedPlan.prices.data[0].recurring.interval_count }}
            {{ selectedPlan.prices.data[0].recurring.interval }}
          </p>
        </div>
      </div>

      <!-- Planos de Assinatura -->
      <div v-if="!loading && plans.length > 0" class="plans-container">
        <!-- Grid de 3 opções -->
        <div class="plans-grid">
          <div
            v-for="plan in displayedPlans"
            :key="`${plan.id}-${plan.billing}`"
            class="plan-card"
            :class="{
              selected:
                selectedPlan?.id === plan.id &&
                selectedPlan?.billing === plan.billing,
              'lifetime-card': plan.metadata?.plan_type === 'lifetime',
              'popular-plan': plan.metadata?.plan_type === 'pro',
            }"
            @click="selectPlan(plan)"
          >
            <!-- Badge de Popular -->
            <div v-if="plan.metadata?.plan_type === 'pro'" class="plan-popular">
              <span>Mais Popular</span>
            </div>

            <!-- Badge de Vitalício -->
            <div
              v-if="plan.metadata?.plan_type === 'lifetime'"
              class="lifetime-badge"
            >
              <span>Pagamento Único</span>
            </div>

            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="currency">R$</span>
                <span class="amount">{{ getPlanPrice(plan) }}</span>
                <span class="period">{{ getPlanPeriod(plan) }}</span>
              </div>
              <div
                v-if="
                  plan.metadata?.type === 'yearly' && getYearlyDiscount(plan)
                "
                class="yearly-savings"
              >
                <span>
                  Economia de R$ {{ getYearlyDiscount(plan).savings }}/ano ({{
                    getYearlyDiscount(plan).percentage
                  }}%)
                </span>
              </div>
              <div
                v-if="plan.metadata?.plan_type === 'lifetime'"
                class="lifetime-savings"
              >
                Pagamento único - Sem mensalidades
              </div>
            </div>

            <div class="plan-description">
              <p>{{ plan.description }}</p>
            </div>

            <div class="plan-features">
              <ul>
                <li v-if="plan.metadata?.max_players !== '0'">
                  <span class="feature-icon">✓</span>
                  Até {{ plan.metadata?.max_players }} jogadores
                </li>
                <li v-if="plan.metadata?.max_teams !== '0'">
                  <span class="feature-icon">✓</span>
                  Até {{ plan.metadata?.max_teams }} equipes
                </li>
                <li v-if="plan.metadata?.plan_type === 'lifetime'">
                  <span class="feature-icon">✓</span>
                  Acesso vitalício
                </li>
                <li v-if="plan.metadata?.plan_type === 'clubes'">
                  <span class="feature-icon">✓</span>
                  Jogadores e equipes ilimitados
                </li>
                <li v-if="plan.metadata?.plan_type === 'pro'">
                  <span class="feature-icon">✓</span>
                  Funcionalidades avançadas
                </li>
                <li v-if="plan.metadata?.type === 'yearly'">
                  <span class="feature-icon">✓</span>
                  Desconto anual
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensagem de erro -->
      <div v-if="error" class="error-message">
        <h3>Erro ao carregar planos</h3>
        <p>{{ error }}</p>
        <button @click="loadPlans" class="retry-button">
          Tentar novamente
        </button>
      </div>

      <!-- Botão de Assinatura -->
      <div v-if="selectedPlan" class="subscription-actions">
        <h3>Plano Selecionado: {{ selectedPlan.name }}</h3>
        <p class="plan-description">{{ selectedPlan.description }}</p>
        <p class="plan-billing-info">
          <strong>Faturamento:</strong>
          {{
            selectedPlan.metadata?.plan_type === "lifetime"
              ? "Pagamento único"
              : `${
                  selectedPlan.metadata?.type === "monthly" ? "Mensal" : "Anual"
                }`
          }}
        </p>

        <button
          @click="subscribeToPlan"
          :disabled="subscriptionLoading"
          class="subscribe-button"
        >
          {{
            subscriptionLoading
              ? "Processando..."
              : `Assinar ${selectedPlan.name} - R$ ${getPlanPrice(
                  selectedPlan
                )}${getPlanPeriod(selectedPlan)}`
          }}
        </button>
      </div>

      <!-- Resultado da Assinatura -->
      <div v-if="subscriptionResult" class="subscription-result">
        <h3>Resultado da Assinatura</h3>
        <pre>{{ JSON.stringify(subscriptionResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Configurações do Stripe
const runtimeConfig = useRuntimeConfig();
const stripeKey = runtimeConfig.public.stripePublishableKey;

// Estado da aplicação
const loading = ref(false);
const subscriptionLoading = ref(false);
const selectedPlan = ref(null);
const selectedBilling = ref("monthly"); // 'monthly', 'yearly'
const subscriptionResult = ref(null);
const showDebug = ref(true); // Ativado para debug
const plans = ref([]);
const error = ref(null);

// Instância do Stripe
const stripe = ref(null);

// API URL
const API_URL = "http://graphql.volleytrack.local/v1/products";

// Planos exibidos baseados na periodicidade selecionada
const displayedPlans = computed(() => {
  if (plans.value.length === 0) return [];

  // Filtrar apenas produtos válidos (excluir produtos de teste)
  const validPlans = plans.value.filter(
    (plan) =>
      plan.metadata?.plan_type &&
      plan.metadata?.plan_type !== "test" &&
      plan.name !== "Product Test"
  );

  // Filtrar planos baseado na periodicidade selecionada
  const filteredPlans = validPlans.filter((plan) => {
    if (plan.metadata?.plan_type === "lifetime") return true; // Sempre mostrar vitalício

    if (selectedBilling.value === "monthly") {
      return plan.metadata?.type === "monthly";
    } else {
      return plan.metadata?.type === "yearly";
    }
  });

  // Ordenar: vitalício primeiro, depois por tipo
  filteredPlans.sort((a, b) => {
    if (a.metadata?.plan_type === "lifetime") return -1;
    if (b.metadata?.plan_type === "lifetime") return 1;

    // Ordenar por tipo: clubes, pro
    const typeOrder = { clubes: 1, pro: 2 };
    const aOrder = typeOrder[a.metadata?.plan_type] || 3;
    const bOrder = typeOrder[b.metadata?.plan_type] || 3;

    return aOrder - bOrder;
  });

  return filteredPlans;
});

// Carregar planos da API
const loadPlans = async () => {
  try {
    loading.value = true;
    error.value = null;

    console.log("🔍 Carregando planos da API:", API_URL);

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Planos carregados:", data);

    if (data.success && data.data) {
      plans.value = data.data;
      console.log(`✅ ${data.data.length} planos carregados com sucesso`);
    } else {
      throw new Error("Resposta da API inválida");
    }
  } catch (err) {
    console.error("❌ Erro ao carregar planos:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Configurações do Stripe Checkout
const lineItems = computed(() => {
  console.log("🔍 lineItems computed - selectedPlan:", selectedPlan.value);

  if (!selectedPlan.value) {
    console.log("❌ lineItems: Nenhum plano selecionado");
    return [];
  }

  // Para o plano vitalício, usar modo 'payment', para outros 'subscription'
  const mode =
    selectedPlan.value.metadata?.plan_type === "lifetime"
      ? "payment"
      : "subscription";

  // Usar o ID do preço da API
  const priceId = selectedPlan.value.prices?.data?.[0]?.id;

  if (!priceId) {
    console.error(
      "❌ Price ID não encontrado para o plano:",
      selectedPlan.value
    );
    return [];
  }

  const items = [
    {
      price: priceId,
      quantity: 1,
    },
  ];

  console.log("✅ lineItems gerados:", items);
  return items;
});

const successURL = `${window.location.origin}/payment/success`;
const cancelURL = `${window.location.origin}/payment/cancel`;

// Funções auxiliares
const getPlanPrice = (plan) => {
  // Usar o preço real da API
  const priceData = plan.prices?.data?.[0];
  if (!priceData) {
    console.warn("⚠️ Preço não encontrado para o plano:", plan.name);
    return "0,00";
  }

  // unit_amount está em centavos, converter para reais
  const priceInReais = priceData.unit_amount / 100;
  return priceInReais.toFixed(2).replace(".", ",");
};

// Calcular desconto anual baseado nos preços reais
const getYearlyDiscount = (plan) => {
  if (plan.metadata?.type !== "yearly") return null;

  // Encontrar o plano mensal correspondente
  const monthlyPlan = plans.value.find(
    (p) =>
      p.metadata?.plan_type === plan.metadata?.plan_type &&
      p.metadata?.type === "monthly"
  );

  if (!monthlyPlan) return null;

  const monthlyPrice = monthlyPlan.prices?.data?.[0]?.unit_amount / 100;
  const yearlyPrice = plan.prices?.data?.[0]?.unit_amount / 100;

  if (!monthlyPrice || !yearlyPrice) return null;

  const yearlyTotal = monthlyPrice * 12;
  const savings = yearlyTotal - yearlyPrice;
  const discountPercentage = Math.round((savings / yearlyTotal) * 100);

  // Log para debug
  //console.log(`🔍 Desconto para ${plan.name}: ${monthlyPrice} × 12 = ${yearlyTotal}, Anual: ${yearlyPrice}, Economia: ${savings}, Desconto: ${discountPercentage}%`);

  return {
    savings: savings.toFixed(2).replace(".", ","),
    percentage: discountPercentage,
  };
};

// Calcular desconto geral para o toggle de periodicidade
const getGeneralYearlyDiscount = computed(() => {
  if (plans.value.length === 0) return 20; // Fallback padrão

  // Priorizar planos Clubes (que têm valores mais altos e desconto mais significativo)
  const clubesMonthly = plans.value.find(
    (p) => p.metadata?.plan_type === "clubes" && p.metadata?.type === "monthly"
  );
  const clubesYearly = plans.value.find(
    (p) => p.metadata?.plan_type === "clubes" && p.metadata?.type === "yearly"
  );

  if (clubesMonthly && clubesYearly) {
    const monthlyPrice = clubesMonthly.prices?.data?.[0]?.unit_amount / 100;
    const yearlyPrice = clubesYearly.prices?.data?.[0]?.unit_amount / 100;

    if (monthlyPrice && yearlyPrice) {
      const yearlyTotal = monthlyPrice * 12;
      const savings = yearlyTotal - yearlyPrice;
      const discountPercentage = Math.round((savings / yearlyTotal) * 100);
      console.log(
        `🔍 Desconto Clubes: ${monthlyPrice} × 12 = ${yearlyTotal}, Anual: ${yearlyPrice}, Economia: ${savings}, Desconto: ${discountPercentage}%`
      );
      return discountPercentage;
    }
  }

  // Fallback para planos Pro
  const proMonthly = plans.value.find(
    (p) => p.metadata?.plan_type === "pro" && p.metadata?.type === "monthly"
  );
  const proYearly = plans.value.find(
    (p) => p.metadata?.plan_type === "pro" && p.metadata?.type === "yearly"
  );

  if (proMonthly && proYearly) {
    const monthlyPrice = proMonthly.prices?.data?.[0]?.unit_amount / 100;
    const yearlyPrice = proYearly.prices?.data?.[0]?.unit_amount / 100;

    if (monthlyPrice && yearlyPrice) {
      const yearlyTotal = monthlyPrice * 12;
      const savings = yearlyTotal - yearlyPrice;
      const discountPercentage = Math.round((savings / yearlyTotal) * 100);
      console.log(
        `🔍 Desconto Pro: ${monthlyPrice} × 12 = ${yearlyTotal}, Anual: ${yearlyPrice}, Economia: ${savings}, Desconto: ${discountPercentage}%`
      );
      return discountPercentage;
    }
  }

  return 20; // Fallback padrão se não conseguir calcular
});

const getPlanPeriod = (plan) => {
  if (plan.metadata?.plan_type === "lifetime") {
    return "";
  }

  // Usar os dados de recorrência da API
  const priceData = plan.prices?.data?.[0];
  if (priceData?.recurring) {
    const interval = priceData.recurring.interval;
    const count = priceData.recurring.interval_count;

    if (interval === "month") {
      return count > 1 ? `/${count} meses` : "/mês";
    } else if (interval === "year") {
      return count > 1 ? `/${count} anos` : "/ano";
    }
  }

  // Fallback para o metadata
  return plan.metadata?.type === "monthly" ? "/mês" : "/ano";
};

const selectPlan = (plan) => {
  selectedPlan.value = plan;
  console.log("Plano selecionado:", plan);
};

const handleLoading = (isLoading) => {
  subscriptionLoading.value = isLoading;
  console.log("Stripe Checkout loading:", isLoading);
};

const subscribeToPlan = async () => {
  try {
    // Validações iniciais
    if (!selectedPlan.value) {
      alert("Por favor, selecione um plano primeiro");
      return;
    }

    if (!stripe.value) {
      console.error("❌ Stripe não inicializado");
      alert("Stripe não foi inicializado. Recarregue a página.");
      return;
    }

    // Verificar se o plano tem preço válido
    const priceId = selectedPlan.value.prices?.data?.[0]?.id;
    if (!priceId) {
      alert("Erro: Preço não encontrado para este plano. Tente novamente.");
      return;
    }

    // Logs para debug
    console.log("🔍 Debug - Plano selecionado:", selectedPlan.value);
    console.log("🔍 Debug - Stripe instance:", stripe.value);
    console.log("🔍 Debug - Line items:", lineItems.value);
    console.log("🔍 Debug - Success URL:", successURL);
    console.log("🔍 Debug - Cancel URL:", cancelURL);

    // Verificar se lineItems está correto
    if (!lineItems.value || lineItems.value.length === 0) {
      console.error("❌ Line items vazio ou inválido");
      alert(
        "Erro: Dados do plano inválidos. Tente selecionar o plano novamente."
      );
      return;
    }

    handleLoading(true);
    console.log(
      "🚀 Iniciando assinatura para o plano:",
      selectedPlan.value.name
    );

    // Determinar o modo baseado no tipo de plano
    const mode =
      selectedPlan.value.metadata?.plan_type === "lifetime"
        ? "payment"
        : "subscription";

    // Criar sessão de checkout
    const result = await stripe.value.redirectToCheckout({
      lineItems: lineItems.value,
      mode: mode,
      successUrl: successURL,
      cancelUrl: cancelURL,
    });

    console.log("🔍 Debug - Resultado do checkout:", result);

    if (result.error) {
      console.error("❌ Erro no checkout:", result.error);
      alert(`Erro no checkout: ${result.error.message}`);
    } else {
      console.log("✅ Checkout iniciado com sucesso");
    }
  } catch (error) {
    console.error("❌ Erro ao iniciar assinatura:", error);
    console.error("❌ Stack trace:", error.stack);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    // Mensagem mais específica baseada no tipo de erro
    if (error.message.includes("price")) {
      alert("Erro: ID do preço inválido. Verifique a configuração dos planos.");
    } else if (error.message.includes("stripe")) {
      alert(
        "Erro de conexão com Stripe. Verifique sua internet e tente novamente."
      );
    } else {
      alert(`Erro ao iniciar assinatura: ${error.message}`);
    }
  } finally {
    handleLoading(false);
  }
};

// Inicialização
onMounted(async () => {
  try {
    console.log("🚀 Iniciando carregamento da página...");

    // Carregar planos da API
    await loadPlans();

    // Verificar se a chave do Stripe está configurada
    if (!stripeKey || stripeKey === "undefined") {
      throw new Error("Chave do Stripe não configurada");
    }

    console.log(
      "🔑 Chave do Stripe encontrada:",
      stripeKey.substring(0, 20) + "..."
    );

    // Carregar Stripe.js se não estiver disponível
    if (!window.Stripe) {
      console.log("📥 Carregando Stripe.js do CDN...");
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log("✅ Stripe.js carregado com sucesso");
          resolve();
        };
        script.onerror = (error) => {
          console.error("❌ Erro ao carregar Stripe.js:", error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    } else {
      console.log("✅ Stripe.js já está disponível");
    }

    // Aguardar Stripe carregar
    console.log("⏳ Aguardando Stripe carregar...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Inicializar Stripe
    console.log("🔧 Inicializando instância do Stripe...");
    stripe.value = window.Stripe(stripeKey);
    console.log("✅ Stripe inicializado com sucesso:", stripe.value);

    // Testar se o Stripe está funcionando
    if (stripe.value && typeof stripe.value.redirectToCheckout === "function") {
      console.log("✅ Método redirectToCheckout disponível");
    } else {
      console.error("❌ Método redirectToCheckout não encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar Stripe:", error);
    console.error("❌ Stack trace:", error.stack);
    showDebug.value = true;
  }

  console.log("📄 Página de planos carregada");
});
</script>

<style scoped>
.subscription-plans-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: white;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 700;
}

p {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  font-size: 1.1rem;
}

/* Toggle de Faturamento */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toggle-label {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.toggle-buttons {
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px;
  position: relative;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  min-width: 120px;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

.discount-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f59e0b;
  color: white;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 700;
}

/* Loading State */
.loading-container {
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

/* Error Message */
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  margin: 40px 0;
  color: white;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.debug-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  margin: 20px 0;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: white;
}

.debug-info p {
  margin: 5px 0;
  text-align: left;
  color: rgba(255, 255, 255, 0.9);
}

.plans-container {
  margin-bottom: 40px;
}

/* Grid de 3 opções */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.plan-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 3px solid transparent;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.plan-card.selected {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 25px;
  flex-shrink: 0;
}

.plan-header h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
}

.plan-price .currency {
  font-size: 1.2rem;
  color: #667eea;
  font-weight: 600;
}

.plan-price .amount {
  font-size: 3rem;
  color: #667eea;
  font-weight: 700;
}

.plan-price .period {
  font-size: 1rem;
  color: #666;
}

.yearly-savings {
  margin-top: 10px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
}

.lifetime-savings {
  margin-top: 10px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
}

.plan-description {
  text-align: center;
  margin-bottom: 20px;
  color: #666 !important;
  font-size: 0.95rem;
  line-height: 1.4;
  flex-shrink: 0;
}

.plan-description p {
  color: #666 !important;
  margin: 0;
}

.plan-features {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  padding: 8px 0;
  color: #555;
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-icon {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.plan-popular {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.lifetime-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.lifetime-card {
  border: 3px solid #8b5cf6;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

.lifetime-card:hover {
  border-color: #7c3aed;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
}

.lifetime-card.selected {
  border-color: #7c3aed;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4);
}

.popular-plan {
  border: 3px solid #f59e0b;
}

.popular-plan:hover {
  border-color: #d97706;
  box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
}

.popular-plan.selected {
  border-color: #d97706;
  box-shadow: 0 20px 40px rgba(245, 158, 11, 0.4);
}

.subscription-actions {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.subscription-actions h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.5rem;
}

.plan-description {
  color: #666;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.plan-billing-info {
  color: #667eea;
  margin-bottom: 25px;
  font-weight: 600;
  font-size: 1rem;
}

.subscribe-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 18px 36px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  min-width: 300px;
}

.subscribe-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
}

.subscribe-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.subscription-result {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.subscription-result h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.subscription-result pre {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  color: #333;
  border: 1px solid #e9ecef;
}

/* Responsividade */
@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .billing-toggle {
    flex-direction: column;
    gap: 15px;
  }

  .toggle-buttons {
    width: 100%;
  }

  .toggle-btn {
    flex: 1;
    min-width: auto;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .plan-card {
    padding: 20px;
    min-height: auto;
  }

  .subscribe-button {
    min-width: 100%;
    padding: 16px 24px;
  }

  h1 {
    font-size: 2rem;
  }
}
</style>
