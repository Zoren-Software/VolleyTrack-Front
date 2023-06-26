<template>
  <ZInput
    id="search"
    v-model="internalValue"
    placeholder="Pesquisar..."
    prepend-icon="search"
    @keyup.enter="actionSearch"
  >
    <template #prependInner> <va-icon name="search" /> </template>
  </ZInput>
</template>

<script>
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  components: {
    ZInput,
    ZButton,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "actionSearch"],
  data() {
    return {
      internalValue: this.modelValue,
    };
  },
  methods: {
    actionSearch() {
      this.$emit("actionSearch", true);
    },
  },
  watch: {
    modelValue(newVal) {
      this.internalValue = newVal;
    },
    internalValue(newVal) {
      this.$emit("update:modelValue", newVal);
    },
  },
};
</script>
