<template>
  <ZInput
    v-model="displayedValue"
    name="phone"
    label="Celular"
    id="phone"
    class="mb-3"
    maxlength="15"
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
    displayedValue: {
      get() {
        return this.formatPhone(this.modelValue);
      },
      set(value) {
        const phoneWithoutMask = this.removeNonNumericCharacters(value);
        this.$emit("update:modelValue", phoneWithoutMask);
      },
    },
  },
  methods: {
    removeNonNumericCharacters(value) {
      return value.replace(/\D/g, "");
    },
    formatPhone(value) {
      const onlyNumbers = this.removeNonNumericCharacters(value);

      if (onlyNumbers.length === 0) {
        return "";
      } else if (onlyNumbers.length <= 2) {
        return onlyNumbers.replace(/^(\d{0,2})/, "($1");
      } else if (onlyNumbers.length <= 6) {
        return onlyNumbers.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
      } else if (onlyNumbers.length <= 10) {
        return onlyNumbers.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else {
        return onlyNumbers.replace(
          /^(\d{2})(\d{1})(\d{4})(\d{0,4})/,
          "($1) $2 $3-$4"
        );
      }
    },
  },
};
</script>
