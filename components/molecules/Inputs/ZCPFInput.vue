<template>
  <ZInput
    v-model="internalValue"
    name="cpf"
    :label="label"
    id="cpf"
    class="mb-3"
    v-mask="'###.###.###-##'"
    :placeholder="placeholder"
  />
</template>

<script>
import ZInput from "~/components/atoms/Inputs/ZInput";
import { mask } from "vue-the-mask";

export default {
  components: {
    ZInput,
  },
  directives: {
    mask,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "CPF",
    },
    placeholder: {
      type: String,
      default: "000.000.000-00",
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        const cpfWithoutMask = this.removeNonNumericCharacters(value);
        this.$emit("update:modelValue", cpfWithoutMask);
      },
    },
  },
  methods: {
    removeNonNumericCharacters(value) {
      return value.replace(/\D/g, "");
    },
  },
};
</script>
