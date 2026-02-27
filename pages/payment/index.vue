<template>
  <div class="subscription-plans-page">
    <!-- Bloqueia a tela até o check-email terminar; sem cache, sempre chama a API -->
    <div v-if="!emailValidationReady" class="page-loading-email-validation">
      <div class="loading-spinner"></div>
      <p>Validando e-mail...</p>
    </div>
    <div v-else class="container">
      <!-- Mensagem de Sucesso Discreta (Canto Inferior Esquerdo) -->
      <div
        v-if="emailValidation.validated && emailValidation.valid"
        class="validation-success-discrete-fixed"
      >
        <div class="validation-icon-small">✅</div>
        <span>E-mail válido - Pronto para pagamento</span>
      </div>

      <!-- Mensagem de Erro Discreta (Canto Inferior Esquerdo): só exibir após o plano ativo ter carregado, para evitar mostrar "inválido" quando o usuário acabou de logar e os dados ainda não carregaram -->
      <div
        v-if="
          emailValidation.validated &&
          !emailValidation.valid &&
          !activePlanLoading
        "
        class="validation-error-discrete-fixed"
      >
        <div class="validation-icon-small">❌</div>
        <span
          >Seu usuário é inválido para trocar o plano, entre em contato com o
          suporte se for necessário rever isso</span
        >
      </div>

      <!-- Header + botões na mesma linha (etapa 1) para alinhamento -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="!showPlansSelection"
          key="header-current"
          class="header-with-actions"
        >
          <div class="page-header-modern page-header-left">
            <h1 class="main-title">Seu Plano Atual</h1>
            <p class="main-subtitle">
              Gerencie sua assinatura e método de pagamento
            </p>
          </div>
          <div class="billing-button-top">
            <NuxtLink to="/billing" class="billing-link-modern">
              <span class="billing-icon">📄</span>
              <span>Ver Faturamentos</span>
            </NuxtLink>
            <button
              v-if="emailValidation.validated && emailValidation.valid"
              type="button"
              class="billing-edit-button"
              :disabled="billingEditLoading"
              @click="openBillingEdit"
            >
              <span class="billing-icon">✏️</span>
              <span>{{
                billingEditLoading
                  ? "Carregando..."
                  : "Editar dados de faturamento"
              }}</span>
            </button>
          </div>
        </div>
        <div v-else key="header-plans" class="page-header-modern">
          <h1 class="main-title">Escolha o plano ideal para sua equipe</h1>
          <p class="main-subtitle">
            Compare os recursos e selecione o plano que melhor atende às suas
            necessidades
          </p>
        </div>
      </Transition>

      <!-- Botão Voltar (apenas na etapa 2) -->
      <Transition name="fade">
        <div v-if="showPlansSelection" class="back-button-top">
          <button @click="showPlansSelection = false" class="back-link-modern">
            <span class="back-icon">←</span>
            <span>Voltar para meu plano</span>
          </button>
        </div>
      </Transition>

      <!-- Status do Plano Ativo e Método de Pagamento (Etapa 1) -->
      <Transition name="slide-fade">
        <div v-if="!showPlansSelection" class="active-plan-container">
          <!-- Plano Ativo -->
          <div class="active-plan-section">
            <ActivePlanChecker
              :auto-refresh="false"
              :tenant-id="getTenantId()"
              :show-upgrade-animations="showUpgradeAnimations"
              @plan-loaded="onActivePlanLoaded"
              @plan-error="onActivePlanError"
              @upgrade-clicked="onUpgradeClicked"
            />
          </div>

          <!-- Método de Pagamento (apenas se tiver plano ativo) -->
          <template v-if="activePlanData && !activePlanData.isTrial">
            <div class="payment-method-section">
              <PaymentMethodCard :customer-id="activePlanData.customer_id" />
            </div>
          </template>
        </div>
      </Transition>

      <!-- Seletor de Periodicidade (apenas na etapa 2) -->
      <Transition name="slide-fade">
        <div v-if="showPlansSelection" class="billing-toggle">
          <span class="toggle-label">Planos:</span>
          <div class="toggle-buttons">
            <button
              class="toggle-btn"
              :class="{
                active: selectedBilling === 'monthly',
              }"
              @click="selectedBilling = 'monthly'"
            >
              Mensal
            </button>
            <button
              class="toggle-btn"
              :class="{
                active: selectedBilling === 'yearly',
              }"
              @click="selectedBilling = 'yearly'"
            >
              Anual
              <span class="discount-badge"
                >-{{ getGeneralYearlyDiscount }}%</span
              >
            </button>
          </div>
        </div>
      </Transition>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando planos...</p>
      </div>

      <div v-if="refreshingPlans && plans.length" class="refreshing-indicator">
        <div class="mini-spinner"></div>
        <span>Atualizando planos com as últimas ofertas...</span>
      </div>

      <div v-if="error" class="error-feedback">
        <p>{{ error }}</p>
        <button class="retry-button" @click="loadPlans({ forceRefresh: true })">
          Tentar novamente
        </button>
      </div>

      <div v-if="!loading && !plans.length && !error" class="empty-plans-state">
        <p>Nenhum plano disponível no momento.</p>
        <div class="empty-actions">
          <button
            class="retry-button"
            @click="
              clearPlansCache();
              loadPlans({ forceRefresh: true });
            "
          >
            Tentar atualizar novamente
          </button>
        </div>
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

      <!-- Planos de Assinatura (apenas na etapa 2) -->
      <Transition name="slide-fade">
        <div
          v-if="showPlansSelection && !loading && plans.length > 0"
          class="plans-container-modern"
        >
          <!-- Grid Horizontal de Planos -->
          <div class="plans-grid-modern">
            <div
              v-for="plan in displayedPlans"
              :key="`${plan.id}-${plan.billing}`"
              class="plan-card-modern"
              :class="{
                selected:
                  selectedPlan?.id === plan.id &&
                  selectedPlan?.billing === plan.billing,
                'plan-trial': plan.metadata?.plan_type === 'trial',
                'plan-pro': plan.metadata?.plan_type === 'pro',
                'plan-clubers': plan.metadata?.plan_type === 'clubes',
                'plan-lifetime': plan.metadata?.plan_type === 'lifetime',
                'plan-active': isPlanActive(plan),
                'plan-disabled': isPlanDisabled(plan),
              }"
              @click="!isPlanActive(plan) && selectPlan(plan)"
            >
              <!-- Badges -->
              <div class="plan-badges-container">
                <!-- Badge Plano Ativo (esquerda) -->
                <div v-if="isPlanActive(plan)" class="plan-badge-left">
                  <span class="badge badge-active"> Plano Ativo </span>
                </div>

                <!-- Badges do tipo de plano (direita) -->
                <div class="plan-badge-top">
                  <span
                    v-if="plan.metadata?.plan_type === 'trial'"
                    class="badge badge-trial"
                  >
                    15 dias grátis
                  </span>
                  <span
                    v-else-if="plan.metadata?.plan_type === 'pro'"
                    class="badge badge-pro"
                  >
                    Recomendado
                  </span>
                  <span
                    v-else-if="plan.metadata?.plan_type === 'clubes'"
                    class="badge badge-clubers"
                  >
                    Equipes Grandes
                  </span>
                  <span
                    v-else-if="plan.metadata?.plan_type === 'lifetime'"
                    class="badge badge-lifetime"
                  >
                    Oferta Vitalícia
                  </span>
                </div>
              </div>

              <!-- Ícone do Plano -->
              <div class="plan-icon">
                <va-icon
                  v-if="plan.metadata?.plan_type === 'trial'"
                  name="card_giftcard"
                  size="48px"
                  :color="getPlanColor(plan)"
                />
                <va-icon
                  v-else-if="plan.metadata?.plan_type === 'pro'"
                  name="star"
                  size="48px"
                  :color="getPlanColor(plan)"
                />
                <va-icon
                  v-else-if="plan.metadata?.plan_type === 'clubes'"
                  name="emoji_events"
                  size="48px"
                  :color="getPlanColor(plan)"
                />
                <va-icon
                  v-else-if="plan.metadata?.plan_type === 'lifetime'"
                  name="all_inclusive"
                  size="48px"
                  :color="getPlanColor(plan)"
                />
                <va-icon
                  v-else
                  name="workspace_premium"
                  size="48px"
                  :color="getPlanColor(plan)"
                />
              </div>

              <!-- Nome do Plano -->
              <h3 class="plan-name">{{ plan.name }}</h3>

              <!-- Descrição do Plano (se disponível) -->
              <div v-if="getPlanDescription(plan)" class="plan-description">
                {{ getPlanDescription(plan) }}
              </div>

              <!-- Preço -->
              <div class="plan-price-modern">
                <span class="price-amount">R$ {{ getPlanPrice(plan) }}</span>
                <span v-if="getPlanPeriod(plan)" class="price-period">{{
                  getPlanPeriod(plan)
                }}</span>
                <span
                  v-if="plan.metadata?.plan_type === 'lifetime'"
                  class="price-lifetime"
                >
                  Pagamento único
                </span>
                <!-- Mostrar opção anual apenas para planos mensais -->
                <span
                  v-else-if="
                    plan.metadata?.type === 'monthly' && getYearlyDiscount(plan)
                  "
                  class="price-yearly"
                >
                  ou R$ {{ getYearlyPrice(plan) }}/ano
                </span>
              </div>

              <!-- Duração (para trial) -->
              <div
                v-if="plan.metadata?.plan_type === 'trial'"
                class="plan-duration"
              >
                Duração: 15 dias
              </div>

              <!-- Features -->
              <div class="plan-features-modern">
                <div
                  v-for="feature in getMainPlanFeatures(plan)"
                  :key="feature"
                  class="feature-item"
                >
                  <va-icon
                    name="check_circle"
                    size="20px"
                    :color="getPlanColor(plan)"
                  />
                  <span>{{ feature }}</span>
                </div>
              </div>

              <!-- Notas Especiais -->
              <div v-if="getPlanSpecialNotes(plan)" class="plan-special-notes">
                <div
                  v-for="note in getPlanSpecialNotes(plan)"
                  :key="note.text"
                  class="special-note"
                >
                  <va-icon
                    :name="note.icon"
                    size="16px"
                    :color="getPlanColor(plan)"
                  />
                  <span>{{ note.text }}</span>
                </div>
              </div>

              <!-- Disponibilidade do Plano Vitalício -->
              <div
                v-if="
                  plan.metadata?.plan_type === 'lifetime' && lifetimeCounter
                "
                class="lifetime-availability-modern"
              >
                <div class="availability-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{
                        width: `${
                          (lifetimeCounter.remaining / lifetimeCounter.limit) *
                          100
                        }%`,
                      }"
                    ></div>
                  </div>
                  <span class="progress-text">
                    {{ lifetimeCounter.remaining }}/{{ lifetimeCounter.limit }}
                  </span>
                </div>
                <div class="availability-note">
                  <va-icon name="schedule" size="14px" color="#6b7280" />
                  <span>Só para as primeiras {{ lifetimeCounter.limit }}</span>
                </div>
              </div>

              <!-- Botão de Ação -->
              <button
                class="plan-button-modern"
                :class="{
                  'button-trial': plan.metadata?.plan_type === 'trial',
                  'button-pro': plan.metadata?.plan_type === 'pro',
                  'button-clubers': plan.metadata?.plan_type === 'clubes',
                  'button-lifetime': plan.metadata?.plan_type === 'lifetime',
                  'button-active': isPlanActive(plan),
                  disabled: isPlanDisabled(plan),
                }"
                :disabled="isPlanDisabled(plan)"
                @click.stop="handlePlanClick(plan)"
              >
                <va-icon
                  v-if="isPlanActive(plan)"
                  name="check_circle"
                  size="18px"
                />
                <va-icon
                  v-else-if="plan.metadata?.plan_type === 'pro'"
                  name="bolt"
                  size="18px"
                />
                <va-icon
                  v-else-if="plan.metadata?.plan_type === 'clubes'"
                  name="groups"
                  size="18px"
                />
                <va-icon
                  v-else-if="plan.metadata?.plan_type === 'lifetime'"
                  name="diamond"
                  size="18px"
                />
                <span v-if="isPlanActive(plan)">Plano Ativo</span>
                <span v-else-if="plan.metadata?.plan_type === 'pro'"
                  >Escolher Pro</span
                >
                <span v-else-if="plan.metadata?.plan_type === 'clubes'"
                  >Escolher Clubers</span
                >
                <span v-else-if="plan.metadata?.plan_type === 'lifetime'"
                  >Escolher Vitalícia</span
                >
                <span v-else>Escolher Plano</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botão de Assinatura/Troca -->
      <Transition name="slide-fade">
        <div
          v-if="showPlansSelection && selectedPlan"
          class="subscription-actions"
        >
          <button
            :disabled="
              subscriptionLoading ||
              !emailValidation.validated ||
              !emailValidation.valid ||
              isPlanActive(selectedPlan) ||
              (selectedPlan?.metadata?.plan_type === 'lifetime' &&
                hasPurchasedLifetimePlan())
            "
            :class="{
              'subscribe-button': true,
              'swap-button': canSwapPlan,
              disabled:
                !emailValidation.validated ||
                !emailValidation.valid ||
                isPlanActive(selectedPlan) ||
                (selectedPlan?.metadata?.plan_type === 'lifetime' &&
                  hasPurchasedLifetimePlan()),
            }"
            @click="handleSubscriptionAction"
          >
            {{
              subscriptionLoading
                ? "Processando..."
                : !emailValidation.validated
                  ? "Aguardando validação..."
                  : !emailValidation.valid
                    ? "E-mail não validado - Contate o suporte"
                    : isPlanActive(selectedPlan)
                      ? "Este plano já está ativo"
                      : selectedPlan?.metadata?.plan_type === "lifetime" &&
                          hasPurchasedLifetimePlan()
                        ? "💎 Plano Vitalício já comprado"
                        : canSwapPlan
                          ? `🔄 Trocar para ${selectedPlan.name} - R$ ${getPlanPrice(
                              selectedPlan,
                            )}${getPlanPeriod(selectedPlan)}`
                          : `Assinar ${selectedPlan.name} - R$ ${getPlanPrice(
                              selectedPlan,
                            )}${getPlanPeriod(selectedPlan)}`
            }}
          </button>
        </div>
      </Transition>

      <!-- Loading do Stripe -->
      <Transition name="slide-fade">
        <div v-if="showPlansSelection && stripeLoading" class="stripe-loading">
          <div class="loading-spinner" />
          <p>Redirecionando para o Stripe...</p>
        </div>
      </Transition>

      <!-- Resultado da Assinatura -->
      <Transition name="slide-fade">
        <div
          v-if="showPlansSelection && subscriptionResult"
          class="subscription-result"
        >
          <h3>Resultado da Assinatura</h3>
          <pre>{{ JSON.stringify(subscriptionResult, null, 2) }}</pre>
        </div>
      </Transition>
    </div>

    <!-- Modal de erro de limite de plano -->
    <PlanLimitErrorModal
      v-model="isModalOpen"
      :error-data="errorData"
      @upgrade-clicked="hideModal"
    />

    <!-- Modal: dados para Nota Fiscal (checkout ou edição) -->
    <BillingFormModal
      v-model="showBillingModal"
      :title="
        billingModalIntent === 'edit'
          ? 'Editar dados de faturamento'
          : billingInitialData
            ? 'Confirmar dados de faturamento'
            : 'Dados para Nota Fiscal'
      "
      :initial-data="billingInitialData"
      :submit-button-text="
        billingModalIntent === 'edit' ? 'Salvar' : 'Continuar para pagamento'
      "
      @submit="onBillingFormSubmit"
      @cancel="showBillingModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import {
  createCheckoutSession,
  redirectToCheckout,
  setPendingCheckoutSessionId,
  validateCheckoutData,
  updateCustomerBilling,
  getCustomerBilling,
} from "~/services/stripeCheckoutService.js";
import { getLifetimePlansCount } from "~/services/lifetimePlanService.js";
import ActivePlanChecker from "~/components/ActivePlanChecker.vue";
import BillingFormModal from "~/components/BillingFormModal.vue";
import PaymentMethodCard from "~/components/PaymentMethodCard.vue";
import PlanLimitErrorModal from "~/components/PlanLimitErrorModal.vue";
import { usePlanLimitError } from "~/composables/usePlanLimitError.js";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import { getApiBaseUrl } from "~/utils/apiBaseUrl";
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";

