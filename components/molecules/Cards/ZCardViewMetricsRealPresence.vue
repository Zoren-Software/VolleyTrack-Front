<template>
  <ZCard
    :stripe="stripe"
    :stripeColor="stripeColor"
    :title="title"
    :color="color"
  >
    <div class="row">
      <div class="flex flex-col md9">
        <div class="item">
          <h2>Presentes: {{ data.presence }}</h2>
          <h2>Ausentes: {{ data.absence }}</h2>
        </div>
      </div>
      <div class="flex flex-col md3">
        <div class="item">
          <h2>{{ data.presencePercentage }}%</h2>
          <h2>{{ data.absencePercentage }}%</h2>
        </div>
      </div>
    </div>
  </ZCard>
</template>

<script>
import ZCard from "~/components/atoms/Cards/ZCard";

export default {
  components: {
    ZCard,
  },
  emits: ["click"],
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
    icon: {
      type: String,
      default: "plus",
    },
    step: {
      type: Number,
      default: 0,
    },
    stepDisabled: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    textTotal: {
      type: String,
      default: "Registros",
    },
    isSlotEmpty: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped>
.border-custom {
  border-left: 2px solid var(--va-primary);
}
</style>
