<template>
  <va-card stripe stripe-color="primary" class="mx-5">
    <va-card-title> Set Password </va-card-title>
    <va-form @keyup.enter="login">
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
            <!-- <ZPasswordInput
              v-model="password"
              label="Password"
              id="password"
              placeholder="Senha"
              :confirmPasswordInput="true"
              :error="error"
              :error-messages="errorMessage"
              :success="success"
              :messages="successMessage"
            /> -->
            <ZPasswordInputWithConfirmPassword
              v-model="password"
              confirmPasswordInput
              name="password"
              passwordLabel="Senha Provisória"
              :error-messages="errorMessage"
              id="password"
              class="mb-3"
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
          Registrar Senha
        </ZButton>
      </div>
    </va-form>
  </va-card>
</template>

<script>
import LOGIN from "~/graphql/user/mutation/login.graphql";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZPasswordInputWithConfirmPassword from "~/components/molecules/Inputs/ZPasswordInputWithConfirmPassword";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZButton from "~/components/atoms/Buttons/ZButton";

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
  },
};
</script>
