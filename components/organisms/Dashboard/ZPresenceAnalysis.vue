<template>
  <div class="presence-analysis-section">
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="event_available" size="24px" color="#E9742B" />
        <h2 class="section-title">Análise de Presenças</h2>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando análise...</span>
    </div>

    <div
      v-else-if="!data || (!data.generalPresenceRate && !data.topTeamsByPresence?.length)"
      class="empty-state"
    >
      <va-icon name="info" size="48px" color="#9E9E9E" />
      <p class="empty-text">Nenhum dado disponível</p>
    </div>

    <div v-else class="presence-cards-grid">
      <!-- Card: Taxa Geral de Presença -->
      <div class="presence-card general-card">
        <h3 class="card-title general-title">Taxa Geral de Presença</h3>
        <div class="card-content">
          <div class="main-metric">
            <div class="metric-value general-value">
              {{ formatPercentage(data.generalPresenceRate) }}
            </div>
            <div class="metric-description">Média do grupo</div>
          </div>
          <div class="trend-indicator" :class="getTrendClass(data.previousMonthComparison)">
            <va-icon
              :name="getTrendIcon(data.previousMonthComparison)"
              size="small"
              :color="getTrendColor(data.previousMonthComparison)"
            />
            <span :class="getTrendTextClass(data.previousMonthComparison)">
              {{ formatComparison(data.previousMonthComparison) }} em relação ao mês passado
            </span>
          </div>
          <div class="additional-metrics">
            <div class="metric-item">
              <div class="metric-item-label">Total de Confirmações</div>
              <div class="metric-item-value">{{ data.totalConfirmations || 0 }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-item-label">Presenças</div>
              <div class="metric-item-value presence-value">{{ data.totalPresences || 0 }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-item-label">Ausências</div>
              <div class="metric-item-value absence-value">{{ data.totalAbsences || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card: Presença por Time -->
      <div class="presence-card teams-card">
        <h3 class="card-title teams-title">Presença por Time</h3>
        <div class="card-content">
          <div
            v-for="(teamData, index) in data.topTeamsByPresence"
            :key="teamData.team.id"
            class="team-presence-item"
            :class="getTeamItemClass(index)"
          >
            <div class="team-info">
              <div class="team-name" :class="getTeamNameClass(index)">
                {{ teamData.team.name }}
              </div>
              <div class="team-comparison" :class="getTeamComparisonClass(teamData.previousMonthComparison)">
                <va-icon
                  :name="getTrendIcon(teamData.previousMonthComparison)"
                  size="small"
                  :color="getTrendColor(teamData.previousMonthComparison)"
                />
                <span :class="getTrendTextClass(teamData.previousMonthComparison)">
                  {{ formatComparison(teamData.previousMonthComparison) }} em relação ao mês passado
                </span>
              </div>
            </div>
            <div class="team-metrics">
              <div class="team-percentage" :class="getTeamPercentageClass(index)">
                {{ formatPercentage(teamData.presencePercentage) }}
              </div>
              <div class="team-trend-icon" :class="getTeamTrendClass(teamData.previousMonthComparison)">
                <va-icon
                  :name="getTrendIcon(teamData.previousMonthComparison)"
                  size="small"
                  :color="getTrendColor(teamData.previousMonthComparison)"
                />
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
import PRESENCE_ANALYSIS from "~/graphql/dashboard/query/presenceAnalysis.graphql";

export default {
  name: "ZPresenceAnalysis",
  data() {
    return {
      data: null,
      loading: false,
    };
  },
  mounted() {
    this.getPresenceAnalysis();
  },
  methods: {
    getPresenceAnalysis(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${PRESENCE_ANALYSIS}
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
        if (result?.data?.presenceAnalysis) {
          this.data = result.data.presenceAnalysis;
        }
        this.loading = false;
      });

      if (value) {
        if (value?.presenceAnalysis) {
          this.data = value.presenceAnalysis;
        }
        this.loading = false;
      }
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    formatComparison(value) {
      const absValue = Math.abs(value);
      const sign = value >= 0 ? "+" : "";
      return `${sign}${Math.round(absValue)}%`;
    },
    getTrendIcon(comparison) {
      if (comparison > 0) return "arrow_upward";
      if (comparison < 0) return "arrow_downward";
      return "arrow_forward";
    },
    getTrendColor(comparison) {
      if (comparison > 0) return "#28a745";
      if (comparison < 0) return "#dc3545";
      return "#6c757d";
    },
    getTrendClass(comparison) {
      if (comparison > 0) return "trend-positive";
      if (comparison < 0) return "trend-negative";
      return "trend-neutral";
    },
    getTrendTextClass(comparison) {
      if (comparison > 0) return "trend-text-positive";
      if (comparison < 0) return "trend-text-negative";
      return "trend-text-neutral";
    },
    getTeamItemClass(index) {
      const classes = ["team-item-orange", "team-item-blue", "team-item-black"];
      return classes[index % classes.length];
    },
    getTeamNameClass(index) {
      const classes = ["name-orange", "name-blue", "name-black"];
      return classes[index % classes.length];
    },
    getTeamPercentageClass(index) {
      const classes = ["percentage-orange", "percentage-blue", "percentage-black"];
      return classes[index % classes.length];
    },
    getTeamTrendClass(comparison) {
      if (comparison > 0) return "trend-positive";
      if (comparison < 0) return "trend-negative";
      return "trend-neutral";
    },
    getTeamComparisonClass(comparison) {
      if (comparison > 0) return "comparison-positive";
      if (comparison < 0) return "comparison-negative";
      return "comparison-neutral";
    },
  },
};
</script>

<style scoped>
.presence-analysis-section {
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

.presence-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.presence-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.general-title {
  color: #e9742b;
}

.teams-title {
  color: #1976d2;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* General Card Styles */
.main-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.general-value {
  color: #e9742b;
}

.metric-description {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.trend-positive .trend-text-positive {
  color: #28a745;
}

.trend-negative .trend-text-negative {
  color: #dc3545;
}

.trend-neutral .trend-text-neutral {
  color: #6c757d;
}

/* Additional Metrics */
.additional-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-item-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.metric-item-value {
  font-size: 28px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.presence-value {
  color: #28a745;
}

.absence-value {
  color: #dc3545;
}

/* Teams Card Styles */
.team-presence-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  gap: 16px;
}

.team-presence-item:last-child {
  border-bottom: none;
}

.team-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.team-name {
  font-size: 15px;
  font-weight: 600;
}

.name-orange {
  color: #e9742b;
}

.name-blue {
  color: #1976d2;
}

.name-black {
  color: #0b1e3a;
}

.team-comparison {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
}

.team-metrics {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.team-percentage {
  font-size: 18px;
  font-weight: 700;
}

.team-trend-icon {
  display: flex;
  align-items: center;
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

.team-trend-icon {
  display: flex;
  align-items: center;
}

.team-comparison {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-top: 4px;
}

.comparison-positive .trend-text-positive {
  color: #28a745;
}

.comparison-negative .trend-text-negative {
  color: #dc3545;
}

.comparison-neutral .trend-text-neutral {
  color: #6c757d;
}

/* Responsive */
@media (max-width: 1024px) {
  .presence-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .presence-analysis-section {
    padding: 16px;
    margin-top: 16px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .presence-card {
    padding: 16px;
  }

  .card-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .metric-value {
    font-size: 40px;
  }

  .team-percentage {
    font-size: 16px;
  }

  .additional-metrics {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
  }

  .metric-item-value {
    font-size: 16px;
  }
}
</style>

