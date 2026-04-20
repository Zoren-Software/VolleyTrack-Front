<template>
  <div
    v-if="loading || players.length > 0"
    class="individual-analysis-section"
  >
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="person" size="24px" color="#FF4E1B" />
        <h2 class="section-title">Análise Individual</h2>
        <ZTop3Badge />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando análise...</span>
    </div>

    <div v-else class="players-grid">
      <div
        v-for="(playerData, index) in players"
        :key="playerData.player.id"
        class="player-card"
      >
        <div class="player-card-content player-card-content--profile">
          <div class="profile-head">
            <div class="profile-head__avatar-wrap">
              <va-avatar
                v-if="playerData.player.id"
                class="profile-avatar"
                size="large"
                :color="getAvatarColor()"
              >
                {{ playerInitial(playerData.player) }}
              </va-avatar>
            </div>
            <div class="profile-head__metrics" aria-label="Resumo do jogador">
              <div class="profile-stat-col">
                <span class="profile-stat-label">Times</span>
                <span
                  class="profile-stat-value"
                  :class="getTrainingsValueClass(index)"
                >
                  {{ teamsCount(playerData) }}
                </span>
              </div>
              <div class="profile-stat-col">
                <span class="profile-stat-label">Presença</span>
                <span
                  class="profile-stat-value"
                  :class="
                    getPresenceValueClass(
                      playerData.presencePercentage,
                      index,
                    )
                  "
                >
                  {{ formatPercentage(playerData.presencePercentage ?? 0) }}
                </span>
              </div>
              <div class="profile-stat-col">
                <span class="profile-stat-label profile-stat-label--with-info">
                  Treinos
                  <va-popover
                    placement="top"
                    trigger="hover"
                    class="info-popover-wrapper"
                  >
                    <va-icon
                      name="info"
                      size="12px"
                      color="#9aa3ad"
                      class="info-icon"
                    />
                    <template #title>Informação</template>
                    <template #body>
                      <p class="info-popover-text">
                        Finalizados / Agendados
                      </p>
                    </template>
                  </va-popover>
                </span>
                <span
                  class="profile-stat-value profile-stat-value--split"
                  :class="getTrainingsValueClass(index)"
                >
                  <span>{{ playerData.trainingsCount || 0 }}</span>
                  <span class="profile-stat-sep">/</span>
                  <span>{{ playerData.pendingTrainingsCount || 0 }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="profile-identity">
            <h3 class="profile-name">
              {{ playerDisplayName(playerData.player) }}
            </h3>
            <div class="fundamentals-section fundamentals-section--profile">
              <p class="profile-positions-label">Posições</p>
              <div class="fundamentals-tags">
                <span
                  v-for="(position, idx) in playerData.player.positions || []"
                  :key="position?.id || idx"
                  class="fundamental-tag fundamental-tag--position"
                >
                  {{ position?.name }}
                </span>
                <span
                  v-if="
                    !playerData.player.positions ||
                    playerData.player.positions.length === 0
                  "
                  class="fundamental-tag fundamental-tag--position"
                >
                  Sem posição
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="profile-details-link"
            @click="goPlayerDetails(playerData.player.id)"
          >
            <span class="profile-details-link__text">Detalhes do jogador</span>
            <va-icon
              name="chevron_right"
              size="18px"
              class="profile-details-link__chev"
            />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import PLAYERS_INDIVIDUAL_ANALYSIS from "~/graphql/dashboard/query/playersIndividualAnalysis.graphql";
import ZTop3Badge from "~/components/molecules/Badges/ZTop3Badge.vue";

export default {
  name: "ZIndividualAnalysis",
  components: {
    ZTop3Badge,
  },
  data() {
    return {
      players: [],
      loading: false,
    };
  },
  mounted() {
    this.getPlayersAnalysis();
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
          this.players = result.data.playersIndividualAnalysis.data;
        }
        this.loading = false;
      });

      if (value) {
        if (value?.playersIndividualAnalysis?.data) {
          this.players = value.playersIndividualAnalysis.data;
        }
        this.loading = false;
      }
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    teamsCount(playerData) {
      const teams = playerData?.player?.teams;
      return Array.isArray(teams) ? teams.length : 0;
    },
    playerDisplayName(player) {
      if (!player) return "—";
      return (player.displayName || player.name || "—").trim();
    },
    playerInitial(player) {
      const n = this.playerDisplayName(player);
      return n.charAt(0).toUpperCase() || "?";
    },
    getAvatarColor() {
      return "#FF4E1B";
    },
    getPresenceValueClass(percentage, index) {
      const baseClasses = ["value-orange", "value-blue", "value-black"];
      return baseClasses[index % baseClasses.length];
    },
    getTrainingsValueClass(index) {
      const classes = ["value-orange", "value-blue", "value-black"];
      return classes[index % classes.length];
    },
    goPlayerDetails(playerId) {
      if (playerId == null) return;
      this.$router.push(`/players/stats/${playerId}`);
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
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
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

.players-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
}

