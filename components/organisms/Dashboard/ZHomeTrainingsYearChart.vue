<template>
  <div class="year-chart-card">
    <div v-if="loading" class="year-chart-card__loading">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando grafico mensal...</span>
    </div>

    <div v-else-if="errorMessage" class="year-chart-card__error">
      <va-icon name="error_outline" size="20px" color="#dc3545" />
      <span>{{ errorMessage }}</span>
    </div>

    <template v-else>
      <div class="year-chart-card__body">
        <div class="year-chart-card__chart-wrap">
          <div class="year-chart-card__chart-header">
            <p class="year-chart-card__eyebrow">Treinos de {{ periodLabel }}</p>
            <div
              class="year-chart-card__period-radios"
              role="radiogroup"
              aria-label="Selecionar periodo do grafico"
            >
              <label
                v-for="option in periodOptions"
                :key="option.value"
                class="year-chart-card__radio-option"
                :class="{
                  'year-chart-card__radio-option--active': selectedPeriod === option.value,
                }"
              >
                <input
                  v-model="selectedPeriod"
                  type="radio"
                  name="chart-period"
                  :value="option.value"
                  class="year-chart-card__radio-input"
                />
                <span class="year-chart-card__radio-label">{{ option.label }}</span>
              </label>
            </div>
          </div>
          <p v-if="usingDemoData" class="year-chart-card__hint">
            Valores simulados para visualizacao do layout.
          </p>

          <div class="year-chart-card__canvas">
            <Line v-if="hasAnyData" :data="chartData" :options="chartOptions" />
            <div v-else class="year-chart-card__empty-chart">
              <va-icon name="show_chart" size="40px" color="#c5c5c5" />
              <p>Nenhum treino encontrado neste mes.</p>
            </div>
          </div>
        </div>

        <div class="year-chart-card__pie-panel">
          <p class="year-chart-card__pie-title">{{ pieTitle }}</p>
          <div class="year-chart-card__pie-canvas">
            <Doughnut :data="pieData" :options="pieOptions" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { Line, Doughnut } from "vue-chartjs";
