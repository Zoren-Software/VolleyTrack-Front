<template>
  <ZInput
    :id="id"
    v-model="internalValue"
    :label="label"
    :rules="rules"
    type="email"
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
      default: () => [],
    },
    id: {
      type: String,
      required: true,
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

  mounted() {
    this.rules.push(
      value => (value && value.length > 0) || 'Este campo é obrigatório',
      value => (value && (this.verifyValueIsEmail(value))) || 'Este campo precisa ser um email'
    )
  },

  methods: {
    verifyValueIsEmail(value) {
      if (value.includes('@')) {
        return true
      } else {
        return false
      }
    },
  }
}
</script>