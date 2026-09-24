<template>
  <VaModal
    v-bind="$attrs"
    :model-value="modelValue"
    hide-default-actions
    size="medium"
    :close-button="!hideCloseButton"
    :no-dismiss="persistent"
    class="z-modal"
    style="z-index: 1001"
    @update:model-value="onModelUpdate"
    @cancel="onCancelClick"
  >
    <template #header>
      <h5 class="font-bold text-lg va-h5">
        {{ title }}
      </h5>
    </template>

    <form
      :id="formId"
      class="z-modal__form"
      @submit.prevent="onOkClick"
    >
      <slot />
    </form>

    <template #footer>
      <div class="z-modal__footer">
        <VaButton
          v-if="cancelText"
          preset="secondary"
          :disabled="loading"
          @click="onCancelClick"
        >
          {{ cancelText }}
        </VaButton>
        <VaButton
          class="z-modal__ok-btn"
          type="submit"
          :form="formId"
          :disabled="okDisabled || loading"
          :loading="loading"
          @click="onOkClick"
        >
          {{ okText || "OK" }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
let zModalFormSeq = 0;

export default {
  name: "ZModal",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    okText: {
      type: String,
      default: undefined,
    },
    cancelText: {
      type: String,
      default: undefined,
    },
    okDisabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
    hideCloseButton: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "ok", "cancel"],
  inheritAttrs: false,
  data() {
    zModalFormSeq += 1;
    return {
      formId: `z-modal-form-${zModalFormSeq}`,
    };
  },
  methods: {
    onModelUpdate(value) {
      if (this.persistent && value === false) {
        return;
      }
      this.$emit("update:modelValue", value);
    },
    onOkClick() {
      if (this.okDisabled || this.loading) {
        return;
      }
      this.$emit("ok");
    },
    onCancelClick() {
      this.$emit("cancel");
      if (!this.persistent) {
        this.$emit("update:modelValue", false);
      }
    },
  },
};
</script>

<style scoped>
:deep(.z-modal .va-modal__container) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

:deep(.z-modal .va-modal__content) {
  overflow-y: auto;
  overflow-x: visible;
}

:deep(.z-modal .va-modal__header) {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
}

:deep(.z-modal .va-modal__header h5) {
  color: #111827;
  font-size: 20px;
  font-weight: 600;
}

:deep(.z-modal .va-modal__content) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.z-modal__form {
  margin: 0;
}

:deep(.z-modal .va-modal__footer) {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.z-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

:deep(.z-modal .va-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.2s ease;
}

:deep(.z-modal .va-button--secondary) {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

:deep(.z-modal .va-button--secondary:hover) {
  background: #f9fafb;
  border-color: #9ca3af;
}

:deep(.z-modal .z-modal__ok-btn) {
  background: #ff4e1b;
  border: none;
  color: white;
  box-shadow: 0 2px 4px rgba(255, 78, 27, 0.2);
}

:deep(.z-modal .z-modal__ok-btn:hover:not(:disabled)) {
  background: #d8651f;
  box-shadow: 0 4px 8px rgba(255, 78, 27, 0.3);
  transform: translateY(-1px);
}

:deep(.z-modal .z-modal__ok-btn:disabled) {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  pointer-events: none;
}
</style>
