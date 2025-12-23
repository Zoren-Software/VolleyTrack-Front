<template>
  <div class="individual-analysis-section">
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="person" size="20px" color="#E9742B" />
        <h2 class="section-title">Análise Individual</h2>
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
      >
        <div class="player-header">
          <ZUser :data="playerData.player" show-position />
        </div>

        <div class="player-stats">
          <div
            class="stat-item presence"
            :class="getPresenceClass(playerData.presencePercentage)"
          >
            <div class="stat-value">
              {{ formatPercentage(playerData.presencePercentage) }}
            </div>
            <div class="stat-label">Presença</div>
          </div>

          <div class="stat-item trainings">
            <div class="stat-value">{{ playerData.trainingsCount }}</div>
            <div class="stat-label">Treinos</div>
          </div>
        </div>

        <div class="fundamentals-section">
          <h4 class="fundamentals-title">Fundamentos Mais Treinados</h4>
          <div class="fundamentals-tags">
            <span
              v-for="(fundamental, idx) in playerData.topFundamentals"
              :key="fundamental.fundamental.id"
              class="fundamental-tag"
              :class="getTagColorClass(index, idx)"
            >
              {{ fundamental.fundamental.name }}
            </span>
          </div>
        </div>

        <div class="player-footer">
          <a href="#" class="view-history-link" @click.prevent="viewHistory(playerData.player.id)">
            Ver histórico completo
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import PLAYERS_INDIVIDUAL_ANALYSIS from "~/graphql/dashboard/query/playersIndividualAnalysis.graphql";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser.vue";

export default {
  name: "ZIndividualAnalysis",
  components: {
    ZUser,
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
        first: 4,
        page: 1,
      };

      const {
        result: { value },
      } = useQuery(query, variables, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-and-network",
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
    getPresenceClass(percentage) {
      if (percentage === 100) return "perfect";
      if (percentage >= 90) return "excellent";
      if (percentage >= 75) return "good";
      if (percentage >= 70) return "regular";
      if (percentage >= 50) return "warning";
      return "danger";
    },
    getTagColorClass(playerIndex, tagIndex) {
      // Cores diferentes para cada jogador
      const colors = ["orange", "dark", "blue"];
      return colors[playerIndex % colors.length];
    },
    viewHistory(playerId) {
      // TODO: Implementar navegação para histórico do jogador
      console.log("Ver histórico do jogador:", playerId);
      // this.$router.push(`/players/${playerId}/history`);
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
  margin-bottom: 20px;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
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
  gap: 20px;
}

.player-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.player-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.player-header {
  margin-bottom: 16px;
}

.player-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-item.presence.perfect .stat-value {
  color: #28a745;
}

.stat-item.presence.excellent .stat-value {
  color: #e9742b;
}

.stat-item.presence.good .stat-value {
  color: #0b1e3a;
}

.stat-item.presence.regular .stat-value {
  color: #1976d2;
}

.stat-item.presence.warning .stat-value {
  color: #ffc107;
}

.stat-item.presence.danger .stat-value {
  color: #dc3545;
}

.stat-item.trainings .stat-value {
  color: #0b1e3a;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.fundamentals-section {
  margin-bottom: 16px;
}

.fundamentals-title {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fundamentals-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

.player-footer {
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.view-history-link {
  font-size: 12px;
  color: #e9742b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-history-link:hover {
  color: #d6652a;
  text-decoration: underline;
}

@media (max-width: 1200px) {
  .players-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .players-grid {
    grid-template-columns: 1fr;
  }

  .individual-analysis-section {
    padding: 16px;
  }
}
</style>

