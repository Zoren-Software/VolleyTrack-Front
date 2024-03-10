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
          <h2 class="mt-2">Confirmados: {{ data.confirmed }}</h2>
          <h2>Pendentes: {{ data.pending }}</h2>
          <h2>Rejeitados: {{ data.rejected }}</h2>
        </div>
      </div>
      <div class="flex flex-col md3">
        <div class="item">
          <h2 class="mt-2">{{ data.confirmedPercentage }}%</h2>
          <h2>{{ data.pendingPercentage }}%</h2>
          <h2>{{ data.rejectedPercentage }}%</h2>
        </div>
      </div>
      <div class="flex flex-col md12 mt-3">
        <div class="item">
          <h2>
            Total Pessoas no Time:
            {{ data.confirmed + data.pending + data.rejected }}
          </h2>
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
