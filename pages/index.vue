<template>
  <div class="welcome-page">
    <div class="welcome-container">
      <div class="dashboard-layout">
        <div class="dashboard-layout__primary">
          <!-- Banner -->
          <section class="dashboard-hero" aria-label="Boas-vindas">
            <div class="dashboard-hero__pattern" aria-hidden="true" />
            <div class="dashboard-hero__inner">
              <div class="dashboard-hero__left">
                <div class="dashboard-hero__datetime-pill">
                  <va-icon name="calendar_today" size="16px" />
                  <span>{{ heroDateTimeLabel }}</span>
                </div>
                <h1 class="dashboard-hero__title">{{ heroHeadline }}</h1>
                <p class="dashboard-hero__subtitle">{{ heroNiceDayMessage }}</p>
                <p class="dashboard-hero__tagline">
                  VolleyTrack — gestão de equipes de vôlei.
                </p>
                <va-button
                  v-if="!isConfigurationComplete"
                  class="dashboard-hero__cta"
                  @click="startConfiguration"
                >
                  <va-icon name="send" class="dashboard-hero__cta-icon" />
                  <span>Começar Configuração</span>
                </va-button>
              </div>
              <div class="dashboard-hero__visual" aria-hidden="true">
                <div class="hero-decoration hero-decoration--1">
                  <va-icon name="sports_volleyball" size="24px" />
                </div>
                <div class="hero-decoration hero-decoration--2">
                  <va-icon name="fitness_center" size="22px" />
                </div>
                <div class="hero-decoration hero-decoration--3">
                  <va-icon name="emoji_events" size="22px" />
                </div>
                <div class="hero-decoration hero-decoration--4">
                  <va-icon name="groups" size="22px" />
                </div>
                <div class="hero-main-ball">
                  <va-icon name="sports_volleyball" size="72px" />
                </div>
              </div>
            </div>
          </section>

          <!-- Totais do clube (layout dashboard) -->
          <div class="totals-section">
            <div class="total-card total-card--trainings">
              <div class="total-icon">
                <va-icon name="event" size="26px" color="#FF4E1B" />
              </div>
              <div class="total-info">
                <div class="total-label">Total de treinos</div>
                <div class="total-number">
                  {{ totalTrainings || 0
                  }}<span
                    v-if="showPlanLimits && planLimits.maxTrainings"
                    class="plan-limit"
                  >
                    / {{ planLimits.maxTrainings }}</span
                  >
                </div>
              </div>
              <va-popover
                v-if="showPlanLimits && planLimits.maxTrainings"
                placement="top"
                trigger="hover"
                class="plan-popover-wrapper"
              >
                <va-icon
                  name="info"
                  size="16px"
                  color="#6c757d"
                  class="plan-info-icon"
                />
                <template #title>Limite do Plano</template>
                <template #body>
                  <p class="plan-popover-text">
                    Você pode cadastrar até
                    {{ planLimits.maxTrainings }} treinos no seu plano atual.
                  </p>
                </template>
              </va-popover>
            </div>

            <div class="total-card total-card--teams">
              <div class="total-icon">
                <va-icon name="groups" size="26px" color="#FF6B35" />
              </div>
              <div class="total-info">
                <div class="total-label">Total de times</div>
                <div class="total-number">
                  {{ totalTeams || 0
                  }}<span
                    v-if="showPlanLimits && planLimits.maxTeams"
                    class="plan-limit"
                  >
                    / {{ planLimits.maxTeams }}</span
                  >
                </div>
              </div>
              <va-popover
                v-if="showPlanLimits && planLimits.maxTeams"
                placement="top"
                trigger="hover"
                class="plan-popover-wrapper"
              >
                <va-icon
                  name="info"
                  size="16px"
                  color="#6c757d"
                  class="plan-info-icon"
                />
                <template #title>Limite do Plano</template>
                <template #body>
                  <p class="plan-popover-text">
                    Você pode cadastrar até {{ planLimits.maxTeams }} times no
                    seu plano atual.
                  </p>
                </template>
              </va-popover>
            </div>

            <div class="total-card total-card--players">
              <div class="total-icon">
                <va-icon name="people" size="26px" color="#E65100" />
              </div>
              <div class="total-info">
                <div class="total-label">Total de jogadores</div>
                <div class="total-number">
                  {{ totalUsers || 0
                  }}<span
                    v-if="showPlanLimits && planLimits.maxPlayers"
                    class="plan-limit"
                  >
                    / {{ planLimits.maxPlayers }}</span
                  >
                </div>
              </div>
              <va-popover
                v-if="showPlanLimits && planLimits.maxPlayers"
                placement="top"
                trigger="hover"
                class="plan-popover-wrapper"
              >
                <va-icon
                  name="info"
                  size="16px"
                  color="#6c757d"
                  class="plan-info-icon"
                />
                <template #title>Limite do Plano</template>
                <template #body>
                  <p class="plan-popover-text">
                    Você pode cadastrar até
                    {{ planLimits.maxPlayers }} jogadores no seu plano atual.
                  </p>
                </template>
              </va-popover>
            </div>
          </div>

          <ZHomeTrainingsYearChart />

          <!-- Completion Animation -->
          <Transition name="completion">
            <div v-if="showCompletionAnimation" class="completion-animation">
              <div class="completion-content">
                <div class="completion-icon-wrapper">
                  <va-icon name="check_circle" size="120px" color="#28A745" />
                </div>
                <h2 class="completion-title">Configuração Concluída!</h2>
                <p class="completion-message">
                  Parabéns! Você completou todas as etapas iniciais.
                </p>
              </div>
            </div>
          </Transition>

          <!-- Progress Section -->
          <Transition name="fade-out">
            <va-card
              v-if="!isConfigurationComplete || showConfigurationDetails"
              class="progress-card"
            >
              <div class="progress-card-header">
                <h2 class="progress-title">Progresso da Configuração</h2>
                <va-button
                  v-if="isConfigurationComplete && showConfigurationDetails"
                  preset="plain"
                  icon="close"
                  size="small"
                  class="close-config-button"
                  @click="closeConfigurationDetails"
                />
              </div>
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
                      color="#FF4E1B"
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
                    <p class="step-description">
                      Planeje e registre os treinos.
                    </p>
                  </div>
                  <div class="step-actions">
                    <span
                      v-if="steps.registerTrainings.completed"
                      class="status-badge status-completed"
                    >
                      Concluído
                    </span>
                    <template v-else-if="steps.registerTrainings.inProgress">
                      <span class="status-badge status-in-progress">
                        Em andamento
                      </span>
                      <va-button
                        color="#1976D2"
                        size="small"
                        @click="navigateTo('/trainings')"
                        style="margin-left: 8px"
                      >
                        Continuar
                      </va-button>
                    </template>
                    <template v-else>
                      <span class="status-badge status-waiting">
                        Aguardando
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </va-card>
          </Transition>

          <!-- Motivational Box -->
          <Transition name="fade-out">
            <va-card
              v-if="!isConfigurationComplete || showConfigurationDetails"
              class="motivational-card"
            >
              <div class="motivational-content">
                <div class="trophy-icon">
                  <va-icon name="emoji_events" size="36px" color="#FF4E1B" />
                </div>
                <p class="motivational-text">
                  Quanto mais você configurar, mais completo será o
                  acompanhamento da sua equipe! 🚀
                </p>
                <p class="motivational-subtitle">
                  Complete todas as etapas para desbloquear o potencial máximo
                  do VolleyTrack.
                </p>
              </div>
            </va-card>
          </Transition>

          <!-- Individual Analysis Section -->
          <ZIndividualAnalysis v-if="totalUsers > 0" />

          <!-- Team Performance Section -->
          <ZTeamPerformance v-if="totalTeams > 0" />

          <!-- Training Technical Vision Section -->
          <ZTrainingTechnicalVision v-if="totalTrainings > 0" />

          <!-- Presence Analysis Section -->
          <ZPresenceAnalysis v-if="totalTrainings > 0" />

          <!-- Presence Ranking Section -->
          <ZPresenceRanking v-if="totalTrainings > 0" />

          <!-- Perfil do jogador (usuário logado) -->
          <ZHomePlayerProfileCard
            v-if="user && user.id"
            :setup-progress="progressPercentage"
          />
        </div>

        <aside
          class="dashboard-layout__sidebar"
          aria-label="Próximos treinos e últimos feedbacks"
        >
          <ZHomeUpcomingTrainings />
          <ZHomeRecentFeedbacks />
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import PLAYERSTOTAL from "~/graphql/user/query/usersTotal.graphql";
import TEAMSTOTAL from "~/graphql/team/query/teamsTotal.graphql";
import TRAININGSTOTAL from "~/graphql/training/query/trainingsTotal.graphql";
import { getActivePlan } from "~/services/stripeCheckoutService.js";
import ZIndividualAnalysis from "~/components/organisms/Dashboard/ZIndividualAnalysis.vue";
import ZTeamPerformance from "~/components/organisms/Dashboard/ZTeamPerformance.vue";
import ZTrainingTechnicalVision from "~/components/organisms/Dashboard/ZTrainingTechnicalVision.vue";
import ZPresenceAnalysis from "~/components/organisms/Dashboard/ZPresenceAnalysis.vue";
import ZPresenceRanking from "~/components/organisms/Dashboard/ZPresenceRanking.vue";
import ZHomePlayerProfileCard from "~/components/organisms/Dashboard/ZHomePlayerProfileCard.vue";
import ZHomeUpcomingTrainings from "~/components/organisms/Dashboard/ZHomeUpcomingTrainings.vue";
import ZHomeRecentFeedbacks from "~/components/organisms/Dashboard/ZHomeRecentFeedbacks.vue";
import ZHomeTrainingsYearChart from "~/components/organisms/Dashboard/ZHomeTrainingsYearChart.vue";

