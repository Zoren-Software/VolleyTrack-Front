<template>
  <ZInput
    v-model="displayedValue"
    name="rg"
    label="RG"
    id="rg"
    class="mb-3"
    maxlength="14"
  />
</template>

<script>
import ZInput from "~/components/atoms/Inputs/ZInput";

export default {
  components: {
    ZInput,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        const rgWithoutMask = this.removeNonNumericCharacters(value);
        this.$emit("update:modelValue", rgWithoutMask);
      },
    },
    displayedValue: {
      get() {
        return this.formatRG(this.internalValue);
      },
      set(value) {
        const rgWithoutMask = this.removeNonNumericCharacters(value);

        // Verifica se o valor excede o comprimento máximo
        if (rgWithoutMask.length > 11) {
          return this.internalValue;
        }

        this.internalValue = rgWithoutMask;
      },
    },
  },
  methods: {
    removeNonNumericCharacters(value) {
      return value.replace(/\D/g, "");
    },
    formatRG(value) {
      let formatted = value;

      if (formatted == null) {
        return formatted;
      }

      // limita a entrada a um máximo de 11 dígitos
      if (formatted.length > 11) {
        formatted = formatted.slice(0, 11);
      }

      if (formatted.length > 2) {
        formatted = `${formatted.substr(0, 2)}.${formatted.substr(2)}`;
      }
      if (formatted.length > 6) {
        formatted = `${formatted.substr(0, 6)}.${formatted.substr(6)}`;
      }
      if (formatted.length > 10) {
        formatted = `${formatted.substr(0, 10)}-${formatted.substr(10, 11)}`;
      }

      return formatted;
    },
  },
};
</script>
