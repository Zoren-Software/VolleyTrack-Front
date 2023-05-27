<template>
  <ZLoginForm />
</template>

<script>

import ZLoginForm from '~/components/organisms/Forms/ZLoginForm'

definePageMeta({
  layout: "login",
});

export default {
  components: {
    ZLoginForm,
  },
}
</script>