<template>
  <div class="year-chart-card">
    <div v-if="loading" class="year-chart-card__loading">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando treinos…</span>
    </div>

    <div v-else-if="errorMessage" class="year-chart-card__error">
      <va-icon name="error_outline" size="20px" color="#dc3545" />
      <span>{{ errorMessage }}</span>
    </div>

    <template v-else>
      <div class="year-chart-card__body">
        <div class="year-chart-card__chart-wrap">
          <p class="year-chart-card__eyebrow">{{ eyebrowLabel }}</p>
          <p v-if="usingDemoData" class="year-chart-card__hint">
            Valores de exemplo (sem endpoint de agregação).
          </p>
          <div class="year-chart-card__canvas">
            <Bar v-if="hasAnyData" :data="chartData" :options="chartOptions" />
            <div v-else class="year-chart-card__empty-chart">
              <va-icon name="bar_chart" size="40px" color="#c5c5c5" />
              <p>Nenhum treino neste ano ainda.</p>
            </div>
          </div>
        </div>

        <div class="year-chart-card__stats">
          <div class="year-chart-card__stat year-chart-card__stat--primary">
            <span class="year-chart-card__stat-dot year-chart-card__stat-dot--orange" />
            <div class="year-chart-card__stat-text">
              <span class="year-chart-card__stat-label">{{ currentMonthLabel }}</span>
              <span class="year-chart-card__stat-value year-chart-card__stat-value--accent">
                {{ currentMonthTotal }}
                <span class="year-chart-card__stat-unit">treinos</span>
              </span>
            </div>
          </div>

          <div class="year-chart-card__stat">
            <span class="year-chart-card__stat-dot year-chart-card__stat-dot--muted" />
            <div class="year-chart-card__stat-text">
              <span class="year-chart-card__stat-label year-chart-card__stat-label--muted">{{
                chartYear
              }}</span>
              <span class="year-chart-card__stat-value">{{ yearTotal }} treinos</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/** Treinos por mês só para exibição até existir endpoint estável no backend. */
const DEMO_MONTH_COUNTS = [8, 14, 22, 18, 26, 12, 10, 16, 19, 15, 11, 9];

export default {
  name: "ZHomeTrainingsYearChart",
  components: { Bar },
  data() {
    return {
      loading: true,
      errorMessage: null,
      monthCounts: [...DEMO_MONTH_COUNTS],
      chartYear: new Date().getFullYear(),
      usingDemoData: true,
    };
  },
  computed: {
    eyebrowLabel() {
      return `Treinos em ${this.chartYear}`;
    },
    monthLabels() {
      return ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    },
    currentMonthIndex() {
      const now = new Date();
      if (now.getFullYear() !== this.chartYear) {
        return 11;
      }
      return now.getMonth();
    },
    currentMonthLabel() {
      try {
        const d = new Date(this.chartYear, this.currentMonthIndex, 1);
        const raw = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(d);
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      } catch {
        return "Mês atual";
      }
    },
    currentMonthTotal() {
      return this.monthCounts[this.currentMonthIndex] ?? 0;
    },
    yearTotal() {
      return this.monthCounts.reduce((a, b) => a + b, 0);
    },
    hasAnyData() {
      return this.yearTotal > 0;
    },
    chartData() {
      const orange = "#FF4E1B";
      return {
        labels: this.monthLabels,
        datasets: [
          {
            label: "Treinos",
            data: [...this.monthCounts],
            backgroundColor: this.monthLabels.map((_, i) =>
              i === this.currentMonthIndex ? orange : "rgba(255, 78, 27, 0.85)",
            ),
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            maxBarThickness: 28,
          },
        ],
      };
    },
    chartOptions() {
      const maxVal = Math.max(1, ...this.monthCounts);
      const niceMax = Math.max(5, Math.ceil(maxVal / 5) * 5);

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const n = ctx.parsed.y;
                return `${n} treino${n === 1 ? "" : "s"}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, weight: "600" },
              color: "#5c6570",
            },
          },
          y: {
            beginAtZero: true,
            max: niceMax,
            ticks: {
              stepSize: Math.max(1, Math.ceil(niceMax / 5)),
              font: { size: 11 },
              color: "#8b949e",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.06)",
              drawBorder: false,
            },
          },
        },
      };
    },
  },
  mounted() {
    this.bootstrapChart();
  },
  methods: {
    /**
     * Usa dados fixos para o gráfico. Quando houver endpoint (ex.: agregação por mês),
     * substitua por chamada GraphQL e defina usingDemoData = false.
     */
    bootstrapChart() {
      this.loading = true;
      this.errorMessage = null;
      this.chartYear = new Date().getFullYear();
      this.monthCounts = [...DEMO_MONTH_COUNTS];
      this.usingDemoData = true;
      this.$nextTick(() => {
        this.loading = false;
      });
    },
  },
};
</script>

<style scoped>
.year-chart-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef0f3;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px 22px 22px;
  width: 100%;
  box-sizing: border-box;
}

.year-chart-card__loading,
.year-chart-card__error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 200px;
  color: #5c6570;
  font-size: 14px;
}

.year-chart-card__error {
  color: #6c757d;
}

.year-chart-card__body {
  display: grid;
  grid-template-columns: 1fr minmax(140px, 200px);
  gap: 20px 24px;
  align-items: stretch;
}

.year-chart-card__eyebrow {
  margin: 0 0 10px 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8b949e;
}

.year-chart-card__hint {
  margin: -4px 0 10px 0;
  font-size: 11px;
  color: #9aa3ad;
  line-height: 1.35;
}

.year-chart-card__chart-wrap {
  min-width: 0;
}

.year-chart-card__canvas {
  position: relative;
  height: 240px;
  width: 100%;
}

.year-chart-card__canvas :deep(canvas) {
  max-height: 240px;
}

.year-chart-card__empty-chart {
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #8b949e;
  font-size: 14px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px dashed #e2e5ea;
}

.year-chart-card__empty-chart p {
  margin: 0;
}

.year-chart-card__stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
  padding: 8px 0 8px 12px;
  border-left: 1px solid #eef0f3;
}

.year-chart-card__stat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.year-chart-card__stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.year-chart-card__stat-dot--orange {
  background: #ff4e1b;
  box-shadow: 0 0 0 3px rgba(255, 78, 27, 0.2);
}

.year-chart-card__stat-dot--muted {
  background: #7c4dff;
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.18);
}

.year-chart-card__stat-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.year-chart-card__stat-label {
  font-size: 15px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.year-chart-card__stat-label--muted {
  font-size: 13px;
  font-weight: 600;
  color: #8b949e;
}

.year-chart-card__stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #0b1e3a;
  line-height: 1.15;
}

.year-chart-card__stat-value--accent {
  font-size: 26px;
  font-weight: 800;
  color: #3949ab;
}

.year-chart-card__stat-unit {
  font-size: 13px;
  font-weight: 600;
  color: #5c6570;
  margin-left: 4px;
}

@media (max-width: 900px) {
  .year-chart-card__body {
    grid-template-columns: 1fr;
  }

  .year-chart-card__stats {
    flex-direction: row;
    flex-wrap: wrap;
    border-left: none;
    border-top: 1px solid #eef0f3;
    padding: 16px 0 0 0;
    gap: 20px;
  }

  .year-chart-card__stat {
    flex: 1 1 140px;
  }
}
</style>
