<template>
  <ZCard
    :stripe="stripe"
    :stripe-color="stripeColor"
    :title="title"
    :color="color"
  >
    <slot />
    <ZButton color="primary" class="mt-3">{{ textButton }}</ZButton>
  </ZCard>
</template>

<script>
import ZCard from "~/components/molecules/Cards/ZCard";
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  components: {
    ZCard,
    ZButton,
  },
  props: {
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
    textButton: {
      type: String,
      default: "Adicionar",
    },
  },
};
</script>