// Configurações do Stripe
const runtimeConfig = useRuntimeConfig();
const stripeKey = runtimeConfig.public.stripePublishableKey;
const route = useRoute();
const router = useRouter();

// Composable para usuário
const { user, getUserInfo, getUserEmail } = useUser();

// Composable para modal de limite de plano
const { isModalOpen, errorData, showModal, hideModal } = usePlanLimitError();

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
const refreshingPlans = ref(false);
const lifetimeCounter = ref(null);

const PLANS_CACHE_KEY = "subscription_plans_cache";
const PLANS_CACHE_VERSION = "v2";
const PLANS_CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 horas
const PLANS_REQUEST_TIMEOUT_MS = 15000; // 15 segundos

const normalizeMetadata = (metadata) => {
  if (!metadata) return {};

  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.warn("Erro ao converter metadata string:", error);
      return {};
    }
  }

  if (typeof metadata === "object") {
    return { ...metadata };
  }

  return {};
};

const getPlanTierInfo = (metadata) => {
  const normalized = normalizeMetadata(metadata);
  return {
    planType: normalized.plan_type ? normalized.plan_type.toLowerCase() : null,
    billingType: normalized.type ? normalized.type.toLowerCase() : null,
  };
};

const matchesPlanTier = (plan, tier) => {
  if (!plan || !tier || !tier.planType) {
    return false;
  }

  const planTier = getPlanTierInfo(plan.metadata);

  if (!planTier.planType) {
    return false;
  }

  if (planTier.planType !== tier.planType) {
    return false;
  }

  if (!tier.billingType || !planTier.billingType) {
    return true;
  }

  return planTier.billingType === tier.billingType;
};

const formatDateBR = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Estados para validação de email do customer
const emailValidation = ref({
  loading: false,
  validated: false,
  valid: false,
  customerData: null,
  error: null,
});
// true só após o check-email ter sido chamado na tela; bloqueia o restante da página até lá
const emailValidationReady = ref(false);

// Estado do plano ativo
const activePlanData = ref(null);
const activePlanLoading = ref(true);
const showUpgradeAnimations = ref(false);
const showPlansSelection = ref(false); // Controla qual etapa está sendo exibida
const activeProductMetadata = computed(() =>
  normalizeMetadata(activePlanData.value?.product?.metadata),
);
const activePlanTier = computed(() =>
  getPlanTierInfo(activePlanData.value?.product?.metadata),
);
const lifetimePlanData = computed(
  () => activePlanData.value?.lifetime_plan ?? null,
);
const lifetimePlanTier = computed(() =>
  getPlanTierInfo(lifetimePlanData.value?.product?.metadata),
);
// Só mostrar botão "Trocar" quando a assinatura estiver ativa (não cancelada)
const canSwapPlan = computed(() => {
  const d = activePlanData.value;
  if (!d?.customer_id || d?.has_active_plan !== true) return false;
  const sub = d.subscription;
  const canceled =
    sub?.cancel_at_period_end === true ||
    sub?.status === "canceled" ||
    sub?.canceled_at != null;
  return !canceled;
});
const lifetimePlanPriceId = computed(
  () =>
    lifetimePlanData.value?.price?.stripe_id ??
    lifetimePlanData.value?.price?.id ??
    null,
);
const lifetimePurchaseDate = computed(
  () => lifetimePlanData.value?.subscription?.purchased_at ?? null,
);
const lifetimePurchaseLabel = computed(() => {
  const formatted = formatDateBR(lifetimePurchaseDate.value);
  return formatted ? `Comprado em ${formatted}` : null;
});

// Removido: Estado do modal de troca de planos (agora redirecionamos para rota específica)

// API URL (baseada em API_ENDPOINT / NUXT_PUBLIC_API_ENDPOINT)
const getProductsUrl = () => `${getApiBaseUrl()}/v1/products`;

// URLs de redirecionamento
const successURL = `${window.location.origin}/payment/success`;
const cancelURL = `${window.location.origin}/payment/cancel`;

// Planos exibidos baseados na periodicidade selecionada
const getPlanPrimaryPrice = (plan) => plan?.prices?.data?.[0] || null;

const isPlanRenderable = (plan) => {
  if (!plan || !plan.metadata?.plan_type) {
    return false;
  }

  if (plan.metadata.plan_type === "lifetime") {
    // Sempre mostrar o plano vitalício, mesmo sem preço (pode já ter sido comprado)
    return true;
  }

  // Demais planos precisam de metadata type e preço válido
  return Boolean(plan.metadata?.type && getPlanPrimaryPrice(plan));
};

