<template>
  <va-card stripe stripe-color="primary" class="mx-5">
    <va-card-title> Set Password </va-card-title>
    <va-form @keyup.enter="registerPassword">
      <div class="row justify-center px-3 pb-4">
        <div class="flex flex-col">
          <div class="item">
            <ZEmailInput
              v-model="email"
              disabled
              label="E-mail"
              id="email"
              placeholder="E-mail"
            />
          </div>
        </div>
      </div>
      <div class="row justify-center px-3 pb-4">
        <div class="flex flex-col">
          <div class="item">
            <ZPasswordInputWithConfirmPassword
              v-model="password"
              confirmPasswordInput
              name="password"
              passwordLabel="Senha Provisória"
              :error-messages="errorMessage"
              id="password"
              class="mb-3"
              @validForm="emitValidFormEvent"
            />
          </div>
        </div>
      </div>
      <div class="row justify-center px-3 pb-3">
        <label class="set-password-terms">
          <input v-model="termsAccepted" type="checkbox" />
          <span>
            Li e concordo com os
            <a :href="termsOfUseUrl" target="_blank" rel="noopener noreferrer">Termos de Uso</a>
            e
            <a :href="privacyPolicyUrl" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
          </span>
        </label>
      </div>
      <div class="row justify-center px-3 pb-3">
        <ZButton
          :block="true"
          :disabled="buttonDisabled || !termsAccepted"
          :loading="loading"
          color="primary"
          @click="registerPassword"
        >
          Registrar Senha
        </ZButton>
      </div>
    </va-form>
  </va-card>
</template>

<script>
// TODO - fazer o endpoint de troca de senha aqui
import USERSETPASSWORD from "~/graphql/user/mutation/userSetPassword.graphql";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZPasswordInputWithConfirmPassword from "~/components/molecules/Inputs/ZPasswordInputWithConfirmPassword";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZButton from "~/components/atoms/Buttons/ZButton";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZInput,
    ZPasswordInput,
    ZPasswordInputWithConfirmPassword,
    ZButton,
    ZEmailInput,
  },

  data() {
    return {
      success: false,
      successMessage: [],
      error: false,
      errorMessage: [],
      loading: false,
      // pegar atributo da rota get
      email: this.$route.params.email,
      password: "",
      buttonDisabled: true,
      termsAccepted: false,
    };
  },

  computed: {
    privacyPolicyUrl() {
      const url = String(this.$config?.public?.privacyPolicyUrl ?? "").trim();
      return url || "https://volleytrack.com/privacy-policy";
    },
    termsOfUseUrl() {
      const url = String(this.$config?.public?.termsOfUseUrl ?? "").trim();
      return url || "https://volleytrack.com/terms-of-use";
    },
  },

  methods: {
    async registerPassword() {
      try {
        this.loading = true;

        const query = gql`
          ${USERSETPASSWORD}
        `;
        const variables = {
          email: this.email,
          password: this.password,
          passwordConfirmation: this.password,
          token: this.$route.params.token,
          termsAccepted: true,
        };

        const { mutate } = await useMutation(query, { variables });

        this.loading = false;

        const {
          data: {
            userSetPassword: { userId },
          },
        } = await mutate();

        if (userId) {
          confirmSuccess("Senha alterada com sucesso!", () => {
            this.$router.push("/login");
          });
        } else {
          confirmError("Erro ao alterar senha!");
        }
      } catch (error) {
        this.error = true;
        console.log(error);
        this.errorMessage[0] = error;
      }
      this.loading = false;
    },

    emitValidFormEvent() {
      this.buttonDisabled = false;
    },
  },
};
</script>

<style scoped>
.set-password-terms {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.45;
  color: #374151;
  max-width: 420px;
}

.set-password-terms a {
  color: #ff4e1b;
  text-decoration: underline;
}
</style>
