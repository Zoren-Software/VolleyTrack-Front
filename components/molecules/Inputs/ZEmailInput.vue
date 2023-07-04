<template>
  <ZInput
    :id="id"
    v-model="internalValue"
    :label="label"
    :rules="rules"
    :success="emailValid"
    type="email"
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
    label: {
      type: String,
      default: "",
    },
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      emailValid: false,
      rules: [
        (value) => (value && value.length > 0) || "Este campo é obrigatório",
        (value) =>
          this.verifyValueIsEmail(value) || "Este campo precisa ser um email",
      ],
    };
  },

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

  methods: {
    verifyValueIsEmail(value) {
      const re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      this.emailValid = re.test(value);
      return this.emailValid;
    },
  },
};
</script>
