<template>
  <div class="account-summary">
    <header class="account-summary-intro">
      <h1 class="account-summary-title">Minha conta</h1>
      <p class="account-summary-subtitle">
        Resumo das suas informações no VolleyTrack
      </p>
    </header>

    <div v-if="loading" class="account-summary-loading">
      <va-progress-circle indeterminate />
      <span>Carregando dados…</span>
    </div>

    <div v-else-if="!user" class="account-summary-empty">
      <p>Não foi possível carregar o perfil.</p>
      <va-button color="primary" @click="getUser">Tentar novamente</va-button>
    </div>

    <div
      v-else
      class="account-summary-grid"
      :class="{ 'account-summary-grid--with-lgpd': showLgpdSection }"
    >
      <!-- Meus dados: cabeçalho + resumo (ícone + texto à esquerda) -->
      <section class="account-card account-card--meus-dados">
        <div class="meus-dados-header">
          <h2 class="meus-dados-title">Meus dados</h2>
          <NuxtLink
            to="/account/edit"
            class="meus-dados-edit"
            aria-label="Editar dados"
          >
            <va-icon name="edit" size="20px" color="#6b7280" />
          </NuxtLink>
        </div>

        <ul class="meus-dados-list">
          <li class="meus-dados-row">
            <va-icon name="person" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{ user.name || "—" }}</span>
          </li>
          <li class="meus-dados-row">
            <va-icon name="text_fields" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{
              user.information?.nickname || "—"
            }}</span>
          </li>
          <li class="meus-dados-row">
            <va-icon name="visibility" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{
              user.information?.showNickname ? "Sim" : "Não"
            }}</span>
          </li>
          <li class="meus-dados-row meus-dados-row--spaced">
            <va-icon name="email" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{ user.email || "—" }}</span>
          </li>
          <li class="meus-dados-row">
            <va-icon name="smartphone" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{
              formatPhone(user.information?.phone)
            }}</span>
          </li>
          <li class="meus-dados-row">
            <va-icon name="event" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{
              formatBirthDate(user.information?.birthDate)
            }}</span>
          </li>
          <li class="meus-dados-row">
            <va-icon name="assignment_ind" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{
              formatCpf(user.information?.cpf)
            }}</span>
          </li>
          <li class="meus-dados-row">
            <va-icon name="article" size="20px" color="#9ca3af" />
            <span class="meus-dados-value">{{
              formatRg(user.information?.rg)
            }}</span>
          </li>
        </ul>
      </section>

      <!-- Pagamentos (plano + cartão; detalhe em /payment) -->
      <section class="account-card account-card--pagamentos">
        <div class="meus-dados-header">
          <h2 class="meus-dados-title">Pagamentos</h2>
          <NuxtLink
            to="/payment"
            class="meus-dados-edit"
            aria-label="Gerenciar pagamentos"
          >
            <va-icon name="edit" size="20px" color="#6b7280" />
          </NuxtLink>
        </div>

        <div v-if="paymentLoading" class="payment-card-loading">
          <va-progress-circle indeterminate size="small" />
          <span>Carregando…</span>
        </div>

        <template v-else>
          <!-- Cartão visual (referência Payment Methods) -->
          <div
            class="payment-cc-card"
            :class="{ 'payment-cc-card--empty': !hasPaymentCard }"
            aria-hidden="true"
          >
            <div class="payment-cc-card__shine" />
            <div class="payment-cc-card__top">
              <span class="payment-cc-card__chip" />
              <span class="payment-cc-card__brand">{{
                paymentCardBrandUpper
              }}</span>
            </div>
            <p class="payment-cc-card__number">{{ paymentCardNumberMasked }}</p>
            <div class="payment-cc-card__bottom">
              <div class="payment-cc-card__holder-block">
                <span class="payment-cc-card__k">CARD HOLDER</span>
                <span class="payment-cc-card__v">{{
                  paymentCardHolderVisual
                }}</span>
              </div>
              <div class="payment-cc-card__expire-block">
                <span class="payment-cc-card__k">VALIDADE</span>
                <span class="payment-cc-card__v">{{
                  paymentCardExpiryShort
                }}</span>
              </div>
            </div>
          </div>

          <!-- Resumo: rótulo (cinza) | valor — sem linhas entre linhas -->
          <dl class="payment-kv">
            <div class="payment-kv-row">
              <dt>Plano</dt>
              <dd>{{ paymentPlanTitle }}</dd>
            </div>
            <div class="payment-kv-row">
              <dt>Situação</dt>
              <dd>{{ paymentStatusText }}</dd>
            </div>
            <div class="payment-kv-row">
              <dt>Renovação / fim do período</dt>
              <dd>{{ paymentPeriodEndText }}</dd>
            </div>
            <div class="payment-kv-row">
              <dt>Tipo do cartão</dt>
              <dd>{{ paymentCardBrandUpper }}</dd>
            </div>
            <div class="payment-kv-row">
              <dt>Portador</dt>
              <dd>{{ paymentCardHolderName }}</dd>
            </div>
            <div class="payment-kv-row">
              <dt>Validade</dt>
              <dd>{{ paymentCardExpiryText }}</dd>
            </div>
            <div class="payment-kv-row">
              <dt>Número</dt>
              <dd>{{ paymentCardNumberMasked }}</dd>
            </div>
          </dl>
        </template>
      </section>

      <!-- Funções / sistema -->
      <section class="account-card account-card--tall">
        <div class="meus-dados-header">
          <h2 class="meus-dados-title">Funções, times e posições</h2>
          <NuxtLink
            to="/account/edit"
            class="meus-dados-edit"
            aria-label="Editar funções e times"
          >
            <va-icon name="edit" size="20px" color="#6b7280" />
          </NuxtLink>
        </div>
        <dl class="account-dl account-dl--plain">
          <div class="account-dl-row account-dl-row--block">
            <dt>Funções no sistema</dt>
            <dd>{{ joinNames(user.roles) }}</dd>
          </div>
          <div class="account-dl-row account-dl-row--block">
            <dt>Times</dt>
            <dd>{{ joinTeamNames(user.teams) }}</dd>
          </div>
          <div class="account-dl-row account-dl-row--block">
            <dt>Posições</dt>
            <dd>{{ joinNames(user.positions) }}</dd>
          </div>
        </dl>
        <div class="account-hint">
          <va-icon name="info" size="18px" color="#9ca3af" />
          <span
            >Para alterar dados sensíveis ou permissões, use
            <strong>Editar</strong>.</span
          >
        </div>
      </section>

      <section v-if="showLgpdSection" class="account-card account-card--lgpd">
        <div class="meus-dados-header">
          <h2 class="meus-dados-title">Privacidade e exclusão de conta</h2>
        </div>
        <div v-if="accountOwnerValidationLoading" class="account-lgpd-card__body">
          <p class="account-lgpd-card__hint">Validando titular da conta…</p>
        </div>
        <div v-else class="account-lgpd-card__body">
          <template v-if="isAccountOwner">
            <p class="account-lgpd-card__text">
              Como titular da assinatura, você pode excluir sua conta central e
              encerrar o clube por completo: anonimização dos dados pessoais,
              tratamento do faturamento e remoção do ambiente do clube, conforme a
              LGPD.
            </p>
            <p class="account-lgpd-card__hint">
              Operação irreversível. Confirme com a senha do login do clube.
            </p>
            <va-button
              color="danger"
              size="small"
              class="account-lgpd-card__button"
              :loading="lgpdCentralSubmitting"
              @click="openLgpdCentralModal"
            >
              Excluir conta e encerrar clube
            </va-button>
          </template>
          <template v-else>
            <p class="account-lgpd-card__text">
              Para excluir sua conta neste clube (perfil, acesso e dados
              pessoais), use a página de privacidade. O tratamento segue a LGPD.
            </p>
            <p class="account-lgpd-card__hint">
              Exclusão da conta central e encerramento do clube são exclusivos do
              titular da assinatura.
            </p>
            <va-button
              color="danger"
              size="small"
              preset="secondary"
              class="account-lgpd-card__button"
              to="/settings/privacy"
            >
              Excluir minha conta no clube
            </va-button>
          </template>
        </div>
      </section>
    </div>

    <ZModal
      v-if="isAccountOwner"
      v-model="lgpdCentralModalOpen"
      title="Confirmar exclusão da conta e do clube"
      ok-text="Confirmar exclusão"
      cancel-text="Cancelar"
      :ok-disabled="!lgpdCentralCanSubmit"
      :loading="lgpdCentralSubmitting"
      @ok="confirmCentralLgpdDeletion"
      @cancel="closeLgpdCentralModal"
    >
      <p class="account-lgpd-modal__intro">
        Digite sua senha para confirmar a exclusão da sua conta central e o
        encerramento do clube. Seus dados pessoais identificáveis serão
        anonimizados ou eliminados conforme a LGPD; o ambiente do clube será
        removido do sistema. Esta ação é irreversível.
      </p>
      <label class="account-lgpd-modal__checkbox">
        <input v-model="lgpdCentralAgreed" type="checkbox" />
        <span>
          Entendo que estou excluindo minha conta central, que o clube será
          encerrado e que não poderei acessar o sistema com as mesmas credenciais.
        </span>
      </label>
      <va-input
        v-model="lgpdCentralPassword"
        type="password"
        label="Senha atual"
        class="account-lgpd-modal__password"
        :disabled="lgpdCentralSubmitting"
      />
    </ZModal>
  </div>
