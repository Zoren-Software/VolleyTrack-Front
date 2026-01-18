<template>
  <div class="training-cell">
    <div class="training-header">
      <div class="training-id">Treino #{{ data.id }}</div>
      <div class="training-status-badge" :class="statusClass">
        {{ statusLabel }}
      </div>
    </div>
    <div class="training-name">{{ data.name }}</div>
    <div v-if="isBeforeTrainingDate()" class="training-metrics">
      <div class="metrics-header">
        <span class="metrics-label">Confirmações de Treino</span>
        <span class="metrics-percentage"
          >{{ roundedConfirmationTraining }}%</span
        >
      </div>
      <div class="progress-bar-container">
        <div
          class="progress-bar-fill"
          :style="{ width: metricsConfirmationTraining + '%' }"
        ></div>
      </div>
    </div>
    <div v-else class="training-metrics">
      <div class="metrics-header">
        <span class="metrics-label">Presença no Treino</span>
        <span class="metrics-percentage success"
          >{{ roundedConfirmationPresence }}%</span
        >
      </div>
      <div class="progress-bar-container">
        <div
          class="progress-bar-fill success"
          :style="{ width: metricsConfirmationPresence + '%' }"
        ></div>
      </div>
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
    roundedConfirmationTraining() {
      return Math.round(this.metricsConfirmationTraining);
    },
    roundedConfirmationPresence() {
      return Math.round(this.metricsConfirmationPresence);
    },
    status() {
      // Usar displayStatus se disponível, caso contrário usar status
      return this.data.displayStatus || this.data.status || "pending";
    },
    statusLabel() {
      const statusMap = {
        pending: "Agendado",
        pending_action: "Pendente ação",
        finished: "Finalizado",
        cancelled: "Cancelado",
      };
      return statusMap[this.status.toLowerCase()] || "Agendado";
    },
    statusClass() {
      const status = this.status.toLowerCase();
      return {
        "status-pending": status === "pending",
        "status-pending-action": status === "pending_action",
        "status-finished": status === "finished",
        "status-cancelled": status === "cancelled",
      };
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

<style scoped>
.training-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.training-id {
  font-weight: 700;
  font-size: 13px;
  color: #e9742b;
  line-height: 1.4;
}

.training-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-finished {
  background-color: #d1fae5;
  color: #059669;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-pending-action {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.training-name {
  font-weight: 600;
  font-size: 14px;
  color: #0b1e3a;
  line-height: 1.4;
}

.training-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metrics-label {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
}

.metrics-percentage {
  font-size: 14px;
  font-weight: 700;
  color: #e9742b;
}

.metrics-percentage.success {
  color: #28a745;
}

.progress-bar-container {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #e9742b 0%, #f5a872 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-bar-fill.success {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
}
</style>
