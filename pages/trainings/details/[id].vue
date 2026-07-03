<template>
  <ZListPageContainer>
  <div class="training-details-page">
    <div class="page-header">
      <h1 class="title">Detalhes do Treino</h1>
      <p class="subtitle">Visualize as informações do treino</p>
    </div>

    <div v-if="loading" class="state-row">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando treino...</span>
    </div>

    <div v-else-if="!training" class="state-row state-row--empty">
      <va-icon name="info" size="20px" color="#6b7280" />
      <span>Nenhum treino encontrado.</span>
    </div>

    <div v-else class="details-cards">
      <va-card class="info-card">
        <div class="card-title">
          <va-icon name="info" size="18px" color="#FF4E1B" />
          <span>Informações básicas</span>
        </div>
        <div class="details-grid">
          <div class="detail-item detail-item--full">
            <div class="detail-label">Nome do treino</div>
            <div class="detail-value">{{ training.name || "-" }}</div>
          </div>
          <div class="detail-item detail-item--full">
            <div class="detail-label">Descrição</div>
            <div class="detail-value detail-value--multiline">
              {{ training.description || "-" }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Data e hora início</div>
            <div class="detail-value">
              {{ formatDateTime(training.dateStart) }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Data e hora fim</div>
            <div class="detail-value">{{ formatDateTime(training.dateEnd) }}</div>
          </div>
          <div class="detail-item detail-item--full">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <span class="status-badge" :class="statusBadgeClass">
                {{ statusLabel }}
              </span>
            </div>
          </div>
        </div>
      </va-card>

      <div class="bottom-grid">
        <va-card class="info-card">
          <div class="card-title">
            <va-icon name="sports_volleyball" size="18px" color="#FF4E1B" />
            <span>Fundamentos gerais</span>
          </div>
          <ul class="bullet-list" v-if="training.fundamentals?.length">
            <li
              v-for="f in fundamentalsPreview"
              :key="f?.id || f?.name"
              class="bullet-item"
            >
              {{ f?.name || "-" }}
            </li>
            <li
              v-if="fundamentalsOverflowCount > 0"
              class="bullet-item bullet-item--muted"
            >
              +{{ fundamentalsOverflowCount }} fundamento(s)
            </li>
          </ul>
          <div v-else class="no-data-text">-</div>
        </va-card>

        <va-card class="info-card">
          <div class="card-title">
            <va-icon name="tune" size="18px" color="#FF4E1B" />
            <span>Fundamentos específicos</span>
          </div>
          <ul class="bullet-list" v-if="training.specificFundamentals?.length">
            <li
              v-for="sf in specificFundamentalsPreview"
              :key="sf?.id || sf?.name"
              class="bullet-item"
            >
              {{ sf?.name || "-" }}
            </li>
            <li
              v-if="specificFundamentalsOverflowCount > 0"
              class="bullet-item bullet-item--muted bullet-item--popover"
            >
              <va-popover
                placement="top"
                trigger="hover"
                class="fundamentals-overflow-popover"
              >
                <span class="overflow-trigger">
                  +{{ specificFundamentalsOverflowCount }} fundamento(s)
                </span>
                <template #body>
                  <div class="overflow-popover-body">
                    <div class="overflow-popover-title">
                      Fundamentos restantes
                    </div>
                    <ul class="overflow-popover-list">
                      <li
                        v-for="sf in specificFundamentalsRest"
                        :key="sf?.id || sf?.name"
                      >
                        {{ sf?.name || "-" }}
                      </li>
                    </ul>
                  </div>
                </template>
              </va-popover>
            </li>
          </ul>
          <div v-else class="no-data-text">-</div>
        </va-card>
      </div>

      <va-card class="info-card">
        <div class="card-title">
          <va-icon name="groups" size="18px" color="#FF4E1B" />
          <span>Times</span>
        </div>

        <div class="teams-block">
          <div class="teams-section">
            <div class="teams-highlight-title">Times relacionados</div>
            <div v-if="relatedTeamsLoading" class="state-row">
              <va-progress-circle indeterminate size="small" />
              <span>Carregando times...</span>
            </div>
            <div v-else-if="relatedTeams.length" class="teams-list">
              <div
                v-for="(t, idx) in relatedTeams"
                :key="t.id"
                class="team-row"
                :class="{ 'team-row--first': idx === 0 }"
              >
                <va-avatar class="team-initial" size="small" color="#FF4E1B">
                  {{ teamInitial(t.name) }}
                </va-avatar>
                <div class="team-row-info">
                  <div class="team-highlight-name">{{ t.name }}</div>
                  <div class="team-highlight-meta">
                    {{ t.playersCount }} {{
                      t.playersCount === 1 ? "jogador" : "jogadores"
                    }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-data-text">-</div>
          </div>

          <div class="teams-section">
            <div class="teams-highlight-title">Jogadores avulsos</div>
            <div v-if="standalonePlayers.length" class="standalone-list">
              <div
                v-for="p in standalonePlayers"
                :key="p?.id || p?.playerId"
                class="standalone-row"
              >
                <div class="standalone-name">
                  {{ p?.displayName || p?.name || "-" }}
                </div>
                <div v-if="p?.email" class="standalone-meta">{{ p.email }}</div>
              </div>
            </div>
            <div v-else class="no-data-text">-</div>
          </div>
        </div>
      </va-card>
    </div>

    <div class="action-buttons">
      <va-button color="secondary" class="mr-1" @click="goBack">Voltar</va-button>
      <div v-if="training?.id" class="action-buttons-right">
        <va-button
          preset="secondary"
          icon="checklist"
          class="action-btn-secondary"
          @click="goToAttendanceList"
        >
          Lista de Presença
        </va-button>
        <va-button
          preset="secondary"
          icon="analytics"
          class="action-btn-secondary"
          @click="goToTechnicalAnalysis"
        >
          Análise Técnica
        </va-button>
        <va-button color="primary" @click="goToEdit">Editar</va-button>
      </div>
    </div>
  </div>
  </ZListPageContainer>
</template>

<script>
import moment from "moment";
import TRAINING from "~/graphql/training/query/training.graphql";
import TEAM from "~/graphql/team/query/team.graphql";

export default {
  data() {
    return {
      loading: false,
      training: null,
      teamLoading: false,
      teamPlayersCount: 0,
      relatedTeamsLoading: false,
      relatedTeams: [],
      variablesGetTraining: {
        id: this.$route.params.id,
      },
    };
  },
  computed: {
    standalonePlayers() {
      const list = this.training?.confirmationsTraining || [];
      return (Array.isArray(list) ? list : [])
        .filter((ct) => !ct?.teamId)
        .map((ct) => ct?.player || ct)
        .filter(Boolean);
    },
    fundamentalsPreview() {
      const list = this.training?.fundamentals || [];
      return (Array.isArray(list) ? list : []).slice(0, 6);
    },
    fundamentalsOverflowCount() {
      const total = Array.isArray(this.training?.fundamentals)
        ? this.training.fundamentals.length
        : 0;
      return Math.max(0, total - 6);
    },
    specificFundamentalsPreview() {
      const list = this.training?.specificFundamentals || [];
      return (Array.isArray(list) ? list : []).slice(0, 5);
    },
    specificFundamentalsRest() {
      const list = this.training?.specificFundamentals || [];
      return (Array.isArray(list) ? list : []).slice(5);
    },
    specificFundamentalsOverflowCount() {
      const total = Array.isArray(this.training?.specificFundamentals)
        ? this.training.specificFundamentals.length
        : 0;
      return Math.max(0, total - 5);
    },
    statusKey() {
      const raw = String(this.training?.displayStatus || this.training?.status || "")
        .toLowerCase()
        .trim();
      if (!raw) return "pending";
      return raw;
    },
    statusLabel() {
      const map = {
        pending: "Agendado",
        pending_action: "Pendente ação",
        finished: "Finalizado",
        cancelled: "Cancelado",
      };
      return map[this.statusKey] || (this.training?.displayStatus || this.training?.status || "-");
    },
    statusBadgeClass() {
      return {
        "status-pending": this.statusKey === "pending",
        "status-pending-action": this.statusKey === "pending_action",
        "status-finished": this.statusKey === "finished",
        "status-cancelled": this.statusKey === "cancelled",
      };
    },
  },
  mounted() {
    this.getTraining({ fetchPolicy: "network-only" });
  },
  methods: {
    getTraining(fetchPolicyOptions = {}) {
      this.loading = true;
      const query = gql`
        ${TRAINING}
      `;
      const consult = { ...this.variablesGetTraining };

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first",
      });

      onResult((result) => {
        this.training = result?.data?.training || null;
        const teamId = this.training?.teamId || this.training?.team?.id;
        if (teamId) {
          this.fetchTeamPlayersCount(teamId);
        } else {
          this.teamPlayersCount = 0;
        }
        this.fetchRelatedTeams();
        this.loading = false;
      });
    },
    async fetchRelatedTeams() {
      const idsFromConfirmations = (this.training?.confirmationsTraining || [])
        .map((ct) => Number(ct?.teamId))
        .filter((id) => !Number.isNaN(id) && id > 0);
      const fallbackTeamId = Number(
        this.training?.teamId || this.training?.team?.id
      );
      const all = new Set([
        ...idsFromConfirmations,
        ...(Number.isNaN(fallbackTeamId) ? [] : [fallbackTeamId]),
      ]);
      const ids = Array.from(all);

      if (!ids.length) {
        this.relatedTeams = [];
        return;
      }

      this.relatedTeamsLoading = true;
      try {
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          this.relatedTeams = [];
          return;
        }

        const query = gql`
          ${TEAM}
        `;

        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await apolloClient.query({
              query,
              variables: { id: String(id) },
              fetchPolicy: "cache-first",
            });
            const team = res?.data?.team;
            return team
              ? {
                  id: Number(team.id),
                  name: team.name,
                  playersCount: Array.isArray(team.players)
                    ? team.players.length
                    : 0,
                }
              : null;
          })
        );

        this.relatedTeams = results
          .filter(Boolean)
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""), "pt-BR", {
              sensitivity: "base",
            })
          );
      } finally {
        this.relatedTeamsLoading = false;
      }
    },
    fetchTeamPlayersCount(teamId) {
      this.teamLoading = true;
      const query = gql`
        ${TEAM}
      `;
      const consult = { id: String(teamId) };
      const { onResult } = useQuery(query, consult, {
        fetchPolicy: "cache-first",
      });
      onResult((result) => {
        const players = result?.data?.team?.players || [];
        this.teamPlayersCount = Array.isArray(players) ? players.length : 0;
        this.teamLoading = false;
      });
    },
    formatDateTime(value) {
      if (!value) return "-";
      return moment(value).format("DD/MM/YYYY HH:mm");
    },
    formatStatus(training) {
      const raw = String(training?.displayStatus || training?.status || "")
        .toLowerCase()
        .trim();
      const map = {
        pending: "Agendado",
        finished: "Finalizado",
        cancelled: "Cancelado",
        pending_action: "Pendente ação",
      };
      return map[raw] || training?.displayStatus || training?.status || "-";
    },
    teamInitial(name) {
      return String(name || "")
        .trim()
        .charAt(0)
        .toUpperCase();
    },
    goBack() {
      this.$router.push("/trainings");
    },
    goToEdit() {
      this.$router.push(`/trainings/edit/${this.$route.params.id}`);
    },
    goToAttendanceList() {
      const id = this.$route.params.id;
      if (!id) return;
      this.$router.push(`/trainings/attendance/${id}`);
    },
    goToTechnicalAnalysis() {
      const id = this.$route.params.id;
      if (!id) return;
      this.$router.push({
        path: "/scout",
        query: { trainingId: String(id) },
      });
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Detalhes do Treino",
});
</script>

