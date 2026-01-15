<template>
  <ZModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="`Estatísticas de ${teamData?.team?.name || 'Time'}`"
    :ok-text="'Fechar'"
    @ok="closeModal"
    @cancel="closeModal"
    size="large"
  >
    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando estatísticas...</span>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <va-icon name="error" size="48px" color="danger" />
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-else-if="teamData" class="team-stats-modal">
      <!-- Header do Time -->
      <div class="team-header-section">
        <ZTeam :data="teamData.team" :showCategoryAndLevel="true" />
      </div>

      <!-- Estatísticas Principais do Time -->
      <div class="main-stats-section">
        <div class="stat-card presence-card">
          <div class="stat-icon">
            <va-icon name="check_circle" size="32px" color="#28a745" />
          </div>
          <div class="stat-content">
            <div class="stat-value presence-value">
              {{ formatPercentage(teamData.averagePresencePercentage ?? 0) }}
            </div>
            <div class="stat-label">Presença Média</div>
            <div class="stat-description">
              Média de presença dos jogadores nos treinos finalizados
            </div>
          </div>
        </div>

        <div class="stat-card players-card">
          <div class="stat-icon">
            <va-icon name="people" size="32px" color="#1976d2" />
          </div>
          <div class="stat-content">
            <div class="stat-value players-value">
              {{ teamData.playersCount || 0 }}
            </div>
            <div class="stat-label">Jogadores</div>
            <div class="stat-description">
              Total de jogadores no time
            </div>
          </div>
        </div>

        <div class="stat-card trainings-card">
          <div class="stat-icon">
            <va-icon name="fitness_center" size="32px" color="#e9742b" />
          </div>
          <div class="stat-content">
            <div class="stat-value trainings-value">
              {{ teamData.trainingsCount || 0 }} / {{ teamData.totalTrainingsCount || 0 }}
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
                    Treinos Finalizados / Total de Treinos
                  </p>
                </template>
              </va-popover>
            </div>
            <div class="stat-description">
              Apenas treinos finalizados são considerados nas estatísticas
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Jogadores -->
      <div class="players-section">
        <div class="section-title-wrapper">
          <h4 class="section-title">Jogadores do Time</h4>
          <span class="players-count-badge">{{ teamData.players?.length || 0 }} jogadores</span>
        </div>
        <div v-if="teamData.players && teamData.players.length > 0" class="players-list">
          <div
            v-for="(playerData, index) in teamData.players"
            :key="playerData.player.id"
            class="player-card"
            :class="getPlayerCardClass(index)"
          >
            <div class="player-card-border" :class="getPlayerBorderClass(index)"></div>
            <div class="player-card-content">
              <div class="player-header">
                <div class="player-rank-wrapper">
                  <div
                    class="player-rank"
                    :class="getRankClass(index, playerData.rank)"
                  >
                    <span class="rank-number">{{ playerData.rank }}º</span>
                  </div>
                  <va-icon
                    v-if="playerData.rank === 1"
                    name="emoji_events"
                    class="trophy-icon"
                  />
                </div>
                <ZUser :data="playerData.player" show-position />
                <div class="player-metrics">
                  <div
                    class="player-percentage"
                    :class="getPlayerPercentageClass(index)"
                  >
                    {{ formatPercentage(playerData.presencePercentage) }}
                  </div>
                  <div class="player-trainings-info">
                    {{ playerData.presencesCount || 0 }}/{{ playerData.trainingsCount || 0 }}
                  </div>
                </div>
              </div>
              <div class="player-stats">
                <div class="player-stat-item">
                  <div class="player-stat-value">{{ playerData.pendingTrainingsCount || 0 }}</div>
                  <div class="player-stat-label">Treinos Pendentes</div>
                </div>
              </div>
              <!-- Visão Técnica dos Fundamentos -->
              <div v-if="playerData.topFundamentals && playerData.topFundamentals.length > 0" class="player-fundamentals">
                <div class="fundamentals-header">
                  <div class="fundamentals-title">Visão Técnica dos Treinos</div>
                  <div class="section-actions">
                    <va-button
                      :icon="getPlayerViewMode(playerData.player.id) === 'chart' ? 'visibility' : 'bar_chart'"
                      preset="plain"
                      size="small"
                      class="toggle-view-btn"
                      @click="togglePlayerFundamentalsView(playerData.player.id)"
                      :title="getPlayerViewMode(playerData.player.id) === 'chart' ? 'Ver informações detalhadas' : 'Ver gráfico radar'"
                    />
                  </div>
                </div>
                <!-- Modo Gráfico Radar -->
                <div v-if="getPlayerViewMode(playerData.player.id) === 'chart'" class="radar-chart-container">
                  <Radar
                    :data="getRadarChartData(playerData)"
                    :options="radarChartOptions"
                  />
                </div>
                <!-- Modo Informações Detalhadas -->
                <div v-else class="fundamentals-list">
                  <div
                    v-for="fundamental in playerData.topFundamentals"
                    :key="fundamental.fundamental.id"
                    class="fundamental-item"
                  >
                    <div class="fundamental-header">
                      <span class="fundamental-name">{{
                        fundamental.fundamental.name
                      }}</span>
                      <span class="fundamental-total"
                        >{{ fundamental.grandTotal }} total</span
                      >
                    </div>
                    <div class="fundamental-content">
                      <div class="fundamental-bars">
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
                      <div class="fundamental-badges">
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
        </div>
        <div v-else class="empty-players">
          <va-icon name="info" size="24px" color="#9E9E9E" />
          <p>Nenhum jogador encontrado no time</p>
        </div>
      </div>
    </div>
  </ZModal>
