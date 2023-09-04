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
import { formatPhoneOnType } from "~/utils/formatting/formatHelper";

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
      return formatPhoneOnType(onlyNumbers);
    },
  },
};
</script>