import HOME_TRAININGS_STATUS_CHART from "~/graphql/dashboard/query/homeTrainingsStatusChart.graphql";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export default {
  name: "ZHomeTrainingsYearChart",
  components: { Line, Doughnut },
  data() {
    return {
      loading: true,
      errorMessage: null,
      selectedPeriod: "month",
      periodOptions: [
        { label: "Mes", value: "month" },
        { label: "Ano", value: "year" },
      ],
      labels: [],
      scheduledSeries: [],
      canceledSeries: [],
      finalizedSeries: [],
      chartYear: new Date().getFullYear(),
      usingDemoData: false,
    };
  },
  computed: {
    monthLabel() {
      try {
        const raw = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
          new Date(),
        );
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      } catch {
        return "Mes atual";
      }
    },
    periodLabel() {
      if (this.selectedPeriod === "year") {
        return this.chartYear;
      }

      return this.monthLabel;
    },
    pieTitle() {
      return this.selectedPeriod === "year" ? "Totais do ano" : "Totais do mes";
    },
    scheduledTotal() {
      return this.scheduledSeries.reduce((acc, n) => acc + n, 0);
    },
    canceledTotal() {
      return this.canceledSeries.reduce((acc, n) => acc + n, 0);
    },
    finalizedTotal() {
      return this.finalizedSeries.reduce((acc, n) => acc + n, 0);
    },
    hasAnyData() {
      return this.scheduledTotal + this.canceledTotal + this.finalizedTotal > 0;
    },
    chartData() {
      return {
        labels: this.labels,
        datasets: [
          {
            label: "Agendado",
            data: this.scheduledSeries,
            borderColor: "#FF4E1B",
            backgroundColor: "rgba(255, 78, 27, 0.16)",
            pointBackgroundColor: "#FF4E1B",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: false,
          },
          {
            label: "Cancelado",
            data: this.canceledSeries,
            borderColor: "#DC3545",
            backgroundColor: "rgba(220, 53, 69, 0.14)",
            pointBackgroundColor: "#DC3545",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: false,
          },
          {
            label: "Finalizado",
            data: this.finalizedSeries,
            borderColor: "#16A34A",
            backgroundColor: "rgba(22, 163, 74, 0.14)",
            pointBackgroundColor: "#16A34A",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: false,
          },
        ],
      };
    },
    chartOptions() {
      const maxValue = Math.max(
        1,
        ...this.scheduledSeries,
        ...this.canceledSeries,
        ...this.finalizedSeries,
      );

      const niceMax = Math.max(5, Math.ceil(maxValue / 5) * 5);

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            align: "start",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8,
              color: "#4b5563",
              font: {
                size: 12,
                weight: "600",
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const n = ctx.parsed.y;
                return `${ctx.dataset.label}: ${n} treino${n === 1 ? "" : "s"}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#6b7280",
              font: {
                size: 11,
                weight: "600",
              },
            },
          },
          y: {
            beginAtZero: true,
            max: niceMax,
            ticks: {
              stepSize: Math.max(1, Math.ceil(niceMax / 5)),
              color: "#8b949e",
              font: {
                size: 11,
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.06)",
              drawBorder: false,
            },
          },
        },
      };
    },
    pieData() {
      return {
        labels: ["Agendado", "Cancelado", "Finalizado"],
        datasets: [
          {
            data: [this.scheduledTotal, this.canceledTotal, this.finalizedTotal],
            backgroundColor: ["#FF4E1B", "#DC3545", "#16A34A"],
            borderColor: ["#ffffff", "#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      };
    },
    pieOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8,
              color: "#4b5563",
              font: {
                size: 11,
                weight: "600",
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const n = Number(ctx.parsed || 0);
                return `${ctx.label}: ${n} treino${n === 1 ? "" : "s"}`;
              },
            },
          },
        },
      };
    },
  },
  watch: {
    selectedPeriod() {
      this.loadChartData();
    },
  },
  mounted() {
    this.loadChartData();
  },
  methods: {
    graphqlPeriod() {
      return this.selectedPeriod === "year" ? "YEAR" : "MONTH";
    },

    resetSeries() {
      this.labels = [];
      this.scheduledSeries = [];
      this.canceledSeries = [];
      this.finalizedSeries = [];
    },

    applyChartPayload(payload) {
      this.labels = [...(payload?.labels || [])];
      this.scheduledSeries = [...(payload?.scheduled || [])];
      this.canceledSeries = [...(payload?.cancelled || [])];
      this.finalizedSeries = [...(payload?.finished || [])];
      this.chartYear = payload?.year || new Date().getFullYear();
      this.usingDemoData = false;
    },

    async loadChartData() {
      this.loading = true;
      this.errorMessage = null;
      this.resetSeries();

      try {
        const query = gql`
          ${HOME_TRAININGS_STATUS_CHART}
        `;
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          throw new Error("Cliente GraphQL indisponivel.");
        }

        const now = new Date();
        const variables = {
          period: this.graphqlPeriod(),
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        };

        const result = await apolloClient.query({
          query,
          variables,
          fetchPolicy: "network-only",
        });

        const payload = result?.data?.homeTrainingsStatusChart;
        if (!payload) {
          throw new Error("Nao foi possivel carregar os dados do grafico.");
        }

        this.applyChartPayload(payload);
      } catch (error) {
        console.warn("ZHomeTrainingsYearChart: erro ao carregar grafico", error);
        this.errorMessage = "Nao foi possivel carregar o grafico de treinos.";
        this.usingDemoData = false;
      } finally {
        this.loading = false;
      }
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
  grid-template-columns: 1fr minmax(160px, 220px);
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

.year-chart-card__chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.year-chart-card__period-radios {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.year-chart-card__radio-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid #dbe1e8;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.year-chart-card__radio-option--active {
  background: rgba(255, 78, 27, 0.1);
  border-color: rgba(255, 78, 27, 0.35);
  color: #c2410c;
  box-shadow: 0 0 0 3px rgba(255, 78, 27, 0.08);
}

.year-chart-card__radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.year-chart-card__radio-label {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
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

.year-chart-card__pie-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 8px 0 8px 12px;
  border-left: 1px solid #eef0f3;
}

.year-chart-card__pie-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0b1e3a;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.year-chart-card__pie-canvas {
  position: relative;
  width: 100%;
  height: 220px;
}

@media (max-width: 900px) {
  .year-chart-card__body {
    grid-template-columns: 1fr;
  }

  .year-chart-card__pie-panel {
    border-left: none;
    border-top: 1px solid #eef0f3;
    padding: 16px 0 0 0;
    gap: 10px;
  }

  .year-chart-card__pie-canvas {
    height: 200px;
  }
}
</style>
