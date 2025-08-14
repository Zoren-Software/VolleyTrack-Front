<template>
  <div class="subscription-plans-page">
    <div class="container">
      <h1>Planos de Assinatura</h1>
      <p>Escolha o plano ideal para o seu clube de vôlei</p>

      <!-- Seletor de Periodicidade -->
      <div class="billing-toggle">
        <span class="toggle-label">Faturamento:</span>
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
            <span class="discount-badge">-20%</span>
          </button>
        </div>
      </div>

      <!-- Debug info -->
      <div v-if="showDebug" class="debug-info">
        <h4>Debug Info:</h4>
        <p><strong>Stripe Key:</strong> {{ stripeKey }}</p>
        <p><strong>Loading:</strong> {{ loading }}</p>
        <p>
          <strong>Selected Plan:</strong> {{ selectedPlan?.name || "Nenhum" }}
        </p>
        <p><strong>Billing:</strong> {{ selectedBilling }}</p>
      </div>

      <!-- Planos de Assinatura -->
      <div class="plans-container">
        <!-- Planos Periódicos (Mensais/Anuais) -->
        <div class="periodic-plans">
          <div
            v-for="plan in periodicPlans"
            :key="`${plan.id}-${plan.billing}`"
            class="plan-card"
            :class="{
              selected:
                selectedPlan?.id === plan.id &&
                selectedPlan?.billing === plan.billing,
            }"
            @click="selectPlan(plan)"
          >
            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="currency">R$</span>
                <span class="amount">{{ getPlanPrice(plan) }}</span>
                <span class="period">{{ getPlanPeriod(plan) }}</span>
              </div>
              <div
                v-if="plan.billing === 'yearly' && plan.discount"
                class="yearly-savings"
              >
                Economia de R$ {{ plan.discount }}/ano
              </div>
            </div>

            <div class="plan-features">
              <ul>
                <li v-for="feature in plan.features" :key="feature">
                  <span class="feature-icon">✓</span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div class="plan-popular" v-if="plan.popular">
              <span>Mais Popular</span>
            </div>
          </div>
        </div>

        <!-- Plano Vitalício Centralizado -->
        <div class="lifetime-plan-container">
          <div
            v-for="plan in lifetimePlans"
            :key="`${plan.id}-${plan.billing}`"
            class="plan-card lifetime-card"
            :class="{
              selected:
                selectedPlan?.id === plan.id &&
                selectedPlan?.billing === plan.billing,
            }"
            @click="selectPlan(plan)"
          >
            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="currency">R$</span>
                <span class="amount">{{ getPlanPrice(plan) }}</span>
                <span class="period">{{ getPlanPeriod(plan) }}</span>
              </div>
            </div>

            <div class="plan-features">
              <ul>
                <li v-for="feature in plan.features" :key="feature">
                  <span class="feature-icon">✓</span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div class="lifetime-badge">
              <span>Pagamento Único</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão de Assinatura -->
      <div v-if="selectedPlan" class="subscription-actions">
        <h3>Plano Selecionado: {{ selectedPlan.name }}</h3>
        <p class="plan-description">{{ selectedPlan.description }}</p>
        <p class="plan-billing-info">
          <strong>Faturamento:</strong>
          {{
            selectedPlan.billing === "lifetime"
              ? "Pagamento único"
              : `${selectedPlan.billing === "monthly" ? "Mensal" : "Anual"}`
          }}
        </p>

        <button
          @click="subscribeToPlan"
          :disabled="loading"
          class="subscribe-button"
        >
          {{
            loading
              ? "Processando..."
              : `Assinar ${selectedPlan.name} - ${getPlanPrice(
                  selectedPlan
                )}${getPlanPeriod(selectedPlan)}`
          }}
        </button>
      </div>

      <!-- Stripe Checkout será implementado via JavaScript -->

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
const selectedPlan = ref(null);
const selectedBilling = ref("monthly"); // 'monthly', 'yearly'
const subscriptionResult = ref(null);
const showDebug = ref(true); // Ativado para debug

// Instância do Stripe
const stripe = ref(null);

