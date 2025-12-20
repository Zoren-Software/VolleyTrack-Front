<template>
  <div class="welcome-page">
    <div class="welcome-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="volleyball-icon">
          <va-icon name="sports_volleyball" size="80px" color="#E9742B" />
        </div>
        <h1 class="welcome-title">
          Bem-vindo ao <span class="highlight">VolleyTrack</span>!
        </h1>
        <p class="welcome-subtitle">
          Comece a gerenciar suas equipes de vôlei em minutos.
        </p>
        <va-button
          color="#E9742B"
          class="start-button"
          @click="startConfiguration"
        >
          <va-icon name="send" class="button-icon" />
          <span>Começar Configuração</span>
        </va-button>
      </div>

      <!-- Progress Section -->
      <va-card class="progress-card">
        <h2 class="progress-title">Progresso da Configuração</h2>
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <p class="progress-text">{{ progressPercentage }}% concluído</p>

        <!-- Steps -->
        <div class="steps-list">
          <!-- Step 1: Jogadores -->
          <div
            class="step-item"
            :class="{ completed: steps.registerPlayers.completed }"
          >
            <div class="step-icon-wrapper">
              <va-icon
                v-if="steps.registerPlayers.completed"
                name="check_circle"
                color="#28A745"
                size="20px"
              />
              <va-icon
                v-else-if="steps.registerPlayers.inProgress"
                name="hourglass_empty"
                color="#1976D2"
                size="20px"
              />
              <va-icon
                v-else
                name="radio_button_unchecked"
                color="#9E9E9E"
                size="20px"
              />
            </div>
            <div class="step-content">
              <h3 class="step-title">Registrar Jogadores</h3>
              <p class="step-description">
                Adicione os jogadores da sua equipe.
              </p>
            </div>
            <div class="step-actions">
              <span
                v-if="steps.registerPlayers.completed"
                class="status-badge status-completed"
              >
                Concluído
              </span>
              <va-button
                v-else
                color="#E9742B"
                size="small"
                @click="navigateTo('/players')"
              >
                Editar
              </va-button>
            </div>
          </div>

          <!-- Step 2: Times -->
          <div
            class="step-item"
            :class="{ completed: steps.registerTeams.completed }"
          >
            <div class="step-icon-wrapper">
              <va-icon
                v-if="steps.registerTeams.completed"
                name="check_circle"
                color="#28A745"
                size="20px"
              />
              <va-icon
                v-else-if="steps.registerTeams.inProgress"
                name="hourglass_empty"
                color="#1976D2"
                size="20px"
              />
              <va-icon
                v-else
                name="radio_button_unchecked"
                color="#9E9E9E"
                size="20px"
              />
            </div>
            <div class="step-content">
              <h3 class="step-title">Registrar Times</h3>
              <p class="step-description">Organize seus times.</p>
            </div>
            <div class="step-actions">
              <span
                v-if="steps.registerTeams.completed"
                class="status-badge status-completed"
              >
                Concluído
              </span>
              <template v-else-if="steps.registerTeams.inProgress">
                <span class="status-badge status-in-progress">
                  Em andamento
                </span>
                <va-button
                  color="#1976D2"
                  size="small"
                  @click="navigateTo('/teams')"
                  style="margin-left: 8px"
                >
                  Continuar
                </va-button>
              </template>
              <span v-else class="status-badge status-pending">
                <va-icon name="warning" size="small" />
                Pendente
              </span>
            </div>
          </div>

          <!-- Step 3: Treinos -->
          <div
            class="step-item"
            :class="{ completed: steps.registerTrainings.completed }"
          >
            <div class="step-icon-wrapper">
              <va-icon
                v-if="steps.registerTrainings.completed"
                name="check_circle"
                color="#28A745"
                size="20px"
              />
              <va-icon
                v-else-if="steps.registerTrainings.inProgress"
                name="hourglass_empty"
                color="#1976D2"
                size="20px"
              />
              <va-icon
                v-else
                name="radio_button_unchecked"
                color="#9E9E9E"
                size="20px"
              />
            </div>
            <div class="step-content">
              <h3 class="step-title">Registrar Treinos</h3>
              <p class="step-description">Planeje e registre os treinos.</p>
            </div>
            <div class="step-actions">
              <span
                v-if="steps.registerTrainings.completed"
                class="status-badge status-completed"
              >
                Concluído
              </span>
              <template v-else-if="steps.registerTrainings.inProgress">
                <va-button
                  color="#1976D2"
                  size="small"
                  @click="navigateTo('/trainings')"
                >
                  Continuar
                </va-button>
              </template>
              <template v-else>
                <span class="status-badge status-pending">
                  <va-icon name="warning" size="small" />
                  Pendente
                </span>
                <va-button
                  color="#9E9E9E"
                  size="small"
                  disabled
                  class="waiting-button"
                  style="margin-left: 8px"
                >
                  Aguardando
                </va-button>
              </template>
            </div>
          </div>
        </div>
      </va-card>

      <!-- Motivational Box -->
      <va-card class="motivational-card">
        <div class="motivational-content">
          <div class="trophy-icon">
            <va-icon name="emoji_events" size="36px" color="#E9742B" />
          </div>
          <p class="motivational-text">
            Quanto mais você configurar, mais completo será o acompanhamento da
            sua equipe! 🚀
          </p>
          <p class="motivational-subtitle">
            Complete todas as etapas para desbloquear o potencial máximo do
            VolleyTrack.
          </p>
        </div>
      </va-card>

      <!-- Totals Section -->
      <div class="totals-section">
        <div class="total-card players-card">
          <div class="total-icon">
            <va-icon name="people" size="32px" color="#E9742B" />
          </div>
          <div class="total-info">
            <div class="total-number">{{ totalUsers || 0 }}</div>
            <div class="total-label">Jogadores</div>
            <div class="total-description">Cadastrados no sistema</div>
          </div>
        </div>

        <div class="total-card teams-card">
          <div class="total-icon">
            <va-icon name="shield" size="32px" color="#1976D2" />
          </div>
          <div class="total-info">
            <div class="total-number">{{ totalTeams || 0 }}</div>
            <div class="total-label">Times</div>
            <div class="total-description">Em configuração</div>
          </div>
        </div>

        <div class="total-card trainings-card">
          <div class="total-icon">
            <va-icon name="event" size="32px" color="#9E9E9E" />
          </div>
          <div class="total-info">
            <div class="total-number">{{ totalTrainings || 0 }}</div>
            <div class="total-label">Treinos</div>
            <div class="total-description">Aguardando configuração</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import PLAYERSTOTAL from "~/graphql/user/query/usersTotal.graphql";
