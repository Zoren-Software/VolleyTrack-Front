<template>
  <div class="legal-links" :class="`legal-links--${variant}`">
    <a
      :href="privacyPolicyUrl"
      class="legal-links__anchor"
      :class="`legal-links__anchor--${variant}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      Política de Privacidade
    </a>
    <a
      :href="termsOfUseUrl"
      class="legal-links__anchor"
      :class="`legal-links__anchor--${variant}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      Termos de Uso
    </a>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "dark",
    validator: (value) => ["light", "dark"].includes(value),
  },
});

const config = useRuntimeConfig();

const privacyPolicyUrl = computed(() => {
  const url = String(config.public.privacyPolicyUrl ?? "").trim();
  return url || "https://volleytrack.com/privacy-policy";
});

const termsOfUseUrl = computed(() => {
  const url = String(config.public.termsOfUseUrl ?? "").trim();
  return url || "https://volleytrack.com/terms-of-use";
});
</script>

<style scoped>
.legal-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.legal-links__anchor {
  font-size: 12px;
  text-decoration: none;
  transition: opacity 0.15s ease;
  white-space: nowrap;
}

.legal-links__anchor:hover {
  text-decoration: underline;
}

.legal-links__anchor--dark {
  color: rgba(232, 238, 247, 0.55);
}

.legal-links__anchor--dark:hover {
  color: rgba(232, 238, 247, 0.85);
}

.legal-links__anchor--light {
  color: rgba(0, 0, 0, 0.45);
}

.legal-links__anchor--light:hover {
  color: rgba(0, 0, 0, 0.7);
}
</style>
