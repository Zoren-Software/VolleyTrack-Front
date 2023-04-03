<template>
  <va-form>
    <div class="row justify-center px-3 pb-4">
      <div class="flex flex-col">
        <div class="item">
          <va-input
            v-model="email"
            label="E-mail"
            :rules="[value => (value && value.length > 0) || 'Este campo é obrigatório', value => verifyValueIsEmail() || 'Este campo deve ser um e-mail válido']"
          />
        </div>
      </div>
    </div>
    <div class="row justify-center px-3 pb-4">
      <div class="flex flex-col">
        <div class="item">
          <va-input
            v-model="password"
            type="password"
            label="Password"
            :rules="[value => (value && value.length > 0) || 'Este campo é obrigatório']"
          />
        </div>
      </div>
    </div>
    <div class="row justify-center px-3 pb-3">
      <va-button
        :block="true"
        color="primary"
        @click="login"
      >
        Login
      </va-button>
    </div>
  </va-form>
</template>

<script>
// This will work in both `<script setup>` and `<script>`
definePageMeta({
  layout: "login",
});

export default {
  data () {
    return {
      email: 'admin@voleiclub.com',
      password: 'password',
    }
  },

  methods: {
    verifyValueIsEmail() {
      if (this.email.includes('@')) {
        return true
      } else {
        return false
      }
    },

    async login() {
      console.log('login')
      try {
        const { data:{login} } = await this.$apollo.clients.default.mutate({
          mutation: gql`
            mutation login($email: String!, $password: String!) {
              login(input: { email: $email, password: $password }) {
                token
              }
            }
          `,
          variables: {
            email: this.email,
            password: this.password
          },
          context: {
            headers: {
              'x-tenant': window.location.hostname.split('.')[0]
            }
          }
        })
        useApollo().onLogin(login.token)
        console.log(useApollo().onLogin(login.token))
        // faça algo com o resultado
      } catch (error) {
        // trate o erro
        console.error(error)
      }
    }
  }
}
</script>