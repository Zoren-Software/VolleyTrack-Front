<template>
  <ZInput
    v-model="internalValue"
    :id="id"
    :type="isPasswordVisible ? 'text' : 'password'"
    :label="label"
    :rules="rules"
    class="mr-6 mb-6"
  >
    <template #appendInner>
      <va-icon
        :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
        size="small"
        color="primary"
        @click="isPasswordVisible = !isPasswordVisible"
      />
    </template>
  </ZInput>
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
    label: {
      type: String,
      default: "",
    },
    rules: {
      type: Array,
      default: () => [
        (value) => (value && value.length > 0) || "Este campo é obrigatório",
      ],
    },
    id: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    isPasswordVisible: false,
  }),

  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