export default {
  components: {
    ZIndividualAnalysis,
    ZTeamPerformance,
    ZTrainingTechnicalVision,
    ZPresenceAnalysis,
    ZPresenceRanking,
    ZHomePlayerProfileCard,
    ZHomeUpcomingTrainings,
    ZHomeRecentFeedbacks,
    ZHomeTrainingsYearChart,
  },
  mounted() {
    this.getInformations();
    this.token = localStorage.getItem("userToken") ?? "sem token";
    try {
      const raw = localStorage.getItem("user");
      this.user = raw ? JSON.parse(raw) : {};
    } catch {
      this.user = {};
    }
    this.checkConfigurationStatus();
    this.loadActivePlan();
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
    this._clockTimeout = setTimeout(() => {
      this.now = new Date();
      this._clockTimer = setInterval(() => {
        this.now = new Date();
      }, 60000);
    }, msUntilNextMinute);
  },
  beforeUnmount() {
    clearTimeout(this._clockTimeout);
    clearInterval(this._clockTimer);
  },
  watch: {
    progressPercentage(newValue) {
      if (newValue === 100 && !this.isConfigurationComplete) {
        this.handleConfigurationComplete();
      }
    },
  },
  computed: {
    isConfigurationComplete() {
      return (
        localStorage.getItem("initialConfigurationComplete") === "true" || false
      );
    },
    showPlanLimits() {
      return (
        this.activePlanData &&
        this.activePlanData.has_active_plan &&
        !this.isUnlimitedPlan
      );
    },
    isUnlimitedPlan() {
      if (!this.activePlanData || !this.activePlanData.product) {
        return true;
      }

      const metadata = this.normalizeMetadata(
        this.activePlanData.product.metadata,
      );
      const maxPlayers = parseInt(metadata.max_players || "0");
      const maxTeams = parseInt(metadata.max_teams || "0");
      const maxTrainings = parseInt(metadata.max_trainings || "0");

      // Se todos os limites são 0 ou null, é ilimitado
      return maxPlayers === 0 && maxTeams === 0 && maxTrainings === 0;
    },
    planLimits() {
      if (!this.activePlanData || !this.activePlanData.product) {
        return {
          maxPlayers: null,
          maxTeams: null,
          maxTrainings: null,
        };
      }

      const metadata = this.normalizeMetadata(
        this.activePlanData.product.metadata,
      );

      return {
        maxPlayers: parseInt(metadata.max_players || "0") || null,
        maxTeams: parseInt(metadata.max_teams || "0") || null,
        maxTrainings: parseInt(metadata.max_trainings || "0") || null,
      };
    },
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
    greetingDisplayName() {
      const n = (this.user?.displayName || this.user?.name || "").trim();
      if (!n) return "Atleta";
      const first = n.split(/\s+/)[0];
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    },
    heroHeadline() {
      const h = new Date().getHours();
      let prefix = "Boa noite";
      if (h >= 5 && h < 12) prefix = "Bom dia";
      else if (h >= 12 && h < 18) prefix = "Boa tarde";
      return `${prefix}, ${this.greetingDisplayName}!`;
    },
    heroNiceDayMessage() {
      const d = new Date().getDay();
      const weekdays = [
        "domingo",
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado",
      ];
      const name = weekdays[d];
      if (d === 0 || d === 6) {
        return `Tenha um ótimo ${name}!`;
      }
      return `Tenha uma ótima ${name}!`;
    },
    heroDateTimeLabel() {
      try {
        return new Intl.DateTimeFormat("pt-BR", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(this.now);
      } catch {
        return "";
      }
    },
  },
  data() {
    return {
      token: "",
      user: {},
      now: new Date(),
      loading: false,
      totalUsers: 0,
      totalTeams: 0,
      totalTrainings: 0,
      showCompletionAnimation: false,
      showConfigurationDetails: false,
      activePlanData: null,
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

      // Verificar status após carregar informações
      this.$nextTick(() => {
        setTimeout(() => {
          this.checkConfigurationStatus();
        }, 500);
      });
    },

    getPlayers(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${PLAYERSTOTAL}
      `;

      let positionsIdsValues = this.variablesGetPlayers.filter.positionsIds.map(
        (position) => position.value,
      );

      let teamsIdsValues = this.variablesGetPlayers.filter.teamsIds.map(
        (team) => team.value,
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
        (position) => position.value,
      );

      let usersIdsValues = this.variablesGetTeams.filter.usersIds.map(
        (user) => user.value,
      );

      let playersIdsValues = this.variablesGetTeams.filter.playersIds.map(
        (player) => player.value,
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
        (team) => parseInt(team.value),
      );

      let usersIdsValues = this.variablesGetTrainings.filter.usersIds.map(
        (user) => parseInt(user.value),
      );

      let playersIdsValues = this.variablesGetTrainings.filter.playersIds.map(
        (player) => parseInt(player.value),
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
    checkConfigurationStatus() {
      // Se já foi concluído antes, não mostrar animação novamente
      if (this.isConfigurationComplete) {
        return;
      }
      // Se chegou a 100% agora, mostrar animação
      if (this.progressPercentage === 100) {
        // Pequeno delay para garantir que os dados foram atualizados
        this.$nextTick(() => {
          this.handleConfigurationComplete();
        });
      }
    },
    handleConfigurationComplete() {
      // Verificar novamente se já foi marcado como concluído
      if (localStorage.getItem("initialConfigurationComplete") === "true") {
        return;
      }

      // Mostrar animação de conclusão
      this.showCompletionAnimation = true;

      // Após 3 segundos, esconder animação e marcar como concluído
      setTimeout(() => {
        this.showCompletionAnimation = false;
        localStorage.setItem("initialConfigurationComplete", "true");
        this.showConfigurationDetails = false;
      }, 3000);
    },
    closeConfigurationDetails() {
      this.showConfigurationDetails = false;
    },
    async loadActivePlan() {
      try {
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("apollo:default.token");
        if (!token) {
          console.log("⚠️ Token não encontrado para carregar plano ativo");
          return;
        }

        const tenantId = localStorage.getItem("tenant_id") || "default";
        console.log("🔍 Carregando plano ativo - tenantId:", tenantId);

        const result = await getActivePlan(token, tenantId);
        console.log("🔍 Resultado do getActivePlan:", result);

        if (result.success && result.data) {
          this.activePlanData = result.data;
          console.log("✅ Plano ativo carregado:", result.data);
        } else {
          console.log("⚠️ Plano ativo não encontrado ou erro:", result);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar plano ativo:", error);
      }
    },
    normalizeMetadata(metadata) {
      if (!metadata) return {};

      // Se metadata é string, tentar fazer parse
      if (typeof metadata === "string") {
        try {
          return JSON.parse(metadata);
        } catch (e) {
          return {};
        }
      }

      // Se já é objeto, retornar diretamente
      return metadata;
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
  padding: 24px 28px 32px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.welcome-container {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Duas colunas: conteúdo principal | eventos + feedbacks */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr minmax(300px, 380px);
  gap: 24px;
  align-items: start;
  width: 100%;
}

.dashboard-layout__primary {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-layout__sidebar {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
}

.dashboard-layout__primary .dashboard-hero__inner {
  padding: 22px 24px 20px;
  min-height: 160px;
  gap: 16px;
}

.dashboard-layout__primary .dashboard-hero__visual {
  width: min(200px, 30vw);
  height: 160px;
}

.dashboard-layout__primary .hero-main-ball {
  width: 112px;
  height: 112px;
  margin-bottom: -18px;
}

.dashboard-layout__primary .hero-decoration {
  width: 42px;
  height: 42px;
}

/* Banner principal — gradiente laranja (dashboard) */
.dashboard-hero {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    125deg,
    #ff4e1b 0%,
    #ff6b35 38%,
    #ff8c42 65%,
    #ff9800 100%
  );
  box-shadow:
    0 12px 40px rgba(255, 78, 27, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.06);
  color: #fff;
}

.dashboard-hero__pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.45;
  background-image:
    radial-gradient(
      ellipse 120% 80% at 100% 100%,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 90% 70% at 0% 0%,
      rgba(0, 0, 0, 0.12) 0%,
      transparent 50%
    ),
    repeating-linear-gradient(
      -12deg,
      transparent,
      transparent 18px,
      rgba(255, 255, 255, 0.04) 18px,
      rgba(255, 255, 255, 0.04) 20px
    );
}

.dashboard-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px 24px;
  min-height: 200px;
}

.dashboard-hero__left {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.dashboard-hero__datetime-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(11, 30, 58, 0.35);
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 18px;
  letter-spacing: 0.01em;
}

.dashboard-hero__datetime-pill :deep(.va-icon) {
  opacity: 0.95;
}

.dashboard-hero__title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.dashboard-hero__subtitle {
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  opacity: 0.96;
  line-height: 1.4;
}

.dashboard-hero__tagline {
  font-size: 0.875rem;
  margin: 0 0 20px 0;
  opacity: 0.88;
  line-height: 1.45;
  max-width: 36rem;
}

.dashboard-hero__cta {
  background: #fff !important;
  color: #ff4e1b !important;
  border-radius: 10px !important;
  padding: 10px 22px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
  border: none !important;
}

.dashboard-hero__cta:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.dashboard-hero__cta-icon {
  font-size: 18px !important;
  margin-right: 8px !important;
}

.dashboard-hero__visual {
  position: relative;
  flex-shrink: 0;
  width: min(280px, 34vw);
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.hero-main-ball {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 3px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: -24px;
}

.hero-main-ball :deep(.va-icon) {
  color: #fff !important;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.hero-decoration {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  animation: hero-float 5s ease-in-out infinite;
}

.hero-decoration :deep(.va-icon) {
  color: #ff4e1b !important;
}

.hero-decoration--1 {
  top: 8%;
  right: 8%;
  animation-delay: 0s;
}

.hero-decoration--2 {
  top: 38%;
  right: -4%;
  animation-delay: 0.6s;
}

.hero-decoration--3 {
  bottom: 28%;
  right: 18%;
  animation-delay: 1.2s;
}

.hero-decoration--4 {
  top: 22%;
  left: 0;
  animation-delay: 0.3s;
}

@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Botão discreto para ver configuração quando já está completa */
.view-config-button {
  color: #6c757d !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.view-config-button:hover {
  color: #ff4e1b !important;
  opacity: 1;
  background: rgba(255, 78, 27, 0.05) !important;
}

.view-config-button :deep(.va-button__content) {
  gap: 4px;
}

.view-config-button .button-icon {
  font-size: 14px;
  margin-right: 6px;
}

/* Progress Card */
.progress-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.progress-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 18px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0;
}

.close-config-button {
  color: #6c757d !important;
  min-width: auto !important;
  padding: 4px 8px !important;
  transition: all 0.2s ease;
}

.close-config-button:hover {
  color: #ff4e1b !important;
  background: rgba(255, 78, 27, 0.1) !important;
}

.progress-bar-container {
  background-color: #e9ecef;
  border-radius: 8px;
  height: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.progress-bar-fill {
  background-color: #ff4e1b;
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

.status-waiting {
  background-color: #e9ecef;
  color: #495057;
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

/* Totais — layout tipo dashboard (rótulo em cima, valor embaixo) */
.totals-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 0;
  width: 100%;
}

.total-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #eef0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
}

.total-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.total-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
}

.total-icon :deep(.va-icon) {
  font-size: 26px !important;
}

.total-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.total-label {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  margin: 0;
  line-height: 1.25;
  letter-spacing: 0.01em;
}

.total-number {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.1;
}

.plan-limit {
  color: #9ca3af;
  font-weight: 600;
  font-size: 0.85em;
}

.plan-popover-wrapper {
  position: absolute;
  top: 12px;
  right: 12px;
}

.plan-info-icon {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.plan-info-icon:hover {
  opacity: 1;
}

.plan-popover-text {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

/* Completion Animation */
.completion-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.completion-content {
  background: white;
  border-radius: 24px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  animation: completionPulse 0.6s ease-out;
}

.completion-icon-wrapper {
  animation: completionCheck 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 24px;
}

.completion-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 12px 0;
}

.completion-message {
  font-size: 18px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

@keyframes completionCheck {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes completionPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Transitions */
.completion-enter-active {
  transition: opacity 0.4s ease;
}

.completion-leave-active {
  transition: opacity 0.3s ease;
}

.completion-enter-from,
.completion-leave-to {
  opacity: 0;
}

.fade-out-enter-active,
.fade-out-leave-active {
  transition: all 0.5s ease;
}

.fade-out-enter-from,
.fade-out-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Tablets grandes (769px - 1024px) */
@media (max-width: 1024px) {
  .welcome-page {
    padding: 20px;
  }

  .welcome-container {
    max-width: 100%;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-layout__sidebar {
    position: static;
  }

  .dashboard-layout__primary .dashboard-hero__visual {
    width: min(240px, 55vw);
  }

  .totals-section {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .total-card {
    padding: 16px;
  }

  .total-number {
    font-size: 24px;
  }

  .total-label {
    font-size: 14px;
  }
}

/* Tablets (481px - 768px) */
@media (max-width: 768px) {
  .welcome-page {
    padding: 20px 16px;
  }

  .welcome-container {
    gap: 16px;
    max-width: 100%;
  }

  .completion-content {
    padding: 32px 24px;
  }

  .completion-title {
    font-size: 24px;
  }

  .completion-message {
    font-size: 16px;
  }

  .completion-icon-wrapper :deep(.va-icon) {
    font-size: 80px !important;
  }

  .dashboard-hero__inner {
    flex-direction: column;
    align-items: stretch;
    padding: 22px 20px 20px;
    min-height: 0;
  }

  .dashboard-hero__visual {
    width: 100%;
    max-width: 280px;
    height: 168px;
    margin: 12px auto 0;
    align-self: center;
  }

  .hero-main-ball {
    width: 120px;
    height: 120px;
    margin-bottom: -20px;
  }

  .hero-main-ball :deep(.va-icon) {
    font-size: 80px !important;
  }

  .dashboard-hero__cta {
    width: 100%;
    max-width: 320px;
  }

  .totals-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .total-card {
    padding: 16px;
    flex-direction: row;
    align-items: center;
  }

  .total-icon {
    width: 40px;
    height: 40px;
  }

  .total-icon :deep(.va-icon) {
    font-size: 24px !important;
  }

  .total-number {
    font-size: 22px;
  }

  .plan-limit {
    font-size: 20px;
  }

  .total-label {
    font-size: 12px;
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

  .progress-title {
    font-size: 16px;
  }

  .step-title {
    font-size: 14px;
  }

  .step-description {
    font-size: 11px;
  }
}

/* Celulares (até 480px) */
@media (max-width: 480px) {
  .welcome-page {
    padding: 16px 12px;
  }

  .welcome-container {
    gap: 12px;
  }

  .dashboard-hero {
    border-radius: 16px;
  }

  .dashboard-hero__inner {
    padding: 18px 16px 16px;
  }

  .dashboard-hero__datetime-pill {
    font-size: 11px;
    padding: 6px 12px;
    margin-bottom: 14px;
  }

  .dashboard-hero__tagline {
    margin-bottom: 16px;
  }

  .dashboard-hero__cta {
    width: 100%;
    max-width: none;
    justify-content: center;
  }

  .dashboard-hero__visual {
    max-width: 240px;
    height: 150px;
  }

  .hero-decoration {
    width: 40px;
    height: 40px;
  }

  .hero-decoration :deep(.va-icon) {
    font-size: 22px !important;
  }

  .hero-main-ball {
    width: 100px;
    height: 100px;
    margin-bottom: -14px;
  }

  .hero-main-ball :deep(.va-icon) {
    font-size: 64px !important;
  }

  .completion-content {
    padding: 24px 20px;
    width: 95%;
  }

  .completion-title {
    font-size: 20px;
  }

  .completion-message {
    font-size: 14px;
  }

  .completion-icon-wrapper :deep(.va-icon) {
    font-size: 60px !important;
  }

  .progress-card,
  .motivational-card {
    padding: 12px;
    border-radius: 8px;
  }

  .progress-card-header {
    margin-bottom: 10px;
  }

  .progress-title {
    font-size: 15px;
  }

  .progress-text {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .steps-list {
    gap: 10px;
  }

  .step-item {
    padding: 10px;
    gap: 10px;
  }

  .step-icon-wrapper {
    flex-shrink: 0;
  }

  .step-title {
    font-size: 13px;
  }

  .step-description {
    font-size: 10px;
  }

  .step-actions {
    width: 100%;
    margin-top: 8px;
    justify-content: flex-start;
  }

  .step-actions :deep(.va-button) {
    min-width: 90px !important;
    width: auto !important;
    font-size: 11px !important;
    padding: 5px 10px !important;
  }

  .status-badge {
    font-size: 11px;
    padding: 3px 10px;
  }

  .motivational-content {
    gap: 6px;
  }

  .trophy-icon :deep(.va-icon) {
    font-size: 28px !important;
  }

  .motivational-text {
    font-size: 14px;
  }

  .motivational-subtitle {
    font-size: 12px;
  }

  .totals-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .total-card {
    padding: 14px;
    flex-direction: row;
    align-items: center;
    border-radius: 8px;
  }

  .total-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .total-icon :deep(.va-icon) {
    font-size: 20px !important;
  }

  .total-info {
    flex: 1;
    min-width: 0;
  }

  .total-number {
    font-size: 20px;
  }

  .plan-limit {
    font-size: 18px;
  }

  .total-label {
    font-size: 11px;
  }

  .plan-popover-wrapper {
    top: 8px;
    right: 8px;
  }

  .plan-info-icon {
    font-size: 14px !important;
  }
}
</style>
