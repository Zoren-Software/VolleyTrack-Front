<template>
  <va-form @keyup.enter="login">
    <div class="row justify-center px-3 pb-4">
      <div class="flex flex-col">
        <div class="item">
          <ZEmailInput
            v-model="email"
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
      <ZButton :block="true" :loading="loading" color="primary" @click="login">
        Login
      </ZButton>
    </div>
  </va-form>
</template>

<script>
import LOGIN from "~/graphql/user/mutation/login.graphql";
import ZInput from "~/components/atoms/Inputs/ZInput";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZButton from "~/components/atoms/Buttons/ZButton";

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
      errorMessage: [],
      loading: false,
      email: "admin@voleiclub.com",
      password: "password",
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
