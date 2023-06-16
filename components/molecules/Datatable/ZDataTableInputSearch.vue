<template>
  <div class="d-flex">
    <ZInput
      id="search"
      v-model="internalValue"
      class="mb-6 mr-3"
      placeholder="Pesquisar..."
      prepend-icon="search"
      @keyup.enter="actionSearch"
    >
      <template #prependInner>
        <va-icon name="search" />
      </template>
    </ZInput>
    <ZButton
      class="mb-6"
      color="primary"
      @click="actionSearch"
      :disabled="!internalValue"
    >
      Pesquisar
    </ZButton>
  </div>
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