</template>

<script>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import PLAYER from "~/graphql/user/query/user.graphql";
import { useCustomerAccountOwner } from "~/composables/useCustomerAccountOwner";
import {
  getLgpdCentralErrorMessage,
  useLgpdDeletion,
} from "~/composables/useLgpdDeletion";
import { confirmError, confirmSuccess } from "~/utils/sweetAlert2/swalHelper";
import moment from "moment";
import {
  formatCPF,
  formatPhoneOnType,
  formatRG,
} from "~/utils/formatting/formatHelper";
import { getActivePlan } from "~/services/stripeCheckoutService.js";
import { getApiBaseUrl } from "~/utils/apiBaseUrl";

export default {
  components: { ZModal },
  data() {
    return {
      user: null,
      loading: true,
      lgpdCentralModalOpen: false,
      lgpdCentralAgreed: false,
      lgpdCentralPassword: "",
      lgpdCentralSubmitting: false,
      isAccountOwner: false,
      accountOwnerValidationLoading: false,
      accountOwnerValidationReady: false,
      accountOwnerCustomerId: null,
      variablesGetUser: {
        id: localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).id
          : null,
      },
      paymentLoading: true,
      activePlanData: null,
      defaultPaymentMethod: null,
    };
  },
  computed: {
    paymentPlanTitle() {
      const name = this.activePlanData?.product?.name?.trim();
      if (name) {
        return name;
      }
      if (this.activePlanData?.isTrial) {
        return "Período de teste";
      }
      if (!this.activePlanData) {
        return "—";
      }
      return "Sem plano ativo";
    },
    paymentStatusText() {
      if (!this.activePlanData) {
        return "—";
      }
      if (this.activePlanData.isTrial) {
        return "Período de teste";
      }
      const s = this.activePlanData.subscription?.status;
      return this.formatSubStatus(s);
    },
    paymentPeriodEndText() {
      if (!this.activePlanData) {
        return "—";
      }
      if (
        this.activePlanData.isTrial &&
        this.activePlanData.trial_info?.trial_ends_at
      ) {
        return this.formatPlanDate(
          this.activePlanData.trial_info.trial_ends_at,
        );
      }
      const end = this.activePlanData.subscription?.current_period_end;
      return this.formatPlanDate(end);
    },
    paymentCardExpiryText() {
      const m = this.defaultPaymentMethod;
      if (!m?.card) {
        return "—";
      }
      const mo = String(m.card.exp_month).padStart(2, "0");
      return `${mo}/${m.card.exp_year}`;
    },
    hasPaymentCard() {
      return Boolean(this.defaultPaymentMethod?.card?.last4);
    },
    paymentCardNumberMasked() {
      const m = this.defaultPaymentMethod;
      if (!m?.card?.last4) {
        return "•••• •••• •••• ••••";
      }
      return `•••• •••• •••• ${m.card.last4}`;
    },
    paymentCardBrandUpper() {
      const m = this.defaultPaymentMethod;
      if (!m?.card?.brand) {
        return "—";
      }
      return String(m.card.brand).toUpperCase();
    },
    paymentCardExpiryShort() {
      const m = this.defaultPaymentMethod;
      if (!m?.card) {
        return "—/—";
      }
      const mo = String(m.card.exp_month).padStart(2, "0");
      const yy = String(m.card.exp_year).slice(-2);
      return `${mo}/${yy}`;
    },
    paymentCardHolderName() {
      const m = this.defaultPaymentMethod;
      const n =
        m?.billing_details?.name?.trim() || this.user?.name?.trim() || "";
      return n || "—";
    },
    paymentCardHolderVisual() {
      const n = this.paymentCardHolderName;
      if (!n || n === "—") {
        return "—";
      }
      return n.toUpperCase();
    },
    lgpdCentralCanSubmit() {
      return (
        this.lgpdCentralAgreed &&
        this.lgpdCentralPassword.length > 0 &&
        !this.lgpdCentralSubmitting
      );
    },
    showLgpdSection() {
      return Boolean(this.user) && this.accountOwnerValidationReady;
    },
  },
  async mounted() {
    this.getUser();
    await Promise.all([this.loadPaymentInfo(), this.validateAccountOwner()]);
  },
  methods: {
    getUser() {
      if (!this.variablesGetUser.id) {
        this.loading = false;
        return;
      }

      this.loading = true;

      const query = gql`
        ${PLAYER}
      `;

      const consult = { ...this.variablesGetUser };

      const {
        result: { value },
      } = useQuery(query, consult);

      if (value?.user) {
        this.user = value.user;
      }

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.user) {
          this.user = result.data.user;
        }
        this.loading = false;
      });
    },
    async validateAccountOwner() {
      this.accountOwnerValidationLoading = true;
      const { validateCustomerAccountOwner } = useCustomerAccountOwner();

      try {
        const result = await validateCustomerAccountOwner();
        this.isAccountOwner = Boolean(result?.isOwner);
        this.accountOwnerCustomerId = result?.customer?.id ?? null;
      } catch {
        this.isAccountOwner = false;
        this.accountOwnerCustomerId = null;
      } finally {
        this.accountOwnerValidationLoading = false;
        this.accountOwnerValidationReady = true;
      }
    },
    openLgpdCentralModal() {
      if (!this.isAccountOwner) {
        confirmError(
          "Seu usuário é inválido para excluir a conta central. Entre em contato com o suporte se for necessário rever isso.",
        );
        return;
      }

      this.lgpdCentralAgreed = false;
      this.lgpdCentralPassword = "";
      this.lgpdCentralModalOpen = true;
    },
    closeLgpdCentralModal() {
      this.lgpdCentralModalOpen = false;
    },
    async confirmCentralLgpdDeletion() {
      if (!this.lgpdCentralCanSubmit) {
        return;
      }

      if (!this.isAccountOwner) {
        confirmError(
          "Seu usuário é inválido para excluir a conta central. Entre em contato com o suporte se for necessário rever isso.",
        );
        return;
      }

      const customerId =
        this.accountOwnerCustomerId ?? this.activePlanData?.customer_id;

      if (!customerId) {
        confirmError(
          "Não foi possível identificar a conta de faturamento. Atualize a página ou entre em contato com o suporte.",
        );
        return;
      }

      this.lgpdCentralSubmitting = true;
      const { requestCentralDeletion, logoutAfterDeletion } = useLgpdDeletion();

      try {
        const result = await requestCentralDeletion(this.lgpdCentralPassword, {
          customerId,
          tenantId: localStorage.getItem("tenant_id"),
        });
        this.closeLgpdCentralModal();
        const tenantDeleted = Boolean(result?.tenant_deleted);
        await confirmSuccess(
          result?.message || "Conta excluída com sucesso.",
          () => {
            logoutAfterDeletion({ tenantDeleted });
          },
        );
      } catch (error) {
        confirmError(getLgpdCentralErrorMessage(error));
      } finally {
        this.lgpdCentralSubmitting = false;
      }
    },
    joinNames(list) {
      if (!Array.isArray(list) || list.length === 0) {
        return "—";
      }
      const names = list.map((item) => item?.name).filter(Boolean);
      return names.length ? names.join(" • ") : "—";
    },
    joinTeamNames(teams) {
      if (!Array.isArray(teams) || teams.length === 0) {
        return "—";
      }
      const names = teams.map((t) => t?.name).filter(Boolean);
      return names.length ? names.join(" • ") : "—";
    },
    formatBirthDate(raw) {
      if (!raw) {
        return "—";
      }
      const m = moment(raw);
      return m.isValid() ? m.format("DD/MM/YYYY") : "—";
    },
    formatCpf(cpf) {
      if (!cpf) {
        return "—";
      }
      const digits = String(cpf).replace(/\D/g, "");
      if (digits.length !== 11) {
        return cpf;
      }
      return formatCPF(digits);
    },
    formatRg(rg) {
      if (!rg) {
        return "—";
      }
      const digits = String(rg).replace(/\D/g, "");
      if (digits.length >= 7) {
        return formatRG(digits);
      }
      return rg;
    },
    formatPhone(phone) {
      if (!phone) {
        return "—";
      }
      const digits = String(phone).replace(/\D/g, "");
      return formatPhoneOnType(digits) || phone;
    },
    formatPlanDate(raw) {
      if (raw === null || raw === undefined || raw === "") {
        return "—";
      }
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) {
        return "—";
      }
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    formatSubStatus(status) {
      const map = {
        active: "Ativo",
        canceled: "Cancelada",
        incomplete: "Incompleta",
        incomplete_expired: "Expirada",
        past_due: "Em atraso",
        trialing: "Período de teste",
        unpaid: "Não paga",
      };
      return map[status] || status || "—";
    },
    async loadPaymentInfo() {
      this.paymentLoading = true;
      this.defaultPaymentMethod = null;
      try {
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("apollo:default.token");
        const tenantId = localStorage.getItem("tenant_id") || "default";
        if (!token) {
          this.activePlanData = null;
          return;
        }
        const result = await getActivePlan(token, tenantId);
        if (result.success && result.data) {
          let data = { ...result.data };
          if (!data.has_active_plan && data.trial_info) {
            data.isTrial = true;
          } else {
            data.isTrial = false;
          }
          this.activePlanData = data;
          const customerId = data.customer_id;
          if (customerId && !data.isTrial) {
            await this.fetchDefaultPaymentMethod(customerId);
          }
        } else {
          this.activePlanData = null;
        }
      } catch (e) {
        console.warn("account loadPaymentInfo", e);
        this.activePlanData = null;
      } finally {
        this.paymentLoading = false;
      }
    },
    async fetchDefaultPaymentMethod(customerId) {
      try {
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("apollo:default.token");
        if (!token) {
          return;
        }
        const res = await fetch(
          `${getApiBaseUrl()}/v1/customers/payment-methods?customer_id=${encodeURIComponent(
            customerId,
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        if (!json.success || !json.data?.payment_methods?.length) {
          return;
        }
        const methods = json.data.payment_methods;
        this.defaultPaymentMethod =
          methods.find((m) => m.is_default) || methods[0];
      } catch (e) {
        console.warn("fetchDefaultPaymentMethod", e);
      }
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Minha conta",
});
</script>

<style scoped>
.account-summary {
  max-width: 1200px;
  margin: 0 auto;
}

.account-summary-intro {
  margin-bottom: 24px;
}

.account-summary-title {
  margin: 0 0 8px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0b1e3a;
}

.account-summary-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
}

.account-summary-loading,
.account-summary-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 240px;
  color: #6b7280;
}

.account-summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.account-summary-grid--with-lgpd {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.9fr) minmax(
      0,
      0.95fr
    );
}

.account-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 22px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.account-card--meus-dados,
.account-card--pagamentos {
  padding: 0;
  overflow: hidden;
}

.payment-card-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 160px;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Cartão de crédito visual (referência) */
.payment-cc-card {
  position: relative;
  margin: 0 20px 0;
  padding: 22px 22px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #dc2626 0%, #ea580c 48%, #f97316 100%);
  color: #ffffff;
  box-shadow: 0 12px 32px rgba(220, 38, 38, 0.35);
  overflow: hidden;
}

.payment-cc-card--empty {
  opacity: 0.92;
  filter: saturate(0.92);
}

.payment-cc-card__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    118deg,
    transparent 35%,
    rgba(255, 255, 255, 0.14) 48%,
    transparent 62%
  );
  pointer-events: none;
}

.payment-cc-card__top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.payment-cc-card__chip {
  width: 44px;
  height: 32px;
  border-radius: 7px;
  background: linear-gradient(145deg, #fde68a, #d97706);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.payment-cc-card__brand {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.payment-cc-card__number {
  position: relative;
  margin: 0 0 28px;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  font-variant-numeric: tabular-nums;
  word-spacing: 0.15em;
}

.payment-cc-card__bottom {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.payment-cc-card__holder-block,
.payment-cc-card__expire-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.payment-cc-card__expire-block {
  text-align: right;
  flex-shrink: 0;
}

.payment-cc-card__k {
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  opacity: 0.85;
}

.payment-cc-card__v {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.2;
  word-break: break-word;
}

.payment-kv {
  margin: 20px 0 0;
  padding: 20px 20px 22px;
  border-top: 1px solid #f3f4f6;
}

.payment-kv-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
}

.payment-kv-row:first-child {
  padding-top: 0;
}

.payment-kv-row:last-child {
  padding-bottom: 0;
}

.payment-kv dt {
  margin: 0;
  flex: 0 1 48%;
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 500;
  line-height: 1.4;
}

.payment-kv dd {
  margin: 0;
  flex: 1;
  text-align: right;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
  word-break: break-word;
}

.meus-dados-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 12px;
}

.meus-dados-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #374151;
  letter-spacing: -0.01em;
}

.meus-dados-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.meus-dados-edit:hover {
  background-color: #f3f4f6;
  color: #ff4e1b;
}

/* Resumo: ícone + texto alinhados à esquerda */
.meus-dados-list {
  list-style: none;
  margin: 0;
  padding: 6px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meus-dados-row {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
  text-align: left;
}

.meus-dados-row :deep(.va-icon) {
  flex-shrink: 0;
  margin-top: 2px;
}

.meus-dados-value {
  flex: 1;
  min-width: 0;
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 400;
  color: #374151;
  line-height: 1.45;
  word-break: break-word;
}

.meus-dados-row--spaced {
  margin-top: 6px;
  padding-top: 10px;
}

.account-dl {
  margin: 0;
  padding: 0 20px 20px;
}

.account-dl--plain {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.account-dl-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 0;
}

.account-dl-row--block {
  flex-direction: column;
  gap: 6px;
}

.account-dl-row dt {
  margin: 0;
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 500;
}

.account-dl-row dd {
  margin: 0;
  font-size: 0.9375rem;
  color: #111827;
  text-align: right;
  max-width: 58%;
  word-break: break-word;
}

.account-dl-row--block dd {
  text-align: left;
  max-width: none;
}

.account-card--tall {
  padding: 0;
  overflow: hidden;
}

.account-card--tall .meus-dados-header {
  padding-bottom: 8px;
}

.account-card--lgpd {
  padding: 0;
  overflow: hidden;
}

.account-card--lgpd-central .meus-dados-header {
  padding-bottom: 8px;
}

.account-lgpd-card__body {
  padding: 0 20px 20px;
}

.account-lgpd-card__text,
.account-lgpd-card__hint {
  margin: 0 0 10px;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #4b5563;
}

.account-lgpd-card__hint {
  color: #6b7280;
}

.account-lgpd-card__button {
  margin-top: 4px;
  width: 100%;
}

.account-lgpd-modal__intro {
  margin: 0 0 16px;
  color: #374151;
  font-size: 15px;
  line-height: 1.5;
}

.account-lgpd-modal__checkbox {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.account-lgpd-modal__password {
  width: 100%;
}

.account-hint {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0 20px 20px;
  padding: 14px 0 0;
  border-top: 1px solid #f3f4f6;
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.45;
}

@media (max-width: 1100px) {
  .account-summary-grid,
  .account-summary-grid--with-lgpd {
    grid-template-columns: 1fr 1fr;
  }

  .account-card--meus-dados {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .account-summary-grid,
  .account-summary-grid--with-lgpd {
    grid-template-columns: 1fr;
  }

  .account-card--meus-dados {
    grid-column: auto;
  }

  .account-dl-row dd {
    max-width: 65%;
  }
}
</style>
