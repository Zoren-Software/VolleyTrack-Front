<template>
  <div class="lgpd-portability-panel">
    <div class="lgpd-portability-panel__card">
      <va-icon name="download" size="28px" color="#2563eb" class="lgpd-portability-panel__icon" />
      <h2 class="lgpd-portability-panel__title">Portabilidade dos seus dados</h2>
      <p class="lgpd-portability-panel__text">
        Solicite uma cópia estruturada dos seus dados (JSON e CSV em ZIP), conforme o
        direito de portabilidade da LGPD. O arquivo será enviado ao seu e-mail e poderá
        ser usado para importação em outro clube.
      </p>
      <p v-if="includeCentralHint" class="lgpd-portability-panel__hint">
        Como titular da assinatura, a exportação inclui também um resumo dos dados da
        conta central (faturamento), sem dados sensíveis de pagamento.
      </p>

      <va-button
        color="primary"
        class="lgpd-portability-panel__cta"
        :loading="isExporting"
        :disabled="exportModalOpen"
        @click="openExportModal"
      >
        Exportar meus dados
      </va-button>

      <div class="lgpd-portability-panel__import">
        <h3 class="lgpd-portability-panel__subtitle">Importar dados de outro clube</h3>
        <p class="lgpd-portability-panel__text">
          Envie o ZIP recebido em outro clube. O histórico esportivo importado aparece
          nas estatísticas; treinos do calendário deste clube não são recriados.
        </p>
        <va-button
          preset="secondary"
          :loading="isImporting"
          @click="openImportModal"
        >
          Importar arquivo ZIP
        </va-button>
      </div>
    </div>

    <ZModal
      v-model="exportModalOpen"
      title="Exportar meus dados"
      ok-text="Confirmar exportação"
      cancel-text="Cancelar"
      :ok-disabled="!exportCanSubmit"
      :loading="isExporting"
      @ok="onConfirmExport"
      @cancel="closeExportModal"
    >
      <p class="lgpd-portability-modal__intro">
        Digite sua senha para confirmar. Você receberá um e-mail quando o arquivo estiver
        pronto (geralmente em poucos minutos).
      </p>
      <va-input
        v-model="exportPassword"
        type="password"
        label="Senha atual"
        class="lgpd-portability-modal__password"
        :disabled="isExporting"
      />
    </ZModal>

    <ZModal
      v-model="importModalOpen"
      title="Importar dados (ZIP)"
      ok-text="Importar"
      cancel-text="Cancelar"
      :ok-disabled="!importCanSubmit"
      :loading="isImporting"
      @ok="onConfirmImport"
      @cancel="closeImportModal"
    >
      <p class="lgpd-portability-modal__intro">
        Selecione o arquivo ZIP exportado de outro clube. O e-mail do pacote deve ser o
        mesmo da sua conta neste clube.
      </p>
      <input
        ref="importFileInput"
        type="file"
        accept=".zip,application/zip"
        class="lgpd-portability-modal__file"
        @change="onImportFileChange"
      />
      <p v-if="importFileName" class="lgpd-portability-modal__file-name">
        Arquivo: {{ importFileName }}
      </p>
      <va-input
        v-model="importPassword"
        type="password"
        label="Senha atual"
        class="lgpd-portability-modal__password"
        :disabled="isImporting"
      />
    </ZModal>
  </div>
</template>

<script setup>
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import { useLgpdPortability } from "~/composables/useLgpdPortability";
import { confirmError, confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

const props = defineProps({
  includeCentralHint: {
    type: Boolean,
    default: false,
  },
  includeCentralOnExport: {
    type: Boolean,
    default: false,
  },
});

const {
  isExporting,
  isImporting,
  requestExport,
  importZipFile,
  getLgpdPortabilityErrorMessage,
} = useLgpdPortability();

const exportModalOpen = ref(false);
const exportPassword = ref("");
const importModalOpen = ref(false);
const importPassword = ref("");
const importFile = ref(null);
const importFileName = ref("");
const importFileInput = ref(null);

const exportCanSubmit = computed(
  () => exportPassword.value.length > 0 && !isExporting.value,
);

const importCanSubmit = computed(
  () =>
    importPassword.value.length > 0 &&
    importFile.value !== null &&
    !isImporting.value,
);

const openExportModal = () => {
  exportPassword.value = "";
  exportModalOpen.value = true;
};

const closeExportModal = () => {
  exportModalOpen.value = false;
};

const openImportModal = () => {
  importPassword.value = "";
  importFile.value = null;
  importFileName.value = "";
  if (importFileInput.value) {
    importFileInput.value.value = "";
  }
  importModalOpen.value = true;
};

const closeImportModal = () => {
  importModalOpen.value = false;
};

const onImportFileChange = (event) => {
  const file = event.target?.files?.[0] ?? null;
  importFile.value = file;
  importFileName.value = file?.name ?? "";
};

const onConfirmExport = async () => {
  if (!exportCanSubmit.value) {
    return;
  }

  try {
    const result = await requestExport(exportPassword.value, {
      includeCentral: props.includeCentralOnExport,
    });

    if (result?.exportId) {
      closeExportModal();
      await confirmSuccess(
        result.message ||
          "Exportação iniciada. Você receberá um e-mail com o arquivo em breve.",
      );
    }
  } catch (error) {
    confirmError(getLgpdPortabilityErrorMessage(error));
  }
};

const onConfirmImport = async () => {
  if (!importCanSubmit.value || !importFile.value) {
    return;
  }

  try {
    const result = await importZipFile(importFile.value, importPassword.value);

    closeImportModal();

    const warnings = Array.isArray(result?.warnings) ? result.warnings : [];
    const sections = Array.isArray(result?.imported_sections)
      ? result.imported_sections.join(", ")
      : "";

    let message = result?.message || "Dados importados com sucesso.";

    if (sections) {
      message += ` Seções: ${sections}.`;
    }

    if (warnings.length > 0) {
      message += ` Avisos: ${warnings.join(" ")}`;
    }

    await confirmSuccess(message);
  } catch (error) {
    confirmError(getLgpdPortabilityErrorMessage(error));
  }
};
</script>

<style scoped>
.lgpd-portability-panel {
  width: 100%;
  max-width: 480px;
  margin-bottom: 24px;
}

.lgpd-portability-panel__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lgpd-portability-panel__icon {
  flex-shrink: 0;
}

.lgpd-portability-panel__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.lgpd-portability-panel__subtitle {
  margin: 8px 0 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.lgpd-portability-panel__text,
.lgpd-portability-panel__hint {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: #4b5563;
}

.lgpd-portability-panel__hint {
  font-size: 14px;
  color: #6b7280;
}

.lgpd-portability-panel__cta {
  align-self: flex-start;
  margin-top: 4px;
}

.lgpd-portability-panel__import {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lgpd-portability-modal__intro {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.5;
  color: #374151;
}

.lgpd-portability-modal__password {
  width: 100%;
}

.lgpd-portability-modal__file {
  display: block;
  margin-bottom: 12px;
  width: 100%;
  font-size: 14px;
}

.lgpd-portability-modal__file-name {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>
