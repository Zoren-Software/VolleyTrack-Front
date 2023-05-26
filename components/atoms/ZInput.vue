<template>
  <va-input
    :id="id"
    v-model="internalValue"
    :label="label"
    :rules="rules"
  />
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default: () => [],
    },
    id: {
      type: String,
      default: '',
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    verifyValueIsEmail() {
      if (this.internalValue.includes('@')) {
        return true
      } else {
        return false
      }
    },
  },
}
</script>