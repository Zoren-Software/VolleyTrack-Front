<template>
  <ZInput
    :id="id"
    v-model="internalValue"
    :label="label"
    :rules="rules"
    type="password"
  />
</template>

<script>
import ZInput from '~/components/atoms/Inputs/ZInput'

export default {
  components: {
    ZInput
  },
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
      default: () => [value => (value && value.length > 0) || 'Este campo é obrigatório'],
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
  }
}
</script>