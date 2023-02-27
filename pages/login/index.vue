<template>
  <va-form>
    <div class="row justify-center px-3 pb-4">
      <div class="flex flex-col">
        <div class="item">
          <va-input
            v-model="inputValue1"
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
            v-model="inputValue2"
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
        @click="submit"
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
      inputValue1: '',
      inputValue2: '',
    }
  },

  methods: {
    verifyValueIsEmail() {
      if (this.inputValue1.includes('@')) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>