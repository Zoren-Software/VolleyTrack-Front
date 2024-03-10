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
import ZBadge from "~/components/atoms/Badges/ZBadge";
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  components: {
    ZBadge,
    ZButton,
  },
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
};
</script>