</template>

<script>
import { gql } from "@apollo/client/core";
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser.vue";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam.vue";
import TEAM_PERFORMANCE_ANALYSIS_DETAIL from "~/graphql/dashboard/query/teamPerformanceAnalysisDetail.graphql";
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
  name: "ZTeamStatsModal",
  components: {
    ZModal,
    ZUser,
    ZTeam,
    Radar,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    teamId: {
      type: [String, Number],
      required: false,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      teamData: null,
      loadingData: false,
      errorMessage: null,
      playerViewModes: {}, // Armazena o modo de visualização de cada jogador: 'chart' ou 'info'
    };
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.teamId) {
        this.loadTeamStats();
      } else {
        this.teamData = null;
        this.errorMessage = null;
      }
    },
    teamId() {
      if (this.modelValue && this.teamId) {
        this.loadTeamStats();
      }
    },
  },
  mounted() {
    if (this.modelValue && this.teamId) {
      this.loadTeamStats();
    }
  },
  computed: {
    loading() {
      return this.loadingData;
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
                size: 10,
              },
              backdropPadding: 2,
              color: "#6c757d",
            },
            pointLabels: {
              font: {
                size: 11,
                weight: "600",
              },
              color: "#0b1e3a",
              padding: 10,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
              lineWidth: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.parsed.r}%`;
              },
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "rgba(233, 116, 43, 1)",
            borderWidth: 1,
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
    async loadTeamStats() {
      if (!this.teamId) return;

      this.loadingData = true;
      this.errorMessage = null;
      this.teamData = null;

      try {
        const query = gql`
          ${TEAM_PERFORMANCE_ANALYSIS_DETAIL}
        `;

        const variables = {
          teamId: String(this.teamId),
        };

        // Usar Apollo Client diretamente para evitar warnings do Nuxt
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;

        if (!apolloClient) {
          throw new Error("Cliente Apollo não encontrado");
        }

        const result = await apolloClient.query({
          query,
          variables,
          fetchPolicy: "network-only", // Sempre buscar dados atualizados
        });

        this.loadingData = false;

        if (result?.data?.teamPerformanceAnalysisDetail) {
          this.teamData = result.data.teamPerformanceAnalysisDetail;
        } else {
          this.errorMessage = "Nenhum dado encontrado para este time.";
        }
      } catch (error) {
        this.loadingData = false;
        this.errorMessage = error.message || "Erro ao carregar estatísticas do time.";
        console.error("Erro ao carregar estatísticas:", error);
      }
    },
    closeModal() {
      this.$emit("update:modelValue", false);
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    getPlayerCardClass(index) {
      const classes = ["player-card-orange", "player-card-blue", "player-card-black"];
      return classes[index % classes.length];
    },
    getPlayerBorderClass(index) {
      const classes = ["border-orange", "border-blue", "border-black"];
      return classes[index % classes.length];
    },
    getPresenceBadgeClass(percentage) {
      if (percentage >= 80) {
        return "badge-high";
      } else if (percentage >= 60) {
        return "badge-medium";
      } else {
        return "badge-low";
      }
    },
    getRankClass(index, rank) {
      const baseClasses = ["rank-orange", "rank-blue", "rank-black"];
      const baseClass = baseClasses[index % baseClasses.length];

      // Adicionar classe especial para os 3 primeiros
      if (rank === 1) {
        return `${baseClass} rank-gold`;
      } else if (rank === 2) {
        return `${baseClass} rank-silver`;
      } else if (rank === 3) {
        return `${baseClass} rank-bronze`;
      }

      return baseClass;
    },
    getPlayerPercentageClass(index) {
      const classes = [
        "percentage-orange",
        "percentage-blue",
        "percentage-black",
      ];
      return classes[index % classes.length];
    },
    getPlayerViewMode(playerId) {
      return this.playerViewModes[playerId] || 'chart';
    },
    togglePlayerFundamentalsView(playerId) {
      const currentMode = this.playerViewModes[playerId] || 'chart';
      this.playerViewModes = {
        ...this.playerViewModes,
        [playerId]: currentMode === 'chart' ? 'info' : 'chart'
      };
    },
    getAllFundamentals() {
      // Ordem: Saque, Recepção, Ataque, Bloqueio, Defesa, Levantamento (sentido horário)
      return [
        { id: 1, name: "Saque" },
        { id: 2, name: "Recepção" },
        { id: 3, name: "Ataque" },
        { id: 4, name: "Bloqueio" },
        { id: 5, name: "Defesa" },
        { id: 6, name: "Levantamento" },
      ];
    },
    getRadarChartData(playerData) {
      if (!playerData?.topFundamentals) {
        return {
          labels: [],
          datasets: [],
        };
      }

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
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    },
    getPercentage(part, total) {
      if (total === 0) return 0;
      return (part / total) * 100;
    },
  },
};
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text,
.error-text {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.error-text {
  color: #dc3545;
}

.team-stats-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.team-header-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.main-stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.presence-value {
  color: #28a745;
}

.players-value {
  color: #1976d2;
}

.trainings-value {
  color: #e9742b;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.stat-description {
  font-size: 12px;
  color: #9e9e9e;
  line-height: 1.4;
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

.players-section {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.section-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0;
}

.players-count-badge {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.player-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
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
}

.border-orange {
  background: #e9742b;
}

.border-blue {
  background: #1976d2;
}

.border-black {
  background: #0b1e3a;
}

.player-card-content {
  padding: 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.player-header :deep(.user-cell) {
  flex: 1;
  min-width: 0;
  padding: 0;
  margin: 0;
  gap: 8px;
}

.player-header :deep(.user-avatar) {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  min-height: 36px !important;
}

.player-header :deep(.user-name) {
  font-size: 14px;
  font-weight: 600;
}

.player-header :deep(.user-detail-item) {
  font-size: 11px;
}

.player-rank-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 32px;
}

.player-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.player-rank .rank-number {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.trophy-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
  z-index: 1;
  color: rgb(143, 108, 38);
  font-size: 18px;
  height: 18px;
  line-height: 18px;
}

.rank-orange {
  background: #e9742b;
}

.rank-blue {
  background: #1976d2;
}

.rank-black {
  background: #0b1e3a;
}

.rank-gold {
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  box-shadow: 0 2px 6px rgba(212, 175, 55, 0.4);
  border: 2px solid #b8941f;
}

.rank-silver {
  background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
  box-shadow: 0 2px 6px rgba(158, 158, 158, 0.4);
  border: 2px solid #757575;
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  box-shadow: 0 2px 6px rgba(205, 127, 50, 0.4);
  border: 2px solid #b87333;
}

.player-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.player-percentage {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.player-trainings-info {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  line-height: 1.2;
}

.percentage-orange {
  color: #e9742b;
}

.percentage-blue {
  color: #1976d2;
}

.percentage-black {
  color: #0b1e3a;
}

.player-presence-badge {
  font-size: 14px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
}

.badge-high {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.badge-medium {
  background: rgba(255, 193, 7, 0.1);
  color: #ff9800;
}

.badge-low {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.player-stats {
  display: flex;
  gap: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.player-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #0b1e3a;
}

.player-stat-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.player-fundamentals {
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.fundamentals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.fundamentals-title {
  font-size: 13px;
  font-weight: 600;
  color: #0b1e3a;
  margin: 0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-view-btn {
  color: #6c757d;
  transition: all 0.2s ease;
}

.toggle-view-btn:hover {
  color: #e9742b !important;
  background: rgba(233, 116, 43, 0.1) !important;
}

.radar-chart-container {
  position: relative;
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.fundamentals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fundamental-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.fundamental-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.fundamental-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.fundamental-name {
  font-size: 14px;
  font-weight: 600;
  color: #0b1e3a;
}

.fundamental-total {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

.fundamental-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fundamental-bars {
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

.fundamental-badges {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  min-width: 45px;
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

.empty-players {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #9e9e9e;
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-stats-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 28px;
  }

  .player-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

