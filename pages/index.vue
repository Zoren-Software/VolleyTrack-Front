<template>
  <div>
    <h1>
      <!-- Mostrar aqui o token do usuario vindo de localstorage -->
      {{ token  }}
    </h1>
  </div>
</template>

<script>

export default {
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