const displayedPlans = computed(() => {
  if (plans.value.length === 0) return [];

  // Filtrar apenas produtos válidos (excluir produtos de teste e sem preço)
  const validPlans = plans.value.filter(
    (plan) =>
      plan.metadata?.plan_type &&
      plan.metadata?.plan_type !== "test" &&
      plan.name !== "Product Test" &&
      isPlanRenderable(plan),
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
      "⚠️ Price data não encontrado, usando subscription como padrão",
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

// Aguardar token de auth aparecer (útil logo após login/redirect)
function getAuthTokenNow() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("apollo:default.token") ||
    null
  );
}
function waitForAuthToken(maxMs = 3500) {
  return new Promise((resolve) => {
    if (getAuthTokenNow()) {
      resolve();
      return;
    }
    const deadline = Date.now() + maxMs;
    const t = setInterval(() => {
      if (getAuthTokenNow() || Date.now() >= deadline) {
        clearInterval(t);
        resolve();
      }
    }, 400);
  });
}

// Validar email do customer: só a API define se o email é o da conta/tenant (pronto para pagamento). Sem fallback por role.
const validateCustomerEmailGraphQL = async () => {
  try {
    emailValidation.value.loading = true;
    emailValidation.value.error = null;

    const userEmail = getUserEmail();
    if (!userEmail) {
      throw new Error("Email do usuário não encontrado");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      throw new Error("Formato de email inválido");
    }

    await validateCustomerEmailAPI(userEmail);
  } catch (err) {
    console.error("❌ Erro na validação do email:", err);
    emailValidation.value.error = err.message;
    // Só marcar validated + valid quando a API responder; em falhas (rede, 401, etc.) não mostrar sucesso nem erro de "inválido"
    emailValidation.value.validated = false;
    emailValidation.value.valid = false;
  } finally {
    emailValidation.value.loading = false;
  }
};

// Rota de validação: usuário logado + email igual ao do customer no tenant = dono da conta. Só o dono pode comprar/alterar/cancelar plano.
const validateCustomerEmailAPI = async (userEmail) => {
  const token = localStorage.getItem("userToken");
  const apolloToken = localStorage.getItem("apollo:default.token");
  const authToken = token || apolloToken;

  if (!authToken) {
    throw new Error("Token de autenticação não encontrado");
  }

  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/v1/customers/check-email`;
  const requestBody = {
    email: userEmail,
    tenant_id: getTenantId(),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {}

  // 200: backend encontrou (ou não) o customer para este email + tenant_id
  if (response.ok) {
    if (data.success && data.exists === true) {
      emailValidation.value.validated = true;
      emailValidation.value.valid = true;
      emailValidation.value.customerData = data.data || null;
      emailValidation.value.error = null;
      return;
    }
    if (data.success === false && data.exists === false) {
      emailValidation.value.validated = true;
      emailValidation.value.valid = false;
      emailValidation.value.customerData = null;
      emailValidation.value.error =
        data.message || "Este e-mail não é o dono da conta neste tenant.";
      return;
    }
    throw new Error(data.message || "Erro na validação do customer");
  }

  if (response.status === 401) {
    throw new Error("Token de autenticação inválido ou expirado");
  }
  if (response.status === 403) {
    throw new Error(
      "Acesso negado - só é possível verificar o próprio e-mail.",
    );
  }
  // 404: customer não encontrado para este tenant = usuário não é o dono da conta
  if (response.status === 404) {
    emailValidation.value.validated = true;
    emailValidation.value.valid = false;
    emailValidation.value.customerData = null;
    emailValidation.value.error =
      data.message || "Customer não encontrado para este tenant.";
    return;
  }
  throw new Error(
    data.message || `Erro ${response.status}: ${response.statusText}`,
  );
};

// Funções de validação removidas - usando apenas validateCustomerEmailGraphQL

const canUseBrowserStorage = () => typeof window !== "undefined";

const loadPlansFromCache = () => {
  if (!canUseBrowserStorage()) {
    return false;
  }

  try {
    const cached = localStorage.getItem(PLANS_CACHE_KEY);
    if (!cached) {
      return false;
    }

    const parsed = JSON.parse(cached);

    if (
      !parsed ||
      parsed.version !== PLANS_CACHE_VERSION ||
      !Array.isArray(parsed.data) ||
      !parsed.timestamp ||
      Date.now() - parsed.timestamp > PLANS_CACHE_TTL_MS
    ) {
      localStorage.removeItem(PLANS_CACHE_KEY);
      return false;
    }

    plans.value = parsed.data;
    console.log("✅ Planos carregados do cache local");
    return true;
  } catch (cacheError) {
    console.warn("⚠️ Falha ao ler cache local de planos:", cacheError);
    localStorage.removeItem(PLANS_CACHE_KEY);
    return false;
  }
};

const savePlansToCache = (planList) => {
  if (!canUseBrowserStorage() || !Array.isArray(planList) || !planList.length) {
    return;
  }

  try {
    localStorage.setItem(
      PLANS_CACHE_KEY,
      JSON.stringify({
        version: PLANS_CACHE_VERSION,
        timestamp: Date.now(),
        data: planList,
      }),
    );
    console.log("💾 Planos atualizados no cache local");
  } catch (cacheError) {
    console.warn("⚠️ Falha ao salvar planos no cache local:", cacheError);
  }
};

const clearPlansCache = () => {
  if (!canUseBrowserStorage()) {
    return;
  }

  localStorage.removeItem(PLANS_CACHE_KEY);
  console.log("🧹 Cache de planos limpo manualmente");
};

const createAbortableRequest = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PLANS_REQUEST_TIMEOUT_MS,
  );

  return { controller, timeoutId };
};

// Carregar planos da API
const loadPlans = async ({ forceRefresh = false } = {}) => {
  try {
    const hadPlansBeforeRequest = plans.value.length > 0;

    if (!forceRefresh && !hadPlansBeforeRequest) {
      loadPlansFromCache();
    }

    if (!plans.value.length) {
      loading.value = true;
    } else {
      refreshingPlans.value = true;
    }

    error.value = null;

    const { controller, timeoutId } = createAbortableRequest();
    let response;

    try {
      response = await fetch(getProductsUrl(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      plans.value = data.data;
      savePlansToCache(data.data);

      // Após carregar os planos, tentar selecionar automaticamente o plano ativo
      nextTick(() => {
        autoSelectActivePlan();
      });
    } else {
      throw new Error("Resposta da API inválida");
    }
  } catch (err) {
    console.error("❌ Erro ao carregar planos:", err);
    if (err.name === "AbortError") {
      error.value =
        "Tempo limite ao carregar planos. Mostrando dados em cache, tente novamente.";
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
    refreshingPlans.value = false;
  }
};

// Funções auxiliares
const formatCurrencyFromCents = (valueInCents) => {
  if (typeof valueInCents !== "number") {
    return null;
  }

  return (valueInCents / 100).toFixed(2).replace(".", ",");
};

const getPlanPrice = (plan) => {
  const priceData = getPlanPrimaryPrice(plan);

  if (!priceData || typeof priceData.unit_amount !== "number") {
    console.warn("⚠️ Preço não encontrado para o plano:", plan?.name);
    return "—";
  }

  const formatted = formatCurrencyFromCents(priceData.unit_amount);
  return formatted ?? "—";
};

// Calcular desconto anual baseado nos preços reais
const getYearlyDiscount = (plan) => {
  if (plan.metadata?.type !== "yearly") return null;

  // Encontrar o plano mensal correspondente
  const monthlyPlan = plans.value.find(
    (p) =>
      p.metadata?.plan_type === plan.metadata?.plan_type &&
      p.metadata?.type === "monthly",
  );

  const monthlyPrice = getPlanPrimaryPrice(monthlyPlan)?.unit_amount;
  const yearlyPrice = getPlanPrimaryPrice(plan)?.unit_amount;

  if (!monthlyPrice || !yearlyPrice) {
    return null;
  }
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
    (p) => p.metadata?.plan_type === "pro" && p.metadata?.type === "yearly",
  );

  const proYearlyPrice = getPlanPrimaryPrice(proYearlyPlan)?.unit_amount;
  const lifetimePrice = getPlanPrimaryPrice(plan)?.unit_amount;

  if (!proYearlyPrice || !lifetimePrice) {
    return null;
  }

  // Assumir que o usuário usaria o plano por 3 anos
  const threeYearTotal = proYearlyPrice * 3;

  if (threeYearTotal <= lifetimePrice) return null;

  const savings = ((threeYearTotal - lifetimePrice) / threeYearTotal) * 100;
  return Math.round(savings);
};

// Obter período do plano
const getPlanPeriod = (plan) => {
  if (plan.metadata?.plan_type === "lifetime") return "";

  const priceData = getPlanPrimaryPrice(plan);
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

// Obter cor do plano baseado no tipo
const getPlanColor = (plan) => {
  if (plan.metadata?.plan_type === "trial") return "#e9742b"; // Laranja
  if (plan.metadata?.plan_type === "pro") return "#3b82f6"; // Azul
  if (plan.metadata?.plan_type === "clubes") return "#10b981"; // Verde
  if (plan.metadata?.plan_type === "lifetime") return "#2563eb"; // Azul vibrante (vôlei)
  return "#6b7280"; // Cinza padrão
};

// Obter features principais do plano
const getMainPlanFeatures = (plan) => {
  const allFeatures = getPlanFeatures(plan);
  const features = [];

  // SEMPRE incluir limitações de times e jogadores primeiro (essenciais)
  const maxTeams = getMaxTeams(plan);
  const maxPlayers = getMaxPlayers(plan);

  if (maxTeams) features.push(maxTeams);
  if (maxPlayers) features.push(maxPlayers);

  // Adicionar todas as features dos metadados após as limitações
  if (allFeatures.length > 0) {
    features.push(...allFeatures);
  }

  // Se não há features nem limitações, usar valores padrão por tipo
  if (features.length === 0) {
    if (plan.metadata?.plan_type === "trial") {
      return ["Times ilimitados", "Jogadores ilimitados"];
    }
    if (plan.metadata?.plan_type === "pro") {
      return ["Até 5 times", "Até 50 jogadores"];
    }
    if (plan.metadata?.plan_type === "clubes") {
      return [
        "Times ilimitados",
        "Jogadores ilimitados",
        "Acesso completo à plataforma",
      ];
    }
    if (plan.metadata?.plan_type === "lifetime") {
      return ["1 time", "Até 20 jogadores"];
    }
  }

  return features;
};

// Obter descrição do plano dos metadados
const getPlanDescription = (plan) => {
  // Verificar vários campos possíveis de descrição
  if (plan.metadata?.description) {
    return plan.metadata.description;
  }
  if (plan.metadata?.display_description) {
    return plan.metadata.display_description;
  }
  if (plan.description) {
    return plan.description;
  }
  if (plan.product?.description) {
    return plan.product.description;
  }
  return null;
};

// Obter notas especiais do plano
const getPlanSpecialNotes = (plan) => {
  const notes = [];
  if (plan.metadata?.plan_type === "trial") {
    notes.push({
      icon: "email",
      text: "E-mail automático 3 dias antes do fim do trial",
    });
    notes.push({
      icon: "lock",
      text: "Acesso será bloqueado ao expirar",
    });
  }
  // Removido: "Migração automática pós-trial" - validações necessárias já foram implementadas
  return notes;
};

// Obter preço anual formatado
const getYearlyPrice = (plan) => {
  if (plan.metadata?.type === "yearly") {
    return getPlanPrice(plan);
  }
  // Se for mensal, buscar o plano anual correspondente
  if (plan.metadata?.type === "monthly") {
    const yearlyPlan = plans.value.find(
      (p) =>
        p.metadata?.plan_type === plan.metadata?.plan_type &&
        p.metadata?.type === "yearly",
    );
    if (yearlyPlan) {
      return getPlanPrice(yearlyPlan);
    }
    // Fallback: calcular o preço anual baseado no mensal
    const monthlyPrice = getPlanPrimaryPrice(plan)?.unit_amount;
    if (monthlyPrice) {
      const yearlyPrice = monthlyPrice * 12;
      return formatCurrencyFromCents(yearlyPrice);
    }
  }
  return null;
};

// Obter recursos do plano
const getPlanFeatures = (plan) => {
  // Tentar ler features dos metadados (vários formatos possíveis)
  const metadataFeatures =
    plan.metadata?.display_features ||
    plan.metadata?.features ||
    plan.metadata?.benefits ||
    plan.metadata?.plan_features;

  if (metadataFeatures) {
    try {
      // Se for string JSON, fazer parse
      if (typeof metadataFeatures === "string") {
        const features = JSON.parse(metadataFeatures);
        if (Array.isArray(features) && features.length > 0) {
          return features;
        }
      }
      // Se já for array, retornar diretamente
      if (Array.isArray(metadataFeatures) && metadataFeatures.length > 0) {
        return metadataFeatures;
      }
    } catch (error) {
      console.warn("Erro ao fazer parse de features dos metadados:", error);
      // Continuar para fallback
    }
  }

  // Fallback: usar valores hardcoded caso metadados não existam
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

// Verificar se o plano tem limites para exibir
const hasPlanLimits = (plan) => {
  return (
    plan.metadata?.max_players !== undefined ||
    plan.metadata?.max_teams !== undefined ||
    plan.metadata?.offer_type !== undefined
  );
};

// Obter limite de jogadores formatado
const getMaxPlayers = (plan) => {
  const maxPlayers = plan.metadata?.max_players;
  if (maxPlayers === undefined || maxPlayers === null) return null;

  if (maxPlayers === "0" || maxPlayers === 0) {
    return "Jogadores ilimitados";
  }

  return `${maxPlayers} jogadores`;
};

// Obter limite de times formatado
const getMaxTeams = (plan) => {
  const maxTeams = plan.metadata?.max_teams;
  if (maxTeams === undefined || maxTeams === null) return null;

  if (maxTeams === "0" || maxTeams === 0) {
    return "Times ilimitados";
  }

  return `${maxTeams} ${maxTeams === "1" ? "time" : "times"}`;
};

// Obter tipo de oferta formatado
const getOfferType = (plan) => {
  const offerType = plan.metadata?.offer_type;
  if (!offerType) return null;

  // Formatar "limited 500 accounts" para "500 contas"
  if (offerType.includes("limited") && offerType.includes("accounts")) {
    const match = offerType.match(/(\d+)/);
    if (match) {
      const number = match[1];
      return `${number} contas disponíveis`;
    }
  }

  return offerType;
};

// Calcular desconto geral anual
const getGeneralYearlyDiscount = computed(() => {
  const yearlyPlans = plans.value.filter(
    (plan) => plan.metadata?.type === "yearly",
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
  if (isPlanDisabled(plan)) {
    console.log("⚠️ Tentativa de selecionar plano indisponível:", plan.name);
    return;
  }

  selectedPlan.value = plan;
};

// Selecionar automaticamente o plano ativo (para exibição visual)
// NOTA: Não selecionamos o plano ativo automaticamente, pois ele já aparece
// com o badge "Plano em Uso" e não deve ser selecionável
const autoSelectActivePlan = () => {
  console.log(
    "ℹ️ Plano ativo detectado - botões serão bloqueados via isPlanDisabled()",
  );
};

// Verificar se um plano está ativo
const isPlanActive = (plan) => {
  if (!activePlanData.value || !activePlanData.value.subscription || !plan) {
    return false;
  }

  const activePriceId = activePlanData.value.subscription.price_id;
  const planPriceId = plan.prices?.data?.[0]?.id;

  const activeProduct = activePlanData.value.product || {};
  const activeProductId = activeProduct.stripe_id || activeProduct.id || null;
  const planProductId = plan.id || plan.stripe_id || null;
  const planMetadata = normalizeMetadata(plan.metadata);
  const activeMetadata = activeProductMetadata.value;

  console.log("🔍 isPlanActive - Comparando planos:", {
    activePriceId,
    planPriceId,
    planName: plan.name,
    activeProductName: activePlanData.value.product?.name,
    activeProductId,
    planProductId,
    planMetadata,
    activeMetadata,
  });

  // Comparar por ID do preço (método mais confiável)
  if (activePriceId && planPriceId) {
    const isActive = activePriceId === planPriceId;
    console.log("🔍 isPlanActive - Comparação por price_id:", isActive);
    if (isActive) {
      return true;
    }
  }

  if (activeProductId && planProductId && activeProductId === planProductId) {
    console.log("🔍 isPlanActive - Comparação por produto:", true);
    return true;
  }

  if (
    activeMetadata.plan_type &&
    planMetadata.plan_type &&
    activeMetadata.plan_type === planMetadata.plan_type
  ) {
    if (
      !activeMetadata.type ||
      !planMetadata.type ||
      activeMetadata.type === planMetadata.type
    ) {
      console.log("🔍 isPlanActive - Comparação por metadata:", true);
      return true;
    }
  }

  if (matchesPlanTier(plan, activePlanTier.value)) {
    console.log("🔍 isPlanActive - Comparação por tier:", true);
    return true;
  }

  // Fallback: comparar por nome
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

    const isActive = activeType === currentType;
    console.log("🔍 isPlanActive - Comparação por nome:", isActive);
    return isActive;
  }

  console.log("🔍 isPlanActive - Nenhuma correspondência encontrada");
  return false;
};

// Verificar se o usuário já comprou o plano vitalício alguma vez
const hasPurchasedLifetimePlan = () => {
  if (!activePlanData.value) {
    return false;
  }

  if (lifetimePlanData.value) {
    return true;
  }

  const hasPurchased = Boolean(activePlanData.value.has_purchased_lifetime);
  const isLifetimeActive =
    activePlanData.value.plan_type === "one_time_payment" ||
    activePlanData.value.subscription?.type === "one_time_payment";

  console.log("🔍 hasPurchasedLifetimePlan:", {
    hasPurchased,
    isLifetimeActive,
    lifetimePlan: lifetimePlanData.value,
    activePlanData: activePlanData.value,
  });

  return hasPurchased || isLifetimeActive;
};

const isPlanDisabled = (plan) => {
  if (!plan) {
    return false;
  }

  if (isPlanActive(plan)) {
    return true;
  }

  if (isLifetimePlanPurchased(plan)) {
    return true;
  }

  return false;
};

const isLifetimePlanPurchased = (plan) => {
  if (plan.metadata?.plan_type !== "lifetime") {
    return false;
  }

  // Se o backend informar que já existe compra vitalícia, consideramos
  // qualquer cartão de plano vitalício como já comprado.
  return hasPurchasedLifetimePlan();
};

// Detectar se o plano ativo é anual baseado nos dados retornados
const detectYearlyPlan = (planData) => {
  if (!planData || !planData.price) {
    return false;
  }

  // Verificar pelo intervalo de recorrência
  const recurring = planData.price.recurring;
  if (recurring && recurring.interval) {
    console.log("🔍 Intervalo de recorrência:", recurring.interval);
    return recurring.interval === "year";
  }

  // Verificar pelo nome do produto (fallback)
  const productName = planData.product?.name?.toLowerCase() || "";
  console.log("🔍 Nome do produto:", productName);

  // Palavras-chave que indicam plano anual
  const yearlyKeywords = ["anual", "yearly", "year", "ano"];
  const isYearlyByName = yearlyKeywords.some((keyword) =>
    productName.includes(keyword),
  );

  if (isYearlyByName) {
    console.log("📅 Plano detectado como anual pelo nome:", productName);
    return true;
  }

  // Verificar pelo preço (planos anuais geralmente têm valores maiores)
  const unitAmount = planData.price.unit_amount;
  if (unitAmount) {
    console.log("🔍 Valor unitário:", unitAmount);
    // Se o valor for muito alto para ser mensal, provavelmente é anual
    // Exemplo: se for maior que R$ 1000, provavelmente é anual
    if (unitAmount > 100000) {
      // R$ 1000,00 em centavos
      console.log("📅 Plano detectado como anual pelo valor alto:", unitAmount);
      return true;
    }
  }

  console.log("📅 Plano detectado como mensal");
  return false;
};

// Verificar se um plano é melhor que o ativo (baseado no valor)
const isBetterPlan = (plan) => {
  // Se não há plano ativo, todos os planos pagos são melhores
  if (!activePlanData.value || !activePlanData.value.price) {
    const currentPlanValue = getPlanValue(plan);
    // Retorna true se o plano tem valor > 0 (não é gratuito)
    return currentPlanValue > 0;
  }

  const activePlanValue = activePlanData.value.price.unit_amount;
  const currentPlanValue = getPlanValue(plan);

  // Se o plano atual for mais caro, é melhor
  return currentPlanValue > activePlanValue;
};

// Obter valor do plano para comparação
const getPlanValue = (plan) => {
  if (!plan.prices?.data?.[0]?.unit_amount) {
    return 0;
  }
  return plan.prices.data[0].unit_amount;
};

// Obter nível de animação baseado na diferença de valor
const getUpgradeAnimationLevel = (plan) => {
  const currentPlanValue = getPlanValue(plan);

  // Se não há plano ativo, definir animação baseado apenas no valor do plano
  if (!activePlanData.value || !activePlanData.value.price) {
    // Plano Pro (R$ 49) = low
    if (currentPlanValue >= 4900 && currentPlanValue < 10000) {
      return "low";
    }
    // Plano Clubes (R$ 149) = medium
    if (currentPlanValue >= 10000 && currentPlanValue < 50000) {
      return "medium";
    }
    // Plano Vitalício (R$ 250) = high
    if (currentPlanValue >= 50000) {
      return "high";
    }
    return "none";
  }

  const activePlanValue = activePlanData.value.price.unit_amount;
  const difference = currentPlanValue - activePlanValue;

  // Calcular percentual de diferença
  const percentageDiff = (difference / activePlanValue) * 100;

  if (percentageDiff >= 100) {
    return "high"; // 100%+ mais caro = animação alta
  } else if (percentageDiff >= 50) {
    return "medium"; // 50-99% mais caro = animação média
  } else if (percentageDiff > 0) {
    return "low"; // 1-49% mais caro = animação baixa
  }

  return "none";
};

// Obter texto do upgrade baseado no nível
const getUpgradeText = (plan) => {
  const level = getUpgradeAnimationLevel(plan);

  switch (level) {
    case "high":
      return "Upgrade Premium!";
    case "medium":
      return "Upgrade Recomendado";
    case "low":
      return "Upgrade Disponível";
    default:
      return "Upgrade";
  }
};

// Event handlers do ActivePlanChecker
const onActivePlanLoaded = (planData) => {
  console.log("📋 Plano ativo carregado:", planData);
  console.log(
    "🔍 Estrutura completa do planData:",
    JSON.stringify(planData, null, 2),
  );
  console.log("🔍 planData.customer_id:", planData?.customer_id);
  console.log("🔍 planData.has_active_plan:", planData?.has_active_plan);

  activePlanData.value = planData;

  // Adicionar flag isTrial para identificar planos de trial
  if (planData && !planData.has_active_plan && planData.trial_info) {
    activePlanData.value.isTrial = true;
  } else if (planData) {
    activePlanData.value.isTrial = false;
  }

  activePlanLoading.value = false;

  if (planData) {
    console.log("✅ Cliente possui plano ativo:", planData.product?.name);
    console.log("🔍 customer_id disponível:", planData.customer_id);
    console.log("🔍 isTrial:", activePlanData.value.isTrial);

    // Detectar se o plano ativo é anual e pré-selecionar a aba correta
    const isYearlyPlan = detectYearlyPlan(planData);
    if (isYearlyPlan) {
      console.log("📅 Plano ativo é anual - pré-selecionando aba anual");
      selectedBilling.value = "yearly";
    } else {
      console.log("📅 Plano ativo é mensal - mantendo aba mensal");
      selectedBilling.value = "monthly";
    }

    // Selecionar automaticamente o plano ativo na lista
    // Usar nextTick para garantir que os planos já foram renderizados
    nextTick(() => {
      autoSelectActivePlan();
    });
  } else {
    console.log("ℹ️ Cliente não possui plano ativo");
  }
};

const onActivePlanError = (error) => {
  console.error("❌ Erro ao carregar plano ativo:", error);
  activePlanLoading.value = false;
  // Não bloquear a interface por erro de carregamento do plano ativo
};

const onUpgradeClicked = async () => {
  if (!emailValidation.value.validated) {
    await getUserInfo();
    await validateCustomerEmailGraphQL();
  }

  showPlansSelection.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
  console.log("🚀 Upgrade clicado - mostrando seleção de planos");
};

// Métodos para seleção de planos
const handlePlanClick = (plan) => {
  // Se é o plano ativo, não faz nada (botão desabilitado)
  if (isPlanActive(plan)) {
    return;
  }

  // Sempre apenas seleciona o plano (a lógica de troca agora está no botão principal)
  selectPlan(plan);
};

// Inicializar Stripe
const initializeStripe = async () => {
  try {
    if (!stripeKey) {
      throw new Error("Chave do Stripe não configurada");
    }

    console.log(
      "🔑 Inicializando Stripe com chave:",
      stripeKey.substring(0, 20) + "...",
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

// Função para lidar com ação de assinatura/troca
const handleSubscriptionAction = async () => {
  console.log("🔍 handleSubscriptionAction chamada");
  console.log("🔍 activePlanData.value:", activePlanData.value);
  console.log("🔍 selectedPlan.value:", selectedPlan.value);

  // Verificar se o plano selecionado é o mesmo que o ativo
  if (selectedPlan.value && isPlanActive(selectedPlan.value)) {
    console.log("⚠️ Tentativa de trocar para o plano que já está ativo");
    alert(
      "Este plano já está ativo. Selecione um plano diferente para trocar.",
    );
    return;
  }

  // Só redirecionar para troca (swap) se a assinatura estiver realmente ativa (não cancelada).
  // Assinatura cancelada ou "ativa até fim do período" deve fazer checkout normal (nova assinatura).
  const sub = activePlanData.value?.subscription;
  const isSubscriptionCanceled =
    sub?.cancel_at_period_end === true ||
    sub?.status === "canceled" ||
    sub?.canceled_at != null;
  const hasActivePlan =
    activePlanData.value?.has_active_plan === true &&
    activePlanData.value?.customer_id &&
    !isSubscriptionCanceled;
  console.log(
    "🔍 hasActivePlan (para swap):",
    hasActivePlan,
    "has_active_plan:",
    activePlanData.value?.has_active_plan,
    "isSubscriptionCanceled:",
    isSubscriptionCanceled,
  );

  // Verificar se o plano ativo é vitalício (one_time_payment)
  const isLifetimePlan =
    activePlanData.value?.plan_type === "one_time_payment" ||
    activePlanData.value?.subscription?.type === "one_time_payment";

  // Verificar se o plano selecionado é recorrente (subscription)
  const selectedPlanIsRecurring =
    selectedPlan.value?.prices?.data?.[0]?.recurring !== null &&
    selectedPlan.value?.prices?.data?.[0]?.type !== "one_time";

  console.log("🔍 isLifetimePlan:", isLifetimePlan);
  console.log("🔍 selectedPlanIsRecurring:", selectedPlanIsRecurring);

  // Validar limites do plano antes de prosseguir
  console.log(
    "🔍 ========== CHAMANDO validatePlanLimits (handleSubscriptionAction) ==========",
  );
  console.log("🔍 selectedPlan.value:", selectedPlan.value);
  const limitValidation = await validatePlanLimits(selectedPlan.value);
  console.log("🔍 Resultado da validação:", limitValidation);
  console.log("🔍 limitValidation.canSubscribe:", limitValidation.canSubscribe);

  if (!limitValidation.canSubscribe) {
    console.log(
      "🚨 ========== BLOQUEANDO ASSINATURA - EXIBINDO MODAL (handleSubscriptionAction) ==========",
    );
    subscriptionLoading.value = false;
    stripeLoading.value = false;

    const modalData = {
      type: limitValidation.type || "general",
      message: limitValidation.message,
      current: limitValidation.current,
      max: limitValidation.max,
      planName: selectedPlan.value.name || "Plano Selecionado",
      bothExceeded: limitValidation.bothExceeded || false,
      playersData: limitValidation.playersData || null,
      teamsData: limitValidation.teamsData || null,
    };

    console.log("🚨 Modal data preparado:", modalData);
    console.log("🚨 Chamando showModal...");

    // Mostrar modal de erro
    showModal(modalData);

    console.log("🚨 showModal chamado, retornando...");
    return;
  }

  console.log("✅ Validação passou - continuando com handleSubscriptionAction");

  if (hasActivePlan) {
    // Se o usuário tem plano vitalício e está tentando comprar um plano recorrente,
    // permitir checkout normal (upgrade de vitalício para assinatura)
    if (isLifetimePlan && selectedPlanIsRecurring) {
      console.log(
        "💎 Usuário com plano vitalício tentando fazer upgrade para plano recorrente - abrindo dados para NF",
      );
      await openBillingModalForCheckout();
      return;
    }

    // Para outros casos (subscription ativa tentando comprar outra subscription),
    // redirecionar para swap
    const priceId = selectedPlan.value.prices?.data?.[0]?.id;
    const customerId = activePlanData.value.customer_id;
    console.log("🔍 priceId encontrado:", priceId);
    console.log("🔍 customerId encontrado:", customerId);

    if (priceId && customerId) {
      const swapUrl = `/payment/swap?price_id=${encodeURIComponent(
        priceId,
      )}&customer_id=${encodeURIComponent(customerId)}`;
      console.log(
        "🔄 Usuário tem plano ativo, redirecionando para troca de planos:",
        swapUrl,
      );
      window.location.href = swapUrl;
    } else {
      alert(
        `Erro: ${
          !priceId ? "ID do preço" : "ID do customer"
        } não encontrado para redirecionamento`,
      );
    }
  } else {
    // Se não tem plano ativo, abrir formulário de dados para NF (pré-preenchido se já existir) e depois checkout
    console.log(
      "🔄 Usuário não tem plano ativo - abrindo dados para NF antes do checkout",
    );
    await openBillingModalForCheckout();
  }
};

// Modal: dados de faturamento para Nota Fiscal (checkout ou edição)
const showBillingModal = ref(false);
/** 'checkout' = abriu ao clicar Assinar; 'edit' = abriu ao clicar Editar dados de faturamento */
const billingModalIntent = ref("checkout");
const billingInitialData = ref(null);
const billingEditLoading = ref(false);

/** Abre o modal de faturamento para checkout, pré-preenchendo com dados existentes do tenant quando houver */
const openBillingModalForCheckout = async () => {
  try {
    const res = await getCustomerBilling(getTenantId());
    billingInitialData.value = res.data ?? null;
  } catch (_) {
    billingInitialData.value = null;
  }
  billingModalIntent.value = "checkout";
  showBillingModal.value = true;
};

const openBillingEdit = async () => {
  billingEditLoading.value = true;
  try {
    const res = await getCustomerBilling(getTenantId());
    billingInitialData.value = res.data ?? null;
    billingModalIntent.value = "edit";
    showBillingModal.value = true;
  } catch (e) {
    confirmError(e.message || "Erro ao carregar dados de faturamento.");
  } finally {
    billingEditLoading.value = false;
  }
};

const onBillingFormSubmit = async (payload) => {
  const tenantId = getTenantId();
  const result = await updateCustomerBilling({
    tenant_id: tenantId,
    federal_tax_number: payload.federal_tax_number,
    billing_address: payload.billing_address,
  });
  if (!result.success) {
    confirmError(result.error || "Erro ao salvar dados. Tente novamente.");
    return;
  }
  showBillingModal.value = false;
  if (billingModalIntent.value === "edit") {
    billingInitialData.value = null;
    billingModalIntent.value = "checkout";
    confirmSuccess("Dados de faturamento salvos com sucesso.");
    return;
  }
  subscribeToPlan();
};

// Função para validar limites do plano antes de assinar
const validatePlanLimits = async (plan) => {
  console.log("🚀 ========== INÍCIO validatePlanLimits ==========");
  console.log("🚀 Plan recebido:", plan);
  console.log("🚀 Plan name:", plan?.name);
  console.log("🚀 Plan metadata:", plan?.metadata);

  try {
    // Se está em trial, permitir tudo
    console.log("🔍 Verificando se está em trial...");
    console.log("🔍 activePlanData.value:", activePlanData.value);
    console.log(
      "🔍 activePlanData.value?.isTrial:",
      activePlanData.value?.isTrial,
    );

    if (activePlanData.value?.isTrial) {
      console.log("✅ Está em trial - permitindo tudo");
      return { canSubscribe: true };
    }

    // Buscar limites do plano
    console.log("🔍 Normalizando metadata...");
    const metadata = normalizeMetadata(plan.metadata);
    console.log("🔍 Metadata normalizada:", metadata);

    const maxPlayers = parseInt(metadata.max_players || "0");
    const maxTeams = parseInt(metadata.max_teams || "0");

    console.log("🔍 Limites extraídos:", {
      max_players_raw: metadata.max_players,
      max_teams_raw: metadata.max_teams,
      maxPlayers,
      maxTeams,
      maxPlayersType: typeof maxPlayers,
      maxTeamsType: typeof maxTeams,
    });

    // Se o plano é ilimitado, permitir
    if (maxPlayers === 0 && maxTeams === 0) {
      console.log("✅ Plano ilimitado - permitindo");
      return { canSubscribe: true };
    }

    console.log("🔍 Plano tem limites definidos, continuando validação...");

    // Buscar totais usando GraphQL via useAsyncQuery
    const usersQuery = gql`
      query users($filter: UserSearchInput, $first: Int, $page: Int) {
        users(filter: $filter, first: $first, page: $page) {
          paginatorInfo {
            total
          }
        }
      }
    `;

    const teamsQuery = gql`
      query teams($filter: TeamSearchInput, $first: Int, $page: Int) {
        teams(filter: $filter, first: $first, page: $page) {
          paginatorInfo {
            total
          }
        }
      }
    `;

    // Buscar totais em paralelo usando Apollo Client
    console.log("🔍 ========== INICIANDO QUERIES GRAPHQL ==========");
    console.log("🔍 Parâmetros das queries:", {
      planName: plan.name,
      metadataRaw: typeof plan.metadata === "string" ? plan.metadata : "object",
      normalizedMetadata: metadata,
      maxPlayers,
      maxTeams,
    });

    let currentPlayers = 0;
    let currentTeams = 0;

    try {
      console.log("🔍 Criando queries GraphQL...");
      console.log(
        "🔍 IMPORTANTE: Contando TODOS os usuários (sem filtro de role), como o backend faz",
      );

      // Usar o cliente Apollo diretamente
      const nuxtApp = useNuxtApp();
      const apolloClient = nuxtApp._apolloClients?.default;

      if (!apolloClient) {
        console.error("❌ Cliente Apollo não encontrado");
        return { canSubscribe: true };
      }

      console.log("🔍 Executando queries com Apollo Client...");

      const [usersResult, teamsResult] = await Promise.all([
        apolloClient.query({
          query: usersQuery,
          variables: {
            // NÃO filtrar por role - contar TODOS os usuários (como o backend faz)
            // O backend usa User::count() sem filtro, então precisamos fazer o mesmo
            filter: {}, // Contar todos os usuários, não apenas jogadores
            first: 1,
            page: 1,
          },
          fetchPolicy: "network-only", // Sempre buscar dados atualizados
        }),
        apolloClient.query({
          query: teamsQuery,
          variables: {
            filter: {},
            first: 1,
            page: 1,
          },
          fetchPolicy: "network-only", // Sempre buscar dados atualizados
        }),
      ]);

      console.log("🔍 ========== RESULTADOS DAS QUERIES ==========");
      console.log("🔍 usersResult:", usersResult);
      console.log("🔍 teamsResult:", teamsResult);
      console.log("🔍 usersResult?.data:", usersResult?.data);
      console.log("🔍 teamsResult?.data:", teamsResult?.data);

      // Apollo Client retorna { data: { users: {...} } }
      const usersData = usersResult?.data?.users;
      const teamsData = teamsResult?.data?.teams;

      console.log("🔍 usersData:", usersData);
      console.log("🔍 teamsData:", teamsData);
      console.log("🔍 usersData?.paginatorInfo:", usersData?.paginatorInfo);
      console.log("🔍 teamsData?.paginatorInfo:", teamsData?.paginatorInfo);

      currentPlayers = usersData?.paginatorInfo?.total || 0;
      currentTeams = teamsData?.paginatorInfo?.total || 0;

      console.log("🔍 ========== DADOS EXTRAÍDOS ==========");
      console.log(
        "🔍 currentPlayers:",
        currentPlayers,
        "(tipo:",
        typeof currentPlayers,
        ")",
      );
      console.log(
        "🔍 currentTeams:",
        currentTeams,
        "(tipo:",
        typeof currentTeams,
        ")",
      );
    } catch (error) {
      console.error("❌ ========== ERRO AO BUSCAR DADOS ==========");
      console.error("❌ Erro completo:", error);
      console.error("❌ Mensagem:", error.message);
      console.error("❌ Stack trace:", error.stack);
      // Em caso de erro, permitir para não bloquear o sistema
      return { canSubscribe: true };
    }

    console.log("🔍 ========== COMPARANDO LIMITES ==========");
    console.log("🔍 maxPlayers:", maxPlayers, "(tipo:", typeof maxPlayers, ")");
    console.log("🔍 maxTeams:", maxTeams, "(tipo:", typeof maxTeams, ")");
    console.log(
      "🔍 currentPlayers:",
      currentPlayers,
      "(tipo:",
      typeof currentPlayers,
      ")",
    );
    console.log(
      "🔍 currentTeams:",
      currentTeams,
      "(tipo:",
      typeof currentTeams,
      ")",
    );

    // Verificar se excede limites
    // maxPlayers > 0 significa que o plano tem limite (não é ilimitado)
    // currentPlayers > maxPlayers significa que excede o limite
    const playersExceeded = maxPlayers > 0 && currentPlayers > maxPlayers;
    const teamsExceeded = maxTeams > 0 && currentTeams > maxTeams;

    console.log("🔍 ========== CÁLCULOS DE VALIDAÇÃO ==========");
    console.log("🔍 maxPlayers > 0:", maxPlayers > 0);
    console.log("🔍 currentPlayers > maxPlayers:", currentPlayers > maxPlayers);
    console.log(
      "🔍 playersExceeded:",
      playersExceeded,
      "(maxPlayers > 0 && currentPlayers > maxPlayers)",
    );
    console.log("🔍 maxTeams > 0:", maxTeams > 0);
    console.log("🔍 currentTeams > maxTeams:", currentTeams > maxTeams);
    console.log(
      "🔍 teamsExceeded:",
      teamsExceeded,
      "(maxTeams > 0 && currentTeams > maxTeams)",
    );
    console.log("🔍 Comparação detalhada jogadores:", {
      current: currentPlayers,
      max: maxPlayers,
      comparison: `${currentPlayers} > ${maxPlayers}`,
      result: currentPlayers > maxPlayers,
      andCondition: maxPlayers > 0,
      final: playersExceeded,
    });
    console.log("🔍 Comparação detalhada times:", {
      current: currentTeams,
      max: maxTeams,
      comparison: `${currentTeams} > ${maxTeams}`,
      result: currentTeams > maxTeams,
      andCondition: maxTeams > 0,
      final: teamsExceeded,
    });
    console.log("🔍 willBlock:", playersExceeded || teamsExceeded);

    if (playersExceeded || teamsExceeded) {
      console.log("❌ ========== LIMITE EXCEDIDO - BLOQUEANDO ==========");

      let message = "";
      let type = "users";
      let current = 0;
      let max = 0;
      let bothExceeded = false;
      let playersData = null;
      let teamsData = null;

      if (playersExceeded && teamsExceeded) {
        console.log("❌ Ambos excedem - mostrando ambos os limites");
        // Se ambos excedem, mostrar ambos
        bothExceeded = true;
        type = "both";
        message = `Você possui ${currentPlayers} jogador(es) e ${currentTeams} time(s), mas o plano selecionado permite apenas ${maxPlayers} jogador(es) e ${maxTeams} time(s).`;
        current = currentPlayers;
        max = maxPlayers;
        playersData = {
          current: currentPlayers,
          max: maxPlayers,
        };
        teamsData = {
          current: currentTeams,
          max: maxTeams,
        };
      } else if (playersExceeded) {
        console.log("❌ Apenas jogadores excedem");
        // Apenas jogadores excedem
        type = "users";
        message = `Você possui ${currentPlayers} jogador(es), mas o plano selecionado permite apenas ${maxPlayers} jogador(es).`;
        current = currentPlayers;
        max = maxPlayers;
      } else if (teamsExceeded) {
        console.log("❌ Apenas times excedem");
        // Apenas times excedem
        type = "teams";
        message = `Você possui ${currentTeams} time(s), mas o plano selecionado permite apenas ${maxTeams} time(s).`;
        current = currentTeams;
        max = maxTeams;
      }

      console.log("❌ Dados do modal:", {
        type,
        message,
        current,
        max,
        playersExceeded,
        teamsExceeded,
        bothExceeded,
        playersData,
        teamsData,
      });

      console.log("❌ Retornando canSubscribe: false");
      console.log(
        "🚀 ========== FIM validatePlanLimits (BLOQUEADO) ==========",
      );

      return {
        canSubscribe: false,
        message,
        type,
        current,
        max,
        bothExceeded,
        playersData,
        teamsData,
      };
    }

    console.log("✅ Nenhum limite excedido - permitindo assinatura");
    console.log("🚀 ========== FIM validatePlanLimits (PERMITIDO) ==========");
    return { canSubscribe: true };
  } catch (error) {
    console.error("❌ ========== ERRO NA VALIDAÇÃO ==========");
    console.error("❌ Erro ao validar limites do plano:", error);
    console.error("❌ Mensagem:", error.message);
    console.error("❌ Stack:", error.stack);
    // Em caso de erro, permitir para não bloquear o sistema
    return { canSubscribe: true };
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
        "Seu e-mail não está registrado como administrador. Entre em contato com o suporte para prosseguir com o pagamento.",
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

    // Validar limites do plano antes de prosseguir
    console.log(
      "🔍 ========== CHAMANDO validatePlanLimits (subscribeToPlan) ==========",
    );
    console.log("🔍 selectedPlan.value:", selectedPlan.value);
    const limitValidation = await validatePlanLimits(selectedPlan.value);
    console.log("🔍 Resultado da validação:", limitValidation);
    console.log(
      "🔍 limitValidation.canSubscribe:",
      limitValidation.canSubscribe,
    );

    if (!limitValidation.canSubscribe) {
      console.log(
        "🚨 ========== BLOQUEANDO ASSINATURA - EXIBINDO MODAL ==========",
      );
      subscriptionLoading.value = false;
      stripeLoading.value = false;

      const modalData = {
        type: limitValidation.type || "general",
        message: limitValidation.message,
        current: limitValidation.current,
        max: limitValidation.max,
        planName: selectedPlan.value.name || "Plano Selecionado",
        bothExceeded: limitValidation.bothExceeded || false,
        playersData: limitValidation.playersData || null,
        teamsData: limitValidation.teamsData || null,
      };

      console.log("🚨 Modal data preparado:", modalData);
      console.log("🚨 Chamando showModal...");

      // Mostrar modal de erro
      showModal(modalData);

      console.log("🚨 showModal chamado, retornando...");
      return;
    }

    console.log("✅ Validação passou - continuando com assinatura");

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
        "Modo de pagamento incompatível com o tipo de preço. O plano selecionado é recorrente (assinatura) mas está sendo processado como pagamento único.",
      );
    }

    if (priceType === "one_time" && mode === "subscription") {
      throw new Error(
        "Modo de pagamento incompatível com o tipo de preço. O plano selecionado é único (vitalício) mas está sendo processado como assinatura.",
      );
    }

    // Validação adicional para casos edge
    if (!isRecurring && priceType !== "one_time" && mode === "subscription") {
      console.warn(
        "⚠️ Aviso: Preço sem recurring nem one_time, mas usando subscription",
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
      console.log("❌ Sessão não criada com sucesso:", sessionResult);

      // Verificar se é erro de subscription existente
      if (sessionResult.isExistingSubscription) {
        // Só redirecionar para swap se a assinatura for realmente ativa (não cancelada).
        // Se estiver cancelada/em fim de período, o swap falharia e geraria o modal "plano não encontrado".
        if (!canSwapPlan.value) {
          confirmError(
            "Você ainda possui uma assinatura ativa até o fim do período atual. " +
              'Para alterar o plano agora, use a opção "Trocar" no card do seu plano. ' +
              "Para assinar um novo plano após o cancelamento, aguarde a data de término do período.",
          );
          return;
        }
        console.log(
          "🔄 Customer já possui assinatura ativa, redirecionando para troca de planos",
        );
        console.log("🔍 Dados do erro:", sessionResult.errorData);

        const priceId = selectedPlan.value.prices?.data?.[0]?.id;
        if (priceId) {
          const swapUrl = `/payment/swap?price_id=${encodeURIComponent(
            priceId,
          )}`;
          console.log("🔄 Redirecionando para:", swapUrl);
          window.location.href = swapUrl;
          return;
        } else {
          throw new Error("ID do preço não encontrado para redirecionamento");
        }
      } else {
        console.log(
          "❌ Erro não relacionado a subscription existente:",
          sessionResult.error,
        );
        throw new Error(
          sessionResult.error || "Erro ao criar sessão de checkout",
        );
      }
    }

    console.log("✅ Sessão criada:", sessionResult.data);
    console.log(
      "🔍 Session ID para redirecionamento:",
      sessionResult.sessionId,
    );
    console.log(
      "🔍 Email na resposta da sessão:",
      sessionResult.data?.customer_email,
    );

    // Verificar se sessionId existe antes de redirecionar
    if (!sessionResult.sessionId) {
      throw new Error("Session ID não encontrado na resposta da API");
    }

    // Guardar session_id para a página de sucesso (fallback se a URL não vier com ?session_id)
    setPendingCheckoutSessionId(sessionResult.sessionId);

    // Redirecionar para o checkout do Stripe
    const redirectResult = await redirectToCheckout(
      stripe.value,
      sessionResult.sessionId,
    );

    if (!redirectResult.success) {
      throw new Error(
        redirectResult.error || "Erro ao redirecionar para checkout",
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
          "4. Tente novamente",
      );
    } else if (
      error.message.includes(
        "You must provide one of lineItems, items, or sessionId",
      )
    ) {
      alert(
        "❌ ERRO: Session ID não encontrado na resposta da API.\n\n" +
          "Verifique os logs do console para mais detalhes.\n" +
          "Possível problema na estrutura da resposta do backend.",
      );
    } else if (error.message.includes("Session ID não encontrado")) {
      alert(
        "❌ ERRO: Session ID não encontrado na resposta da API.\n\n" +
          "Verifique se o backend está retornando o session_id corretamente.",
      );
    } else if (
      error.message.includes("recurring price") ||
      error.message.includes("payment mode but passed a recurring price")
    ) {
      alert(
        "❌ ERRO: Modo de pagamento incompatível com o tipo de preço.\n\n" +
          "O plano selecionado é recorrente (assinatura) mas está sendo processado como pagamento único.\n" +
          "Tente novamente ou entre em contato com o suporte.",
      );
    } else if (error.message.includes("price")) {
      alert("Erro: ID do preço inválido. Verifique a configuração dos planos.");
    } else if (error.message.includes("stripe")) {
      alert(
        "Erro de conexão com Stripe. Verifique sua internet e tente novamente.",
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
// Carregar contador de planos vitalícios
const loadLifetimeCounter = async () => {
  try {
    console.log("📊 Carregando contador de planos vitalícios...");

    const result = await getLifetimePlansCount();

    if (result.success) {
      lifetimeCounter.value = result.data;
      console.log("✅ Contador carregado:", lifetimeCounter.value);
    } else {
      console.warn("⚠️ Erro ao carregar contador, usando valores padrão");
      lifetimeCounter.value = {
        total_sold: 0,
        limit: 500,
        remaining: 500,
        percentage: 0,
        is_sold_out: false,
      };
    }
  } catch (error) {
    console.error("❌ Erro ao carregar contador:", error);
    lifetimeCounter.value = null;
  }
};

onMounted(async () => {
  try {
    console.log("🚀 Iniciando carregamento da página...");

    // Primeiro: check-email na tela; nada da página carrega antes disso (sem cache)
    await waitForAuthToken(3500);
    await getUserInfo();
    console.log("🔍 Info do usuário:", user.value);
    await validateCustomerEmailGraphQL();
    // Logo após login a sessão pode responder 401 na 1ª chamada; repetir até obter resposta da API (validated) ou esgotar tentativas
    const retryDelays = [2000, 3500];
    for (const delayMs of retryDelays) {
      if (emailValidation.value.validated) break;
      await new Promise((r) => setTimeout(r, delayMs));
      await getUserInfo();
      await validateCustomerEmailGraphQL();
    }
    emailValidationReady.value = true;

    // Aviso quando redirecionado da tela "Trocar plano" por não ter assinatura ativa
    if (route.query.sem_plano_ativo === "1") {
      confirmSuccess(
        "Você não tem um plano ativo. Escolha um plano abaixo para assinar.",
        () => {
          router.replace({ path: "/payment", query: {} });
        },
      );
    }
    if (route.query.preco_nao_encontrado === "1") {
      confirmSuccess(
        "Plano selecionado não encontrado. Escolha um plano na lista abaixo.",
        () => {
          router.replace({ path: "/payment", query: {} });
        },
      );
    }

    // Só depois do check-email: carregar planos, Stripe, etc.
    await loadPlans();

    // Carregar contador de planos vitalícios
    await loadLifetimeCounter();

    // Verificar se a chave do Stripe está configurada
    if (!stripeKey || stripeKey === "undefined") {
      throw new Error("Chave do Stripe não configurada");
    }

    console.log(
      "🔑 Chave do Stripe encontrada:",
      stripeKey.substring(0, 20) + "...",
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
  background: #f9fafb;
}

.page-loading-email-validation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  color: #6b7280;
}
.page-loading-email-validation .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #e9742b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding-left: 24px;
  padding-right: 24px;
  box-sizing: border-box;
}

/* Header + botões na mesma linha (alinhado com o conteúdo abaixo) */
.header-with-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.header-with-actions .page-header-modern {
  margin-bottom: 0;
  flex: 1;
  min-width: 0;
}

.header-with-actions .billing-button-top {
  margin-bottom: 0;
  flex-shrink: 0;
  width: auto;
  max-width: none;
  margin-left: 0;
  margin-right: 0;
}

.page-header-left {
  text-align: left;
}

/* Header Moderno (tela de escolha de planos) */
.page-header-modern {
  text-align: center;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header-modern .main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #e9742b;
  margin-bottom: 8px;
  margin-top: 0;
}

.page-header-modern .main-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Botão Ver Faturamentos + Editar dados de faturamento (dentro de .header-with-actions ou sozinho) */
.billing-button-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.billing-edit-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: white;
  color: #374151;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e5e7eb;
  cursor: pointer;
  white-space: nowrap;
}

.billing-edit-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.billing-edit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.billing-edit-button .billing-icon {
  font-size: 1.25rem;
}

/* Botão Voltar */
.back-button-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}

.back-link-modern {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: white;
  color: #374151;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e5e7eb;
  cursor: pointer;
}

.back-link-modern:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.back-link-modern .back-icon {
  font-size: 1.25rem;
  font-weight: 700;
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.payment-method-section {
  display: flex;
  flex-direction: column;
}

.billing-link-modern {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  white-space: nowrap;
  width: auto;
  min-width: auto;
}

.billing-link-modern:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.billing-link-modern .billing-icon {
  font-size: 1.25rem;
}

.billing-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.billing-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.billing-icon {
  font-size: 1.2rem;
}

h1 {
  text-align: center;
  color: white;
  margin-bottom: 10px;
  margin-top: 0;
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
  margin-bottom: 10px;
  margin-top: 5px;
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.validation-loading,
.validation-success,
.validation-error {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: left;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.validation-success {
  border-color: #10b981;
  background: #f0fdf4;
}

.validation-success-discrete-fixed {
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #059669;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  backdrop-filter: blur(8px);
  opacity: 0.85;
  transition: opacity 0.3s ease;
}

.validation-success-discrete-fixed:hover {
  opacity: 1;
}

.validation-success-discrete-fixed .validation-icon-small {
  font-size: 0.75rem;
  opacity: 0.8;
}

.validation-error-discrete-fixed {
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #dc2626;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  backdrop-filter: blur(8px);
  opacity: 0.85;
  transition: opacity 0.3s ease;
}

.validation-error-discrete-fixed:hover {
  opacity: 1;
}

.validation-error-discrete-fixed .validation-icon-small {
  font-size: 0.75rem;
  opacity: 0.8;
}

.validation-icon-small {
  font-size: 1.2rem;
}

.validation-error {
  border-color: #ef4444;
  background: #fef2f2;
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
  gap: 12px;
  margin-bottom: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 16px 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
}

.toggle-label {
  color: #374151;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
  width: auto;
}

.toggle-buttons {
  display: flex;
  background: transparent;
  border-radius: 8px;
  padding: 0;
  position: relative;
  flex: 1;
  justify-content: center;
  gap: 8px;
}

.toggle-btn {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  min-width: 120px;
  margin: 0;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover:not(.active) {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #374151;
}

.toggle-btn.auto-selected {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  border: 2px solid #10b981;
}

.toggle-btn.auto-selected.active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.auto-selected-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
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
  padding: 40px 20px;
  color: #6b7280;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.refreshing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 12px 20px;
  border-radius: 8px;
  margin: 0 auto 20px;
  max-width: 1200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-size: 0.95rem;
  justify-content: center;
  max-width: 360px;
}

.mini-spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-feedback {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px 20px;
  color: #991b1b;
  text-align: center;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.error-feedback p {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
}

.empty-plans-state {
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  color: #6b7280;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-plans-state p {
  margin: 0 0 15px 0;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
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
  background: white;
  padding: 16px;
  margin: 20px 0;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #1f2937;
}

.debug-info p {
  margin: 5px 0;
  text-align: left;
  color: #6b7280;
}

/* Container de Planos Moderno */
.plans-container-modern {
  margin-bottom: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 0;
}

/* Grid Horizontal de Planos */
.plans-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  align-items: stretch;
  max-width: 100%;
}

/* Card de Plano Moderno */
.plan-card-modern {
  background: white;
  border-radius: 12px;
  padding: 24px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
}

.plan-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.plan-card-modern.selected {
  border-width: 2px;
  transform: translateY(-4px);
}

.plan-card-modern.plan-trial {
  border-color: #e9742b;
}

.plan-card-modern.plan-trial.selected {
  box-shadow: 0 8px 24px rgba(233, 116, 43, 0.25);
}

.plan-card-modern.plan-pro {
  border-color: #3b82f6;
}

.plan-card-modern.plan-pro.selected {
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
}

.plan-card-modern.plan-clubers {
  border-color: #10b981;
}

.plan-card-modern.plan-clubers.selected {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
}

.plan-card-modern.plan-lifetime {
  border-color: #2563eb;
}

.plan-card-modern.plan-lifetime.selected {
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
}

.plan-card-modern.plan-active {
  border-color: #10b981;
  border-width: 3px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
  cursor: default;
}

.plan-card-modern.plan-active:hover {
  transform: none;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.plan-card-modern.plan-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Badge no topo direito */
.plan-badges-container {
  position: relative;
  width: 100%;
  min-height: 40px;
  margin-bottom: 8px;
}

.plan-badge-left {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
}

.plan-badge-left .badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.plan-badge-top {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.plan-badge-top .badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.plan-badge-top .badge-trial {
  background: #e9742b;
}

.plan-badge-top .badge-pro {
  background: #3b82f6;
}

.plan-badge-top .badge-clubers {
  background: #10b981;
}

.plan-badge-top .badge-lifetime {
  background: #2563eb;
}

.plan-badge-left .badge-active,
.plan-badge-top .badge-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

/* Ícone do Plano */
.plan-icon {
  display: flex;
  justify-content: center;
  margin: 16px 0 12px;
}

/* Nome do Plano */
.plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin: 0 0 12px;
}

.plan-description {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
  margin: 0 0 16px;
  line-height: 1.5;
  font-style: italic;
}

/* Preço Moderno */
.plan-price-modern {
  text-align: center;
  margin-bottom: 12px;
}

.plan-price-modern .price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.plan-price-modern .price-period {
  font-size: 1rem;
  color: #6b7280;
  display: block;
}

.plan-price-modern .price-lifetime,
.plan-price-modern .price-yearly {
  font-size: 0.875rem;
  color: #6b7280;
  display: block;
  margin-top: 4px;
}

/* Duração */
.plan-duration {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 24px;
}

/* Features Modernas */
.plan-features-modern {
  flex-grow: 1;
  margin-bottom: 16px;
}

.plan-features-modern .feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 0.875rem;
  color: #374151;
}

/* Notas Especiais */
.plan-special-notes {
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.plan-special-notes .special-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.plan-special-notes .special-note:last-child {
  margin-bottom: 0;
}

/* Disponibilidade Vitalícia */
.lifetime-availability-modern {
  margin-bottom: 16px;
  padding-top: 12px;
}

.lifetime-availability-modern .availability-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.lifetime-availability-modern .progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.lifetime-availability-modern .progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.lifetime-availability-modern .progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 60px;
  text-align: right;
}

.lifetime-availability-modern .availability-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Botão Moderno */
.plan-button-modern {
  width: 100%;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: auto;
}

.plan-button-modern.button-trial {
  background: #e9742b;
  color: white;
}

.plan-button-modern.button-trial:hover {
  background: #d4631f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.3);
}

.plan-button-modern.button-pro {
  background: #3b82f6;
  color: white;
}

.plan-button-modern.button-pro:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.plan-button-modern.button-clubers {
  background: #10b981;
  color: white;
}

.plan-button-modern.button-clubers:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.plan-button-modern.button-lifetime {
  background: #2563eb;
  color: white;
}

.plan-button-modern.button-lifetime:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.plan-button-modern.button-active {
  background: #10b981;
  color: white;
  cursor: default;
}

.plan-button-modern.button-active:hover {
  transform: none;
  box-shadow: none;
}

.plan-button-modern.disabled,
.plan-button-modern:disabled {
  background: #e5e7eb !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.7;
  pointer-events: none;
}

.plan-button-modern.button-active.disabled,
.plan-button-modern.button-active:disabled {
  background: #d1fae5 !important;
  color: #065f46 !important;
  border: 2px solid #10b981;
}

.plan-button-modern.disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Animações de Upgrade */
.plan-card.upgrade-plan {
  border: 3px solid #f59e0b;
  background: linear-gradient(135deg, #fff7ed, #ffffff);
}

.plan-card.upgrade-high {
  animation: upgradePulseHigh 2s ease-in-out infinite;
  box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
}

.plan-card.upgrade-medium {
  animation: upgradePulseMedium 3s ease-in-out infinite;
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.3);
}

.plan-card.upgrade-low {
  animation: upgradePulseLow 4s ease-in-out infinite;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
}

@keyframes upgradePulseHigh {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 20px 45px rgba(245, 158, 11, 0.6);
  }
}

@keyframes upgradePulseMedium {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 12px 30px rgba(245, 158, 11, 0.3);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 18px 40px rgba(245, 158, 11, 0.5);
  }
}

@keyframes upgradePulseLow {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
  }
  50% {
    transform: scale(1.005);
    box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
  }
}

/* Badge de Upgrade Disponível */
.upgrade-available-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 10;
  animation: upgradeBadgeGlow 2s ease-in-out infinite alternate;
}

.upgrade-available-badge.upgrade-high {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.6);
  animation: upgradeBadgeGlowHigh 1.5s ease-in-out infinite alternate;
}

.upgrade-available-badge.upgrade-medium {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  animation: upgradeBadgeGlowMedium 2s ease-in-out infinite alternate;
}

.upgrade-available-badge.upgrade-low {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  animation: upgradeBadgeGlowLow 2.5s ease-in-out infinite alternate;
}

@keyframes upgradeBadgeGlowHigh {
  0% {
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.6);
    transform: translateX(-50%) scale(1);
  }
  100% {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.8);
    transform: translateX(-50%) scale(1.05);
  }
}

@keyframes upgradeBadgeGlowMedium {
  0% {
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    transform: translateX(-50%) scale(1);
  }
  100% {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
    transform: translateX(-50%) scale(1.03);
  }
}

@keyframes upgradeBadgeGlowLow {
  0% {
    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
    transform: translateX(-50%) scale(1);
  }
  100% {
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
    transform: translateX(-50%) scale(1.02);
  }
}

.upgrade-icon {
  font-size: 1.1rem;
  animation: upgradeIconSpin 2s linear infinite;
}

@keyframes upgradeIconSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.upgrade-text {
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

.plan-limits {
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.limits-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 12px 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.limit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  text-align: center;
  min-height: 80px;
}

.limit-icon {
  font-size: 2rem;
  flex-shrink: 0;
  text-align: center;
  margin-bottom: 4px;
}

.limit-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.limit-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
}

.limit-value {
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
  text-align: center;
  word-break: break-word;
}

/* Disponibilidade do Plano Vitalício */
.lifetime-availability {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.lifetime-availability.availability-success {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
}

.lifetime-availability.availability-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #f59e0b;
  animation: pulse-glow 2s ease-in-out infinite;
}

.lifetime-availability.availability-danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.availability-icon {
  font-size: 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.availability-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.availability-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.availability-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #333;
  line-height: 1.3;
}

.availability-success .availability-value {
  color: #059669;
}

.availability-warning .availability-value {
  color: #d97706;
}

.availability-danger .availability-value {
  color: #dc2626;
}

.offer-floating-badge {
  position: absolute;
  top: -31px;
  right: 9px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 15;
  border: 2px solid #ffffff;
  animation: offerPulse 2s ease-in-out infinite;
  min-width: 180px;
}

@keyframes offerPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(245, 158, 11, 0.6);
  }
}

.offer-badge-icon {
  font-size: 2rem;
  flex-shrink: 0;
  animation: offerIconBounce 2s ease-in-out infinite;
}

@keyframes offerIconBounce {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-3px) rotate(-5deg);
  }
  75% {
    transform: translateY(-3px) rotate(5deg);
  }
}

.offer-badge-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.offer-badge-label {
  font-size: 0.65rem;
  color: #78350f;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.offer-badge-value {
  font-size: 0.85rem;
  color: #78350f;
  font-weight: 800;
  line-height: 1.2;
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
  left: 20px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  z-index: 10;
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

.purchased-lifetime-badge {
  position: absolute;
  top: -15px;
  right: 20px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  z-index: 10;
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
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
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

.subscribe-button.swap-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.subscribe-button.swap-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 12px 35px rgba(245, 158, 11, 0.6);
}

.subscription-result {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 32px;
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
  opacity: 1;
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

.plan-button.active-plan.disabled,
.plan-button.purchased-lifetime.disabled {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  opacity: 1;
}

.plan-button.disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.plan-button.purchased-lifetime {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
}

.plan-button .lifetime-purchased-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.9rem;
}

.plan-button .purchase-date {
  font-size: 0.75rem;
  opacity: 0.85;
}

.plan-button.purchased-lifetime:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

/* Estilos de troca removidos - agora usamos o botão principal */

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

/* Container do plano ativo e método de pagamento */
.active-plan-container {
  display: grid;
  gap: 20px;
  margin-bottom: 32px;
  align-items: stretch;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 0;
}

/* Grid quando tiver método de pagamento */
.active-plan-container:has(.payment-method-section) {
  grid-template-columns: 1fr 0.75fr;
}

/* Centralizar quando NÃO tiver método de pagamento (plano free) */
.active-plan-container:not(:has(.payment-method-section)) {
  grid-template-columns: 1fr;
  max-width: 800px;
  justify-items: center;
  place-items: center;
}

/* Garantir centralização quando só tem active-plan-section (plano free) */
.active-plan-container:has(.active-plan-section):not(
    :has(.payment-method-section)
  )
  .active-plan-section {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
}

.active-plan-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.active-plan-section > * {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.payment-method-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.payment-method-section > *:not(.billing-button-wrapper) {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* Alinhar padding do PaymentMethodCard com ActivePlanChecker */
.payment-method-section :deep(.payment-method-card) {
  padding: 30px !important;
}

/* Garantir que ActivePlanChecker também tenha padding consistente */
.active-plan-section :deep(.active-plan) {
  padding: 30px !important;
}

.active-plan-info {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 0.95rem;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.active-plan-label {
  font-weight: 600;
  opacity: 0.85;
}

.active-plan-name {
  font-weight: 700;
}

/* Responsividade */
@media (max-width: 1024px) {
  .active-plan-container {
    grid-template-columns: 1fr;
  }
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

  .auto-selected-badge {
    font-size: 0.6rem;
    padding: 1px 4px;
    top: -6px;
    left: -6px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .plan-card {
    padding: 20px;
    min-height: auto;
  }

  .plan-limits {
    padding: 12px;
    margin-bottom: 15px;
  }

  .limits-title {
    font-size: 0.8rem;
    margin-bottom: 10px;
  }

  .limits-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .offer-floating-badge {
    top: -15px;
    right: 10px;
    padding: 10px 12px;
    min-width: 150px;
  }

  .offer-badge-icon {
    font-size: 1.5rem;
  }

  .offer-badge-label {
    font-size: 0.6rem;
  }

  .offer-badge-value {
    font-size: 0.75rem;
  }

  .limit-item {
    gap: 6px;
    padding: 10px 4px;
    min-height: 70px;
  }

  .limit-icon {
    font-size: 1.5rem;
    margin-bottom: 2px;
  }

  .limit-label {
    font-size: 0.65rem;
  }

  .limit-value {
    font-size: 0.75rem;
  }

  /* Animações responsivas de upgrade */
  .plan-card.upgrade-high {
    animation: upgradePulseHighMobile 2.5s ease-in-out infinite;
  }

  .plan-card.upgrade-medium {
    animation: upgradePulseMediumMobile 3.5s ease-in-out infinite;
  }

  .plan-card.upgrade-low {
    animation: upgradePulseLowMobile 4.5s ease-in-out infinite;
  }

  @keyframes upgradePulseHighMobile {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 12px 30px rgba(245, 158, 11, 0.3);
    }
    50% {
      transform: scale(1.01);
      box-shadow: 0 15px 35px rgba(245, 158, 11, 0.5);
    }
  }

  @keyframes upgradePulseMediumMobile {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);
    }
    50% {
      transform: scale(1.005);
      box-shadow: 0 12px 30px rgba(245, 158, 11, 0.4);
    }
  }

  @keyframes upgradePulseLowMobile {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.15);
    }
    50% {
      transform: scale(1.002);
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
    }
  }

  .upgrade-available-badge {
    font-size: 0.8rem;
    padding: 6px 16px;
  }

  .upgrade-icon {
    font-size: 1rem;
  }

  .subscribe-button {
    min-width: 100%;
    padding: 16px 24px;
  }

  h1 {
    font-size: 2rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content h1,
  .header-content p {
    text-align: center;
  }

  /* Responsivo para layout moderno */
  .page-header-modern .main-title {
    font-size: 2rem;
  }

  .page-header-modern .main-subtitle {
    font-size: 1rem;
  }

  .payment-method-section .billing-button-wrapper,
  .billing-button-standalone {
    justify-content: flex-start;
  }

  .plans-grid-modern {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .plan-card-modern {
    padding: 20px 24px;
    min-height: auto;
  }

  .plan-price-modern .price-amount {
    font-size: 2rem;
  }

  .plan-icon {
    margin: 16px 0 12px;
  }

  .plan-icon va-icon {
    font-size: 36px !important;
  }

  .plan-name {
    font-size: 1.25rem;
  }
}
</style>
