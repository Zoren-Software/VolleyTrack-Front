<template>
  <va-input
    id="search"
    v-model="internalValue"
    class="mb-6"
    placeholder="Pesquisar..."
    prepend-icon="search"
  >
    <template #prependInner>
      <va-icon name="search" />
    </template>
  </va-input>
</template>

<script>

import ZInput from '~/components/atoms/Inputs/ZInput';

export default {
  components: {
    ZInput
  },
  props: {
    modelValue: {
      type: String,
      default: ""
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      internalValue: this.modelValue
    }
  },
  watch: {
    modelValue(newVal) {
      this.internalValue = newVal;
    },
    internalValue(newVal) {
      this.$emit('update:modelValue', newVal);
    }
  },
  methods: {
    updateValue() {
      this.$emit('update:modelValue', this.internalValue);
    }
  }
}
</script>
