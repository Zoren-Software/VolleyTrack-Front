<template>
  <div class="team-performance-section">
    <div class="section-header">
      <div class="section-title-wrapper">
        <h2 class="section-title">Desempenho por Time</h2>
        <ZTop3Badge />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando desempenho...</span>
    </div>

    <div v-else-if="teams.length === 0" class="empty-state">
      <va-icon name="info" size="48px" color="#9E9E9E" />
      <p class="empty-text">Nenhum time com análise disponível</p>
    </div>

    <div v-else class="teams-grid">
      <div
        v-for="(teamData, index) in teams"
        :key="teamData.team.id"
        class="team-card"
        :class="getTeamCardClass(index)"
      >
        <div class="team-card-border" :class="getTeamBorderClass(index)"></div>
        <div class="team-card-content">
          <div class="team-header">
            <ZTeam :data="teamData.team" />
          </div>

          <div class="team-stats">
            <div class="stat-item players">
              <div class="stat-value">{{ teamData.playersCount }}</div>
              <div class="stat-label">Jogadores</div>
            </div>

            <div class="stat-item trainings" :class="getTrainingsClass(index)">
              <div class="stat-value" :class="getTrainingsValueClass(index)">
                {{ teamData.trainingsCount }}
              </div>
              <div class="stat-label">Treinos</div>
            </div>

            <div class="stat-item presence" :class="getPresenceClass(teamData.averagePresencePercentage, index)">
              <div class="stat-value" :class="getPresenceValueClass(teamData.averagePresencePercentage, index)">
                {{ formatPercentage(teamData.averagePresencePercentage) }}
              </div>
              <div class="stat-label">Presença Média</div>
            </div>
          </div>

          <div class="team-footer">
            <a href="#" class="team-details-link" @click.prevent="navigateToTeams">
              Detalhes do Time
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import TEAMS_PERFORMANCE_ANALYSIS from "~/graphql/dashboard/query/teamsPerformanceAnalysis.graphql";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam.vue";
import ZTop3Badge from "~/components/molecules/Badges/ZTop3Badge.vue";

export default {
  name: "ZTeamPerformance",
  components: {
    ZTeam,
    ZTop3Badge,
  },
  data() {
    return {
      teams: [],
      loading: false,
    };
  },
  mounted() {
    this.getTeamsPerformance();
  },
  methods: {
    getTeamsPerformance(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${TEAMS_PERFORMANCE_ANALYSIS}
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
        if (result?.data?.teamsPerformanceAnalysis) {
          this.teams = result.data.teamsPerformanceAnalysis;
        }
        this.loading = false;
      });

      if (value) {
        if (value?.teamsPerformanceAnalysis) {
          this.teams = value.teamsPerformanceAnalysis;
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
    getTeamNameClass(index) {
      const classes = ["name-orange", "name-blue", "name-black"];
      return classes[index % classes.length];
    },
    getTeamColor(index) {
      const colors = ["#E9742B", "#1976D2", "#0B1E3A"];
      return colors[index % colors.length];
    },
    getTrainingsClass(index) {
      const classes = ["trainings-orange", "trainings-blue", "trainings-black"];
      return classes[index % classes.length];
    },
    getTrainingsValueClass(index) {
      const classes = ["value-orange", "value-blue", "value-black"];
      return classes[index % classes.length];
    },
    getPresenceClass(percentage, index) {
      const baseClasses = ["presence-orange", "presence-blue", "presence-black"];
      return baseClasses[index % baseClasses.length];
    },
    getPresenceValueClass(percentage, index) {
      const baseClasses = ["value-orange", "value-blue", "value-black"];
      return baseClasses[index % baseClasses.length];
    },
    navigateToTeams() {
      this.$router.push("/teams");
    },
  },
};
</script>

<style scoped>
.team-performance-section {
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

.teams-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.team-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  height: 100%;
  overflow: hidden;
  width: 100%;
  position: relative;
}

.team-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.team-card-border {
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

.team-card-content {
  padding: 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.team-header {
  margin-bottom: 4px;
}

.team-header {
  margin-bottom: 4px;
}

.team-header :deep(.team-container) {
  margin: 0;
  gap: 10px;
  align-items: center;
}

.team-header :deep(.avatar-wrapper) {
  margin: 0;
  padding: 0;
  align-self: center;
}

.team-header :deep(.team-avatar) {
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
}

.team-header :deep(.team-avatar .va-avatar) {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border-radius: 50% !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.team-header :deep(.team-avatar .va-avatar__content) {
  border-radius: 50% !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: white !important;
}

.team-header :deep(.team-name) {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
}

.team-header :deep(.team-info) {
  flex: 1;
  min-width: 0;
}

.team-stats {
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

.stat-item.players .stat-value {
  color: #0b1e3a;
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
}

.team-footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.team-details-link {
  color: #1976d2;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.team-details-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

/* Tablets grandes (769px - 1024px) */
@media (max-width: 1024px) {
  .teams-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* Tablets (481px - 768px) */
@media (max-width: 768px) {
  .team-performance-section {
    padding: 16px;
    margin-top: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .teams-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .team-card {
    min-height: auto;
  }

  .team-card-content {
    padding: 16px;
    padding-left: 20px;
  }

  .team-stats {
    gap: 12px;
  }

  .stat-value {
    font-size: 24px;
  }
}

/* Celulares (até 480px) */
@media (max-width: 480px) {
  .team-performance-section {
    padding: 12px;
    border-radius: 8px;
  }

  .section-title {
    font-size: 16px;
  }

  .teams-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .team-card-content {
    padding: 12px;
    padding-left: 16px;
    gap: 12px;
  }

  .team-name {
    font-size: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>

