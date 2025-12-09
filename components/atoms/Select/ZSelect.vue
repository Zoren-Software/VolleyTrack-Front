<template>
  <va-select
    style="width: 100%"
    v-model="value"
    v-bind="$attrs"
    :options="options"
    searchable
    searchPlaceholderText="Pesquisar"
    selected-top-shown
    clearable
    clearable-icon="cancel"
    no-options-text="Nenhuma opção encontrada"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope"></slot>
    </template>
  </va-select>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: [Array, Object, String, Number],
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      value: this.modelValue || [],
    };
  },
  watch: {
    modelValue(newVal) {
      this.value = newVal || [];
    },
    value(newVal) {
      this.$emit("update:modelValue", newVal);
    },
  },
};
</script>
