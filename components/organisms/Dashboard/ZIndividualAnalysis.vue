<template>
  <div class="individual-analysis-section">
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="person" size="24px" color="#E9742B" />
        <h2 class="section-title">Análise Individual</h2>
        <ZTop3Badge />
      </div>
      <div class="header-actions">
        <va-button
          v-if="players.length > 0"
          :icon="allExpanded ? 'unfold_less' : 'unfold_more'"
          preset="plain"
          size="small"
          class="expand-all-btn"
          @click="toggleExpandAll"
          :title="
            allExpanded
              ? 'Recolher todas as estatísticas'
              : 'Expandir todas as estatísticas'
          "
        >
          {{ allExpanded ? "Recolher todas" : "Expandir todas" }}
        </va-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando análise...</span>
    </div>

    <div v-else-if="players.length === 0" class="empty-state">
      <va-icon name="info" size="48px" color="#9E9E9E" />
      <p class="empty-text">Nenhum jogador com análise disponível</p>
    </div>

    <div v-else class="players-grid">
      <div
        v-for="(playerData, index) in players"
        :key="playerData.player.id"
        class="player-card"
        :class="getPlayerCardClass(index)"
      >
        <div
          class="player-card-border"
          :class="getPlayerBorderClass(index)"
        ></div>
        <div class="player-card-content">
          <div class="card-header-actions">
            <div class="player-header">
              <ZUser :data="playerData.player" show-position />
            </div>
            <va-button
              :icon="
                viewMode[playerData.player.id] === 'chart'
                  ? 'visibility'
                  : 'bar_chart'
              "
              preset="plain"
              size="small"
              class="toggle-view-btn"
              :class="{
                'toggle-view-btn-disabled':
                  !expandedStats[playerData.player.id] &&
                  viewMode[playerData.player.id] !== 'chart',
              }"
              @click="toggleViewMode(playerData.player.id)"
              :disabled="
                !expandedStats[playerData.player.id] &&
                viewMode[playerData.player.id] !== 'chart'
              "
              :title="
                !expandedStats[playerData.player.id] &&
                viewMode[playerData.player.id] !== 'chart'
                  ? 'Expanda as estatísticas primeiro'
                  : viewMode[playerData.player.id] === 'chart'
                  ? 'Ver informações'
                  : 'Ver gráfico'
              "
            />
          </div>

          <!-- Modo Informações -->
          <div
            v-if="viewMode[playerData.player.id] !== 'chart'"
            class="player-info-view"
          >
            <div class="player-stats">
              <div
                class="stat-item presence"
                :class="getPresenceClass(playerData.presencePercentage, index)"
              >
                <div
                  class="stat-value"
                  :class="
                    getPresenceValueClass(playerData.presencePercentage, index)
                  "
                >
                  {{ formatPercentage(playerData.presencePercentage ?? 0) }}
                </div>
                <div class="stat-label">Presença</div>
              </div>

              <div
                class="stat-item trainings"
                :class="getTrainingsClass(index)"
              >
                <div class="stat-value" :class="getTrainingsValueClass(index)">
                  {{ playerData.presencesCount || 0 }} /
                  {{ playerData.trainingsCount || 0 }} /
                  {{ playerData.pendingTrainingsCount || 0 }}
                </div>
                <div class="stat-label">
                  Treinos
                  <va-popover
                    placement="top"
                    trigger="hover"
                    class="info-popover-wrapper"
                  >
                    <va-icon
                      name="info"
                      size="14px"
                      color="#6c757d"
                      class="info-icon"
                    />
                    <template #title>Informação</template>
                    <template #body>
                      <p class="info-popover-text">
                        Presenças / Treinos Finalizados / Treinos Agendados
                      </p>
                    </template>
                  </va-popover>
                </div>
              </div>
            </div>

            <div class="fundamentals-section">
              <h4 class="fundamentals-title">Posição</h4>
              <div class="fundamentals-tags">
                <span
                  v-for="(position, idx) in playerData.player.positions || []"
                  :key="position?.id || idx"
                  class="fundamental-tag"
                  :class="getTagColorClass(index, idx)"
                >
                  {{ position?.name }}
                </span>
                <span
                  v-if="
                    !playerData.player.positions ||
                    playerData.player.positions.length === 0
                  "
                  class="fundamental-tag"
                  :class="getTagColorClass(index, 0)"
                >
                  Sem posição
                </span>
              </div>
            </div>

            <div class="player-details-section">
              <a
                href="#"
                class="player-details-link"
                @click.prevent="openPlayerDetailsModal(playerData.player.id)"
              >
                Detalhes do jogador
              </a>
            </div>

            <div
              v-if="expandedStats[playerData.player.id]"
              class="fundamentals-stats-section"
            >
              <div class="fundamentals-stats-expanded">
                <div class="fundamentals-title-wrapper">
                  <h4 class="fundamentals-title">Estatísticas Fundamentos</h4>
                  <span class="fundamentals-top3-badge">TOP 3</span>
                </div>
                <div class="fundamentals-stats-list">
                  <div
                    v-for="fundamental in playerData.topFundamentals"
                    :key="fundamental.fundamental.id"
                    class="fundamental-stat-item"
                  >
                    <div class="fundamental-stat-header">
                      <span class="fundamental-stat-name">{{
                        fundamental.fundamental.name
                      }}</span>
                      <span class="fundamental-stat-total"
                        >{{ fundamental.grandTotal }} total</span
                      >
                    </div>
                    <div class="fundamental-stat-content">
                      <div class="fundamental-stat-bars">
                        <div
                          class="stat-bar stat-bar-a"
                          :style="{
                            width:
                              getPercentage(
                                fundamental.totalA,
                                fundamental.grandTotal
                              ) + '%',
                          }"
                        ></div>
                        <div
                          class="stat-bar stat-bar-b"
                          :style="{
                            width:
                              getPercentage(
                                fundamental.totalB,
                                fundamental.grandTotal
                              ) + '%',
                          }"
                        ></div>
                        <div
                          class="stat-bar stat-bar-c"
                          :style="{
                            width:
                              getPercentage(
                                fundamental.totalC,
                                fundamental.grandTotal
                              ) + '%',
                          }"
                        ></div>
                      </div>
                      <div class="fundamental-stat-badges">
                        <div class="stat-badge stat-badge-a">
                          <span class="stat-label">A</span>
                          <span class="stat-value">{{
                            fundamental.totalA
                          }}</span>
                        </div>
                        <div class="stat-badge stat-badge-b">
                          <span class="stat-label">B</span>
                          <span class="stat-value">{{
                            fundamental.totalB
                          }}</span>
                        </div>
                        <div class="stat-badge stat-badge-c">
                          <span class="stat-label">C</span>
                          <span class="stat-value">{{
                            fundamental.totalC
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modo Gráfico -->
          <div v-else class="player-chart-view">
            <h4 class="chart-title">Avaliação por Fundamentos</h4>
            <div class="chart-container">
              <Radar
                :data="getRadarChartData(playerData)"
                :options="radarChartOptions"
              />
            </div>

            <!-- Estatísticas Resumidas -->
            <div class="summary-stats-section">
              <div class="summary-stat-card">
                <div class="summary-stat-value">
                  {{ getSummaryStats(playerData).totalEvaluations }}
                </div>
                <div class="summary-stat-label">Total de Avaliações</div>
              </div>
              <div class="summary-stat-card">
                <div class="summary-stat-value summary-stat-success">
                  {{ getSummaryStats(playerData).efficiencyPercentage }}%
                </div>
                <div class="summary-stat-label">Eficiência (A)</div>
              </div>
              <div class="summary-stat-card">
                <div class="summary-stat-value summary-stat-warning">
                  {{ getSummaryStats(playerData).regularPercentage }}%
                </div>
                <div class="summary-stat-label">Regular (B)</div>
              </div>
              <div class="summary-stat-card">
                <div class="summary-stat-value summary-stat-danger">
                  {{ getSummaryStats(playerData).errorRate }}%
                </div>
                <div class="summary-stat-label">Erros (C)</div>
              </div>
            </div>

            <!-- Melhor Fundamental -->
            <div
              class="best-fundamental-section"
              v-if="getSummaryStats(playerData).bestFundamental"
            >
              <div class="best-fundamental-card">
                <va-icon name="emoji_events" color="#e9742b" size="small" />
                <div class="best-fundamental-content">
                  <div class="best-fundamental-label">Melhor Fundamental</div>
                  <div class="best-fundamental-value">
                    {{ getSummaryStats(playerData).bestFundamental }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de Fundamentos com Scores -->
            <div class="fundamentals-scores-section">
              <h5 class="fundamentals-scores-title">
                Performance por Fundamental
              </h5>
              <div class="fundamentals-scores-list">
                <div
                  v-for="fundamental in getTop3FundamentalsWithScores(
                    playerData
                  )"
                  :key="fundamental.name"
                  class="fundamental-score-item"
                >
                  <div class="fundamental-score-header">
                    <span class="fundamental-score-name">{{
                      fundamental.name
                    }}</span>
                    <span
                      class="fundamental-score-value"
                      :class="getScoreClass(fundamental.score)"
                    >
                      {{ fundamental.score }}%
                    </span>
                  </div>
                  <div class="fundamental-score-bar-container">
                    <div
                      class="fundamental-score-bar"
                      :class="getScoreBarClass(fundamental.score)"
                      :style="{ width: fundamental.score + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Estatísticas do Jogador -->
    <ZPlayerStatsModal
      v-if="selectedPlayerId"
      v-model="showPlayerStatsModal"
      :player-id="selectedPlayerId"
    />
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import PLAYERS_INDIVIDUAL_ANALYSIS from "~/graphql/dashboard/query/playersIndividualAnalysis.graphql";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser.vue";
import ZTop3Badge from "~/components/molecules/Badges/ZTop3Badge.vue";
import ZPlayerStatsModal from "~/components/molecules/Modal/ZPlayerStatsModal.vue";
import { Radar } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

// Registrar componentes do Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export default {
  name: "ZIndividualAnalysis",
  components: {
    ZUser,
    ZTop3Badge,
    ZPlayerStatsModal,
    Radar,
  },
  data() {
    return {
      players: [],
      loading: false,
      viewMode: {}, // 'info' ou 'chart'
      expandedStats: {}, // Controla quais jogadores têm estatísticas expandidas
      showPlayerStatsModal: false,
      selectedPlayerId: null,
    };
  },
  mounted() {
    this.getPlayersAnalysis();
  },
  computed: {
    allExpanded() {
      if (this.players.length === 0) return false;
      return this.players.every(
        (playerData) => this.expandedStats[playerData.player.id]
      );
    },
    radarChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              font: {
                size: 9,
              },
              backdropPadding: 2,
            },
            pointLabels: {
              font: {
                size: 10,
                weight: "500",
              },
              color: "#666",
              padding: 8,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.parsed.r}%`;
              },
            },
          },
        },
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          },
        },
      };
    },
  },
  methods: {
    getPlayersAnalysis(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${PLAYERS_INDIVIDUAL_ANALYSIS}
      `;

      const variables = {
        filter: {},
        first: 3,
        page: 1,
      };

      const {
        result: { value },
      } = useQuery(query, variables, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "network-only",
      });

      const { onResult } = useQuery(query, variables);

      onResult((result) => {
        if (result?.data?.playersIndividualAnalysis?.data) {
          // Debug: verificar valores de presencePercentage
          console.log(
            "📊 Dados recebidos do GraphQL:",
            result.data.playersIndividualAnalysis.data.map((p) => ({
              player: p.player?.name,
              presencePercentage: p.presencePercentage,
            }))
          );
          this.players = result.data.playersIndividualAnalysis.data;
        }
        this.loading = false;
      });

      if (value) {
        if (value?.playersIndividualAnalysis?.data) {
          // Debug: verificar valores de presencePercentage
          console.log(
            "📊 Dados do cache/value:",
            value.playersIndividualAnalysis.data.map((p) => ({
              player: p.player?.name,
              presencePercentage: p.presencePercentage,
            }))
          );
          this.players = value.playersIndividualAnalysis.data;
        }
        this.loading = false;
      }
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    getPercentage(part, total) {
      if (total === 0) return 0;
      return (part / total) * 100;
    },
    getPlayerCardClass(index) {
      const classes = [
        "player-card-orange",
        "player-card-blue",
        "player-card-black",
      ];
      return classes[index % classes.length];
    },
    getPlayerBorderClass(index) {
      const classes = ["border-orange", "border-blue", "border-black"];
      return classes[index % classes.length];
    },
    getPresenceClass(percentage, index) {
      const baseClasses = [
        "presence-orange",
        "presence-blue",
        "presence-black",
      ];
      return baseClasses[index % baseClasses.length];
    },
    getPresenceValueClass(percentage, index) {
      const baseClasses = ["value-orange", "value-blue", "value-black"];
      return baseClasses[index % baseClasses.length];
    },
    getTrainingsClass(index) {
      const classes = ["trainings-orange", "trainings-blue", "trainings-black"];
      return classes[index % classes.length];
    },
    getTrainingsValueClass(index) {
      const classes = ["value-orange", "value-blue", "value-black"];
      return classes[index % classes.length];
    },
    getTagColorClass(playerIndex, tagIndex) {
      // Cores diferentes para cada jogador
      const colors = ["orange", "dark", "blue"];
      return colors[playerIndex % colors.length];
    },
    toggleViewMode(playerId) {
      // Só permite alternar se as estatísticas estiverem expandidas ou se já estiver no modo chart
      if (
        !this.expandedStats[playerId] &&
        this.viewMode[playerId] !== "chart"
      ) {
        return;
      }

      // Alternar entre 'info' e 'chart'
      if (!this.viewMode[playerId]) {
        this.viewMode = { ...this.viewMode, [playerId]: "chart" };
      } else {
        this.viewMode = {
          ...this.viewMode,
          [playerId]: this.viewMode[playerId] === "chart" ? "info" : "chart",
        };
      }
    },
    toggleExpandAll() {
      const allExpanded = this.allExpanded;
      const newExpandedStats = {};
      const newViewMode = { ...this.viewMode };

      this.players.forEach((playerData) => {
        const playerId = playerData.player.id;
        newExpandedStats[playerId] = !allExpanded;

        // Se estiver recolhendo, voltar para o modo informações
        if (allExpanded) {
          newViewMode[playerId] = "info";
        }
      });

      this.expandedStats = newExpandedStats;
      this.viewMode = newViewMode;
    },
    getAllFundamentals() {
      return [
        { id: 1, name: "Saque" },
        { id: 2, name: "Recepção" },
        { id: 3, name: "Levantamento" },
        { id: 4, name: "Ataque" },
        { id: 5, name: "Bloqueio" },
        { id: 6, name: "Defesa" },
      ];
    },
    getSummaryStats(playerData) {
      let totalA = 0;
      let totalB = 0;
      let totalC = 0;

      playerData.topFundamentals.forEach((f) => {
        totalA += f.totalA;
        totalB += f.totalB;
        totalC += f.totalC;
      });

      const totalEvaluations = totalA + totalB + totalC;
      const efficiencyPercentage =
        totalEvaluations > 0
          ? Math.round((totalA / totalEvaluations) * 100)
          : 0;
      const regularPercentage =
        totalEvaluations > 0
          ? Math.round((totalB / totalEvaluations) * 100)
          : 0;
      const errorRate =
        totalEvaluations > 0
          ? Math.round((totalC / totalEvaluations) * 100)
          : 0;

      // Encontrar melhor fundamental
      let bestFundamental = null;
      let bestScore = 0;

      playerData.topFundamentals.forEach((f) => {
        if (f.grandTotal > 0) {
          const score =
            ((f.totalA * 3 + f.totalB * 2 + f.totalC * 1) /
              (f.grandTotal * 3)) *
            100;
          if (score > bestScore) {
            bestScore = score;
            bestFundamental = f.fundamental.name;
          }
        }
      });

      return {
        totalEvaluations,
        efficiencyPercentage,
        regularPercentage,
        errorRate,
        bestFundamental,
      };
    },
    getTop3FundamentalsWithScores(playerData) {
      // Calcular score apenas para os top 3 fundamentos
      const fundamentalsWithScores = playerData.topFundamentals.map((f) => {
        let score = 0;

        if (f.grandTotal > 0) {
          // Calcular score: (A * 3 + B * 2 + C * 1) / (total * 3) * 100
          score = Math.round(
            ((f.totalA * 3 + f.totalB * 2 + f.totalC * 1) /
              (f.grandTotal * 3)) *
              100
          );
        }

        return {
          name: f.fundamental.name,
          score,
          totalA: f.totalA,
          totalB: f.totalB,
          totalC: f.totalC,
          grandTotal: f.grandTotal,
        };
      });

      // Ordenar por score (maior para menor)
      return fundamentalsWithScores.sort((a, b) => b.score - a.score);
    },
    getScoreClass(score) {
      if (score >= 80) return "score-excellent";
      if (score >= 60) return "score-good";
      if (score >= 40) return "score-regular";
      return "score-low";
    },
    getScoreBarClass(score) {
      if (score >= 80) return "score-bar-excellent";
      if (score >= 60) return "score-bar-good";
      if (score >= 40) return "score-bar-regular";
      return "score-bar-low";
    },
    getRadarChartData(playerData) {
      const allFundamentals = this.getAllFundamentals();

      // Criar um mapa dos fundamentos treinados
      const fundamentalsMap = {};
      playerData.topFundamentals.forEach((f) => {
        fundamentalsMap[f.fundamental.name] = f;
      });

      // Calcular dados para o gráfico radar
      const labels = allFundamentals.map((f) => f.name);
      const data = allFundamentals.map((fundamental) => {
        const trained = fundamentalsMap[fundamental.name];
        if (!trained || trained.grandTotal === 0) {
          return 0;
        }

        // Calcular score: (A * 3 + B * 2 + C * 1) / (total * 3) * 100
        const score =
          ((trained.totalA * 3 + trained.totalB * 2 + trained.totalC * 1) /
            (trained.grandTotal * 3)) *
          100;
        return Math.round(score);
      });

      return {
        labels,
        datasets: [
          {
            label: "Performance",
            data,
            backgroundColor: "rgba(233, 116, 43, 0.2)",
            borderColor: "rgba(233, 116, 43, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(233, 116, 43, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(233, 116, 43, 1)",
          },
        ],
      };
    },
    openPlayerDetailsModal(playerId) {
      this.selectedPlayerId = playerId;
      this.showPlayerStatsModal = true;
    },
  },
};
</script>

