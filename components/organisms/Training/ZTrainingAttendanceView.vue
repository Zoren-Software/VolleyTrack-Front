<template>
  <div class="training-attendance-view">
    <div v-if="loading" class="state-row">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando lista de presença...</span>
    </div>

    <div v-else-if="!form.id" class="state-row state-row--empty">
      <va-icon name="info" size="20px" color="#6b7280" />
      <span>Treino não encontrado.</span>
    </div>

    <div v-else class="attendance-body">
      <div class="metrics-section">
        <div class="totals-grid">
          <div class="total-card total-card--players">
            <div class="total-icon">
              <va-icon name="people" size="26px" color="#E65100" />
            </div>
            <div class="total-info">
              <div class="total-label">Total Jogadores</div>
              <div class="total-number">{{ confirmationTrainingMetrics.total }}</div>
            </div>
          </div>

          <div class="total-card total-card--confirmed">
            <div class="total-icon">
              <va-icon name="task_alt" size="26px" color="#16A34A" />
            </div>
            <div class="total-info">
              <div class="total-label">Confirmados</div>
              <div class="total-number">{{ confirmationTrainingMetrics.confirmed }}</div>
            </div>
          </div>

          <div class="total-card total-card--rejected-intention">
            <div class="total-icon">
              <va-icon name="cancel" size="26px" color="#DC3545" />
            </div>
            <div class="total-info">
              <div class="total-label">Rejeitados</div>
              <div class="total-number">{{ confirmationTrainingMetrics.rejected }}</div>
            </div>
          </div>

          <div class="total-card total-card--present">
            <div class="total-icon">
              <va-icon name="how_to_reg" size="26px" color="#2563EB" />
            </div>
            <div class="total-info">
              <div class="total-label">Presentes</div>
              <div class="total-number">{{ confirmationTrainingMetrics.presence }}</div>
            </div>
          </div>

          <div class="total-card total-card--absent">
            <div class="total-icon">
              <va-icon name="person_off" size="26px" color="#6B7280" />
            </div>
            <div class="total-info">
              <div class="total-label">Ausentes</div>
              <div class="total-number">{{ confirmationTrainingMetrics.absence }}</div>
            </div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-panel">
            <div class="chart-panel__head">
              <div class="chart-panel__title-row">
                <va-icon name="event_available" size="24px" color="#FF4E1B" />
                <p class="chart-panel__title">Intenção de presença</p>
              </div>
            </div>
            <div class="chart-panel__canvas">
              <Pie
                v-if="intentionPieHasData"
                :data="intentionPieData"
                :options="intentionPieOptions"
              />
              <div v-else class="chart-panel__empty">
                <va-icon name="pie_chart" size="36px" color="#c5c5c5" />
                <span>Sem dados de intenção</span>
              </div>
            </div>
            <div class="chart-panel__foot chart-panel__foot--spacer" aria-hidden="true" />
          </div>

          <div class="chart-panel">
            <div class="chart-panel__head">
              <div class="chart-panel__title-row">
                <va-icon name="fact_check" size="24px" color="#FF4E1B" />
                <p class="chart-panel__title">Presença real</p>
              </div>
            </div>
            <div class="chart-panel__canvas">
              <Pie
                v-if="presencePieHasData"
                :data="presencePieData"
                :options="presencePieOptions"
              />
              <div v-else class="chart-panel__empty">
                <va-icon name="pie_chart" size="36px" color="#c5c5c5" />
                <span>Sem registro de presença</span>
              </div>
            </div>
            <div class="chart-panel__foot chart-panel__foot--spacer" aria-hidden="true" />
          </div>

          <div class="chart-panel chart-panel--comparison">
            <div class="chart-panel__head chart-panel__head--comparison">
              <div class="chart-panel__title-row">
                <va-icon name="compare_arrows" size="24px" color="#FF4E1B" />
                <p class="chart-panel__title">Confirmação × comparecimento</p>
              </div>
              <p class="chart-panel__subtitle">
                Quem confirmou presença e quem efetivamente foi
              </p>
            </div>
            <div class="chart-panel__canvas">
              <Bar
                v-if="comparisonBarHasData"
                :data="comparisonBarData"
                :options="comparisonBarOptions"
              />
              <div v-else class="chart-panel__empty">
                <va-icon name="compare_arrows" size="36px" color="#c5c5c5" />
                <span>Sem dados para comparar</span>
              </div>
            </div>
            <div class="chart-panel__foot">
              <div
                v-if="comparisonBarHasData"
                class="comparison-insight"
                :class="`comparison-insight--${comparisonInsightVariant}`"
              >
                <p class="comparison-insight__text">
                  {{ comparisonInsightText }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="players-list-section">
        <ZListRelationConfirmationTrainings
          :items="form.confirmationsTraining"
          :training-date="form.dateValue"
          @action-confirm="actionConfirm"
          @action-reject="actionReject"
          @action-confirm-presence="actionConfirmPresence"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Pie, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import TRAINING from "~/graphql/training/query/training.graphql";
import { transformTrainingData } from "~/utils/forms/trainingForm";
import ZListRelationConfirmationTrainings from "~/components/organisms/List/Relations/ZListRelationConfirmationTrainings";
import CONFIRMTRAINING from "~/graphql/training/mutation/confirmTraining.graphql";
import CONFIRMPRESENCE from "~/graphql/training/mutation/confirmPresence.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
);

