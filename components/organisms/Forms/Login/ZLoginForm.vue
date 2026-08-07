<template>
  <va-card stripe stripe-color="primary" class="mx-5" style="z-index: 99">
    <va-card-title>
      {{ loginStep === "credentials" ? "Login" : "Confirmar acesso" }}
    </va-card-title>
    <va-form
      v-if="loginStep === 'credentials'"
      @submit.prevent="login"
      @keyup.enter="login"
    >
      <div class="row justify-center px-3 pb-4">
        <div class="flex flex-col">
          <div class="item">
            <ZEmailInput
              v-model="email"
              label="E-mail"
              id="email"
              placeholder="E-mail"
              :error-messages="errorMessageEmail"
              :error="errorEmail"
            />
          </div>
        </div>
      </div>
      <div class="row justify-center px-3 pb-4">
        <div class="flex flex-col">
          <div class="item">
            <ZPasswordInput
              v-model="password"
              label="Password"
              id="password"
              placeholder="Senha"
              :error="errorPassword"
              :error-messages="errorMessagePassword"
              :success="success"
              :messages="successMessage"
            />
          </div>
        </div>
      </div>
      <div class="row justify-center px-3 pb-3">
        <ZButton
          :block="true"
          :loading="loading"
          color="primary"
          @click="login"
        >
          Login
        </ZButton>
      </div>
    </va-form>
    <va-form
      v-else
      class="px-3 pb-4"
      @submit.prevent="confirmTwoFactorChallenge"
      @keyup.enter="confirmTwoFactorChallenge"
    >
      <div class="two-factor-identity">
        <va-avatar color="primary" size="42px">
          {{ challengeInitial }}
        </va-avatar>
        <div>
          <p class="two-factor-signed-in">Conectado como</p>
          <strong>{{ email }}</strong>
        </div>
      </div>

      <template v-if="hasPasskeyMethod">
        <ZButton
          :block="true"
          :loading="loading && passkeyBusy"
          color="primary"
          :disabled="loading"
          @click="confirmPasskeyChallenge"
        >
          Usar chave de acesso
        </ZButton>
        <p class="two-factor-hint">
          Confirme com 1Password, Face ID, Touch ID ou outra passkey.
        </p>
      </template>

      <div v-if="hasTotpMethod && (!hasPasskeyMethod || showTotpFallback)">
        <ZInput
          v-model="twoFactorCode"
          id="two-factor-code"
          label="Código do autenticador"
          placeholder="Digite o código de 6 dígitos"
          inputmode="numeric"
          autocomplete="one-time-code"
          :error="twoFactorError"
          :error-messages="twoFactorErrorMessage"
        />
        <p class="two-factor-hint">
          Abra seu aplicativo autenticador para obter o código.
        </p>
        <ZButton
          :block="true"
          :loading="loading && !passkeyBusy"
          color="primary"
          :disabled="!twoFactorCode.trim()"
          type="submit"
        >
          Verificar
        </ZButton>
      </div>

      <va-button
        v-if="hasPasskeyMethod && hasTotpMethod && !showTotpFallback"
        preset="plain"
        class="mt-2"
        :disabled="loading"
        @click="showTotpFallback = true"
      >
        Está com problemas?
      </va-button>

      <p v-if="passkeyError" class="two-factor-error" role="alert">
        {{ passkeyError }}
      </p>

      <va-button
        preset="plain"
        class="mt-2"
        :disabled="loading"
        @click="resetTwoFactorChallenge"
      >
        Voltar
      </va-button>
    </va-form>
  </va-card>
  <div v-if="loginStep === 'credentials'" class="ml-4 mt-2">
    <div class="row justify-start px-3">
      <div class="flex flex-col">
        <div class="item">
          <VaButton
            preset="plain"
            class="ml-3 mr-6 mt-2"
            @click="resetPassword"
          >
            Esqueceu a senha?
          </VaButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LOGIN from "~/graphql/user/mutation/login.graphql";
