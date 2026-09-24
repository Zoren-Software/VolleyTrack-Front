<template>
  <div class="metrics-card">
    <div class="metrics-card-header">
      <h3 class="metrics-card-title">{{ title }}</h3>
    </div>
    <div class="metrics-card-content">
      <div class="metrics-columns">
        <div class="metric-column">
          <span class="column-label">Confirmados</span>
          <span class="column-value">{{ data.confirmed }}</span>
        </div>
        <div class="metric-column">
          <span class="column-label">Pendentes</span>
          <span class="column-value">{{ data.pending }}</span>
        </div>
        <div class="metric-column">
          <span class="column-label">Rejeitados</span>
          <span class="column-value">{{ data.rejected }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
.metrics-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.metrics-card-header {
  background: linear-gradient(135deg, #FF4E1B 0%, #ff6b35 100%);
  padding: 16px 20px;
}

.metrics-card-title {
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metrics-card-content {
  padding: 20px;
}

.metrics-columns {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
}

.metric-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 14px 10px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 8px;
}

.column-label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 600;
  line-height: 1.2;
}

.column-value {
  font-size: 22px;
  font-weight: 700;
  color: #0b1e3a;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 520px) {
  .metrics-columns {
    flex-direction: column;
  }

  .metric-column {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    align-items: center;
  }

  .column-label {
    text-align: left;
  }
}
</style>
