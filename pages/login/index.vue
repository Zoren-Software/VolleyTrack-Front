<template>
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
