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
        <div v-if="user">
          <p><strong>Usuário Logado:</strong></p>
          <p><strong>ID:</strong> {{ user.id }}</p>
          <p><strong>Nome:</strong> {{ user.name }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p>
            <strong>Roles:</strong>
            {{ user.roles?.map((r) => r.name).join(", ") || "Nenhum" }}
          </p>
          <p>
            <strong>Email para Stripe:</strong>
            {{ getUserEmail() || "Não disponível" }}
          </p>
        </div>
        <div v-else>
          <p><strong>Usuário:</strong> Não logado</p>
        </div>
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

              <!-- Desconto anual -->
              <div v-if="getYearlyDiscount(plan)" class="yearly-savings">
                Economia de {{ getYearlyDiscount(plan) }}%
              </div>

              <!-- Economia vitalícia -->
              <div
                v-if="plan.metadata?.plan_type === 'lifetime'"
                class="lifetime-savings"
              >
                Economia de {{ getLifetimeSavings(plan) }}%
              </div>
            </div>

            <div class="plan-description">
              <p>{{ plan.description || "Descrição não disponível" }}</p>
            </div>

            <div class="plan-features">
              <ul>
                <li v-for="feature in getPlanFeatures(plan)" :key="feature">
                  <span class="feature-icon">✓</span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <button
              class="plan-button"
              :class="{
                selected:
                  selectedPlan?.id === plan.id &&
                  selectedPlan?.billing === plan.billing,
              }"
              @click.stop="selectPlan(plan)"
            >
              {{
                selectedPlan?.id === plan.id &&
                selectedPlan?.billing === plan.billing
                  ? "Selecionado"
                  : "Selecionar Plano"
              }}
            </button>
          </div>
        </div>

        <!-- Botão de Assinatura -->
        <div v-if="selectedPlan" class="subscription-actions">
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
      </div>

      <!-- Loading do Stripe -->
      <div v-if="stripeLoading" class="stripe-loading">
        <div class="loading-spinner"></div>
        <p>Redirecionando para o Stripe...</p>
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
import { ref, computed, onMounted, nextTick } from "vue";
import { loadStripe } from "@stripe/stripe-js";

// Configurações do Stripe
const runtimeConfig = useRuntimeConfig();
const stripeKey = runtimeConfig.public.stripePublishableKey;

// Composable para usuário
const { user, getUserInfo, getUserEmail } = useUser();

// Estado da aplicação
const loading = ref(false);
const subscriptionLoading = ref(false);
const stripeLoading = ref(false);
const selectedPlan = ref(null);
const selectedBilling = ref("monthly"); // 'monthly', 'yearly'
const subscriptionResult = ref(null);
const showDebug = ref(false); // Ativado para debug
const plans = ref([]);
const error = ref(null);
const stripe = ref(null);

// API URL
const API_URL = "http://graphql.volleytrack.local/v1/products";

// URLs de redirecionamento
const successURL = `${window.location.origin}/payment/success`;
const cancelURL = `${window.location.origin}/payment/cancel`;

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

