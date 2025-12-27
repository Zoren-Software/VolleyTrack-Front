<template>
  <div class="training-technical-vision-section">
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="swap_horiz" size="24px" color="#0B1E3A" />
        <h2 class="section-title">Visão Técnica dos Treinos</h2>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando visão técnica...</span>
    </div>

    <div
      v-else-if="
        !data ||
        (!data.trainingFocus?.length && !data.trainingsPerMonth?.length)
      "
      class="empty-state"
    >
      <va-icon name="info" size="48px" color="#9E9E9E" />
      <p class="empty-text">Nenhum dado disponível</p>
    </div>

    <div v-else class="charts-grid">
      <!-- Card: Foco dos Treinos -->
      <div class="chart-card focus-card">
        <h3 class="chart-title focus-title">Foco dos Treinos</h3>
        <div class="chart-content">
          <Bar
            v-if="data.trainingFocus?.length"
            :data="trainingFocusChartData"
            :options="horizontalBarOptions"
          />
        </div>
      </div>

      <!-- Card: Treinos por Mês -->
      <div class="chart-card monthly-card">
        <h3 class="chart-title monthly-title">Treinos por Mês</h3>
        <div class="chart-content">
          <Bar
            v-if="data.trainingsPerMonth?.length"
            :data="trainingsPerMonthChartData"
            :options="verticalBarOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import TRAINING_TECHNICAL_VISION from "~/graphql/dashboard/query/trainingTechnicalVision.graphql";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Plugin customizado para mostrar valores nas barras
const barValuePlugin = {
  id: "barValuePlugin",
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (value !== null && value !== undefined) {
          const xPos = bar.x;
          const yPos = bar.y;

          ctx.save();

          // Para barras horizontais
          if (chart.options.indexAxis === "y") {
            const barRight = bar.x + (bar.width || 0);
            const barLeft = bar.x;
            const chartRight = chartArea.right;

            // Medir o texto para saber o espaço necessário
            ctx.font = "700 13px sans-serif";
            const textMetrics = ctx.measureText(value.toString());
            const textWidth = textMetrics.width;

            ctx.textBaseline = "middle";

            // Sempre mostrar o valor no final direito da barra
            // Se a barra é grande o suficiente para o texto, colocar dentro (branco)
            if (bar.width > textWidth + 10) {
              ctx.textAlign = "right";
              ctx.fillStyle = "#ffffff";
              ctx.fillText(value, barRight - 5, yPos);
            } else {
              // Se a barra é pequena, colocar dentro mesmo assim (branco) ou à direita se não couber
              if (barRight + textWidth + 10 <= chartRight) {
                // Cabe à direita da barra
                ctx.textAlign = "left";
                ctx.fillStyle = "#0b1e3a";
                ctx.fillText(value, barRight + 5, yPos);
              } else {
                // Não cabe, colocar dentro da barra (branco)
                ctx.textAlign = "right";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(value, barRight - 5, yPos);
              }
            }
          } else {
            // Para barras verticais
            const barTop = bar.y;
            const chartTop = chartArea.top;
            const isAtMax = barTop <= chartTop + 10;

            ctx.textAlign = "center";
            ctx.font = "700 12px sans-serif";
            ctx.fillStyle = "#0b1e3a";

            if (isAtMax) {
              // Se está no máximo, colocar um pouco mais abaixo
              ctx.textBaseline = "top";
              ctx.fillText(value, xPos, barTop + 5);
            } else {
              // Caso contrário, colocar no topo
              ctx.textBaseline = "bottom";
              ctx.fillText(value, xPos, barTop - 5);
            }
          }

          ctx.restore();
        }
      });
    });
  },
};

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Registrar plugin customizado
ChartJS.register(barValuePlugin);

export default {
  name: "ZTrainingTechnicalVision",
  components: {
    Bar,
  },
  data() {
    return {
      data: null,
      loading: false,
    };
  },
  computed: {
    trainingFocusChartData() {
      if (!this.data?.trainingFocus?.length) {
        return {
          labels: [],
          datasets: [],
        };
      }

      const colors = ["#e9742b", "#1976d2", "#0b1e3a", "#e9742b"];
      const backgroundColors = this.data.trainingFocus.map(
        (_, index) => colors[index % colors.length]
      );

      return {
        labels: this.data.trainingFocus.map((item) => item.fundamentalName),
        datasets: [
          {
            label: "Quantidade",
            data: this.data.trainingFocus.map((item) => item.count),
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 0,
            borderRadius: 4,
            barThickness: 30,
            maxBarThickness: 40,
          },
        ],
      };
    },
    trainingsPerMonthChartData() {
      if (!this.data?.trainingsPerMonth?.length) {
        return {
          labels: [],
          datasets: [],
        };
      }

      const colors = ["#e9742b", "#1976d2", "#0b1e3a", "#e9742b"];
      const backgroundColors = this.data.trainingsPerMonth.map(
        (_, index) => colors[index % colors.length]
      );

      return {
        labels: this.data.trainingsPerMonth.map((item) => item.month),
        datasets: [
          {
            label: "Treinos",
            data: this.data.trainingsPerMonth.map((item) => item.count),
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 0,
            borderRadius: 4,
            barThickness: 40,
            maxBarThickness: 50,
          },
        ],
      };
    },
    horizontalBarOptions() {
      return {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            right: 40, // Espaço extra à direita para os valores
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                return `Quantidade: ${context.parsed.x}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
              },
              color: "#6c757d",
            },
            grid: {
              display: false,
            },
          },
          y: {
            ticks: {
              font: {
                size: 13,
                weight: 600,
              },
              color: "#0b1e3a",
            },
            grid: {
              display: false,
            },
          },
        },
      };
    },
    verticalBarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 20, // Espaço extra no topo para os valores
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                return `Treinos: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 12,
                weight: 600,
              },
              color: "#0b1e3a",
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
              },
              color: "#6c757d",
            },
            grid: {
              display: false,
            },
          },
        },
      };
    },
  },
  mounted() {
    this.getTrainingTechnicalVision();
  },
  methods: {
    getTrainingTechnicalVision(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${TRAINING_TECHNICAL_VISION}
      `;

      const variables = {
        filter: {},
      };

      const {
        result: { value },
      } = useQuery(query, variables, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-and-network",
      });

      const { onResult } = useQuery(query, variables);

      onResult((result) => {
        if (result?.data?.trainingTechnicalVision) {
          this.data = result.data.trainingTechnicalVision;
        }
        this.loading = false;
      });

      if (value) {
        if (value?.trainingTechnicalVision) {
          this.data = value.trainingTechnicalVision;
        }
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.training-technical-vision-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-text {
  color: #6c757d;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.empty-text {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: stretch;
  height: 236px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  height: 100%;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.focus-title {
  color: #e9742b;
}

.monthly-title {
  color: #1976d2;
}

.chart-content {
  height: 300px;
  position: relative;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .training-technical-vision-section {
    padding: 16px;
    margin-top: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .chart-card {
    padding: 16px;
  }

  .chart-title {
    font-size: 15px;
    margin-bottom: 16px;
  }

  .bars-container {
    height: 180px;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .training-technical-vision-section {
    padding: 12px;
    border-radius: 8px;
  }

  .section-title {
    font-size: 16px;
  }

  .chart-card {
    padding: 12px;
    border-radius: 8px;
  }

  .chart-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .chart-content {
    gap: 12px;
  }

  .horizontal-bar {
    height: 20px;
  }

  .bars-container {
    height: 160px;
    gap: 6px;
  }

  .bar-value {
    font-size: 12px;
  }

  .monthly-label {
    font-size: 11px;
  }
}
</style>
