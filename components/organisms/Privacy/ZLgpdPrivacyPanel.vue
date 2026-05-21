<template>
  <div class="lgpd-privacy-panel">
    <div class="lgpd-privacy-panel__card">
      <div v-show="validationLoading" class="lgpd-privacy-panel__state">
        <va-progress-circle indeterminate size="small" />
        <span class="lgpd-privacy-panel__loading-text">Validando permissões…</span>
      </div>

      <div
        v-show="!validationLoading && isAccountOwner"
        class="lgpd-privacy-panel__state"
      >
        <va-icon name="info" size="28px" color="#ea580c" class="lgpd-privacy-panel__icon" />
        <h2 class="lgpd-privacy-panel__title">Titular da conta</h2>
        <p class="lgpd-privacy-panel__text">
          Como titular (mesmo e-mail da assinatura), a exclusão completa do clube e da
          conta central deve ser feita em
          <NuxtLink to="/account" class="lgpd-privacy-panel__link">Minha conta</NuxtLink>.
        </p>
        <va-button color="primary" to="/account" class="lgpd-privacy-panel__cta">
          Ir para Minha conta
        </va-button>
      </div>

      <div
        v-show="!validationLoading && !isAccountOwner"
        class="lgpd-privacy-panel__state"
      >
        <va-icon name="privacy_tip" size="28px" color="#dc2626" class="lgpd-privacy-panel__icon" />
        <h2 class="lgpd-privacy-panel__title">Exclusão dos seus dados no clube</h2>
        <p class="lgpd-privacy-panel__text">
          Anonimiza seu perfil, credenciais e dados sensíveis neste clube. Histórico
          esportivo pode permanecer desidentificado.
        </p>
        <p class="lgpd-privacy-panel__hint">
          Não altera faturamento na conta VolleyTrack. O titular da assinatura encerra
          o clube em
          <NuxtLink to="/account" class="lgpd-privacy-panel__link">Minha conta</NuxtLink>.
        </p>
        <p class="lgpd-privacy-panel__legal">
          <a :href="privacyPolicyUrl" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
          <span class="lgpd-privacy-panel__legal-sep">·</span>
          <a :href="termsOfUseUrl" target="_blank" rel="noopener noreferrer">Termos de Uso</a>
        </p>
        <va-button
          color="danger"
          class="lgpd-privacy-panel__cta"
          :disabled="validationLoading"
          @click="openDeletionModal"
        >
          Solicitar exclusão dos meus dados
        </va-button>
      </div>
    </div>

    <ZModal
      v-model="deletionModalOpen"
      title="Confirmar exclusão de dados no clube"
      ok-text="Confirmar solicitação"
      cancel-text="Cancelar"
      :ok-disabled="!canSubmit"
      :loading="isSubmitting"
      @ok="onConfirmDeletion"
      @cancel="closeDeletionModal"
    >
      <p class="lgpd-deletion-modal__intro">
        Digite sua senha para confirmar. Esta operação é irreversível para seus dados
        pessoais neste clube.
      </p>
      <label class="lgpd-deletion-modal__checkbox">
        <input v-model="hasAgreed" type="checkbox" class="lgpd-deletion-modal__input" />
        <span>
          Entendo que meus dados pessoais serão anonimizados e que não poderei acessar
          esta conta com as mesmas credenciais.
        </span>
      </label>
      <va-input
        v-model="password"
        type="password"
        label="Senha atual"
        class="lgpd-deletion-modal__password"
        :disabled="isSubmitting"
      />
    </ZModal>
  </div>
</template>

<script setup>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import { useCustomerAccountOwner } from "~/composables/useCustomerAccountOwner";
import { useLgpdDeletion } from "~/composables/useLgpdDeletion";
import { confirmError, confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

const config = useRuntimeConfig();

const privacyPolicyUrl = computed(() => {
  const url = String(config.public.privacyPolicyUrl ?? "").trim();
  return url || "https://volleytrack.com/privacy-policy";
});

const termsOfUseUrl = computed(() => {
  const url = String(config.public.termsOfUseUrl ?? "").trim();
  return url || "https://volleytrack.com/terms-of-use";
});

const {
  validationLoading,
  isAccountOwner,
  validateCustomerAccountOwner,
} = useCustomerAccountOwner();

const { isSubmitting, requestTenantDeletion, logoutAfterDeletion } =
  useLgpdDeletion();

const deletionModalOpen = ref(false);
const hasAgreed = ref(false);
const password = ref("");

const canSubmit = computed(
  () =>
    hasAgreed.value &&
    password.value.length > 0 &&
    !isSubmitting.value &&
    !validationLoading.value,
);

onMounted(() => {
  validateCustomerAccountOwner();
});

const openDeletionModal = () => {
  if (validationLoading.value || isAccountOwner.value) {
    return;
  }

  hasAgreed.value = false;
  password.value = "";
  deletionModalOpen.value = true;
};

const closeDeletionModal = () => {
  deletionModalOpen.value = false;
};

const onConfirmDeletion = async () => {
  if (!canSubmit.value) {
    return;
  }

  try {
    const result = await requestTenantDeletion(password.value);

    if (result?.success) {
      closeDeletionModal();
      await confirmSuccess(result.message || "Solicitação processada.", () => {
        logoutAfterDeletion();
      });
    }
  } catch (error) {
    const message =
      error?.graphQLErrors?.[0]?.message ||
      error?.message ||
      "Não foi possível processar a solicitação. Tente novamente.";
    confirmError(message);
  }
};
</script>

<style scoped>
.lgpd-privacy-panel {
  width: 100%;
  max-width: 480px;
}

.lgpd-privacy-panel__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.lgpd-privacy-panel__state {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.lgpd-privacy-panel__icon {
  flex-shrink: 0;
}

.lgpd-privacy-panel__loading-text {
  font-size: 14px;
  color: #6b7280;
}

.lgpd-privacy-panel__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.35;
}

.lgpd-privacy-panel__text,
.lgpd-privacy-panel__hint {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: #4b5563;
}

.lgpd-privacy-panel__legal {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #6b7280;
}

.lgpd-privacy-panel__legal a {
  color: #ff4e1b;
  text-decoration: underline;
}

.lgpd-privacy-panel__legal a:hover {
  color: #e04518;
}

.lgpd-privacy-panel__legal-sep {
  margin: 0 6px;
}

.lgpd-privacy-panel__link {
  color: #ff4e1b;
  font-weight: 500;
  text-decoration: underline;
}

.lgpd-privacy-panel__cta {
  margin-top: 8px;
  align-self: flex-start;
}

.lgpd-deletion-modal__intro {
  margin: 0 0 16px;
  color: #374151;
  font-size: 15px;
  line-height: 1.5;
}

.lgpd-deletion-modal__checkbox {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.45;
  color: #374151;
  cursor: pointer;
}

.lgpd-deletion-modal__input {
  flex-shrink: 0;
  margin-top: 3px;
}

.lgpd-deletion-modal__password {
  width: 100%;
}
</style>
