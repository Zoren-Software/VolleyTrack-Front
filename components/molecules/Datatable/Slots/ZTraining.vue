<template>
  <div>
    <div class="mb-2">
      {{ data.name }}
    </div>
    <div v-if="isBeforeTrainingDate()">
      <div class="mb-1">
        <span class="va-text-secondary"> Confirmações de Treino </span>
      </div>
      <VaProgressBar
        size="large"
        :model-value="metricsConfirmationTraining"
        show-percent
        content-inside
      />
    </div>
    <div v-else>
      <div class="mb-1">
        <span class="va-text-secondary"> Presença no Treino </span>
      </div>
      <VaProgressBar
        size="large"
        :model-value="metricsConfirmationPresence"
        show-percent
        content-inside
        color="success"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    metrics: {
      type: Object,
      required: true,
    },
  },
  methods: {
    isBeforeTrainingDate() {
      return new Date(this.data.dateStart) > new Date();
    },
  },
  computed: {
    metricsConfirmationTraining() {
      return this.metrics.confirmedPercentage + this.metrics.rejectedPercentage;
    },
    metricsConfirmationPresence() {
      return this.metrics.presencePercentage;
    },
  },
};
</script>