export default defineComponent({
  name: "ZTrainingAttendanceView",
  components: {
    ZListRelationConfirmationTrainings,
    Pie,
    Bar,
  },
  props: {
    trainingId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      form: {},
    };
  },
  computed: {
    confirmationTrainingMetrics() {
      const confirmations = this.form.confirmationsTraining || [];

      const confirmed = confirmations.filter(
        (c) => c.status === "CONFIRMED" || c.status === "confirmed"
      ).length;
      const pending = confirmations.filter(
        (c) => c.status === "PENDING" || c.status === "pending"
      ).length;
      const rejected = confirmations.filter(
        (c) => c.status === "REJECTED" || c.status === "rejected"
      ).length;
      const presence = confirmations.filter((c) => c.presence === true).length;
      const absence = confirmations.filter((c) => c.presence === false).length;

      const total = confirmed + pending + rejected;

      return {
        confirmed,
        pending,
        rejected,
        total,
        confirmedPercentage: total > 0 ? (confirmed / total) * 100 : 0,
        pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
        rejectedPercentage: total > 0 ? (rejected / total) * 100 : 0,
        presence,
        absence,
        presencePercentage: total > 0 ? (presence / total) * 100 : 0,
        absencePercentage: total > 0 ? (absence / total) * 100 : 0,
      };
    },

    intentionPieHasData() {
      const m = this.confirmationTrainingMetrics;
      return m.total > 0;
    },

    presencePieHasData() {
      const m = this.confirmationTrainingMetrics;
      return m.presence + m.absence > 0;
    },

    comparisonBarHasData() {
      const m = this.confirmationTrainingMetrics;
      return m.confirmed > 0 || m.presence > 0;
    },

    comparisonAttendanceGap() {
      const m = this.confirmationTrainingMetrics;
      return m.presence - m.confirmed;
    },

    comparisonInsightText() {
      const d = this.comparisonAttendanceGap;
      if (d === 0) {
        return "Mesmo número de confirmações e de comparecimentos.";
      }
      if (d > 0) {
        return `${d} jogador${d === 1 ? "" : "es"} comparece${d === 1 ? "u" : "ram"} além das confirmações registradas.`;
      }
      const n = Math.abs(d);
      return `${n} jogador${n === 1 ? "" : "es"} confirm${n === 1 ? "ou" : "aram"} presença mas não comparece${n === 1 ? "u" : "ram"}.`;
    },

    comparisonInsightVariant() {
      const d = this.comparisonAttendanceGap;
      if (d === 0) return "balanced";
      if (d > 0) return "surplus";
      return "shortfall";
    },

    intentionPieData() {
      const m = this.confirmationTrainingMetrics;
      return {
        labels: ["Confirmados", "Pendentes", "Rejeitados"],
        datasets: [
          {
            data: [m.confirmed, m.pending, m.rejected],
            backgroundColor: ["#16A34A", "#F59E0B", "#DC3545"],
            borderColor: ["#ffffff", "#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      };
    },

    presencePieData() {
      const m = this.confirmationTrainingMetrics;
      return {
        labels: ["Presentes", "Rejeitados"],
        datasets: [
          {
            data: [m.presence, m.absence],
            backgroundColor: ["#2563EB", "#94A3B8"],
            borderColor: ["#ffffff", "#ffffff"],
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      };
    },

    intentionPieOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            align: "center",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8,
              padding: 12,
              color: "#4b5563",
              font: { size: 11, weight: "600" },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const n = Number(ctx.parsed ?? ctx.raw ?? 0);
                return `${ctx.label}: ${n} jogador${n === 1 ? "" : "es"}`;
              },
            },
          },
        },
      };
    },

    presencePieOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            align: "center",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8,
              padding: 12,
              color: "#4b5563",
              font: { size: 11, weight: "600" },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const n = Number(ctx.parsed ?? ctx.raw ?? 0);
                return `${ctx.label}: ${n} jogador${n === 1 ? "" : "es"}`;
              },
            },
          },
        },
      };
    },

    comparisonBarData() {
      const m = this.confirmationTrainingMetrics;
      return {
        labels: ["Confirmaram", "Compareceram"],
        datasets: [
          {
            label: "Jogadores",
            data: [m.confirmed, m.presence],
            backgroundColor: ["rgba(22, 163, 74, 0.85)", "rgba(37, 99, 235, 0.85)"],
            borderColor: ["#16A34A", "#2563EB"],
            borderWidth: 2,
            borderRadius: 8,
            maxBarThickness: 72,
          },
        ],
      };
    },

    comparisonBarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 96,
            right: 96,
            top: 8,
            bottom: 4,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const n =
                  ctx.parsed && typeof ctx.parsed.y === "number"
                    ? ctx.parsed.y
                    : Number(ctx.raw ?? 0);
                return `${ctx.label}: ${n} jogador${n === 1 ? "" : "es"}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "#4b5563",
              font: { size: 11, weight: "600" },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: "#6b7280",
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
  watch: {
    trainingId: {
      handler() {
        this.loadTraining();
      },
    },
  },
  mounted() {
    this.loadTraining();
  },
  methods: {
    async loadTraining() {
      if (
        this.trainingId === undefined ||
        this.trainingId === null ||
        String(this.trainingId).trim() === ""
      ) {
        this.form = {};
        return;
      }

      this.loading = true;
      try {
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          confirmError("Cliente GraphQL indisponível.");
          this.form = {};
          return;
        }

        const query = gql`
          ${TRAINING}
        `;
        const result = await apolloClient.query({
          query,
          variables: { id: String(this.trainingId) },
          fetchPolicy: "network-only",
        });

        const t = result?.data?.training;
        if (!t) {
          this.form = {};
          return;
        }

        this.form = transformTrainingData(t);
        this.form.confirmationsTraining = t.confirmationsTraining || [];
      } catch (e) {
        console.error(e);
        this.form = {};
        confirmError("Não foi possível carregar o treino.");
      } finally {
        this.loading = false;
      }
    },

    patchConfirmation(id, playerId, patch) {
      const list = this.form.confirmationsTraining;
      if (!Array.isArray(list)) return;

      const confirmationIndex = list.findIndex(
        (confirmation) =>
          (confirmation.id && confirmation.id === parseInt(id, 10)) ||
          (confirmation.playerId &&
            confirmation.playerId === parseInt(playerId, 10)) ||
          (confirmation.player?.id &&
            confirmation.player?.id === parseInt(playerId, 10))
      );

      if (confirmationIndex === -1) return;

      this.form.confirmationsTraining = [
        ...list.slice(0, confirmationIndex),
        {
          ...list[confirmationIndex],
          ...patch,
        },
        ...list.slice(confirmationIndex + 1),
      ];
    },

    async actionReject(id, playerId, trainingId) {
      try {
        const query = gql`
          ${CONFIRMTRAINING}
        `;

        const variables = {
          id: parseInt(id, 10),
          playerId: parseInt(playerId, 10),
          trainingId: parseInt(trainingId, 10),
          status: "REJECTED",
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        this.patchConfirmation(id, playerId, { status: "REJECTED" });

        confirmSuccess("Negando intenção de presença com sucesso!", () => {});
      } catch (error) {
        console.error(error);
        this.handleMutationError(
          error,
          "Ocorreu um erro ao negar a intenção de presença!"
        );
      }
    },

    async actionConfirmPresence(id, playerId, trainingId, presence) {
      try {
        const query = gql`
          ${CONFIRMPRESENCE}
        `;

        const variables = {
          id: parseInt(id, 10),
          playerId: parseInt(playerId, 10),
          trainingId: parseInt(trainingId, 10),
          presence,
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        this.patchConfirmation(id, playerId, { presence });

        confirmSuccess("Presença confirmada com sucesso!", () => {});
      } catch (error) {
        console.error(error);
        this.handleMutationError(
          error,
          "Ocorreu um erro ao confirmar a presença!"
        );
      }
    },

    async actionConfirm(id, playerId, trainingId) {
      try {
        const query = gql`
          ${CONFIRMTRAINING}
        `;

        const variables = {
          id: parseInt(id, 10),
          playerId: parseInt(playerId, 10),
          trainingId: parseInt(trainingId, 10),
          status: "CONFIRMED",
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        this.patchConfirmation(id, playerId, { status: "CONFIRMED" });

        confirmSuccess("Intenção de presença confirmada com sucesso!", () => {});
      } catch (error) {
        console.error(error);
        this.handleMutationError(
          error,
          "Ocorreu um erro ao confirmar a intenção de presença!"
        );
      }
    },

    handleMutationError(error, fallbackMessage) {
      if (
        error.graphQLErrors &&
        error.graphQLErrors[0] &&
        error.graphQLErrors[0].extensions &&
        error.graphQLErrors[0].extensions.validation
      ) {
        const validationErrors = error.graphQLErrors[0].extensions.validation;
        const errorMessages = Object.values(validationErrors).map((item) => {
          return Array.isArray(item) ? item[0] : item;
        });
        confirmError(fallbackMessage, errorMessages.join("<br>"));
      } else {
        confirmError(fallbackMessage);
      }
    },
  },
});
</script>

<style scoped>
.training-attendance-view {
  width: 100%;
}

.state-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  color: #4b5563;
  font-weight: 600;
}

.state-row--empty {
  color: #6b7280;
}

.metrics-section {
  margin-bottom: 32px;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
  width: 100%;
}

.total-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #eef0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.total-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.total-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
}

.total-icon :deep(.va-icon) {
  font-size: 26px !important;
}

.total-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.total-label {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  margin: 0;
  line-height: 1.25;
  letter-spacing: 0.01em;
}

.total-number {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.1;
}

.charts-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.55fr);
  gap: 20px;
  align-items: stretch;
}

.chart-panel {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eef0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 14px 16px 12px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: minmax(52px, auto) minmax(148px, 1fr) auto;
  min-height: 0;
  align-self: stretch;
}

.chart-panel--comparison {
  grid-template-rows: minmax(88px, auto) minmax(148px, 1fr) auto;
}

.chart-panel__head {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  text-align: left;
  min-height: 52px;
  box-sizing: border-box;
}

.chart-panel__head--comparison {
  min-height: 88px;
  justify-content: flex-start;
  padding-bottom: 0;
}

.chart-panel__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.chart-panel__title-row :deep(.va-icon) {
  flex-shrink: 0;
}

.chart-panel__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0b1e3a;
  text-align: left;
  line-height: 1.25;
}

.chart-panel__head--comparison .chart-panel__title-row {
  margin-bottom: 6px;
}

.chart-panel__subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-align: left;
  line-height: 1.35;
  max-width: 42ch;
  padding-left: 32px;
}

.chart-panel__canvas {
  position: relative;
  width: 100%;
  min-height: 0;
  height: 100%;
}

.chart-panel__foot {
  display: flex;
  align-items: stretch;
  justify-content: center;
  min-height: 68px;
  padding-top: 8px;
  box-sizing: border-box;
}

.chart-panel__foot--spacer {
  visibility: hidden;
  pointer-events: none;
}

.comparison-insight {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  box-sizing: border-box;
  text-align: center;
}

.comparison-insight__text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  color: #1f2937;
}

.comparison-insight--balanced {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-color: #bbf7d0;
}

.comparison-insight--surplus {
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  border-color: #bfdbfe;
}

.comparison-insight--shortfall {
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
  border-color: #fecaca;
}

.chart-panel__empty {
  height: 100%;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
}

.players-list-section {
  margin-top: 32px;
}

@media (max-width: 1200px) {
  .charts-row {
    grid-template-columns: 1fr;
  }

  .chart-panel {
    grid-template-rows: minmax(56px, auto) minmax(168px, 220px) auto;
  }

  .chart-panel--comparison {
    grid-template-rows: minmax(96px, auto) minmax(168px, 220px) auto;
  }

  .chart-panel__foot {
    min-height: 64px;
  }
}

@media (max-width: 768px) {
  .totals-grid {
    grid-template-columns: 1fr;
  }
}
</style>
