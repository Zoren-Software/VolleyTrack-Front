<template>
  <div class="z-team-stats-view">
    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando estatísticas...</span>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <va-icon name="error" size="48px" color="danger" />
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-else-if="teamData" class="team-stats-view">
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
            <va-icon name="fitness_center" size="32px" color="#FF4E1B" />
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
            class="player-profile-card"
            :class="'player-profile-card--accent-' + (index % 3)"
          >
            <div class="player-profile-top">
              <div class="player-profile-actions">
                <va-button
                  preset="plain"
                  :icon="isPlayerBookmarked(playerData.player.id) ? 'bookmark' : 'bookmark_border'"
                  size="small"
                  round
                  class="profile-action-btn"
                  :color="isPlayerBookmarked(playerData.player.id) ? 'warning' : 'secondary'"
                  aria-label="Marcar jogador"
                  @click="togglePlayerBookmark(playerData.player.id)"
                />
                <NuxtLink
                  :to="`/players/stats/${playerData.player.id}`"
                  class="profile-action-link"
                  title="Estatísticas individuais"
                >
                  <va-button
                    preset="plain"
                    icon="analytics"
                    size="small"
                    round
                    class="profile-action-btn"
                    color="secondary"
                  />
                </NuxtLink>
              </div>

              <div class="player-profile-main">
                <va-avatar
                  class="player-profile-avatar"
                  :size="64"
                >
                  {{ playerNameInitial(playerData.player) }}
                </va-avatar>

                <div class="player-profile-body">
                  <div class="player-profile-name-row">
                    <h3 class="player-profile-name">
                      {{ playerData.player.displayName || playerData.player.name }}
                    </h3>
                    <va-icon
                      v-if="showPresenceVerified(playerData)"
                      name="verified"
                      color="#22c55e"
                      size="20px"
                      class="player-profile-verified"
                    />
                    <span
                      v-if="playerData.rank <= 3"
                      class="player-profile-rank-pill"
                      :class="getRankPillClass(playerData.rank)"
                    >
                      <va-icon
                        v-if="playerData.rank === 1"
                        name="emoji_events"
                        size="14px"
                        class="rank-pill-icon"
                      />
                      {{ playerData.rank }}º no ranking
                    </span>
                  </div>

                  <div class="player-profile-tags">
                    <span
                      v-for="(pos, pi) in playerData.player.positions || []"
                      :key="pos.id || pi"
                      class="position-tag"
                      :class="'position-tag--' + (pi % 3)"
                    >
                      {{ pos.name }}
                    </span>
                    <span
                      v-if="!(playerData.player.positions || []).length"
                      class="position-tag position-tag--muted"
                    >
                      Sem posição
                    </span>
                  </div>

                  <div class="player-profile-meta">
                    <span class="profile-meta-item">
                      <va-icon name="military_tech" size="16px" color="#9ca3af" />
                      Ranking {{ playerData.rank }}º no time
                    </span>
                    <span class="profile-meta-item">
                      <va-icon name="event_available" size="16px" color="#9ca3af" />
                      {{ playerData.presencesCount || 0 }}/{{ playerData.trainingsCount || 0 }} presenças / treinos fin.
                    </span>
                    <span class="profile-meta-item">
                      <va-icon name="schedule" size="16px" color="#9ca3af" />
                      {{ playerData.pendingTrainingsCount || 0 }} treino(s) pendente(s)
                    </span>
                  </div>

                  <p class="player-profile-summary">
                    {{ getPlayerSummaryText(playerData, isPlayerBioExpanded(playerData.player.id)) }}
                  </p>
                  <button
                    v-if="shouldShowReadMore(playerData)"
                    type="button"
                    class="player-profile-read-more"
                    @click="togglePlayerBioExpanded(playerData.player.id)"
                  >
                    {{ isPlayerBioExpanded(playerData.player.id) ? "Ver menos" : "Ver mais…" }}
                  </button>
                </div>
              </div>
            </div>

            <div class="player-profile-stats-divider" />

            <div class="player-profile-stats-row">
              <div class="profile-stat-col">
                <div class="profile-stat-icon profile-stat-icon--blue">
                  <va-icon name="percent" size="20px" color="#2563eb" />
                </div>
                <div class="profile-stat-value">
                  {{ formatPercentage(playerData.presencePercentage ?? 0) }}
                </div>
                <div class="profile-stat-label">Presença</div>
              </div>
              <div class="profile-stat-col">
                <div class="profile-stat-icon profile-stat-icon--orange">
                  <va-icon name="check_circle" size="20px" color="#ea580c" />
                </div>
                <div class="profile-stat-value">
                  {{ playerData.presencesCount || 0 }}/{{ playerData.trainingsCount || 0 }}
                </div>
                <div class="profile-stat-label">Presenças / Treinos</div>
              </div>
              <div class="profile-stat-col">
                <div class="profile-stat-icon profile-stat-icon--red">
                  <va-icon name="fitness_center" size="20px" color="#dc2626" />
                </div>
                <div class="profile-stat-value">{{ playerData.trainingsCount || 0 }}</div>
                <div class="profile-stat-label">Treinos finalizados</div>
              </div>
              <div class="profile-stat-col">
                <div class="profile-stat-icon profile-stat-icon--green">
                  <va-icon name="pending_actions" size="20px" color="#16a34a" />
                </div>
                <div class="profile-stat-value">{{ playerData.pendingTrainingsCount || 0 }}</div>
                <div class="profile-stat-label">Treinos pendentes</div>
              </div>
              <div class="profile-stat-col">
                <div class="profile-stat-icon profile-stat-icon--purple">
                  <va-icon name="shield" size="20px" color="#7c3aed" />
                </div>
                <div class="profile-stat-value profile-stat-value--sm">
                  {{ getTopFundamentalShort(playerData) }}
                </div>
                <div class="profile-stat-label">Destaque técnico</div>
              </div>
            </div>

            <!-- Visão Técnica dos Fundamentos -->
              <div v-if="playerData.topFundamentals && playerData.topFundamentals.length > 0" class="player-fundamentals player-fundamentals--in-card">
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
        <div v-else class="empty-players">
          <va-icon name="info" size="24px" color="#9E9E9E" />
          <p>Nenhum jogador encontrado no time</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
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
  name: "ZTeamStatsView",
  components: {
    ZTeam,
    Radar,
  },
  props: {
    teamId: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["loaded"],
  data() {
    return {
      teamData: null,
      loadingData: false,
      errorMessage: null,
      playerViewModes: {},
      playerBioExpanded: {},
      playerBookmarked: {},
    };
  },
  watch: {
    teamId: {
      immediate: true,
      handler(newId) {
        if (newId != null && newId !== "") {
          this.loadTeamStats();
        } else {
          this.teamData = null;
          this.errorMessage = null;
        }
      },
    },
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
            borderColor: "rgba(255, 78, 27, 1)",
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
          this.$emit("loaded", this.teamData);
        } else {
          this.errorMessage = "Nenhum dado encontrado para este time.";
        }
      } catch (error) {
        this.loadingData = false;
        this.errorMessage = error.message || "Erro ao carregar estatísticas do time.";
        console.error("Erro ao carregar estatísticas:", error);
      }
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    playerNameInitial(player) {
      const nameToUse = player?.displayName || player?.name || "?";
      return String(nameToUse).charAt(0).toUpperCase();
    },
    showPresenceVerified(playerData) {
      return (playerData?.presencePercentage ?? 0) >= 60;
    },
    getRankPillClass(rank) {
      if (rank === 1) return "rank-pill-gold";
      if (rank === 2) return "rank-pill-silver";
      if (rank === 3) return "rank-pill-bronze";
      return "";
    },
    isPlayerBookmarked(playerId) {
      return !!this.playerBookmarked[playerId];
    },
    togglePlayerBookmark(playerId) {
      this.playerBookmarked = {
        ...this.playerBookmarked,
        [playerId]: !this.playerBookmarked[playerId],
      };
    },
    isPlayerBioExpanded(playerId) {
      return !!this.playerBioExpanded[playerId];
    },
    togglePlayerBioExpanded(playerId) {
      this.playerBioExpanded = {
        ...this.playerBioExpanded,
        [playerId]: !this.playerBioExpanded[playerId],
      };
    },
    getPlayerSummaryShort(playerData) {
      const pct = this.formatPercentage(playerData.presencePercentage ?? 0);
      const pres = playerData.presencesCount || 0;
      const train = playerData.trainingsCount || 0;
      return `Integra o elenco com ${pct} de presença nos treinos finalizados, com ${pres} presença(s) registrada(s) em ${train} treino(s) concluído(s).`;
    },
    getPlayerSummaryLong(playerData) {
      const base = this.getPlayerSummaryShort(playerData);
      const rank = playerData.rank;
      const pending = playerData.pendingTrainingsCount || 0;
      let extra = ` Ocupa a ${rank}ª posição no ranking de presença do time.`;
      if (pending > 0) {
        extra += ` Há ${pending} treino(s) agendado(s) ainda não finalizado(s).`;
      }
      const topName = this.getTopFundamentalName(playerData);
      if (topName) {
        extra += ` Maior volume de registros técnicos em ${topName}.`;
      }
      return base + extra;
    },
    getPlayerSummaryText(playerData, expanded) {
      return expanded
        ? this.getPlayerSummaryLong(playerData)
        : this.getPlayerSummaryShort(playerData);
    },
    shouldShowReadMore(playerData) {
      const pending = playerData.pendingTrainingsCount || 0;
      const hasFund = !!this.getTopFundamentalName(playerData);
      return pending > 0 || hasFund;
    },
    getTopFundamentalName(playerData) {
      const list = playerData?.topFundamentals;
      if (!list?.length) return null;
      const sorted = [...list].sort(
        (a, b) => (b.grandTotal || 0) - (a.grandTotal || 0)
      );
      return sorted[0]?.fundamental?.name || null;
    },
    getTopFundamentalShort(playerData) {
      const name = this.getTopFundamentalName(playerData);
      if (!name) return "—";
      const max = 20;
      return name.length > max ? `${name.slice(0, max - 1)}…` : name;
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
            backgroundColor: "rgba(255, 78, 27, 0.2)",
            borderColor: "rgba(255, 78, 27, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(255, 78, 27, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255, 78, 27, 1)",
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

.z-team-stats-view {
  width: 100%;
}

.team-stats-view {
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
  color: #FF4E1B;
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
  color: #FF4E1B;
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

.player-profile-card {
  position: relative;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8ecf1;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 14px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.player-profile-card:hover {
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.player-profile-card--accent-0 {
  border-left: 4px solid #ff4e1b;
}

.player-profile-card--accent-1 {
  border-left: 4px solid #1976d2;
}

.player-profile-card--accent-2 {
  border-left: 4px solid #0b1e3a;
}

.player-profile-top {
  position: relative;
  padding: 22px 24px 20px;
}

.player-profile-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.profile-action-btn {
  border: 1px solid #e5e7eb !important;
  background: #fafafa !important;
}

.profile-action-link {
  display: inline-flex;
  text-decoration: none;
}

.player-profile-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  padding-right: 72px;
}

.player-profile-avatar {
  flex-shrink: 0;
  border-radius: 10px !important;
  font-size: 22px !important;
  font-weight: 700 !important;
  background: linear-gradient(145deg, #ff4e1b 0%, #e03d12 100%) !important;
  color: #fff !important;
}

.player-profile-card--accent-1 .player-profile-avatar {
  background: linear-gradient(145deg, #1976d2 0%, #125ea2 100%) !important;
}

.player-profile-card--accent-2 .player-profile-avatar {
  background: linear-gradient(145deg, #0b1e3a 0%, #1a365d 100%) !important;
}

.player-profile-body {
  flex: 1;
  min-width: 0;
}

.player-profile-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin-bottom: 10px;
}

.player-profile-name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.player-profile-verified {
  flex-shrink: 0;
}

.player-profile-rank-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.rank-pill-icon {
  flex-shrink: 0;
}

.rank-pill-gold {
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  box-shadow: 0 1px 4px rgba(212, 175, 55, 0.35);
}

.rank-pill-silver {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.rank-pill-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #a65d24 100%);
}

.player-profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.position-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.position-tag--0 {
  background: #e0f2fe;
  color: #0369a1;
}

.position-tag--1 {
  background: #dcfce7;
  color: #15803d;
}

.position-tag--2 {
  background: #ffedd5;
  color: #c2410c;
}

.position-tag--muted {
  background: #f1f5f9;
  color: #64748b;
}

.player-profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 22px;
  margin-bottom: 14px;
}

.profile-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.player-profile-summary {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.55;
  color: #475569;
}

.player-profile-read-more {
  padding: 0;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  cursor: pointer;
  text-decoration: none;
}

.player-profile-read-more:hover {
  text-decoration: underline;
  color: #125ea2;
}

.player-profile-stats-divider {
  height: 1px;
  background: #eef2f6;
  margin: 0;
}

.player-profile-stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px 8px;
  padding: 20px 20px 22px;
  background: #fafbfc;
}

.profile-stat-col {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.profile-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-stat-icon--blue {
  background: rgba(37, 99, 235, 0.1);
}

.profile-stat-icon--orange {
  background: rgba(234, 88, 12, 0.12);
}

.profile-stat-icon--red {
  background: rgba(220, 38, 38, 0.1);
}

.profile-stat-icon--green {
  background: rgba(22, 163, 74, 0.1);
}

.profile-stat-icon--purple {
  background: rgba(124, 58, 237, 0.1);
}

.profile-stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  word-break: break-word;
}

.profile-stat-value--sm {
  font-size: 0.95rem;
  font-weight: 600;
}

.profile-stat-label {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  line-height: 1.3;
  max-width: 100%;
}

.player-fundamentals {
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.player-fundamentals--in-card {
  padding: 16px 20px 20px;
  margin: 0;
  border-top: 1px solid #eef2f6;
  background: #fff;
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
  color: #FF4E1B !important;
  background: rgba(255, 78, 27, 0.1) !important;
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

  .player-profile-main {
    flex-direction: column;
    padding-right: 0;
    gap: 16px;
  }

  .player-profile-stats-row {
    grid-template-columns: repeat(2, 1fr);
    padding: 16px 14px 18px;
  }

  .profile-stat-col:nth-child(5) {
    grid-column: 1 / -1;
  }
}
</style>