// Todos os planos disponíveis
const allPlans = ref([
  // Plano Básico
  {
    id: "basic",
    name: "Básico",
    billing: "monthly",
    priceId: "price_basic_monthly",
    price: 29.9,
    description: "Plano ideal para clubes iniciantes",
    features: [
      "Até 20 jogadores",
      "Gestão básica de treinos",
      "Relatórios simples",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    id: "basic",
    name: "Básico",
    billing: "yearly",
    priceId: "price_basic_yearly",
    price: 287.04, // 29.90 * 12 * 0.8 (20% desconto)
    discount: 71.76,
    description: "Plano ideal para clubes iniciantes",
    features: [
      "Até 20 jogadores",
      "Gestão básica de treinos",
      "Relatórios simples",
      "Suporte por email",
    ],
    popular: false,
  },

  // Plano Profissional
  {
    id: "pro",
    name: "Profissional",
    billing: "monthly",
    priceId: "price_pro_monthly",
    price: 59.9,
    description: "Para clubes em crescimento",
    features: [
      "Até 50 jogadores",
      "Gestão avançada de treinos",
      "Relatórios detalhados",
      "Scouting técnico",
      "Suporte prioritário",
      "Integração com calendário",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Profissional",
    billing: "yearly",
    priceId: "price_pro_yearly",
    price: 575.04, // 59.90 * 12 * 0.8 (20% desconto)
    discount: 143.76,
    description: "Para clubes em crescimento",
    features: [
      "Até 50 jogadores",
      "Gestão avançada de treinos",
      "Relatórios detalhados",
      "Scouting técnico",
      "Suporte prioritário",
      "Integração com calendário",
    ],
    popular: true,
  },

  // Plano Empresarial
  {
    id: "enterprise",
    name: "Empresarial",
    billing: "monthly",
    priceId: "price_enterprise_monthly",
    price: 99.9,
    description: "Para grandes clubes e federações",
    features: [
      "Jogadores ilimitados",
      "Todas as funcionalidades Pro",
      "API personalizada",
      "Suporte 24/7",
      "Treinamento da equipe",
      "Relatórios customizados",
    ],
    popular: false,
  },
  {
    id: "enterprise",
    name: "Empresarial",
    billing: "yearly",
    priceId: "price_enterprise_yearly",
    price: 959.04, // 99.90 * 12 * 0.8 (20% desconto)
    discount: 239.76,
    description: "Para grandes clubes e federações",
    features: [
      "Jogadores ilimitados",
      "Todas as funcionalidades Pro",
      "API personalizada",
      "Suporte 24/7",
      "Treinamento da equipe",
      "Relatórios customizados",
    ],
    popular: false,
  },

  // Plano Vitalício
  {
    id: "lifetime",
    name: "Vitalício",
    billing: "lifetime",
    priceId: "price_lifetime",
    price: 999.9,
    description: "Acesso vitalício com funcionalidades limitadas",
    features: [
      "Até 10 jogadores",
      "Gestão básica de treinos",
      "Relatórios simples",
      "Sem atualizações futuras",
      "Suporte por email (1 ano)",
      "Acesso vitalício",
    ],
    popular: false,
  },
]);

// Planos periódicos baseados na periodicidade selecionada
const periodicPlans = computed(() => {
  return allPlans.value.filter(
    (plan) => plan.billing === selectedBilling.value
  );
});

// Plano vitalício sempre disponível
const lifetimePlans = computed(() => {
  return allPlans.value.filter((plan) => plan.billing === "lifetime");
});

// Configurações do Stripe Checkout
const lineItems = computed(() => {
  console.log("🔍 lineItems computed - selectedPlan:", selectedPlan.value);

  if (!selectedPlan.value) {
    console.log("❌ lineItems: Nenhum plano selecionado");
    return [];
  }

  const items = [
    {
      price: selectedPlan.value.priceId,
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
  if (plan.billing === "lifetime") {
    return plan.price.toFixed(2).replace(".", ",");
  }
  return plan.price.toFixed(2).replace(".", ",");
};

const getPlanPeriod = (plan) => {
  if (plan.billing === "lifetime") {
    return "";
  }
  return plan.billing === "monthly" ? "/mês" : "/ano";
};

const selectPlan = (plan) => {
  selectedPlan.value = plan;
  console.log("Plano selecionado:", plan);
};

const handleLoading = (isLoading) => {
  loading.value = isLoading;
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

    // Criar sessão de checkout
    const result = await stripe.value.redirectToCheckout({
      lineItems: lineItems.value,
      mode: "subscription",
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

.periodic-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.lifetime-plan-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
}

.lifetime-plan-container .plan-card {
  width: 100%;
  max-width: 400px;
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

.plan-features {
  margin-bottom: 20px;
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
  width: 100%;
  min-width: 320px;
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

  .periodic-plans {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .lifetime-plan-container {
    margin-top: 30px;
  }

  .lifetime-card {
    width: 100%;
    min-width: auto;
  }

  .lifetime-plan-container .plan-card {
    max-width: 100%;
  }

  .plan-card {
    padding: 20px;
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