<style scoped>
.training-details-page {
  width: 100%;
}

.page-header {
  text-align: left;
  margin-bottom: 24px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  color: #0b1e3a;
  margin: 0 0 6px 0;
}

.subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.details-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}

.bottom-grid > .info-card {
  height: 100%;
}

.info-card {
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title :deep(.va-icon) {
  flex-shrink: 0;
}

.state-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 14px;
  padding: 8px 0;
}

.state-row--empty {
  justify-content: center;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.detail-item {
  min-width: 0;
}

.detail-item--full {
  grid-column: span 2;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  word-break: break-word;
}

.detail-value--multiline {
  font-weight: 500;
  color: #374151;
  white-space: pre-wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-finished {
  background-color: #d1fae5;
  color: #059669;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-pending-action {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.no-data-text {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
}

.bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bullet-item {
  position: relative;
  padding-left: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #0b1e3a;
  line-height: 1.4;
}

.bullet-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #ff4e1b;
}

.bullet-item--muted {
  color: #6b7280;
  font-weight: 600;
}

.bullet-item--muted::before {
  background: #e5e7eb;
}

.bullet-item--popover {
  padding-left: 0;
}

.bullet-item--popover::before {
  display: none;
}

.overflow-trigger {
  cursor: help;
  text-decoration: underline;
  text-decoration-color: rgba(255, 78, 27, 0.35);
  text-underline-offset: 3px;
}

.overflow-popover-body {
  max-width: 260px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 78, 27, 0.35);
  background: #fff4ec;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.12);
}

