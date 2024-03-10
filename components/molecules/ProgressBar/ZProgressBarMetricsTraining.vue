<template>
  <div>
    <div class="mb-1 mt-3">
      <span class="va-text-secondary"> Respostas de Intenção de Presença </span>
    </div>
    <VaProgressBar
      size="large"
      :model-value="metricsConfirmationTraining"
      show-percent
      content-inside
    />
  </div>
  <div>
    <div class="mb-1 mt-2">
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
  data() {
    return {
      metricsConfirmationTraining:
        this.metrics.confirmedPercentage + this.metrics.rejectedPercentage,
      metricsConfirmationPresence: this.metrics.presencePercentage,
    };
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
