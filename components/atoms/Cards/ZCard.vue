<template>
  <VaCard :color="color" gradient :stripe="stripe" :stripe-color="stripeColor">
    <VaCardTitle>{{ title }}</VaCardTitle>
    <VaCardContent>
      <slot></slot>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
const props = defineProps({
  stripe: {
    type: Boolean,
    default: false,
  },
  stripeColor: {
    type: String,
    default: "primary",
  },
  title: {
    type: String,
    default: "Título",
  },
  color: {
    type: String,
    default: "primary",
  },
});
</script>