.overflow-popover-title {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.overflow-popover-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #374151;
  line-height: 1.5;
}

.overflow-popover-list li {
  margin-bottom: 6px;
}

.overflow-popover-list li:last-child {
  margin-bottom: 0;
}

.teams-block {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.teams-section {
  padding: 0;
  border: none;
  background: transparent;
}

.teams-list {
  display: flex;
  flex-direction: column;
}

.teams-highlight-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 10px;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid #f3f4f6;
}

.team-row--first {
  border-top: none;
  padding-top: 0;
}

.team-initial {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  font-weight: 700;
  color: #ffffff !important;
}

.team-row-info {
  min-width: 0;
  flex: 1;
}

.team-highlight-name {
  font-size: 14px;
  font-weight: 700;
  color: #0b1e3a;
  margin-bottom: 4px;
}

.team-highlight-meta {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.standalone-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.standalone-row {
  padding: 10px 0;
  border-top: 1px solid #f3f4f6;
}

.standalone-name {
  font-size: 13px;
  font-weight: 700;
  color: #0b1e3a;
  margin-bottom: 2px;
}

.standalone-meta {
  font-size: 12px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}

.action-buttons-right {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-left: auto;
}

.action-buttons va-button,
.action-buttons .action-btn-secondary {
  border-radius: 8px;
}

.action-btn-secondary {
  border: 1px solid #e4e4e7 !important;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item--full {
    grid-column: span 1;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .teams-block {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons-right {
    margin-left: 0;
    flex-direction: column;
    width: 100%;
  }

  .action-buttons va-button,
  .action-buttons .action-btn-secondary {
    width: 100%;
  }
}
</style>

