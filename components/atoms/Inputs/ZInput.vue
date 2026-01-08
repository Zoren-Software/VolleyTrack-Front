<template>
  <va-input
    style="width: 100%"
    v-bind="$attrs"
    :id="id"
    :label="label"
    :rules="rules"
    :type="type"
    immediate-validation
    :messages="messages"
    v-model="internalValue"
    :error-messages="errorMessages"
    :error="error"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope"></slot>
    </template>
  </va-input>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: String,
      default: "",
    },
    rules: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "text",
    },
    messages: {
      type: Array,
      default: () => [],
    },
    errorMessages: {
      type: [String, Array],
      default: "",
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>

<style scoped>
/* Remover apenas a borda da label (texto acima do input), mantendo a borda do campo de input */
:deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

:deep(.va-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}
</style>
