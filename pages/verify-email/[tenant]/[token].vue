<template>
  <div class="pa-6 text-center">
    Redirecionando…
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const config = useRuntimeConfig()

function backendBase (): string {
  return String(config.public.apiEndpoint || '')
    .replace(/\/graphql\/?$/i, '')
    .replace(/\/$/, '')
}

onMounted(() => {
  const base = backendBase()
  const tenant = route.params.tenant as string
  const token = route.params.token as string
  if (base && tenant && token) {
    window.location.replace(`${base}/verify-email/${encodeURIComponent(tenant)}/${encodeURIComponent(token)}`)
  }
})
</script>