// Configurações do Stripe Checkout
const lineItems = computed(() => {
  console.log("🔍 lineItems computed - selectedPlan:", selectedPlan.value);

  if (!selectedPlan.value) {
    console.log("❌ lineItems: Nenhum plano selecionado");
    return [];
  }

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

// Modo do checkout baseado no tipo de plano
const checkoutMode = computed(() => {
  if (!selectedPlan.value) return "subscription";

  return selectedPlan.value.metadata?.plan_type === "lifetime"
    ? "payment"
    : "subscription";
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

  if (!monthlyPlan || !monthlyPlan.prices?.data?.[0]) return null;

  const monthlyPrice = monthlyPlan.prices.data[0].unit_amount;
  const yearlyPrice = plan.prices.data[0].unit_amount;
  const yearlyTotal = monthlyPrice * 12;

  if (yearlyTotal <= yearlyPrice) return null;

  const savings = ((yearlyTotal - yearlyPrice) / yearlyTotal) * 100;
  return Math.round(savings);
};

// Calcular economia do plano vitalício
const getLifetimeSavings = (plan) => {
  if (plan.metadata?.plan_type !== "lifetime") return null;

  // Encontrar o plano pro anual correspondente
  const proYearlyPlan = plans.value.find(
    (p) => p.metadata?.plan_type === "pro" && p.metadata?.type === "yearly"
  );

  if (!proYearlyPlan || !proYearlyPlan.prices?.data?.[0]) return null;

  const proYearlyPrice = proYearlyPlan.prices.data[0].unit_amount;
  const lifetimePrice = plan.prices.data[0].unit_amount;

  // Assumir que o usuário usaria o plano por 3 anos
  const threeYearTotal = proYearlyPrice * 3;

  if (threeYearTotal <= lifetimePrice) return null;

  const savings = ((threeYearTotal - lifetimePrice) / threeYearTotal) * 100;
  return Math.round(savings);
};

// Obter período do plano
const getPlanPeriod = (plan) => {
  if (plan.metadata?.plan_type === "lifetime") return "";

  const priceData = plan.prices?.data?.[0];
  if (!priceData?.recurring) return "";

  const interval = priceData.recurring.interval;
  const count = priceData.recurring.interval_count;

  if (interval === "month") {
    return count === 1 ? "/mês" : `/ ${count} meses`;
  } else if (interval === "year") {
    return count === 1 ? "/ano" : `/ ${count} anos`;
  }

  return "";
};

// Obter recursos do plano
const getPlanFeatures = (plan) => {
  const baseFeatures = [
    "Gestão completa de jogadores",
    "Controle de presença",
    "Relatórios e estatísticas",
    "Suporte por email",
  ];

  if (plan.metadata?.plan_type === "pro") {
    return [
      ...baseFeatures,
      "Avaliações técnicas",
      "Scouting avançado",
      "Integração com APIs",
      "Suporte prioritário",
    ];
  } else if (plan.metadata?.plan_type === "lifetime") {
    return [
      ...baseFeatures,
      "Acesso vitalício",
      "Todas as funcionalidades",
      "Atualizações gratuitas",
      "Suporte premium",
    ];
  }

  return baseFeatures;
};

// Calcular desconto geral anual
const getGeneralYearlyDiscount = computed(() => {
  const yearlyPlans = plans.value.filter(
    (plan) => plan.metadata?.type === "yearly"
  );

  if (yearlyPlans.length === 0) return 0;

  let totalDiscount = 0;
  let validPlans = 0;

  yearlyPlans.forEach((plan) => {
    const discount = getYearlyDiscount(plan);
    if (discount !== null) {
      totalDiscount += discount;
      validPlans++;
    }
  });

  return validPlans > 0 ? Math.round(totalDiscount / validPlans) : 0;
});

// Selecionar plano
const selectPlan = (plan) => {
  selectedPlan.value = plan;
  console.log("✅ Plano selecionado:", plan);
};

// Inicializar Stripe
const initializeStripe = async () => {
  try {
    if (!stripeKey) {
      throw new Error("Chave do Stripe não configurada");
    }

    console.log(
      "🔑 Inicializando Stripe com chave:",
      stripeKey.substring(0, 20) + "..."
    );
    stripe.value = await loadStripe(stripeKey);

    if (!stripe.value) {
      throw new Error("Falha ao inicializar Stripe");
    }

    console.log("✅ Stripe inicializado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao inicializar Stripe:", error);
    throw error;
  }
};

// Assinar plano
const subscribeToPlan = async () => {
  try {
    if (!selectedPlan.value) {
      alert("Por favor, selecione um plano primeiro.");
      return;
    }

    if (!stripe.value) {
      await initializeStripe();
    }

    // Verificar se o plano tem preço válido
    const priceId = selectedPlan.value.prices?.data?.[0]?.id;
    if (!priceId) {
      alert("Erro: Preço não encontrado para este plano. Tente novamente.");
      return;
    }

    // Logs para debug detalhado
    console.log("🔍 === DEBUG DETALHADO ===");
    console.log("🔍 Plano selecionado:", selectedPlan.value);
    console.log("🔍 Price ID:", priceId);
    console.log("🔍 Checkout mode:", checkoutMode.value);
    console.log("🔍 Stripe Key:", stripeKey);
    console.log("🔍 Success URL:", successURL);
    console.log("🔍 Cancel URL:", cancelURL);
    console.log("🔍 Usuário:", user.value);
    console.log("🔍 =========================");

    subscriptionLoading.value = true;
    stripeLoading.value = true;

    console.log(
      "🚀 Iniciando assinatura para o plano:",
      selectedPlan.value.name
    );

    // Configurar opções do checkout
    const checkoutOptions = {
      mode: checkoutMode.value,
      lineItems: lineItems.value,
      successUrl: successURL,
      cancelUrl: cancelURL,
      customerEmail: getUserEmail() || "customer@example.com", // Usar email do usuário logado
    };

    console.log("🔧 Opções do checkout:", checkoutOptions);

    // Redirecionar para o checkout
    const { error: checkoutError } = await stripe.value.redirectToCheckout(
      checkoutOptions
    );

    if (checkoutError) {
      throw checkoutError;
    }

    console.log("✅ Redirecionamento para checkout iniciado");
  } catch (error) {
    console.error("❌ Erro ao iniciar assinatura:", error);
    console.error("❌ Stack trace:", error.stack);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    // Mensagem mais específica baseada no tipo de erro
    if (error.message.includes("client-only integration")) {
      alert(
        "❌ ERRO CRÍTICO: A integração client-only do Stripe não está habilitada!\n\n" +
          "1. Acesse: https://dashboard.stripe.com/account/checkout/settings\n" +
          "2. Na seção 'Client-only integration', clique em 'Enable'\n" +
          "3. Salve as configurações\n" +
          "4. Tente novamente"
      );
    } else if (error.message.includes("price")) {
      alert("Erro: ID do preço inválido. Verifique a configuração dos planos.");
    } else if (error.message.includes("stripe")) {
      alert(
        "Erro de conexão com Stripe. Verifique sua internet e tente novamente."
      );
    } else {
      alert(`Erro ao iniciar assinatura: ${error.message}`);
    }

    subscriptionLoading.value = false;
    stripeLoading.value = false;
  }
};

// Inicialização
onMounted(async () => {
  try {
    console.log("🚀 Iniciando carregamento da página...");

    // Carregar informações do usuário logado
    await getUserInfo();
    console.log("🔍 Info do usuário:", user.value);

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

    // Inicializar Stripe
    await initializeStripe();

    console.log("✅ Página carregada com sucesso!");
  } catch (error) {
    console.error("❌ Erro na inicialização:", error);
    alert(`Erro na inicialização: ${error.message}`);
  }
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

.plan-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  width: 100%;
  margin-top: auto;
}

.plan-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.plan-button.selected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.stripe-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.stripe-loading .loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.stripe-loading p {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
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
