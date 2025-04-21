<template>
  <VaModal
    v-bind="$attrs"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    size="medium"
    close-button
    class="z-modal"
  >
    <template #header>
      <h5 class="font-bold text-lg va-h5">
        {{ title }}
      </h5>
    </template>

    <slot />

    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
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
  },
  emits: ["update:modelValue"],
  inheritAttrs: false, // 🔥 necessário para evitar duplicação com `v-bind="$attrs"`
};
</script>

<style scoped>
.z-modal {
  max-width: 600px;
}
</style>
