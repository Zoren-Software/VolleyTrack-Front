<template>
  <va-card stripe stripe-color="primary" class="mx-5">
    <va-card-title> Set Password </va-card-title>
    <va-form>
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
        <ZButton
          :block="true"
          :disabled="buttonDisabled"
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
    };
  },

  methods: {
    async registerPassword() {
      try {
        //this.loading = true;

        const query = gql`
          ${USERSETPASSWORD}
        `;
        const variables = {
          email: this.email,
          password: this.password,
          passwordConfirmation: this.password,
          token: this.$route.params.token,
        };

        const { mutate } = await useMutation(query, { variables });

        this.loading = false;

        const {
          data: {
            userSetPassword: { token },
          },
        } = await mutate();

        this.$router.push("/login");
      } catch (error) {
        this.error = true;
        console.log(error);
        this.errorMessage = error;
      }
      this.loading = false;
    },

    emitValidFormEvent() {
      this.buttonDisabled = false;
    },
  },
};
</script>
