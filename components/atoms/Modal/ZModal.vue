<template>
  <VaModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="title"
    size="medium"
    close-button
    class="z-modal"
  >
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
};
</script>

<style scoped>
.z-modal {
  max-width: 600px;
}
</style>
