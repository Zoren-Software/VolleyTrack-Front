<template>
  <div class="subscription-plans-page">
    <div class="container">
      <h1>Planos de Assinatura</h1>
      <p>Escolha o plano ideal para o seu clube de vôlei</p>

      <!-- Status do Plano Ativo -->
      <div class="active-plan-status">
        <ActivePlanChecker
          :auto-refresh="false"
          :tenant-id="getTenantId()"
          @plan-loaded="onActivePlanLoaded"
          @plan-error="onActivePlanError"
        />
      </div>

      <!-- Status da Validação do Email -->
      <div class="email-validation-status">
        <div v-if="emailValidation.loading" class="validation-loading">
          <div class="loading-spinner" />
          <p>Validando seu email...</p>
        </div>

        <div
          v-else-if="emailValidation.validated && emailValidation.valid"
          class="validation-success-discrete"
        >
          <div class="validation-icon-small">✅</div>
          <span>E-mail válido - Pronto para pagamento</span>
        </div>

        <div
          v-else-if="emailValidation.validated && !emailValidation.valid"
          class="validation-error"
        >
          <div class="validation-content">
            <div class="validation-header">
              <div class="validation-icon">❌</div>
              <h3>E-mail Não Encontrado</h3>
            </div>
            <p>
              Seu e-mail não está registrado como administrador. Entre em
              contato com o suporte para prosseguir com o pagamento.
            </p>
            <button class="retry-button" @click="validateCustomerEmailGraphQL">
              Tentar Novamente
            </button>
          </div>
        </div>

        <div v-else-if="emailValidation.error" class="validation-error">
          <div class="validation-icon">⚠️</div>
          <div class="validation-content">
            <h3>Erro na Validação</h3>
            <p>{{ emailValidation.error }}</p>
            <button class="retry-button" @click="validateCustomerEmailGraphQL">
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>

      <!-- Seletor de Periodicidade -->
      <div class="billing-toggle">
        <span class="toggle-label">Planos:</span>
        <div class="toggle-buttons">
          <button
            class="toggle-btn"
            :class="{ active: selectedBilling === 'monthly' }"
            @click="selectedBilling = 'monthly'"
          >
            Mensal
          </button>
          <button
            class="toggle-btn"
            :class="{ active: selectedBilling === 'yearly' }"
            @click="selectedBilling = 'yearly'"
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
        <div
          v-if="
            emailValidation.validated &&
            emailValidation.valid &&
            emailValidation.customerData
          "
        >
          <p><strong>Validação de E-mail:</strong></p>
          <p><strong>Status:</strong> ✅ E-mail validado com sucesso</p>
          <p>
            <strong>Customer ID:</strong> {{ emailValidation.customerData.id }}
          </p>
          <p>
            <strong>Nome do Customer:</strong>
            {{ emailValidation.customerData.name }}
          </p>
          <p>
            <strong>E-mail do Customer:</strong>
            {{ emailValidation.customerData.email }}
          </p>
          <p>
            <strong>Tenant ID:</strong>
            {{ emailValidation.customerData.tenant_id }}
          </p>
          <p>
            <strong>E-mail Verificado:</strong>
            {{
              emailValidation.customerData.email_verified_at || "Não verificado"
            }}
          </p>
          <p>
            <strong>Criado em:</strong>
            {{ emailValidation.customerData.created_at }}
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

            <!-- Badge de Plano Ativo -->
            <div v-if="isPlanActive(plan)" class="active-plan-badge">
              <span>Plano em Uso</span>
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
                'active-plan': isPlanActive(plan),
                disabled: isPlanActive(plan),
              }"
              :disabled="isPlanActive(plan)"
              @click.stop="selectPlan(plan)"
            >
              <span v-if="isPlanActive(plan)"> ✅ Plano em Uso </span>
              <span
                v-else-if="
                  selectedPlan?.id === plan.id &&
                  selectedPlan?.billing === plan.billing
                "
              >
                Selecionado
              </span>
              <span v-else> Selecionar Plano </span>
            </button>
          </div>
        </div>

        <!-- Botão de Assinatura -->
        <div v-if="selectedPlan" class="subscription-actions">
          <button
            :disabled="
              subscriptionLoading ||
              !emailValidation.validated ||
              !emailValidation.valid
            "
            :class="{
              'subscribe-button': true,
              disabled: !emailValidation.validated || !emailValidation.valid,
            }"
            @click="subscribeToPlan"
          >
            {{
              subscriptionLoading
                ? "Processando..."
                : !emailValidation.validated
                ? "Aguardando validação..."
                : !emailValidation.valid
                ? "E-mail não validado - Contate o suporte"
                : `Assinar ${selectedPlan.name} - R$ ${getPlanPrice(
                    selectedPlan
                  )}${getPlanPeriod(selectedPlan)}`
            }}
          </button>
        </div>
      </div>

      <!-- Loading do Stripe -->
      <div v-if="stripeLoading" class="stripe-loading">
        <div class="loading-spinner" />
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
import { ref, computed, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import {
  createCheckoutSession,
  redirectToCheckout,
  validateCheckoutData,
} from "~/services/stripeCheckoutService.js";
import ActivePlanChecker from "~/components/ActivePlanChecker.vue";

// Configurações do Stripe
const runtimeConfig = useRuntimeConfig();
const stripeKey = runtimeConfig.public.stripePublishableKey;

// Composable para usuário
const { user, getUserInfo, getUserEmail } = useUser();

// Função para obter tenant_id (salvo pelo middleware Apollo)
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

// Estados para validação de email do customer
const emailValidation = ref({
  loading: false,
  validated: false,
  valid: false,
  customerData: null,
  error: null,
});

// Estado do plano ativo
const activePlanData = ref(null);
const activePlanLoading = ref(true);

// API URL
const API_URL = "http://graphql.volleytrack.local/v1/products";
const CUSTOMER_VALIDATION_URL =
  "http://api.volleytrack.local/v1/customers/check-email";

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

// Configurações do Stripe Checkout (mantido para compatibilidade)
// const lineItems = computed(() => {
//   console.log("🔍 lineItems computed - selectedPlan:", selectedPlan.value);

//   if (!selectedPlan.value) {
//     console.log("❌ lineItems: Nenhum plano selecionado");
//     return [];
//   }

//   // Usar o ID do preço da API
//   const priceId = selectedPlan.value.prices?.data?.[0]?.id;

//   if (!priceId) {
//     console.error(
//       "❌ Price ID não encontrado para o plano:",
//       selectedPlan.value
//     );
//     return [];
//   }

//   const items = [
//     {
//       price: priceId,
//       quantity: 1,
//     },
//   ];

//   console.log("✅ lineItems gerados:", items);
//   return items;
// });

// Modo do checkout baseado no tipo de preço
const checkoutMode = computed(() => {
  if (!selectedPlan.value) return "subscription";

  // Verificar se o preço é recorrente ou único
  const priceData = selectedPlan.value.prices?.data?.[0];
  if (!priceData) {
    console.log(
      "⚠️ Price data não encontrado, usando subscription como padrão"
    );
    return "subscription";
  }

  // Se o preço tem recurring, deve ser subscription
  if (priceData.recurring) {
    return "subscription";
  }

  // Se o tipo é 'one_time', deve ser payment
  if (priceData.type === "one_time") {
    return "payment";
  }

  // Se não tem recurring e não é one_time, assumir subscription por padrão
  return "subscription";
});

// Validar email do customer (tentativa de API + fallback)
const validateCustomerEmailGraphQL = async () => {
  try {
    emailValidation.value.loading = true;
    emailValidation.value.error = null;

    const userEmail = getUserEmail();
    if (!userEmail) {
      throw new Error("Email do usuário não encontrado");
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error("❌ Formato de email inválido:", userEmail);
      throw new Error("Formato de email inválido");
    }

    // Tentar fazer chamada para API REST primeiro
    try {
      await validateCustomerEmailAPI(userEmail);
      return; // Se a API funcionou, sair da função
    } catch (apiError) {
      // API não disponível, usar validação local
    }

    // Fallback: validação local usando dados do GraphQL

    // Verificar se o usuário está logado e tem dados válidos
    if (!user.value || !user.value.id) {
      throw new Error("Usuário não está logado corretamente");
    }

    // Verificar se o usuário tem roles (administrador)
    if (!user.value.roles || user.value.roles.length === 0) {
      throw new Error("Usuário não possui permissões de administrador");
    }

    // Verificar se tem pelo menos um role válido
    const validRoles = ["admin", "administrator", "super_admin", "owner"];
    const hasValidRole = user.value.roles.some((role) =>
      validRoles.includes(role.name.toLowerCase())
    );

    if (!hasValidRole) {
      throw new Error(
        "Usuário não possui permissões de administrador necessárias"
      );
    }

    // Se chegou até aqui, o email é válido
    emailValidation.value.validated = true;
    emailValidation.value.valid = true;
    emailValidation.value.customerData = {
      id: user.value.id,
      name: user.value.name,
      email: user.value.email,
      tenant_id: getTenantId(),
      email_verified_at: user.value.emailVerifiedAt || new Date().toISOString(),
      created_at: user.value.createdAt || new Date().toISOString(),
    };

    console.log(
      "✅ Validação de email bem-sucedida (fallback local):",
      emailValidation.value
    );
  } catch (err) {
    console.error("❌ Erro na validação do email:", err);
    emailValidation.value.error = err.message;
    emailValidation.value.validated = true;
    emailValidation.value.valid = false;
  } finally {
    emailValidation.value.loading = false;
  }
};

// Função para tentar validar via API REST
const validateCustomerEmailAPI = async (userEmail) => {
  const token = localStorage.getItem("userToken");
  const apolloToken = localStorage.getItem("apollo:default.token");

  const authToken = token || apolloToken;

  if (!authToken) {
    throw new Error("Token de autenticação não encontrado");
  }

  // Rota correta para validação de email
  const correctRoute = "http://volleytrack.local/v1/customers/check-email";

  try {
    const requestBody = {
      email: userEmail,
      tenant_id: getTenantId(),
    };

    const response = await fetch(correctRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        emailValidation.value.validated = true;
        emailValidation.value.valid = data.exists;
        emailValidation.value.customerData = data.data;
        return; // Sucesso, sair da função
      } else {
        throw new Error(data.message || "Erro na validação do customer");
      }
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error("Token de autenticação inválido ou expirado");
    } else if (response.status === 403) {
      const errorData = await response.json();
      throw new Error(
        "Acesso negado - só é possível verificar o próprio email"
      );
    } else {
      const errorData = await response.json();
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || "Erro desconhecido"}`
      );
    }
  } catch (error) {
    throw error;
  }
};

// Validar email do customer usando GraphQL (função original)
const validateCustomerEmailGraphQLOriginal = async () => {
  try {
    emailValidation.value.loading = true;
    emailValidation.value.error = null;

    const userEmail = getUserEmail();
    if (!userEmail) {
      throw new Error("Email do usuário não encontrado");
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error("❌ Formato de email inválido:", userEmail);
      throw new Error("Formato de email inválido");
    }

    // Verificar se o usuário está logado e tem dados válidos
    if (!user.value || !user.value.id) {
      throw new Error("Usuário não está logado corretamente");
    }

    // Verificar se o usuário tem roles (administrador)
    if (!user.value.roles || user.value.roles.length === 0) {
      throw new Error("Usuário não possui permissões de administrador");
    }

    // Verificar se tem pelo menos um role válido
    const validRoles = ["admin", "administrator", "super_admin", "owner"];
    const hasValidRole = user.value.roles.some((role) =>
      validRoles.includes(role.name.toLowerCase())
    );

    if (!hasValidRole) {
      throw new Error(
        "Usuário não possui permissões de administrador necessárias"
      );
    }

    // Se chegou até aqui, o email é válido
    emailValidation.value.validated = true;
    emailValidation.value.valid = true;
    emailValidation.value.customerData = {
      id: user.value.id,
      name: user.value.name,
      email: user.value.email,
      tenant_id: getTenantId(),
      email_verified_at: user.value.emailVerifiedAt || new Date().toISOString(),
      created_at: user.value.createdAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ Erro na validação GraphQL do email:", err);
    emailValidation.value.error = err.message;
    emailValidation.value.validated = true;
    emailValidation.value.valid = false;
  } finally {
    emailValidation.value.loading = false;
  }
};

// Validar email do customer localmente (sem API)
const validateCustomerEmailLocal = async () => {
  try {
    emailValidation.value.loading = true;
    emailValidation.value.error = null;

    const userEmail = getUserEmail();
    if (!userEmail) {
      throw new Error("Email do usuário não encontrado");
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error("❌ Formato de email inválido:", userEmail);
      throw new Error("Formato de email inválido");
    }

    // Verificar se o usuário está logado e tem dados válidos
    if (!user.value || !user.value.id) {
      throw new Error("Usuário não está logado corretamente");
    }

    // Verificar se o usuário tem roles (administrador)
    if (!user.value.roles || user.value.roles.length === 0) {
      throw new Error("Usuário não possui permissões de administrador");
    }

    // Verificar se tem pelo menos um role válido
    const validRoles = ["admin", "administrator", "super_admin", "owner"];
    const hasValidRole = user.value.roles.some((role) =>
      validRoles.includes(role.name.toLowerCase())
    );

    if (!hasValidRole) {
      throw new Error(
        "Usuário não possui permissões de administrador necessárias"
      );
    }

    // Se chegou até aqui, o email é válido
    emailValidation.value.validated = true;
    emailValidation.value.valid = true;
    emailValidation.value.customerData = {
      id: user.value.id,
      name: user.value.name,
      email: user.value.email,
      tenant_id: getTenantId(),
      email_verified_at: user.value.emailVerifiedAt || new Date().toISOString(),
      created_at: user.value.createdAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error("❌ Erro na validação local do email:", err);
    emailValidation.value.error = err.message;
    emailValidation.value.validated = true;
    emailValidation.value.valid = false;
  } finally {
    emailValidation.value.loading = false;
  }
};

// Validar email do customer (função original - comentada)
const validateCustomerEmail = async () => {
  try {
    emailValidation.value.loading = true;
    emailValidation.value.error = null;

    const userEmail = getUserEmail();
    if (!userEmail) {
      throw new Error("Email do usuário não encontrado");
    }

    // Obter token de autenticação
    const token = localStorage.getItem("userToken");
    const apolloToken = localStorage.getItem("apollo:default.token");

    if (!token && !apolloToken) {
      throw new Error(
        "Token de autenticação não encontrado. Faça login novamente."
      );
    }

    // Usar o token disponível (priorizar userToken, depois apollo)
    const authToken = token || apolloToken;

    const response = await fetch(
      `${CUSTOMER_VALIDATION_URL}?email=${encodeURIComponent(userEmail)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`, // ✅ Adicionar token de autenticação
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      emailValidation.value.validated = true;
      emailValidation.value.valid = data.exists;
      emailValidation.value.customerData = data.data;
    } else {
      throw new Error(data.message || "Erro na validação do customer");
    }
  } catch (err) {
    console.error("❌ Erro ao validar email do customer:", err);
    emailValidation.value.error = err.message;
    emailValidation.value.validated = true;
    emailValidation.value.valid = false;
  } finally {
    emailValidation.value.loading = false;
  }
};

// Carregar planos da API
const loadPlans = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      plans.value = data.data;
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
  // Não permitir seleção se o plano já está ativo
  if (isPlanActive(plan)) {
    console.log("⚠️ Tentativa de selecionar plano já ativo:", plan.name);
    return;
  }
  selectedPlan.value = plan;
};

// Verificar se um plano está ativo
const isPlanActive = (plan) => {
  if (!activePlanData.value || !activePlanData.value.subscription) {
    return false;
  }

  const activePriceId = activePlanData.value.subscription.price_id;
  const planPriceId = plan.prices?.data?.[0]?.id;

  // Comparar por ID do preço
  if (activePriceId && planPriceId) {
    return activePriceId === planPriceId;
  }

  // Fallback: comparar por nome e tipo
  const activeProductName = activePlanData.value.product?.name?.toLowerCase();
  const planName = plan.name?.toLowerCase();

  if (activeProductName && planName) {
    // Verificar se é o mesmo tipo de plano
    const activePlanType = activePlanData.value.product?.name?.toLowerCase();
    const currentPlanType = plan.name?.toLowerCase();

    // Mapear tipos de planos
    const planTypeMapping = {
      "plano pro mensal": "pro",
      "plano clubes mensal": "clubes",
      "plano vitalício": "lifetime",
    };

    const activeType = planTypeMapping[activePlanType] || activePlanType;
    const currentType = planTypeMapping[currentPlanType] || currentPlanType;

    return activeType === currentType;
  }

  return false;
};

// Event handlers do ActivePlanChecker
const onActivePlanLoaded = (planData) => {
  console.log("📋 Plano ativo carregado:", planData);
  activePlanData.value = planData;
  activePlanLoading.value = false;

  if (planData) {
    console.log("✅ Cliente possui plano ativo:", planData.product?.name);
  } else {
    console.log("ℹ️ Cliente não possui plano ativo");
  }
};

const onActivePlanError = (error) => {
  console.error("❌ Erro ao carregar plano ativo:", error);
  activePlanLoading.value = false;
  // Não bloquear a interface por erro de carregamento do plano ativo
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

    // Verificar se a validação do email foi realizada e se é válida
    if (!emailValidation.value.validated) {
      alert("Aguarde a validação do seu email para continuar.");
      return;
    }

    if (!emailValidation.value.valid) {
      alert(
        "Seu e-mail não está registrado como administrador. Entre em contato com o suporte para prosseguir com o pagamento."
      );
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

    subscriptionLoading.value = true;
    stripeLoading.value = true;

    // Verificar compatibilidade do modo com o preço
    const priceData = selectedPlan.value.prices?.data?.[0];
    const isRecurring = priceData?.recurring;
    const priceType = priceData?.type;
    const mode = checkoutMode.value;

    // Validação mais robusta
    if (isRecurring && mode === "payment") {
      throw new Error(
        "Modo de pagamento incompatível com o tipo de preço. O plano selecionado é recorrente (assinatura) mas está sendo processado como pagamento único."
      );
    }

    if (priceType === "one_time" && mode === "subscription") {
      throw new Error(
        "Modo de pagamento incompatível com o tipo de preço. O plano selecionado é único (vitalício) mas está sendo processado como assinatura."
      );
    }

    // Validação adicional para casos edge
    if (!isRecurring && priceType !== "one_time" && mode === "subscription") {
      console.warn(
        "⚠️ Aviso: Preço sem recurring nem one_time, mas usando subscription"
      );
    }

    // Obter email do usuário logado
    const userEmail = getUserEmail();

    if (!userEmail) {
      throw new Error("Email do usuário não encontrado. Faça login novamente.");
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      throw new Error("Email do usuário inválido. Faça login novamente.");
    }

    // Preparar dados para o checkout
    const checkoutData = {
      price_id: priceId,
      customer_email: userEmail, // Usar email do usuário logado
      success_url: successURL,
      cancel_url: cancelURL,
      mode: mode,
      quantity: 1, // Quantidade padrão
    };

    // Validar dados antes de enviar
    const validation = validateCheckoutData(checkoutData);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
    }

    // Criar sessão de checkout no backend
    const sessionResult = await createCheckoutSession(checkoutData);

    if (!sessionResult.success) {
      throw new Error(
        sessionResult.error || "Erro ao criar sessão de checkout"
      );
    }

    console.log("✅ Sessão criada:", sessionResult.data);
    console.log(
      "🔍 Session ID para redirecionamento:",
      sessionResult.sessionId
    );
    console.log(
      "🔍 Email na resposta da sessão:",
      sessionResult.data?.customer_email
    );

    // Verificar se sessionId existe antes de redirecionar
    if (!sessionResult.sessionId) {
      throw new Error("Session ID não encontrado na resposta da API");
    }

    // Redirecionar para o checkout do Stripe
    const redirectResult = await redirectToCheckout(
      stripe.value,
      sessionResult.sessionId
    );

    if (!redirectResult.success) {
      throw new Error(
        redirectResult.error || "Erro ao redirecionar para checkout"
      );
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
    } else if (
      error.message.includes(
        "You must provide one of lineItems, items, or sessionId"
      )
    ) {
      alert(
        "❌ ERRO: Session ID não encontrado na resposta da API.\n\n" +
          "Verifique os logs do console para mais detalhes.\n" +
          "Possível problema na estrutura da resposta do backend."
      );
    } else if (error.message.includes("Session ID não encontrado")) {
      alert(
        "❌ ERRO: Session ID não encontrado na resposta da API.\n\n" +
          "Verifique se o backend está retornando o session_id corretamente."
      );
    } else if (
      error.message.includes("recurring price") ||
      error.message.includes("payment mode but passed a recurring price")
    ) {
      alert(
        "❌ ERRO: Modo de pagamento incompatível com o tipo de preço.\n\n" +
          "O plano selecionado é recorrente (assinatura) mas está sendo processado como pagamento único.\n" +
          "Tente novamente ou entre em contato com o suporte."
      );
    } else if (error.message.includes("price")) {
      alert("Erro: ID do preço inválido. Verifique a configuração dos planos.");
    } else if (error.message.includes("stripe")) {
      alert(
        "Erro de conexão com Stripe. Verifique sua internet e tente novamente."
      );
    } else if (error.message.includes("Dados inválidos")) {
      alert(`Erro de validação: ${error.message}`);
    } else if (error.message.includes("Erro ao criar sessão")) {
      alert(`Erro no servidor: ${error.message}`);
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

    // Validar email do customer (usando GraphQL)
    await validateCustomerEmailGraphQL();

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

/* Status do Plano Ativo */
.active-plan-status {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.active-plan-status .active-plan-checker {
  max-width: 800px;
  width: 100%;
}

.active-plan-status .active-plan-checker .active-plan {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid #10b981;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2);
}

.active-plan-status .active-plan-checker .no-plan {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.active-plan-status .active-plan-checker .error {
  background: rgba(254, 242, 242, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #fecaca;
}

.active-plan-status .active-plan-checker .loading {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Status da Validação do Email */
.email-validation-status {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.validation-loading,
.validation-success,
.validation-error {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: left;
  max-width: 600px;
  width: 100%;
}

.validation-loading {
  justify-content: center;
  text-align: center;
  flex-direction: column;
}

.validation-success {
  flex-direction: column;
  text-align: center;
}

.validation-error {
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.validation-loading .loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.validation-success {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.1);
}

.validation-success-discrete {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto 20px;
  max-width: 400px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.validation-icon-small {
  font-size: 1.2rem;
}

.validation-error {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.validation-icon {
  font-size: 2rem;
  flex-shrink: 0;
  text-align: center;
}

.validation-content {
  flex: 1;
  text-align: center;
}

.validation-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.validation-header .validation-icon {
  font-size: 2.5rem;
  margin: 0;
}

.validation-header h3 {
  margin: 0;
}

.validation-content h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

.validation-content p {
  margin: 0 0 10px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.4;
}

.customer-info {
  margin: 15px auto 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  max-width: 400px;
}

.customer-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin: 10px auto 0;
  transition: all 0.3s ease;
  display: block;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
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

.active-plan-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  z-index: 10;
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

.subscribe-button:disabled,
.subscribe-button.disabled {
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

.plan-button.active-plan {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  cursor: default;
}

.plan-button.active-plan:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.plan-button.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

.plan-button.disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
