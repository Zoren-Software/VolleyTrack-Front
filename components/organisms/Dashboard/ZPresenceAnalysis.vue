<template>
  <section
    v-if="loading || hasPresenceData"
    class="presence-analysis-section"
    aria-label="Presença vs Confirmação"
  >
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="event_available" size="24px" color="#FF4E1B" />
        <h2 class="section-title">Presença vs Confirmação</h2>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando análise...</span>
    </div>

    <div v-else-if="!hasPresenceData" class="empty-state">
      <va-icon name="info" size="48px" color="#9E9E9E" />
      <p class="empty-text">Nenhum dado disponível</p>
    </div>

    <div v-else class="summary-card">
      <div class="summary-metrics">
        <div class="summary-metric-card">
          <span class="summary-metric-card__label">Confirmados</span>
          <span class="summary-metric-card__value">{{ formatPercentage(confirmedRate) }}</span>
        </div>

        <div class="summary-metric-card">
          <span class="summary-metric-card__label">Presentes</span>
          <span class="summary-metric-card__value">{{ formatPercentage(presentRate) }}</span>
        </div>
      </div>

      <div class="real-rate-card" :class="realRateToneClass">
        <div class="real-rate-card__left">
          <span class="real-rate-card__label">Taxa real</span>
          <span class="real-rate-card__value">{{ formatPercentage(realConfirmationRate) }}</span>
        </div>

        <div class="real-rate-card__status">
          <va-icon :name="realRateToneIcon" size="18px" :color="realRateToneColor" />
          <span class="real-rate-card__status-text">{{ realRateToneLabel }}</span>
        </div>
      </div>

      <div class="warning-card">
        <va-icon name="warning_amber" size="18px" color="#D97706" />
        <p class="warning-card__text">
          {{ formatPercentage(confirmedButAbsentRate) }} confirmaram mas faltaram
        </p>
      </div>
    </div>
  </section>
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
  computed: {
    hasPresenceData() {
      return Boolean(
        this.data &&
          ((this.data.totalConfirmations || 0) > 0 ||
            (this.data.totalPresences || 0) > 0 ||
            (this.data.totalAbsences || 0) > 0),
      );
    },
    attendanceBase() {
      const confirmations = Number(this.data?.totalConfirmations || 0);
      const attendanceTotal =
        Number(this.data?.totalPresences || 0) + Number(this.data?.totalAbsences || 0);

      return Math.max(confirmations, attendanceTotal, 1);
    },
    confirmedRate() {
      return (Number(this.data?.totalConfirmations || 0) / this.attendanceBase) * 100;
    },
    presentRate() {
      return (Number(this.data?.totalPresences || 0) / this.attendanceBase) * 100;
    },
    realConfirmationRate() {
      const confirmations = Number(this.data?.totalConfirmations || 0);
      if (!confirmations) return 0;
      return (Number(this.data?.totalPresences || 0) / confirmations) * 100;
    },
    confirmedButAbsentRate() {
      return Math.max(0, 100 - this.realConfirmationRate);
    },
    realRateToneLabel() {
      if (this.realConfirmationRate >= 90) return "Alta";
      if (this.realConfirmationRate >= 75) return "Atenção";
      return "Baixa";
    },
    realRateToneIcon() {
      if (this.realConfirmationRate >= 90) return "verified";
      if (this.realConfirmationRate >= 75) return "brightness_1";
      return "error";
    },
    realRateToneColor() {
      if (this.realConfirmationRate >= 90) return "#16A34A";
      if (this.realConfirmationRate >= 75) return "#EAB308";
      return "#DC2626";
    },
    realRateToneClass() {
      if (this.realConfirmationRate >= 90) return "real-rate-card--positive";
      if (this.realConfirmationRate >= 75) return "real-rate-card--warning";
      return "real-rate-card--danger";
    },
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
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
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

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-text,
.empty-text {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-metric-card {
  border: 1px solid #e9ecef;
  border-radius: 14px;
  background: #f8fafc;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-metric-card__label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.summary-metric-card__value {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.real-rate-card {
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid transparent;
}

.real-rate-card--positive {
  background: rgba(22, 163, 74, 0.08);
  border-color: rgba(22, 163, 74, 0.16);
}

.real-rate-card--warning {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.24);
}

.real-rate-card--danger {
  background: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.16);
}

.real-rate-card__left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.real-rate-card__label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.real-rate-card__value {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.real-rate-card__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.real-rate-card__status-text {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}

.warning-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.warning-card__text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #9a3412;
}

@media (max-width: 768px) {
  .presence-analysis-section {
    padding: 16px;
    margin-top: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .summary-metrics {
    grid-template-columns: 1fr;
  }

  .real-rate-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