import CONFIRM_TWO_FACTOR_CHALLENGE from "~/graphql/user/mutation/confirmTwoFactorChallenge.graphql";
import BEGIN_PASSKEY_CHALLENGE from "~/graphql/user/mutation/beginPasskeyChallenge.graphql";
import CONFIRM_PASSKEY_CHALLENGE from "~/graphql/user/mutation/confirmPasskeyChallenge.graphql";
import FORGOT_PASSWORD from "~/graphql/user/mutation/forgotPassword.graphql";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZButton from "~/components/atoms/Buttons/ZButton";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";
import {
  assertPasskeyCredential,
  credentialToJson,
  passkeySupportMessage,
  supportsPasskeys,
} from "~/utils/passkeys";

export default {
  components: {
    ZInput,
    ZPasswordInput,
    ZButton,
    ZEmailInput,
  },

  data() {
    const config = useRuntimeConfig();
    const isLocal = config.public.appEnv === "local";
    return {
      success: false,
      successMessage: [],
      errorPassword: false,
      errorEmail: false,
      errorMessagePassword: "",
      errorMessageEmail: "",
      loading: false,
      email: isLocal ? config.public.loginTestEmail || "" : "",
      password: isLocal ? config.public.loginTestPassword || "" : "",
      loginStep: "credentials",
      twoFactorChallenge: null,
      twoFactorCode: "",
      twoFactorError: false,
      twoFactorErrorMessage: "",
      showTotpFallback: false,
      passkeyBusy: false,
      passkeyError: "",
    };
  },

  methods: {
    completeLogin(token) {
      const { onLogin } = useApollo();
      this.success = true;
      this.successMessage = ["Login realizado com sucesso"];
      localStorage.setItem("userToken", token);
      onLogin(token);
      this.$router.push("/");
    },
    async login() {
      try {
        this.loading = true;
        const query = gql`
          ${LOGIN}
        `;

        if (this.email == "") {
          this.errorEmail = true;
          this.error = true;
          this.errorMessageEmail = "E-mail é obrigatório para fazer login";
          this.loading = false;
          this.success = false;

          if (this.password == "") {
            this.errorPassword = true;
            this.errorMessagePassword =
              "A senha é obrigatória para fazer login";
            this.loading = false;
            this.success = false;
          }
          return;
        }
        if (this.password == "") {
          this.errorPassword = true;
          this.errorMessagePassword = "A senha é obrigatória para fazer login";
          this.loading = false;
          this.success = false;
          return;
        }

        const variables = {
          email: this.email,
          password: this.password,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();
        const login = data?.login;

        if (login?.token) {
          this.completeLogin(login.token);
          return;
        }

        if (login?.twoFactorRequired && login.challengeToken) {
          this.password = "";
          this.twoFactorChallenge = login;
          this.twoFactorCode = "";
          this.twoFactorError = false;
          this.twoFactorErrorMessage = "";
          this.showTotpFallback = !(login.methods || []).includes("passkey");
          this.passkeyError = "";
          this.loginStep = "two_factor";
        }
      } catch (error) {
        this.errorPassword = true;
        if (error.message == "The provided credentials are incorrect.") {
          this.errorMessagePassword =
            "Usuário ou senha inválidos, tente novamente";
        } else {
          this.errorMessagePassword = error.message;
        }
      }
      this.loading = false;
    },

    async confirmTwoFactorChallenge() {
      if (!this.twoFactorCode.trim() || !this.twoFactorChallenge?.challengeToken) {
        return;
      }

      try {
        this.loading = true;
        this.passkeyBusy = false;
        this.twoFactorError = false;
        this.twoFactorErrorMessage = "";
        const mutation = gql`
          ${CONFIRM_TWO_FACTOR_CHALLENGE}
        `;
        const variables = {
          challengeToken: this.twoFactorChallenge.challengeToken,
          code: this.twoFactorCode.trim(),
        };
        const { mutate } = await useMutation(mutation, { variables });
        const { data } = await mutate();
        const token = data?.confirmTwoFactorChallenge?.token;

        if (token) {
          this.completeLogin(token);
        }
      } catch (error) {
        this.twoFactorError = true;
        this.twoFactorErrorMessage =
          error.graphQLErrors?.[0]?.message ||
          "Não foi possível verificar o código. Tente novamente.";
      } finally {
        this.loading = false;
      }
    },

    async confirmPasskeyChallenge() {
      if (!this.twoFactorChallenge?.challengeToken) {
        return;
      }

      if (!supportsPasskeys()) {
        this.passkeyError =
          passkeySupportMessage() ||
          "Este navegador não oferece chaves de acesso. Use o autenticador.";
        this.showTotpFallback = true;
        return;
      }

      try {
        this.loading = true;
        this.passkeyBusy = true;
        this.passkeyError = "";

        const beginMutation = gql`
          ${BEGIN_PASSKEY_CHALLENGE}
        `;
        const { mutate: beginMutate } = await useMutation(beginMutation, {
          variables: {
            challengeToken: this.twoFactorChallenge.challengeToken,
          },
        });
        const { data: beginData } = await beginMutate();
        const begin = beginData?.beginPasskeyChallenge;

        if (!begin?.optionsJson || !begin?.assertionId) {
          throw new Error("Não foi possível iniciar a verificação com passkey.");
        }

        const credential = await assertPasskeyCredential(begin.optionsJson);
        const confirmMutation = gql`
          ${CONFIRM_PASSKEY_CHALLENGE}
        `;
        const { mutate: confirmMutate } = await useMutation(confirmMutation, {
          variables: {
            challengeToken: this.twoFactorChallenge.challengeToken,
            assertionId: begin.assertionId,
            credentialJson: credentialToJson(credential),
          },
        });
        const { data: confirmData } = await confirmMutate();
        const token = confirmData?.confirmPasskeyChallenge?.token;

        if (token) {
          this.completeLogin(token);
        }
      } catch (error) {
        this.passkeyError =
          error.graphQLErrors?.[0]?.message ||
          error.message ||
          "Não foi possível confirmar a chave de acesso.";
        if (this.hasTotpMethod) {
          this.showTotpFallback = true;
        }
      } finally {
        this.loading = false;
        this.passkeyBusy = false;
      }
    },

    resetTwoFactorChallenge() {
      this.loginStep = "credentials";
      this.twoFactorChallenge = null;
      this.twoFactorCode = "";
      this.twoFactorError = false;
      this.twoFactorErrorMessage = "";
      this.showTotpFallback = false;
      this.passkeyError = "";
    },

    async resetPassword() {
      try {
        this.loading = true;

        const query = gql`
          ${FORGOT_PASSWORD}
        `;

        if (this.email == "") {
          this.errorEmail = true;
          this.errorMessageEmail = "E-mail é obrigatório para resetar a senha";
          this.loading = false;
          this.success = false;
          return;
        }

        const variables = {
          email: this.email,
        };

        const { mutate } = await useMutation(query, { variables });

        const {
          data: {
            forgotPassword: { status, message },
          },
        } = await mutate();

        if (status === "success") {
          confirmSuccess(message);
        }
      } catch (error) {
        this.errorPassword = true;
        this.errorMessage = error.message;
      }
      this.loading = false;
    },
  },
  computed: {
    hasTotpMethod() {
      return this.twoFactorChallenge?.methods?.includes("totp") ?? false;
    },
    hasPasskeyMethod() {
      return this.twoFactorChallenge?.methods?.includes("passkey") ?? false;
    },
    challengeInitial() {
      return (this.twoFactorChallenge?.name || this.email || "?")
        .charAt(0)
        .toUpperCase();
    },
  },
};
</script>

<style scoped>
.two-factor-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: #f8fafc;
}

.two-factor-signed-in {
  margin: 0 0 2px;
  font-size: 12px;
  color: #6b7280;
}

.two-factor-hint {
  margin: 6px 0 18px;
  font-size: 13px;
  color: #6b7280;
}

.two-factor-error {
  margin: 8px 0 0;
  color: #b91c1c;
  font-size: 13px;
}
</style>
