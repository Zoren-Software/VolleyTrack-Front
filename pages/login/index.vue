<template>
  <div class="logo-wrapper">
    <img src="/images/logo/logo-volleytrack.png" alt="logo" class="logo" />
  </div>
  <ZLoginForm />
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
  height: auto;
  display: block;
  position: relative;
  z-index: 2;
}

@media (min-width: 2013px) {
  .logo {
    margin-left: 3rem;
    width: 15rem;
    margin-right: auto;
  }
}

@media (max-width: 2013px) {
  .logo {
    width: 15rem;
    margin-left: 3rem;
    margin-right: auto;
  }
}

@media (max-width: 1435px) {
  .logo {
    width: 15rem;
    margin-left: 2rem;
    margin-right: auto;
  }
}
@media (max-width: 991px) {
  .logo {
    width: 12rem;
    margin-left: 2rem;
    margin-right: auto;
  }
}
</style>
