<template>
  <div class="progress-bars-container">
    <div class="progress-bar-item">
      <div class="progress-bar-header">
        <span class="progress-bar-label"
          >Respostas de Intenção de Presença</span
        >
        <span class="progress-bar-percentage"
          >{{ formatPercentage(metricsConfirmationTraining) }}%</span
        >
      </div>
      <VaProgressBar
        size="large"
        :model-value="formattedMetricsConfirmationTraining"
        show-percent
        content-inside
        class="custom-progress-bar"
      />
    </div>
    <div class="progress-bar-item">
      <div class="progress-bar-header">
        <span class="progress-bar-label">Presença no Treino</span>
        <span class="progress-bar-percentage success"
          >{{ formatPercentage(metricsConfirmationPresence) }}%</span
        >
      </div>
      <VaProgressBar
        size="large"
        :model-value="formattedMetricsConfirmationPresence"
        show-percent
        content-inside
        color="success"
        class="custom-progress-bar"
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
  computed: {
    metricsConfirmationTraining() {
      return this.metrics.confirmedPercentage + this.metrics.rejectedPercentage;
    },
    metricsConfirmationPresence() {
      return this.metrics.presencePercentage;
    },
    formattedMetricsConfirmationTraining() {
      const value = this.metricsConfirmationTraining;
      if (value == null || value === undefined || isNaN(value)) {
        return 0;
      }
      return Number(Number(value).toFixed(2));
    },
    formattedMetricsConfirmationPresence() {
      const value = this.metricsConfirmationPresence;
      if (value == null || value === undefined || isNaN(value)) {
        return 0;
      }
      return Number(Number(value).toFixed(2));
    },
  },
  mounted() {
    this.formatProgressBarPercentages();
  },
  updated() {
    this.formatProgressBarPercentages();
  },
  methods: {
    isBeforeTrainingDate() {
      return new Date(this.data.dateStart) > new Date();
    },
    formatPercentage(value) {
      if (value == null || value === undefined || isNaN(value)) {
        return "0.00";
      }
      return Number(value).toFixed(2);
    },
    formatProgressBarPercentages() {
      this.$nextTick(() => {
        const progressBars = this.$el.querySelectorAll(".custom-progress-bar");
        progressBars.forEach((bar) => {
          const content = bar.querySelector(".va-progress-bar__content");
          if (content) {
            const text = content.textContent || content.innerText;
            if (text && text.includes("%")) {
              const percentageMatch = text.match(/(\d+\.?\d*)%/);
              if (percentageMatch) {
                const value = parseFloat(percentageMatch[1]);
                if (!isNaN(value)) {
                  const formatted = value.toFixed(2);
                  content.textContent = `${formatted}%`;
                }
              }
            }
          }
        });
      });
    },
  },
};
</script>

<style scoped>
.progress-bars-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-bar-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-bar-label {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.progress-bar-percentage {
  font-size: 16px;
  font-weight: 700;
  color: #e9742b;
}

.progress-bar-percentage.success {
  color: #28a745;
}

.custom-progress-bar {
  width: 100%;
}

/* Formatar porcentagem dentro da barra de progresso para 2 casas decimais */
.custom-progress-bar :deep(.va-progress-bar__content) {
  font-variant-numeric: tabular-nums;
}

/* Usar JavaScript para formatar o texto dentro da barra */
.custom-progress-bar :deep(.va-progress-bar__content) {
  font-feature-settings: "tnum";
}

@media (max-width: 768px) {
  .progress-bar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
