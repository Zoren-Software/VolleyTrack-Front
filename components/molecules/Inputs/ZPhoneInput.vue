<template>
  <ZInput
    v-model="displayedValue"
    name="phone"
    :label="label"
    id="phone"
    class="mb-3"
    maxlength="15"
    :placeholder="placeholder"
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
    label: {
      type: String,
      default: "Celular",
    },
    placeholder: {
      type: String,
      default: "(00) 00000-0000",
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
      if (value) {
        return value.replace(/\D/g, "");
      }
      return value;
    },
    formatPhone(value) {
      const onlyNumbers = this.removeNonNumericCharacters(value);
      return formatPhoneOnType(onlyNumbers);
    },
  },
};
</script>
