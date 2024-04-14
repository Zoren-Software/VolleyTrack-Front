<template>
  <div v-if="userLogin == formId || formId == 0">
    <ZPasswordInput
      v-model="password"
      v-bind="$attrs"
      :id="id + '-password'"
      :type="isPasswordVisible ? 'text' : 'password'"
      :label="passwordLabel"
      :success="password === confirmPassword && password !== ''"
      :messages="passwordMessages"
      :rules="passwordRules"
      @input="validatePassword"
    >
      <template #appendInner>
        <va-icon
          :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
          size="small"
          color="primary"
          @click="isPasswordVisible = !isPasswordVisible"
        />
      </template>
    </ZPasswordInput>
    <ZInput
      v-if="confirmPasswordInput"
      v-model="confirmPassword"
      :id="id + '-confirm-password'"
      :type="isPasswordVisible ? 'text' : 'password'"
      :disabled="password === ''"
      :label="confirmPasswordLabel"
      :rules="confirmPasswordRules"
      :success="password === confirmPassword && password !== ''"
      @input="validatePassword"
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
  </div>
</template>

<script>
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZInput from "~/components/atoms/Inputs/ZInput";

export default {
  components: {
    ZPasswordInput,
    ZInput,
  },
  mounted() {
    watch(
      () => this.isFormValid,
      (isValid) => {
        if (isValid) {
          this.emitValidFormEvent();
        }
      }
    );
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    passwordLabel: {
      type: String,
      default: "Senha",
    },
    passwordMessages: {
      type: Array,
      default: () => [],
    },
    confirmPasswordLabel: {
      type: String,
      default: "Confirmar Senha",
    },
    confirmPasswordInput: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
      default: () => [
        (value) => (value && value.length > 0) || "Este campo é obrigatório",
      ],
    },
    userLogin: {
      type: Number,
      default: 0,
    },
    formId: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    isPasswordVisible: false,
    password: "",
    confirmPassword: "",
  }),
  computed: {
    isFormValid() {
      return (
        this.password.length >= 6 && this.password === this.confirmPassword
      );
    },
    passwordRules() {
      return [
        ...this.rules,
        (value) =>
          this.confirmPassword === "" ||
          value === this.confirmPassword ||
          "As senhas não coincidem",
      ];
    },
    confirmPasswordRules() {
      return [
        ...this.rules,
        (value) =>
          this.password === "" ||
          value === this.password ||
          "As senhas não coincidem",
      ];
    },
  },
  methods: {
    validatePassword() {
      if (this.password !== this.confirmPassword) {
        console.error("As senhas não coincidem");
      } else {
        this.$emit("update:modelValue", this.password);
      }
    },
    emitValidFormEvent() {
      this.$emit("validForm");
    },
  },
};
</script>
