<template>
  <ZModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="`Estatísticas de ${playerData?.player?.displayName || playerData?.player?.name || 'Jogador'}`"
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

    <div v-else-if="playerData" class="player-stats-modal">
      <!-- Header do Jogador -->
      <div class="player-header-section">
        <ZUser :data="playerData.player" show-position />
      </div>

      <!-- Estatísticas Principais -->
      <div class="main-stats-section">
        <div class="stat-card presence-card">
          <div class="stat-icon">
            <va-icon name="check_circle" size="32px" color="#28a745" />
          </div>
          <div class="stat-content">
            <div class="stat-value presence-value">
              {{ formatPercentage(playerData.presencePercentage ?? 0) }}
            </div>
            <div class="stat-label">Presença</div>
            <div class="stat-description">
              Percentual de presença nos treinos finalizados
            </div>
          </div>
        </div>

        <div class="stat-card trainings-card">
          <div class="stat-icon">
            <va-icon name="fitness_center" size="32px" color="#e9742b" />
          </div>
          <div class="stat-content">
            <div class="stat-value trainings-value">
              {{ playerData.presencesCount || 0 }} / {{ playerData.trainingsCount || 0 }} / {{ playerData.pendingTrainingsCount || 0 }}
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
            <div class="stat-description">
              Apenas treinos finalizados são considerados nas estatísticas
            </div>
          </div>
        </div>
      </div>

      <!-- Posições -->
      <div class="positions-section">
        <h4 class="section-title">Posição</h4>
        <div class="positions-tags">
          <span
            v-for="(position, idx) in playerData.player.positions || []"
            :key="position?.id || idx"
            class="position-tag"
          >
            {{ position?.name }}
          </span>
          <span
            v-if="!playerData.player.positions || playerData.player.positions.length === 0"
            class="position-tag empty"
          >
            Sem posição
          </span>
        </div>
      </div>

      <!-- Visão Técnica dos Fundamentos -->
      <div class="fundamentals-section">
        <div class="section-title-wrapper">
          <h4 class="section-title">Visão Técnica dos Treinos</h4>
          <div class="section-actions">
            <va-button
              :icon="fundamentalsViewMode === 'chart' ? 'visibility' : 'bar_chart'"
              preset="plain"
              size="small"
              class="toggle-view-btn"
              @click="toggleFundamentalsView"
              :title="fundamentalsViewMode === 'chart' ? 'Ver informações detalhadas' : 'Ver gráfico radar'"
            />
          </div>
        </div>
        <div
          v-if="
            playerData.topFundamentals &&
            playerData.topFundamentals.length > 0
          "
        >
          <!-- Modo Gráfico Radar -->
          <div v-if="fundamentalsViewMode === 'chart'" class="radar-chart-container">
            <Radar
              :data="getRadarChartData()"
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
        <div v-else class="empty-fundamentals">
          <va-icon name="info" size="24px" color="#9E9E9E" />
          <p>Nenhum fundamental treinado ainda</p>
        </div>
      </div>

      <!-- Ranking de Presença nos Times -->
      <div v-if="playerData.teamRankings && playerData.teamRankings.length > 0" class="team-rankings-section">
        <div class="section-title-wrapper">
          <h4 class="section-title">Ranking de Presença nos Times</h4>
          <va-icon name="emoji_events" size="20px" color="#E9742B" />
        </div>
        <div class="team-rankings-list">
          <div
            v-for="(teamRanking, index) in playerData.teamRankings"
            :key="teamRanking.team.id"
            class="team-ranking-card"
            :class="getTeamRankingCardClass(index)"
          >
            <div class="team-ranking-border" :class="getTeamRankingBorderClass(index)"></div>
            <div class="team-ranking-content">
              <div class="team-ranking-header">
                <ZTeam :data="teamRanking.team" :showCategoryAndLevel="true" />
                <div class="team-ranking-badge" :class="getTeamRankingBadgeClass(index)">
                  {{ formatPercentage(teamRanking.presencePercentage) }}
                </div>
              </div>
              <div class="player-ranking-info">
                <div class="rank-display">
                  <div
                    class="rank-badge"
                    :class="getRankBadgeClass(index, teamRanking.rank)"
                  >
                    <span class="rank-number">{{ teamRanking.rank }}º</span>
                  </div>
                  <va-icon
                    v-if="teamRanking.rank === 1"
                    name="emoji_events"
                    class="trophy-icon-small"
                  />
                </div>
                <div class="ranking-details">
                  <div class="ranking-detail-item">
                    <span class="detail-label">Presenças:</span>
                    <span class="detail-value">{{ teamRanking.totalPresences }}/{{ teamRanking.totalConfirmations }}</span>
                  </div>
                  <div class="ranking-detail-item">
                    <span class="detail-label">Total de jogadores no time:</span>
                    <span class="detail-value">{{ teamRanking.totalPlayersInTeam }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
import PLAYER_INDIVIDUAL_ANALYSIS from "~/graphql/dashboard/query/playerIndividualAnalysis.graphql";
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
  name: "ZPlayerStatsModal",
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
    playerId: {
      type: [String, Number],
      required: false,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      playerData: null,
      loadingData: false,
      errorMessage: null,
      fundamentalsViewMode: 'chart', // 'chart' ou 'info'
    };
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.playerId) {
        this.loadPlayerStats();
      } else {
        this.playerData = null;
        this.errorMessage = null;
      }
    },
    playerId() {
      if (this.modelValue && this.playerId) {
        this.loadPlayerStats();
      }
    },
  },
  mounted() {
    if (this.modelValue && this.playerId) {
      this.loadPlayerStats();
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
    async loadPlayerStats() {
      if (!this.playerId) return;

      this.loadingData = true;
      this.errorMessage = null;
      this.playerData = null;

      try {
        const query = gql`
          ${PLAYER_INDIVIDUAL_ANALYSIS}
        `;

        const variables = {
          playerId: String(this.playerId),
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

        if (result?.data?.playerIndividualAnalysis) {
          this.playerData = result.data.playerIndividualAnalysis;
        } else {
          this.errorMessage = "Nenhum dado encontrado para este jogador.";
        }
      } catch (error) {
        this.loadingData = false;
        this.errorMessage = error.message || "Erro ao carregar estatísticas do jogador.";
        console.error("Erro ao carregar estatísticas:", error);
      }
    },
    closeModal() {
      this.$emit("update:modelValue", false);
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    getPercentage(part, total) {
      if (total === 0) return 0;
      return (part / total) * 100;
    },
    getTeamRankingCardClass(index) {
      const classes = ["team-card-orange", "team-card-blue", "team-card-black"];
      return classes[index % classes.length];
    },
    getTeamRankingBorderClass(index) {
      const classes = ["border-orange", "border-blue", "border-black"];
      return classes[index % classes.length];
    },
    getTeamRankingBadgeClass(index) {
      const classes = ["badge-orange", "badge-blue", "badge-black"];
      return classes[index % classes.length];
    },
    getRankBadgeClass(index, rank) {
      const baseClasses = ["rank-orange", "rank-blue", "rank-black"];
      const baseClass = baseClasses[index % baseClasses.length];

      if (rank === 1) {
        return `${baseClass} rank-gold`;
      } else if (rank === 2) {
        return `${baseClass} rank-silver`;
      } else if (rank === 3) {
        return `${baseClass} rank-bronze`;
      }

      return baseClass;
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    toggleFundamentalsView() {
      this.fundamentalsViewMode = this.fundamentalsViewMode === 'chart' ? 'info' : 'chart';
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
    getRadarChartData() {
      if (!this.playerData?.topFundamentals) {
        return {
          labels: [],
          datasets: [],
        };
      }

      const allFundamentals = this.getAllFundamentals();

      // Criar um mapa dos fundamentos treinados
      const fundamentalsMap = {};
      this.playerData.topFundamentals.forEach((f) => {
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

.player-stats-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.player-header-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.main-stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.positions-section,
.fundamentals-section {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
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
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.fundamentals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fundamental-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
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
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
}

.fundamental-total {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.fundamental-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fundamental-bars {
  display: flex;
  height: 20px;
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
  gap: 10px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
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
  font-size: 12px;
  line-height: 1;
  display: inline-block;
}

.stat-badge .stat-value {
  font-weight: 600;
  font-size: 12px;
  line-height: 1;
  display: inline-block;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 16px 0;
}

.positions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.position-tag {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background-color: #fff4ec;
  border: 1px solid #e9742b;
  color: #e9742b;
}

.position-tag.empty {
  background-color: #f5f5f5;
  border-color: #9e9e9e;
  color: #9e9e9e;
}

.fundamentals-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.top3-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #e9742b;
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


.empty-fundamentals {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #9e9e9e;
  font-size: 14px;
}

.team-rankings-section {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.team-rankings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-ranking-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.team-ranking-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.team-ranking-border {
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

.team-ranking-content {
  padding: 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.team-ranking-header :deep(.team-container) {
  margin: 0;
  gap: 8px;
}

.team-ranking-header :deep(.team-name) {
  font-size: 14px;
  font-weight: 600;
}

.team-ranking-header :deep(.info-text) {
  font-size: 11px;
}

.team-ranking-badge {
  font-size: 14px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
}

.badge-orange {
  background: rgba(233, 116, 43, 0.1);
  color: #e9742b;
}

.badge-blue {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}

.badge-black {
  background: rgba(11, 30, 58, 0.1);
  color: #0b1e3a;
}

.player-ranking-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rank-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.rank-badge {
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

.rank-number {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.trophy-icon-small {
  color: rgb(143, 108, 38);
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
}

.ranking-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.ranking-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #0b1e3a;
  font-weight: 600;
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
}
</style>

