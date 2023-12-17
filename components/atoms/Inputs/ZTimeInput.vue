<template>
  <VaTimeInput
    style="width: 100%"
    v-bind="$attrs"
    :id="id"
    :label="label"
    v-model="internalValue"
    class="mb-3"
  />
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
      type: [Date, String],
      default: () => "",
    },
    rules: {
      type: Array,
      default: () => [],
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
