<template>
  <div class="metrics-card">
    <div class="metrics-card-header">
      <h3 class="metrics-card-title">{{ title }}</h3>
    </div>
    <div class="metrics-card-content">
      <div class="metrics-row">
        <div class="metrics-item">
          <span class="metrics-label">Confirmados:</span>
          <span class="metrics-value">{{ data.confirmed }}</span>
          <span class="metrics-percentage"
            >{{ formatPercentage(data.confirmedPercentage) }}%</span
          >
        </div>
        <div class="metrics-item">
          <span class="metrics-label">Pendentes:</span>
          <span class="metrics-value">{{ data.pending }}</span>
          <span class="metrics-percentage"
            >{{ formatPercentage(data.pendingPercentage) }}%</span
          >
        </div>
        <div class="metrics-item">
          <span class="metrics-label">Rejeitados:</span>
          <span class="metrics-value">{{ data.rejected }}</span>
          <span class="metrics-percentage"
            >{{ formatPercentage(data.rejectedPercentage) }}%</span
          >
        </div>
      </div>
      <div class="metrics-total">
        <span class="total-label">Total Pessoas no Time:</span>
        <span class="total-value">{{ data.total }}</span>
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
  methods: {
    formatPercentage(value) {
      if (value == null || value === undefined || isNaN(value)) {
        return "0.00";
      }
      return Number(value).toFixed(2);
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
  background: linear-gradient(135deg, #e9742b 0%, #ff6b35 100%);
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

.metrics-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.metrics-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 12px;
}

.metrics-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
  flex: 1;
}

.metrics-value {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
  min-width: 40px;
  text-align: right;
}

.metrics-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #e9742b;
  min-width: 50px;
  text-align: right;
}

.metrics-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff4ec;
  border-radius: 8px;
  border: 1px solid #ffe3d1;
}

.total-label {
  font-size: 14px;
  font-weight: 600;
  color: #0b1e3a;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #e9742b;
}

@media (max-width: 768px) {
  .metrics-item {
    flex-wrap: wrap;
  }

  .metrics-value,
  .metrics-percentage {
    min-width: auto;
  }
}
</style>