import TEAMSTOTAL from "~/graphql/team/query/teamsTotal.graphql";
import TRAININGSTOTAL from "~/graphql/training/query/trainingsTotal.graphql";

export default {
  mounted() {
    this.getInformations();
    this.token = localStorage.getItem("userToken") ?? "sem token";
    this.user = JSON.parse(localStorage.getItem("user"));
  },

  computed: {
    progressPercentage() {
      let completed = 0;
      if (this.totalUsers > 0) completed++;
      if (this.totalTeams > 0) completed++;
      if (this.totalTrainings > 0) completed++;
      return Math.round((completed / 3) * 100);
    },
    steps() {
      return {
        registerPlayers: {
          completed: this.totalUsers > 0,
          inProgress: false,
        },
        registerTeams: {
          completed: this.totalTeams > 0,
          inProgress: this.totalUsers > 0 && this.totalTeams === 0,
        },
        registerTrainings: {
          completed: this.totalTrainings > 0,
          inProgress: this.totalTeams > 0 && this.totalTrainings === 0,
        },
      };
    },
  },
  data() {
    return {
      token: "",
      user: {},
      loading: false,
      totalUsers: 0,
      totalTeams: 0,
      totalTrainings: 0,
      paginatorInfo: {},
      variablesGetPlayers: {
        page: 1,
        filter: {
          search: "%%",
          positionsIds: [],
          teamsIds: [],
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      variablesGetTeams: {
        page: 1,
        filter: {
          usersIds: [],
          playersIds: [],
          positionsIds: [],
          search: "%%",
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      variablesGetTrainings: {
        page: 1,
        filter: {
          teamsIds: [],
          usersIds: [],
          playersIds: [],
          search: "%%",
          dateStart: null,
          dateEnd: null,
        },
        orderBy: "id",
        sortedBy: "desc",
      },
    };
  },
  methods: {
    getInformations() {
      this.getPlayers({ fetchPolicy: "network-only" });
      this.getTeams({ fetchPolicy: "network-only" });
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    getPlayers(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${PLAYERSTOTAL}
      `;

      let positionsIdsValues = this.variablesGetPlayers.filter.positionsIds.map(
        (position) => position.value
      );

      let teamsIdsValues = this.variablesGetPlayers.filter.teamsIds.map(
        (team) => team.value
      );

      const consult = {
        ...this.variablesGetPlayers,
        filter: {
          ...this.variablesGetPlayers.filter,
          positionsIds: positionsIdsValues,
          teamsIds: teamsIdsValues,
          rolesIds: [3],
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.users?.paginatorInfo) {
          this.totalUsers = result?.data?.users?.paginatorInfo?.total;
        }
      });

      if (value) {
        if (value?.users?.paginatorInfo.total) {
          this.totalUsers = value?.users?.paginatorInfo.total;
        }
      }
      this.loading = false;
    },
    getTeams(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TEAMSTOTAL}
      `;

      let positionsIdsValues = this.variablesGetTeams.filter.positionsIds.map(
        (position) => position.value
      );

      let usersIdsValues = this.variablesGetTeams.filter.usersIds.map(
        (user) => user.value
      );

      let playersIdsValues = this.variablesGetTeams.filter.playersIds.map(
        (player) => player.value
      );

      const consult = {
        ...this.variablesGetTeams,
        filter: {
          ...this.variablesGetTeams.filter,
          positionsIds: positionsIdsValues,
          usersIds: usersIdsValues,
          playersIds: playersIdsValues,
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.teams?.paginatorInfo) {
          this.totalTeams = result?.data?.teams?.paginatorInfo?.total;
        }
      });

      if (value) {
        if (value?.teams?.paginatorInfo.total) {
          this.totalTeams = value?.teams?.paginatorInfo.total;
        }
      }
      this.loading = false;
    },
    getTrainings(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TRAININGSTOTAL}
      `;

      let teamsIdsValues = this.variablesGetTrainings.filter.teamsIds.map(
        (team) => parseInt(team.value)
      );

      let usersIdsValues = this.variablesGetTrainings.filter.usersIds.map(
        (user) => parseInt(user.value)
      );

      let playersIdsValues = this.variablesGetTrainings.filter.playersIds.map(
        (player) => parseInt(player.value)
      );

      let dateEnd = this.variablesGetTrainings.filter.dateEnd;

      if (dateEnd) {
        dateEnd = moment(dateEnd).format("YYYY-MM-DD 23:59:59");
      }

      let dateStart = this.variablesGetTrainings.filter.dateStart;

      if (dateStart) {
        dateStart = moment(dateStart).format("YYYY-MM-DD 00:00:00");
      }

      const consult = {
        ...this.variablesGetTrainings,
        filter: {
          ...this.variablesGetTrainings.filter,
          teamsIds: teamsIdsValues,
          usersIds: usersIdsValues,
          playersIds: playersIdsValues,
          dateStart,
          dateEnd,
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      onResult((result) => {
        if (result?.data?.trainings?.paginatorInfo) {
          this.totalTrainings = result?.data?.trainings?.paginatorInfo?.total;
        }
      });

      if (value) {
        if (value?.trainings?.paginatorInfo.total) {
          this.totalTrainings = value?.trainings?.paginatorInfo.total;
        }
      }
      this.loading = false;
    },
    startConfiguration() {
      // Navegar para a primeira etapa não concluída
      if (this.totalUsers === 0) {
        this.navigateTo("/players");
      } else if (this.totalTeams === 0) {
        this.navigateTo("/teams");
      } else if (this.totalTrainings === 0) {
        this.navigateTo("/trainings");
      } else {
        this.navigateTo("/players");
      }
    },
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Home",
});
</script>

<style scoped>
.welcome-page {
  min-height: calc(100vh - 40px);
  background-color: #f5f5f5;
  padding: 24px 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  padding: 32px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.volleyball-icon {
  margin-bottom: 16px;
  opacity: 0.1;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.highlight {
  color: #e9742b;
}

.welcome-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.start-button {
  background-color: #e9742b !important;
  color: white !important;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
  transition: all 0.2s ease;
}

.start-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.4);
  transform: translateY(-2px);
}

.button-icon {
  font-size: 16px;
  margin-right: 10px;
}

/* Progress Card */
.progress-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.progress-title {
  font-size: 18px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 12px 0;
}

.progress-bar-container {
  background-color: #e9ecef;
  border-radius: 8px;
  height: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress-bar-fill {
  background-color: #e9742b;
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.step-item.completed {
  background: #e8f8f1;
  border-left-color: #28a745;
}

.step-icon-wrapper {
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
  margin: 0 0 2px 0;
  line-height: 1.3;
}

.step-description {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  line-height: 1.3;
}

.step-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.step-actions :deep(.va-button) {
  padding: 6px 12px !important;
  font-size: 12px !important;
  min-height: 28px !important;
  min-width: 100px !important;
  width: 100px !important;
  justify-content: center !important;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-in-progress {
  background-color: #cce5ff;
  color: #004085;
}

.status-pending {
  background-color: #f0f0f0;
  color: #6c757d;
}

.waiting-button {
  background-color: #9e9e9e !important;
  color: white !important;
}

/* Motivational Card */
.motivational-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.motivational-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.trophy-icon {
  margin-bottom: 4px;
}

.motivational-text {
  font-size: 16px;
  font-weight: 600;
  color: #0b1e3a;
  margin: 0;
  line-height: 1.4;
}

.motivational-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

/* Totals Section */
.totals-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 0;
}

.total-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.total-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.total-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff4ec;
  border-radius: 10px;
}

.total-icon :deep(.va-icon) {
  font-size: 28px !important;
}

.players-card .total-icon {
  background: #fff4ec;
}

.teams-card .total-icon {
  background: #e3f2fd;
}

.trainings-card .total-icon {
  background: #f5f5f5;
}

.total-info {
  flex: 1;
  min-width: 0;
}

.total-number {
  font-size: 28px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 2px 0;
  line-height: 1;
}

.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
  margin: 0 0 2px 0;
  line-height: 1.2;
}

.total-description {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 20px 16px;
  }

  .welcome-container {
    gap: 16px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 13px;
  }

  .totals-section {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .step-item {
    flex-wrap: wrap;
    padding: 10px 12px;
  }

  .step-actions {
    width: 100%;
    margin-top: 8px;
  }

  .progress-card,
  .motivational-card {
    padding: 16px;
  }
}
</style>
