<template>
  <div class="login-container">
    <div class="logo-wrapper">
      <img src="/images/logo/logo-volleytrack.png" alt="logo" class="logo" />
    </div>
    <ZLoginForm />
  </div>
</template>

<script setup>
import ZLoginForm from "~/components/organisms/Forms/Login/ZLoginForm";

definePageMeta({
  layout: "login",
});

useHead({
  titleTemplate: "Login",
});
</script>

<style scoped>
.login-container {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.logo-wrapper {
  display: inline-block;
  padding: 10px;
  border-radius: 8px;
  filter: blur(0);
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.logo-wrapper::before {
  content: "";
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: linear-gradient(-45deg, #3f3431 50%, #dadada 50%);
  filter: blur(44px);
  z-index: -1;
  border-radius: 16px;
}

.logo {
  width: 245px;
  height: auto;
  display: block;
  position: relative;
  z-index: 2;
}
</style>
