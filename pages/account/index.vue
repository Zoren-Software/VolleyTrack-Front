<template>
  <!-- imprimir o Json de user quebrando linhas -->
  <pre>{{ JSON.stringify(user, null, 2) }}</pre>
</template>

<script>
export default {
  data() {
    return {
      user: {}
    }
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user'))
  }
}
</script>