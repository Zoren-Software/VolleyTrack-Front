<template>
  <VaModal
    v-bind="$attrs"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :ok-text="okText"
    :cancel-text="cancelText"
    :ok-disabled="okDisabled"
    @ok="$emit('ok')"
    @cancel="$emit('cancel')"
    size="medium"
    close-button
    :no-dismiss="false"
    class="z-modal"
    style="z-index: 1001"
  >
    <template #header>
      <h5 class="font-bold text-lg va-h5">
        {{ title }}
      </h5>
    </template>

    <slot />
  </VaModal>
</template>

<script>
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
  },
  emits: ["update:modelValue", "ok", "cancel"],
  inheritAttrs: false, // 🔥 necessário para evitar duplicação com `v-bind="$attrs"`
};
</script>

<style scoped>
:deep(.z-modal .va-modal__container) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* Permitir que dropdowns apareçam fora do container */
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

:deep(.z-modal .va-modal__footer) {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

:deep(.z-modal .va-button--primary) {
  background: #e9742b;
  border: none;
  color: white;
  box-shadow: 0 2px 4px rgba(233, 116, 43, 0.2);
}

:deep(.z-modal .va-button--primary:hover) {
  background: #d8651f;
  box-shadow: 0 4px 8px rgba(233, 116, 43, 0.3);
  transform: translateY(-1px);
}
</style>