<style scoped>
.individual-analysis-section {
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
  flex-wrap: wrap;
}

.header-actions {
  flex-shrink: 0;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.expand-all-btn {
  color: #e9742b !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 6px 12px !important;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.expand-all-btn:hover {
  background: rgba(233, 116, 43, 0.1) !important;
  color: #d6652a !important;
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

.players-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
}

.player-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  height: 100%;
  overflow: hidden;
  width: 100%;
  position: relative;
}

.player-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.player-card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
}

.border-orange {
  background-color: #e9742b;
}

.border-blue {
  background-color: #1976d2;
}

.border-black {
  background-color: #0b1e3a;
}

.player-card-content {
  padding: 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.card-header-actions {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 4px;
  gap: 12px;
  width: 100%;
  position: relative;
}

.player-header {
  flex: 1;
  position: relative;
  padding-right: 40px;
}

.player-header :deep(.user-cell) {
  width: 100%;
  margin: 0;
}

.player-header :deep(.user-container) {
  margin: 0;
  gap: 10px;
  align-items: center;
  width: 100%;
  display: flex;
}

.player-header :deep(.avatar-wrapper) {
  margin: 0;
  padding: 0;
  align-self: center;
  flex-shrink: 0;
}

.player-header :deep(.user-avatar) {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: white !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  flex-shrink: 0;
}

.player-header :deep(.user-info) {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.player-header :deep(.user-name) {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 15ch;
}

.player-info-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.toggle-view-btn {
  position: absolute;
  top: 0;
  right: 0;
  flex-shrink: 0;
  color: #6c757d !important;
  min-width: auto !important;
  padding: 4px 8px !important;
  transition: all 0.2s ease;
  z-index: 2;
}

.toggle-view-btn:hover:not(.toggle-view-btn-disabled) {
  color: #e9742b !important;
  background: rgba(233, 116, 43, 0.1) !important;
}

.toggle-view-btn-disabled {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}

.toggle-view-btn-disabled:hover {
  color: #6c757d !important;
  background: transparent !important;
}

.player-stats {
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 70px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2px;
}

.value-orange {
  color: #e9742b;
}

.value-blue {
  color: #1976d2;
}

.value-black {
  color: #0b1e3a;
}

.stat-label {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-icon {
  cursor: help;
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: #e9742b;
}

.info-popover-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: white;
}

.fundamentals-stats-section {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.fundamentals-stats-expanded {
  transition: all 0.3s ease;
  overflow: hidden;
}

.fundamentals-stats-list {
  transition: all 0.3s ease;
  overflow: hidden;
}

.fundamentals-stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fundamental-stat-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.fundamental-stat-item:hover {
  border-color: #e9742b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.fundamental-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.fundamental-stat-name {
  font-size: 13px;
  font-weight: 600;
  color: #0b1e3a;
}

.fundamental-stat-total {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

.fundamental-stat-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fundamental-stat-bars {
  display: flex;
  height: 18px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-bar {
  height: 100%;
  transition: width 0.3s ease;
  position: relative;
  min-width: 0;
}

.stat-bar-a {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-bar-b {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.stat-bar-c {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.fundamental-stat-badges {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  min-width: 44px;
  justify-content: center;
  line-height: 1;
}

.stat-badge-a {
  background-color: rgba(40, 167, 69, 0.12);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.stat-badge-b {
  background-color: rgba(255, 193, 7, 0.12);
  color: #ff9800;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.stat-badge-c {
  background-color: rgba(220, 53, 69, 0.12);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.stat-badge .stat-label {
  font-weight: 700;
  font-size: 11px;
  line-height: 1;
  display: inline-block;
}

.stat-badge .stat-value {
  font-weight: 600;
  font-size: 11px;
  line-height: 1;
  display: inline-block;
}

.fundamentals-title-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  flex-wrap: nowrap;
}

.fundamentals-title {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.fundamentals-top3-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: #e9742b;
  color: white;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}

.fundamentals-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0;
}

.fundamental-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.fundamental-tag.orange {
  background-color: #fff4ec;
  border-color: #e9742b;
  color: #e9742b;
}

.fundamental-tag.dark {
  background-color: #f5f5f5;
  border-color: #0b1e3a;
  color: #0b1e3a;
}

.fundamental-tag.blue {
  background-color: #e3f2fd;
  border-color: #1976d2;
  color: #1976d2;
}

/* Modo Gráfico */
.player-chart-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 8px 0;
  overflow: hidden;
}

.chart-title {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;

  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.chart-container {
  position: relative;
  flex-shrink: 0;
  height: 220px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

/* Estatísticas Resumidas */
.summary-stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.summary-stat-card {
  background: white;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.summary-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
  margin-bottom: 2px;
}

.summary-stat-value.summary-stat-success {
  color: #28a745;
}

.summary-stat-value.summary-stat-warning {
  color: #ffc107;
}

.summary-stat-value.summary-stat-danger {
  color: #dc3545;
}

.summary-stat-label {
  font-size: 9px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

/* Melhor Fundamental */
.best-fundamental-section {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.best-fundamental-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #fff4ec 0%, #ffe8d6 100%);
  border-radius: 8px;
  border: 1px solid rgba(233, 116, 43, 0.2);
}

.best-fundamental-content {
  flex: 1;
}

.best-fundamental-label {
  font-size: 9px;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
  line-height: 1.2;
}

.best-fundamental-value {
  font-size: 13px;
  font-weight: 700;
  color: #e9742b;
  line-height: 1.2;
}

/* Lista de Fundamentos com Scores */
.fundamentals-scores-section {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.fundamentals-scores-title {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fundamentals-scores-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fundamental-score-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.fundamental-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fundamental-score-name {
  font-size: 12px;
  font-weight: 600;
  color: #0b1e3a;
}

.fundamental-score-value {
  font-size: 12px;
  font-weight: 700;
}

.fundamental-score-value.score-excellent {
  color: #28a745;
}

.fundamental-score-value.score-good {
  color: #0b1e3a;
}

.fundamental-score-value.score-regular {
  color: #1976d2;
}

.fundamental-score-value.score-low {
  color: #6c757d;
}

.fundamental-score-bar-container {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.fundamental-score-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.fundamental-score-bar.score-bar-excellent {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
}

.fundamental-score-bar.score-bar-good {
  background: linear-gradient(90deg, #0b1e3a 0%, #1a3a5a 100%);
}

.fundamental-score-bar.score-bar-regular {
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
}

.fundamental-score-bar.score-bar-low {
  background: linear-gradient(90deg, #6c757d 0%, #9e9e9e 100%);
}

/* Scrollbar personalizada para lista de scores */
.fundamentals-scores-section::-webkit-scrollbar {
  width: 4px;
}

.fundamentals-scores-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.fundamentals-scores-section::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.fundamentals-scores-section::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.chart-container :deep(canvas) {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
}

/* Tablets grandes (769px - 1024px) */
@media (max-width: 1024px) {
  .players-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.player-details-section {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.player-details-link {
  color: #1976d2;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
  display: inline-block;
}

.player-details-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .players-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .individual-analysis-section {
    padding: 16px;
    margin-top: 16px;
  }

  .section-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .section-title {
    font-size: 18px;
  }

  .expand-all-btn {
    font-size: 11px !important;
    padding: 5px 10px !important;
  }

  .player-card {
    min-height: auto;
  }

  .player-card-content {
    padding: 16px;
    padding-left: 20px;
  }

  .card-header-actions {
    margin-bottom: 4px;
    gap: 8px;
  }

  .player-header {
    padding-right: 40px;
  }

  .player-header :deep(.user-name) {
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 15ch;
  }

  .player-stats {
    gap: 12px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 200px;
  }

  .summary-stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .summary-stat-card {
    padding: 8px;
  }

  .summary-stat-value {
    font-size: 16px;
  }
}

/* Celulares (até 480px) */
@media (max-width: 480px) {
  .individual-analysis-section {
    padding: 12px;
    border-radius: 8px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .expand-all-btn {
    width: 100%;
    justify-content: center;
    font-size: 11px !important;
    padding: 6px 12px !important;
  }

  .players-grid {
    gap: 12px;
  }

  .player-card {
    min-height: auto;
  }

  .player-card-content {
    padding: 12px;
    padding-left: 16px;
    gap: 12px;
  }

  .card-header-actions {
    margin-bottom: 4px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .player-header {
    padding-right: 40px;
  }

  .player-header :deep(.user-container) {
    gap: 8px;
  }

  .player-header :deep(.user-avatar) {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    font-size: 14px !important;
  }

  .player-header :deep(.user-name) {
    font-size: 14px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 15ch;
  }

  .player-stats {
    gap: 12px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }

  .fundamental-tag {
    padding: 3px 10px;
    font-size: 11px;
  }

  .fundamentals-stats-expanded {
    margin-top: 8px;
  }

  .fundamental-stat-item {
    padding: 10px;
  }

  .fundamental-stat-name {
    font-size: 12px;
  }

  .fundamental-stat-total {
    font-size: 10px;
  }

  .fundamental-stat-badges {
    gap: 6px;
  }

  .stat-badge {
    padding: 3px 8px;
    font-size: 10px;
    min-width: 40px;
  }

  .chart-container {
    height: 180px;
  }

  .chart-title {
    font-size: 11px;
    margin-bottom: 8px;
  }

  .summary-stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-bottom: 10px;
  }

  .summary-stat-card {
    padding: 8px 6px;
  }

  .summary-stat-value {
    font-size: 14px;
  }

  .summary-stat-label {
    font-size: 8px;
  }

  .best-fundamental-card {
    padding: 8px;
  }

  .best-fundamental-label {
    font-size: 8px;
  }

  .best-fundamental-value {
    font-size: 12px;
  }

  .fundamentals-scores-title {
    font-size: 10px;
    margin-bottom: 10px;
  }

  .fundamental-score-item {
    padding: 6px;
  }

  .fundamental-score-name {
    font-size: 11px;
  }

  .fundamental-score-value {
    font-size: 11px;
  }
}
</style>
