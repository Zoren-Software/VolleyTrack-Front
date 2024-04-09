<template>
  <ZSetPasswordForm />
</template>

<script setup>
import ZSetPasswordForm from "~/components/organisms/Forms/SetPassword/ZSetPasswordForm";

definePageMeta({
  layout: "login",
});

useHead({
  titleTemplate: "Set Password",
});
</script>
