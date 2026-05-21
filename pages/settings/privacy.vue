<template>
  <div class="list-page-container privacy-page">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Privacidade e dados pessoais</h1>
          <p class="page-subtitle">
            Solicite a exclusão dos seus dados pessoais no clube, conforme a LGPD
          </p>
        </div>
      </div>
    </div>

    <section class="privacy-card">
      <h2 class="privacy-card__title">Exclusão de dados no clube</h2>
      <p class="privacy-card__text">
        Ao confirmar, seus dados pessoais identificáveis neste clube serão
        anonimizados e informações sensíveis serão removidas quando aplicável.
        Registros históricos de treinos e jogos podem permanecer de forma
        desidentificada, para preservar a integridade do sistema.
      </p>
      <p class="privacy-card__hint">
        Esta ação não remove automaticamente dados de faturamento na conta
        central VolleyTrack. Se você é titular da assinatura, conclua também a
        exclusão em
        <NuxtLink to="/account">Minha conta</NuxtLink>
        ou em Pagamentos.
      </p>

      <ZLegalLinks variant="light" class="privacy-card__links" />

      <va-button
        color="danger"
        class="privacy-card__button"
        :loading="isSubmitting"
        @click="openModal"
      >
        Solicitar exclusão dos meus dados
      </va-button>
    </section>

    <ZModal
      v-model="isModalOpen"
      title="Confirmar exclusão de dados"
      ok-text="Confirmar solicitação"
      cancel-text="Cancelar"
      :ok-disabled="!canSubmit"
      :loading="isSubmitting"
      @ok="onConfirm"
      @cancel="closeModal"
    >
      <p class="privacy-modal__intro">
        Digite sua senha para confirmar. Esta operação é irreversível para seus
        dados pessoais no clube.
      </p>

      <label class="privacy-modal__checkbox">
        <input v-model="hasAgreed" type="checkbox" />
        <span>
          Entendo que meus dados pessoais serão anonimizados e que não poderei
          acessar esta conta com as mesmas credenciais.
        </span>
      </label>

      <va-input
        v-model="password"
        type="password"
        label="Senha atual"
        class="privacy-modal__password"
        :disabled="isSubmitting"
      />
    </ZModal>
  </div>
</template>

<script setup>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ZLegalLinks from "~/components/organisms/Footer/ZLegalLinks.vue";
import { useLgpdDeletion } from "~/composables/useLgpdDeletion";
import { confirmError, confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

const isModalOpen = ref(false);
const hasAgreed = ref(false);
const password = ref("");

const { isSubmitting, requestTenantDeletion, logoutAfterDeletion } =
  useLgpdDeletion();

const canSubmit = computed(
  () => hasAgreed.value && password.value.length > 0 && !isSubmitting.value
);

const openModal = () => {
  hasAgreed.value = false;
  password.value = "";
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const onConfirm = async () => {
  if (!canSubmit.value) {
    return;
  }

  try {
    const result = await requestTenantDeletion(password.value);

    if (result?.success) {
      closeModal();
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
.privacy-page {
  max-width: 720px;
}

.privacy-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.privacy-card__title {
  margin: 0 0 12px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.privacy-card__text,
.privacy-card__hint {
  margin: 0 0 12px;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.5;
}

.privacy-card__links {
  margin: 16px 0 20px;
}

.privacy-card__button {
  margin-top: 8px;
}

.privacy-modal__intro {
  margin: 0 0 16px;
  color: #374151;
  font-size: 15px;
  line-height: 1.5;
}

.privacy-modal__checkbox {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.privacy-modal__password {
  width: 100%;
}
</style>
