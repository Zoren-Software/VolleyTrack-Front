<template>
  <div>
    <h1>
      <!-- Mostrar aqui o token do usuario vindo de localstorage -->
      {{ token }}
      <pre>{{ JSON.stringify(user, null, 2) }}</pre>

      <ZList> </ZList>
    </h1>
  </div>
</template>

<script>
import ZList from "~/components/atoms/List/ZList";

export default {
  components: {
    ZList,
  },
  data() {
    return {
      token: "",
      user: {},
    };
  },
  mounted() {
    this.token = localStorage.getItem("userToken") ?? "sem token";
    this.user = JSON.parse(localStorage.getItem("user"));
  },
};
</script>
