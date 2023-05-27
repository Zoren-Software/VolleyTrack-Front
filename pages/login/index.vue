<template>
  <va-form>
    <div class="row justify-center px-3 pb-4">
      <div class="flex flex-col">
        <div class="item">
          <ZEmailInput
            v-model="email"
            label="E-mail"
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
          />
        </div>
      </div>
    </div>
    <div class="row justify-center px-3 pb-3">
      <ZButton
        :block="true"
        color="primary"
        @click="login"
      >
        Login
      </ZButton>
    </div>
  </va-form>
</template>

<script>

import LOGIN from '~/graphql/user/mutation/login.graphql'
import ZInput from '~/components/atoms/Inputs/ZInput'
import ZPasswordInput from '~/components/molecules/Inputs/ZPasswordInput'
import ZEmailInput from '~/components/molecules/Inputs/ZEmailInput'
import ZButton from '~/components/atoms/Buttons/ZButton'

definePageMeta({
  layout: "login",
});

export default {
  components: {
    ZInput,
    ZPasswordInput,
    ZButton,
    ZEmailInput
  },

  data () {
    return {
      email: 'admin@voleiclub.com',
      password: 'password',
    }
  },

  methods: {
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