.player-card {
  background: #fff;
  border-radius: 22px;
  padding: 0;
  border: none;
  box-shadow: 0 4px 24px rgba(11, 30, 58, 0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.player-card:hover {
  box-shadow: 0 8px 32px rgba(11, 30, 58, 0.1);
  transform: translateY(-2px);
}

.player-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.player-card-content--profile {
  align-items: stretch;
  text-align: left;
  padding: 22px 22px 20px;
  gap: 0;
}

.profile-head {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.profile-head__avatar-wrap {
  flex-shrink: 0;
}

.profile-avatar {
  font-size: 22px !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 16px rgba(255, 78, 27, 0.22);
  border: 3px solid #fff;
}

.profile-head__metrics {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px 8px;
  align-content: start;
  padding-top: 2px;
}

.profile-identity {
  margin-bottom: 18px;
}

.profile-name {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 800;
  color: #0b1e3a;
  line-height: 1.3;
  max-width: 100%;
  word-break: break-word;
  letter-spacing: -0.02em;
}

.profile-positions-label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  color: #9aa3ad;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.fundamentals-section--profile {
  margin-top: 0;
}

.fundamentals-tags {
  justify-content: flex-start;
}

.profile-stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  min-width: 0;
}

.profile-stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9aa3ad;
  line-height: 1.2;
}

.profile-stat-label--with-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.profile-stat-value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
}

.profile-stat-value--split {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-size: 17px;
}

.profile-stat-sep {
  font-weight: 600;
  opacity: 0.45;
  font-size: 14px;
}

.profile-details-link {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  padding: 10px 0 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  color: #7c8794;
  transition: color 0.2s ease;
}

.profile-details-link:hover {
  color: #5c6570;
}

.profile-details-link:focus-visible {
  outline: 2px solid rgba(255, 78, 27, 0.35);
  outline-offset: 2px;
  border-radius: 4px;
}

.profile-details-link__text {
  line-height: 1.2;
}

.profile-details-link :deep(.va-icon) {
  color: currentColor !important;
}

.profile-details-link__chev {
  opacity: 0.92;
  flex-shrink: 0;
  margin-top: 1px;
}

.value-orange {
  color: #FF4E1B;
}

.value-blue {
  color: #1976d2;
}

.value-black {
  color: #0b1e3a;
}

.info-icon {
  cursor: help;
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: #ff4e1b;
}

.info-popover-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: white;
}

.fundamentals-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0;
}

.fundamental-tag {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.fundamental-tag--position {
  background-color: #f0f2f5;
  border: 1px solid #e4e7ec;
  color: #3d4a5c;
}

/* Tablets grandes (769px - 1024px) */
@media (max-width: 1024px) {
  .players-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
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

  .player-card {
    min-height: auto;
  }

  .player-card-content {
    padding: 16px;
  }

  .player-card-content--profile {
    padding: 18px 14px 16px;
  }

  .profile-stat-value {
    font-size: 18px;
  }

  .profile-stat-value--split {
    font-size: 15px;
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

  .players-grid {
    gap: 12px;
  }

  .player-card-content {
    padding: 12px;
    gap: 12px;
  }

  .player-card-content--profile {
    padding: 16px 12px 14px;
  }

  .profile-name {
    font-size: 16px;
  }

  .profile-head {
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .profile-head__metrics {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 10px;
    padding-top: 0;
  }

  .profile-stat-col {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    text-align: left;
  }

  .profile-stat-label,
  .profile-stat-label--with-info {
    justify-content: flex-start;
  }

  .profile-stat-value,
  .profile-stat-value--split {
    text-align: right;
  }

  .fundamental-tag {
    padding: 3px 10px;
    font-size: 11px;
  }
}
</style>
