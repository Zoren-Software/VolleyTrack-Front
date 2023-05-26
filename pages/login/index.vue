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
          <ZInput
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

import LOGIN from '~/graphql/user/mutation/login.graphql'
import ZInput from '~/components/atoms/ZInput'

definePageMeta({
  layout: "login",
});

export default {
  components: {
    ZInput
  },

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
      try {
        const { onLogin } = useApollo()

        const query = gql`
          ${LOGIN}
        `
        const variables = {
          email: this.email,
          password: this.password
        }

        const {mutate} = await useMutation(query, {variables})

        const { data:{login:{token}} } = await mutate()

        if (token) {
          localStorage.setItem('userToken', token); 
          onLogin(token)
          this.$router.push('/')
        }

      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>