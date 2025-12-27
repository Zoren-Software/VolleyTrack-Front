<template>
  <div class="presence-ranking-section">
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="emoji_events" size="24px" color="#E9742B" />
        <h2 class="section-title">Ranking de Presença</h2>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando ranking...</span>
    </div>

    <div
      v-else-if="!data || !data.topTeams || data.topTeams.length === 0"
      class="empty-state"
    >
      <va-icon name="info" size="48px" color="#9E9E9E" />
      <p class="empty-text">Nenhum dado disponível</p>
    </div>

    <div v-else class="teams-ranking-grid">
      <div
        v-for="(teamData, index) in data.topTeams"
        :key="teamData.team.id"
        class="team-ranking-card"
        :class="getTeamCardClass(index)"
      >
        <div class="team-card-border" :class="getTeamBorderClass(index)"></div>
        <div class="team-card-content">
          <div class="team-header">
            <ZTeam :data="teamData.team" :showCategoryAndLevel="true" />
            <div class="team-presence-badge" :class="getTeamBadgeClass(index)">
              {{ formatPercentage(teamData.presencePercentage) }}
            </div>
          </div>

          <div class="players-ranking-list">
            <div
              v-for="(playerData, playerIndex) in teamData.topPlayers"
              :key="playerData.player.id"
              class="player-ranking-item"
            >
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
              <ZUser :data="playerData.player" :show-position="true" />
              <div class="player-metrics">
                <div
                  class="player-percentage"
                  :class="getPlayerPercentageClass(index)"
                >
                  {{ formatPercentage(playerData.presencePercentage) }}
                </div>
                <div class="player-trainings-info">
                  {{ playerData.totalPresences }}/{{
                    playerData.totalTrainings
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import PRESENCE_RANKING from "~/graphql/dashboard/query/presenceRanking.graphql";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam.vue";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser.vue";

export default {
  name: "ZPresenceRanking",
  components: {
    ZTeam,
    ZUser,
  },
  data() {
    return {
      data: null,
      loading: false,
    };
  },
  mounted() {
    this.getPresenceRanking();
  },
  methods: {
    getPresenceRanking(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${PRESENCE_RANKING}
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
        if (result?.data?.presenceRanking) {
          this.data = result.data.presenceRanking;
        }
        this.loading = false;
      });

      if (value) {
        if (value?.presenceRanking) {
          this.data = value.presenceRanking;
        }
        this.loading = false;
      }
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    getTeamCardClass(index) {
      const classes = ["team-card-orange", "team-card-blue", "team-card-black"];
      return classes[index % classes.length];
    },
    getTeamBorderClass(index) {
      const classes = ["border-orange", "border-blue", "border-black"];
      return classes[index % classes.length];
    },
    getTeamBadgeClass(index) {
      const classes = ["badge-orange", "badge-blue", "badge-black"];
      return classes[index % classes.length];
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
  },
};
</script>

<style scoped>
.presence-ranking-section {
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

.teams-ranking-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .teams-ranking-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .teams-ranking-grid {
    grid-template-columns: 1fr;
  }
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
  display: flex;
  flex-direction: column;
}

.team-ranking-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.team-card-border {
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

.team-card-content {
  padding: 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 2px;
}

.team-header :deep(.team-container) {
  margin: 0;
  gap: 8px;
}

.team-header :deep(.team-name) {
  font-size: 13px;
}

.team-header :deep(.info-text) {
  font-size: 10px;
}

.team-presence-badge {
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

.players-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.player-ranking-item:hover {
  background: #f0f0f0;
  transform: translateX(2px);
}

.player-ranking-item :deep(.user-cell) {
  flex: 1;
  min-width: 0;
  padding: 0;
  margin: 0;
  gap: 8px;
}

.player-ranking-item :deep(.user-avatar) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
}

.player-ranking-item :deep(.user-avatar .va-avatar) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  border-radius: 50% !important;
  overflow: hidden !important;
}

.player-ranking-item :deep(.user-avatar .va-avatar__content) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.player-ranking-item :deep(.user-name) {
  font-size: 13px;
}

.player-ranking-item :deep(.user-detail-item) {
  font-size: 11px;
  gap: 4px;
}

.player-rank-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 24px;
}

.player-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.player-rank .rank-number {
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.trophy-icon {
  position: absolute;
  left: 16px;
  top: 49%;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
  z-index: 1;
  color: rgb(143, 108, 38);
  font-size: 16px;
  height: 16px;
  line-height: 16px;
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
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.player-trainings-info {
  font-size: 11px;
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

/* Responsive */
@media (max-width: 768px) {
  .presence-ranking-section {
    padding: 16px;
    margin-top: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .team-card-content {
    padding: 14px;
    padding-left: 18px;
    gap: 10px;
  }

  .team-presence-badge {
    font-size: 12px;
    padding: 3px 8px;
  }

  .player-ranking-item {
    padding: 6px;
    gap: 8px;
  }

  .player-rank {
    width: 22px;
    height: 22px;
  }

  .player-rank .rank-number {
    font-size: 9px;
  }

  .player-percentage {
    font-size: 12px;
  }

  .player-trainings-info {
    font-size: 10px;
  }
}
</style>
