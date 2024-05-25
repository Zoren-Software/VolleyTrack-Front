<template>
  <va-card stripe stripe-color="primary" class="mx-5">
    <va-card-title> Login </va-card-title>
    <va-form @keyup.enter="login">
      <div class="row justify-center px-3 pb-4">
        <div class="flex flex-col">
          <div class="item">
            <ZEmailInput
              v-model="email"
              label="E-mail"
              id="email"
              placeholder="E-mail"
              :error-messages="errorMessageEmail"
              :error="error"
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
              :error="error"
              :error-messages="errorMessage"
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
  </va-card>
  <div class="ml-4 mt-2">
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
import FORGOT_PASSWORD from "~/graphql/user/mutation/forgotPassword.graphql";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZButton from "~/components/atoms/Buttons/ZButton";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZInput,
    ZPasswordInput,
    ZButton,
    ZEmailInput,
  },

  data() {
    return {
      success: false,
      successMessage: [],
      error: false,
      errorMessage: "",
      errorMessageEmail: "",
      loading: false,
      email: "",
      password: "",
    };
  },

  methods: {
    async login() {
      try {
        this.loading = true;
        const { onLogin } = useApollo();

        const query = gql`
          ${LOGIN}
        `;

        if (this.email == "") {
          this.error = true;
          this.errorMessageEmail = "E-mail é obrigatório";
          this.loading = false;
          this.success = false;

          if (this.password == "") {
            this.error = true;
            this.errorMessage = "A senha é obrigatória";
            this.loading = false;
            this.success = false;
          }
          return;
        }

        const variables = {
          email: this.email,
          password: this.password,
        };

        const { mutate } = await useMutation(query, { variables });

        const {
          data: {
            login: { token },
          },
        } = await mutate();

        if (token) {
          this.success = true;
          this.successMessage = ["Login realizado com sucesso"];
          localStorage.setItem("userToken", token);
          onLogin(token);
          this.$router.push("/");
        }
      } catch (error) {
        this.error = true;
        this.errorMessage = error.message;
      }
      this.loading = false;
    },

    async resetPassword() {
      try {
        this.loading = true;

        const query = gql`
          ${FORGOT_PASSWORD}
        `;

        if (this.email == "") {
          this.error = true;
          this.errorMessageEmail = "E-mail é obrigatório";
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
        this.error = true;
        this.errorMessage = error.message;
      }
      this.loading = false;
    },
  },
};
</script>
