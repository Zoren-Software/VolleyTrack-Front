<template>
  <ZModal
    :model-value="isModalOpen"
    title="Aceite dos Termos"
    ok-text="Confirmar aceite"
    :ok-disabled="!hasAgreed || isSubmitting"
    :persistent="true"
    :hide-close-button="true"
    class="terms-acceptance-modal"
    @ok="onConfirm"
  >
    <p class="terms-acceptance-modal__intro">
      Para continuar usando o VolleyTrack, é necessário aceitar a versão atual dos
      Termos de Uso e da Política de Privacidade.
    </p>

    <div class="terms-acceptance-modal__links">
      <ZLegalLinks variant="light" />
    </div>

    <label class="terms-acceptance-modal__checkbox">
      <input v-model="hasAgreed" type="checkbox" class="terms-acceptance-modal__input" />
      <span>
        Li e concordo com os Termos de Uso e Política de Privacidade
      </span>
    </label>
  </ZModal>
</template>

<script setup>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ZLegalLinks from "~/components/organisms/Footer/ZLegalLinks.vue";
import { useTermsAcceptance } from "~/composables/useTermsAcceptance";
import { confirmError } from "~/utils/sweetAlert2/swalHelper";

const { isModalOpen, isSubmitting, acceptTerms } = useTermsAcceptance();
const hasAgreed = ref(false);

watch(isModalOpen, (open) => {
  if (open) {
    hasAgreed.value = false;
  }
});

const onConfirm = async () => {
  if (!hasAgreed.value || isSubmitting.value) {
    return;
  }

  try {
    await acceptTerms();
  } catch {
    confirmError(
      "Não foi possível registrar o aceite. Tente novamente.",
      () => {}
    );
  }
};
</script>

<style scoped>
.terms-acceptance-modal__intro {
  margin: 0 0 16px;
  color: #374151;
  font-size: 15px;
  line-height: 1.5;
}

.terms-acceptance-modal__links {
  margin-bottom: 20px;
}

.terms-acceptance-modal__links :deep(.legal-links) {
  align-items: flex-start;
}

.terms-acceptance-modal__checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  color: #111827;
  font-size: 14px;
  line-height: 1.45;
}

.terms-acceptance-modal__input {
  margin-top: 3px;
  flex-shrink: 0;
}
</style>
