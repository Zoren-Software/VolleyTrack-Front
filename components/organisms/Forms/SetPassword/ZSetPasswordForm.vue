<template>
  <div class="set-password-shell mx-5">
    <va-card stripe stripe-color="primary" class="set-password-card">
      <va-card-title> Set Password </va-card-title>
      <va-form class="set-password-form" @keyup.enter="registerPassword">
        <div class="set-password-field">
          <ZEmailInput
            v-model="email"
            disabled
            label="E-mail"
            id="email"
            placeholder="E-mail"
          />
        </div>

        <div class="set-password-field">
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

        <label class="set-password-terms">
          <input
            v-model="termsAccepted"
            type="checkbox"
            class="set-password-terms__checkbox"
          />
          <span class="set-password-terms__text">
            <span class="set-password-terms__line">Li e concordo com os</span>
            <span class="set-password-terms__line">
              <a :href="termsOfUseUrl" target="_blank" rel="noopener noreferrer"
                >Termos de Uso</a
              >
              e
              <a
                :href="privacyPolicyUrl"
                target="_blank"
                rel="noopener noreferrer"
                >Política de Privacidade</a
              >
            </span>
          </span>
        </label>

        <ZButton
          :block="true"
          :disabled="buttonDisabled || !termsAccepted"
          :loading="loading"
          color="primary"
          @click="registerPassword"
        >
          Registrar Senha
        </ZButton>
      </va-form>
    </va-card>
  </div>
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
.set-password-shell {
  width: 320px;
  max-width: calc(100vw - 2rem);
  min-width: 0;
}

.set-password-shell :deep(.va-card) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

.set-password-shell :deep(.va-card__content),
.set-password-shell :deep(.va-form) {
  min-width: 0 !important;
}

.set-password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 12px 16px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.set-password-field {
  width: 100%;
  min-width: 0;
}

.set-password-field :deep(.va-input-wrapper),
.set-password-field :deep(.va-input) {
  width: 100%;
}

.set-password-terms {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  column-gap: 10px;
  align-items: start;
  width: 100%;
  min-width: 0;
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.45;
  color: #374151;
}

.set-password-terms__checkbox {
  margin-top: 3px;
}

.set-password-terms__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  white-space: normal !important;
}

.set-password-terms__line {
  display: block;
  white-space: normal !important;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.set-password-terms a {
  color: #ff4e1b;
  text-decoration: underline;
  white-space: normal !important;
}
</style>
