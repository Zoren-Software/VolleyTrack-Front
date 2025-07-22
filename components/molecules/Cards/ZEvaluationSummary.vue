<template>
  <ZCard title="Resumo da Avaliação" class="evaluation-summary">
    <div class="summary-content">
      <!-- Estatísticas Gerais -->
      <div class="general-stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalEvaluations }}</div>
          <div class="stat-label">Total de Avaliações</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ efficiencyPercentage }}%</div>
          <div class="stat-label">Eficiência (A)</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ regularPercentage }}%</div>
          <div class="stat-label">Regular (B)</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ errorPercentage }}%</div>
          <div class="stat-label">Erros (C)</div>
        </div>
      </div>

      <!-- Gráfico de Barras por Fundamentos -->
      <div class="fundamentals-chart">
        <h4 class="chart-title">Performance por Fundamentos</h4>
        <div class="chart-bars">
          <div
            v-for="fundamental in fundamentalsData"
            :key="fundamental.id"
            class="chart-bar-group"
          >
            <div class="fundamental-name">{{ fundamental.name }}</div>
            <div class="bar-container">
              <div
                class="bar-segment bar-a"
                :style="{ width: fundamental.aPercentage + '%' }"
              ></div>
              <div
                class="bar-segment bar-b"
                :style="{ width: fundamental.bPercentage + '%' }"
              ></div>
              <div
                class="bar-segment bar-c"
                :style="{ width: fundamental.cPercentage + '%' }"
              ></div>
            </div>
            <div class="bar-total">{{ fundamental.total }}</div>
          </div>
        </div>
      </div>

      <!-- Fundamentos com Melhor e Pior Performance -->
      <div class="performance-highlights">
        <div class="highlight-item best">
          <va-icon name="trophy" color="success" />
          <div class="highlight-content">
            <div class="highlight-label">Melhor Fundamentos</div>
            <div class="highlight-value">{{ bestFundamental }}</div>
          </div>
        </div>
        <div class="highlight-item worst">
          <va-icon name="exclamation-triangle" color="warning" />
          <div class="highlight-content">
            <div class="highlight-label">Precisa Melhorar</div>
            <div class="highlight-value">{{ worstFundamental }}</div>
          </div>
        </div>
      </div>
    </div>
  </ZCard>
</template>

<script setup>
import { computed } from "vue";
import ZCard from "~/components/atoms/Cards/ZCard.vue";

// Props
const props = defineProps({
  evaluations: {
    type: Object,
    default: () => ({}),
  },
});

// Computed
const totalEvaluations = computed(() => {
  let total = 0;
  Object.values(props.evaluations).forEach((evaluation) => {
    total += evaluation.a + evaluation.b + evaluation.c;
  });
  return total;
});

const totalA = computed(() => {
  let total = 0;
  Object.values(props.evaluations).forEach((evaluation) => {
    total += evaluation.a;
  });
  return total;
});

const totalB = computed(() => {
  let total = 0;
  Object.values(props.evaluations).forEach((evaluation) => {
    total += evaluation.b;
  });
  return total;
});

const totalC = computed(() => {
  let total = 0;
  Object.values(props.evaluations).forEach((evaluation) => {
    total += evaluation.c;
  });
  return total;
});

const efficiencyPercentage = computed(() => {
  if (totalEvaluations.value === 0) return 0;
  return Math.round((totalA.value / totalEvaluations.value) * 100);
});

const regularPercentage = computed(() => {
  if (totalEvaluations.value === 0) return 0;
  return Math.round((totalB.value / totalEvaluations.value) * 100);
});

const errorPercentage = computed(() => {
  if (totalEvaluations.value === 0) return 0;
  return Math.round((totalC.value / totalEvaluations.value) * 100);
});

const fundamentalsData = computed(() => {
  const fundamentals = [
    { id: "saque", name: "Saque" },
    { id: "recepcao", name: "Recepção" },
    { id: "ataque", name: "Ataque" },
    { id: "bloqueio", name: "Bloqueio" },
    { id: "defesa", name: "Defesa" },
    { id: "levantamento", name: "Levantamento" },
  ];

  return fundamentals.map((fundamental) => {
    const evaluation = props.evaluations[fundamental.id] || {
      a: 0,
      b: 0,
      c: 0,
    };
    const total = evaluation.a + evaluation.b + evaluation.c;

    return {
      ...fundamental,
      ...eval,
      total,
      aPercentage: total > 0 ? (eval.a / total) * 100 : 0,
      bPercentage: total > 0 ? (eval.b / total) * 100 : 0,
      cPercentage: total > 0 ? (eval.c / total) * 100 : 0,
    };
  });
});

const bestFundamental = computed(() => {
  if (fundamentalsData.value.length === 0) return "N/A";

  const best = fundamentalsData.value.reduce((prev, current) => {
    const prevEfficiency = prev.total > 0 ? (prev.a / prev.total) * 100 : 0;
    const currentEfficiency =
      current.total > 0 ? (current.a / current.total) * 100 : 0;
    return currentEfficiency > prevEfficiency ? current : prev;
  });

  return best.name;
});

const worstFundamental = computed(() => {
  if (fundamentalsData.value.length === 0) return "N/A";

  const worst = fundamentalsData.value.reduce((prev, current) => {
    const prevErrorRate = prev.total > 0 ? (prev.c / prev.total) * 100 : 0;
    const currentErrorRate =
      current.total > 0 ? (current.c / current.total) * 100 : 0;
    return currentErrorRate > prevErrorRate ? current : prev;
  });

  return worst.name;
});
</script>

<style scoped>
.evaluation-summary {
  height: 100%;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.general-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2196f3;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.fundamentals-chart {
  margin-top: 16px;
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fundamental-name {
  min-width: 80px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.bar-container {
  flex: 1;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

.bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.bar-a {
  background-color: #4caf50;
}

.bar-b {
  background-color: #ff9800;
}

.bar-c {
  background-color: #f44336;
}

.bar-total {
  min-width: 30px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.performance-highlights {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.highlight-item.best {
  border-left: 4px solid #4caf50;
}

.highlight-item.worst {
  border-left: 4px solid #ff9800;
}

.highlight-content {
  flex: 1;
}

.highlight-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
}

.highlight-value {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

/* Responsividade */
@media (max-width: 768px) {
  .general-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .performance-highlights {
    grid-template-columns: 1fr;
  }

  .chart-bar-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .fundamental-name {
    min-width: auto;
  }

  .bar-container {
    width: 100%;
  }
}
</style>
