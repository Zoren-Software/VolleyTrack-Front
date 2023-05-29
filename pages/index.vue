<template>
  <div>
    <h1>
      <!-- Mostrar aqui o token do usuario vindo de localstorage -->
      {{ token  }}
      <ZList>

      </ZList>
    </h1>
  </div>
</template>

<script>

import ZList from '~/components/atoms/List/ZList'

export default {
  components: {
    ZList
  },
  data () {
    return {
      token: ''
    }
  },
  mounted () {
    this.token = localStorage.getItem('userToken') ?? 'sem token'
  }
}
</script>