<template>
  <div>
    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando estatísticas...</span>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <va-icon name="error" size="48px" color="danger" />
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-else-if="playerData" class="player-stats-view">
      <div class="player-profile-card">
        <div class="player-profile-top">
          <div class="player-profile-actions">
            <va-button
              preset="plain"
              :icon="profileBookmarked ? 'bookmark' : 'bookmark_border'"
              size="small"
              round
              class="profile-action-btn"
              :color="profileBookmarked ? 'warning' : 'secondary'"
              aria-label="Marcar jogador"
              @click="profileBookmarked = !profileBookmarked"
            />
          </div>

          <div class="player-profile-main">
            <va-avatar class="player-profile-avatar" :size="64">
              {{ playerNameInitial(playerData.player) }}
            </va-avatar>

            <div class="player-profile-body">
              <div class="player-profile-name-row">
                <h2 class="player-profile-name">
                  {{ playerData.player.displayName || playerData.player.name }}
                </h2>
                <va-icon
                  v-if="showPresenceVerified()"
                  name="verified"
                  color="#22c55e"
                  size="20px"
                  class="player-profile-verified"
                />
                <div class="player-profile-tags">
                  <span
                    v-for="(position, idx) in playerData.player.positions || []"
                    :key="position?.id || idx"
                    class="position-tag"
                    :class="'position-tag--' + (idx % 3)"
                  >
                    {{ position?.name }}
                  </span>
                  <span
                    v-if="
                      !playerData.player.positions ||
                      playerData.player.positions.length === 0
                    "
                    class="position-tag position-tag--muted"
                  >
                    Sem posição
                  </span>
                </div>
              </div>
              <p
                v-if="playerData.player.email"
                class="player-profile-email"
              >
                {{ playerData.player.email }}
              </p>
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
              {{ getTopFundamentalShort() }}
            </div>
            <div class="profile-stat-label">Destaque técnico</div>
          </div>
        </div>
      </div>

      <div class="player-stats-tabs-card">
        <nav class="player-stats-tabs" role="tablist" aria-label="Seções">
          <button
            type="button"
            role="tab"
            class="player-stats-tab"
            :class="{ 'player-stats-tab--active': activePlayerTab === 'overview' }"
            :aria-selected="activePlayerTab === 'overview'"
            @click="activePlayerTab = 'overview'"
          >
            Visão Geral
          </button>
          <button
            type="button"
            role="tab"
            class="player-stats-tab"
            :class="{ 'player-stats-tab--active': activePlayerTab === 'feedbacks' }"
            :aria-selected="activePlayerTab === 'feedbacks'"
            @click="activePlayerTab = 'feedbacks'"
          >
            Feedbacks
          </button>
          <button
            type="button"
            role="tab"
            class="player-stats-tab"
            :class="{ 'player-stats-tab--active': activePlayerTab === 'presence' }"
            :aria-selected="activePlayerTab === 'presence'"
            @click="activePlayerTab = 'presence'"
          >
            Presença
          </button>
          <button
            type="button"
            role="tab"
            class="player-stats-tab"
            :class="{ 'player-stats-tab--active': activePlayerTab === 'technical' }"
            :aria-selected="activePlayerTab === 'technical'"
            @click="activePlayerTab = 'technical'"
          >
            Desempenho Técnico
          </button>
        </nav>

        <div class="player-stats-tab-panels">
          <div
            v-show="activePlayerTab === 'overview'"
            class="player-stats-tab-panel player-stats-tab-panel--overview"
            role="tabpanel"
          >
            <div class="overview-two-col">
              <div class="overview-col overview-col--teams">
                <div class="related-teams">
                  <div class="related-teams__header">
                    <div class="related-teams__title-row">
                      <va-icon name="groups" size="20px" color="#FF4E1B" />
                      <h3 class="related-teams__title">Times relacionados</h3>
                    </div>
                    <p class="related-teams__subtitle">
                      Times em que o jogador aparece no elenco e presença nos treinos
                    </p>
                  </div>

                  <div
                    v-if="!playerData.teamRankings || !playerData.teamRankings.length"
                    class="related-teams__empty"
                  >
                    <va-icon name="group_off" size="32px" color="#c5c5c5" />
                    <p>Nenhum time relacionado encontrado.</p>
                  </div>

                  <div v-else class="related-teams__grid">
                    <button
                      v-for="tr in playerData.teamRankings"
                      :key="tr.team.id"
                      type="button"
                      class="related-team-card"
                      @click="goTeamStats(tr.team.id)"
                    >
                      <div
                        class="related-team-card__avatar"
                        :class="relatedTeamAvatarRingClass(tr.presencePercentage)"
                      >
                        {{ teamInitial(tr.team) }}
                      </div>
                      <div class="related-team-card__player-name">
                        {{ playerData.player.displayName || playerData.player.name }}
                      </div>
                      <div class="related-team-card__role">
                        {{ relatedTeamRoleLine(tr) }}
                      </div>
                      <div class="related-team-card__team-line">
                        {{ tr.team.name }} — #{{ tr.team.id }}
                      </div>
                      <div class="related-team-card__stats">
                        <div class="related-team-card__stat-block">
                          <div class="related-team-card__pct">
                            {{ formatPercentage(tr.presencePercentage ?? 0) }}
                          </div>
                          <div class="related-team-card__stat-label">Presença</div>
                          <div class="related-team-card__stat-sub">
                            {{ tr.totalPresences }}/{{ tr.totalConfirmations }} confirmações
                          </div>
                        </div>
                        <div
                          class="related-team-card__gauge"
                          :style="relatedTeamGaugeStyle(tr.presencePercentage ?? 0)"
                          :aria-label="'Presença ' + formatPercentage(tr.presencePercentage ?? 0)"
                        >
                          <span class="related-team-card__gauge-inner">{{
                            Math.round(tr.presencePercentage ?? 0) + "%"
                          }}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div class="overview-col overview-col--trainings">
                <div class="last-trainings last-trainings--in-overview">
                  <div class="last-trainings__header">
                    <div class="last-trainings__title-row">
                      <va-icon name="history" size="20px" color="#FF4E1B" />
                      <h3 class="last-trainings__title">Últimos treinos</h3>
                    </div>
                    <p class="last-trainings__subtitle">
                      Treinos já realizados ou encerrados nos quais você entrou na escalação
                    </p>
                  </div>

                  <div v-if="lastTrainingsLoading" class="last-trainings__state">
                    <va-progress-circle indeterminate size="small" />
                    <span>Carregando treinos…</span>
                  </div>

                  <div
                    v-else-if="lastTrainingsError"
                    class="last-trainings__state last-trainings__state--error"
                  >
                    <va-icon name="error_outline" size="20px" color="#dc3545" />
                    <span>{{ lastTrainingsError }}</span>
                  </div>

                  <div v-else-if="!lastTrainings.length" class="last-trainings__empty">
                    <va-icon name="event_busy" size="32px" color="#c5c5c5" />
                    <p>Nenhum treino passado encontrado.</p>
                  </div>

                  <ul v-else class="last-trainings__list">
                    <li
                      v-for="t in lastTrainings"
                      :key="t.id"
                      class="last-trainings__item"
                      role="button"
                      tabindex="0"
                      @click="goTrainingDetails(t.id)"
                      @keydown.enter="goTrainingDetails(t.id)"
                    >
                      <div class="last-trainings__calendar">
                        <span class="last-trainings__month">{{
                          formatLastTrainingMonth(t.dateStart)
                        }}</span>
                        <span class="last-trainings__day">{{
                          formatLastTrainingDayNum(t.dateStart)
                        }}</span>
                      </div>
                      <div class="last-trainings__main">
                        <div class="last-trainings__name">{{ t.name || "Treino" }}</div>
                        <div class="last-trainings__meta">
                          <span class="last-trainings__time">{{
                            formatLastTrainingTimeRange(t)
                          }}</span>
                          <span
                            v-if="lastTrainingTeamName(t)"
                            class="last-trainings__team"
                            >{{ lastTrainingTeamName(t) }}</span
                          >
                        </div>
                      </div>
                      <span
                        class="last-trainings__badge"
                        :class="
                          'last-trainings__badge--' + getTrainingParticipationKey(t)
                        "
                      >
                        {{ getTrainingParticipationLabel(t) }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div
            v-show="activePlayerTab === 'feedbacks'"
            class="player-stats-tab-panel player-stats-tab-panel--feedbacks"
            role="tabpanel"
          >
            <div class="feedbacks-two-columns">
              <div class="feedbacks-column feedbacks-column--scouts">
                <h4 class="feedbacks-column-title">Feedback por Scout</h4>
                <div
                  v-if="!scoutFeedbackCards.length"
                  class="feedbacks-empty"
                >
                  <va-icon name="chat_bubble_outline" size="28px" color="#9ca3af" />
                  <p>
                    Nenhum feedback por scout registrado em treinos finalizados.
                  </p>
                </div>
                <div v-else class="feedback-scout-rows">
                  <div
                    v-for="(row, rowIdx) in scoutFeedbackRows"
                    :key="'fb-row-' + rowIdx"
                    class="feedback-scout-row"
                  >
                    <div
                      v-for="(card, cardIdx) in row"
                      :key="
                        'fb-' +
                        rowIdx +
                        '-' +
                        cardIdx +
                        '-' +
                        card.trainingName +
                        '-' +
                        card.scoutLabel
                      "
                      class="scout-feedback-card"
                    >
                      <div class="scout-feedback-card__head">
                        <div class="scout-feedback-card__training-block">
                          <span class="scout-feedback-card__training-name">{{
                            card.trainingName
                          }}</span>
                          <span class="scout-feedback-card__training-date">{{
                            formatScoutCardDate(card.trainingDate)
                          }}</span>
                        </div>
                        <span class="scout-feedback-card__scout-label">{{
                          card.scoutLabel
                        }}</span>
                      </div>
                      <p class="scout-feedback-card__text">
                        {{ card.feedbackText }}
                      </p>
                      <div class="scout-feedback-card__divider" />
                      <div class="scout-feedback-card__meta">
                        <span class="scout-feedback-card__author">{{
                          card.evaluatorDisplayName || "—"
                        }}</span>
                        <span class="scout-feedback-card__team">{{
                          card.teamName || "—"
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="feedbacks-column feedbacks-column--observations">
                <h4 class="feedbacks-column-title">Observações gerais</h4>
                <div
                  v-if="!scoutGeneralObservations.length"
                  class="feedbacks-empty"
                >
                  <va-icon name="notes" size="28px" color="#9ca3af" />
                  <p>
                    Nenhuma observação geral registrada em treinos finalizados.
                  </p>
                </div>
                <div v-else class="general-observations-list">
                  <div
                    v-for="(obs, obsIdx) in scoutGeneralObservations"
                    :key="'obs-' + obsIdx + '-' + obs.trainingName"
                    class="general-observation-card"
                  >
                    <div class="general-observation-card__head">
                      <span class="general-observation-card__training-name">{{
                        obs.trainingName
                      }}</span>
                      <span class="general-observation-card__training-date">{{
                        formatScoutCardDate(obs.trainingDate)
                      }}</span>
                    </div>
                    <p class="general-observation-card__text">
                      {{ obs.observationsText }}
                    </p>
                    <div class="general-observation-card__divider" />
                    <div class="general-observation-card__meta">
                      <span class="general-observation-card__author">{{
                        obs.evaluatorDisplayName || "—"
                      }}</span>
                      <span class="general-observation-card__team">{{
                        obs.teamName || "—"
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-show="activePlayerTab === 'presence'"
            class="player-stats-tab-panel"
            role="tabpanel"
          >
            <template
              v-if="playerData.teamRankings && playerData.teamRankings.length > 0"
            >
              <div class="section-title-wrapper tab-section-header">
                <h4 class="section-title">Ranking de Presença nos Times</h4>
                <va-icon name="emoji_events" size="20px" color="#FF4E1B" />
              </div>
              <div class="team-rankings-list">
                <div
                  v-for="(teamRanking, index) in playerData.teamRankings"
                  :key="teamRanking.team.id"
                  class="team-ranking-card"
                  :class="getTeamRankingCardClass(index)"
                >
                  <div
                    class="team-ranking-border"
                    :class="getTeamRankingBorderClass(index)"
                  ></div>
                  <div class="team-ranking-content">
                    <div class="team-ranking-header">
                      <ZTeam :data="teamRanking.team" :showCategoryAndLevel="true" />
                      <div
                        class="team-ranking-badge"
                        :class="getTeamRankingBadgeClass(index)"
                      >
                        {{ formatPercentage(teamRanking.presencePercentage) }}
                      </div>
                    </div>
                    <div class="player-ranking-info">
                      <div class="rank-display">
                        <div
                          class="rank-badge"
                          :class="getRankBadgeClass(index, teamRanking.rank)"
                        >
                          <span class="rank-number">{{ teamRanking.rank }}º</span>
                        </div>
                        <va-icon
                          v-if="teamRanking.rank === 1"
                          name="emoji_events"
                          class="trophy-icon-small"
                        />
                      </div>
                      <div class="ranking-details">
                        <div class="ranking-detail-item">
                          <span class="detail-label">Presenças:</span>
                          <span class="detail-value"
                            >{{ teamRanking.totalPresences }}/{{
                              teamRanking.totalConfirmations
                            }}</span
                          >
                        </div>
                        <div class="ranking-detail-item">
                          <span class="detail-label">Total de jogadores no time:</span>
                          <span class="detail-value">{{
                            teamRanking.totalPlayersInTeam
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-tab">
              <va-icon name="info" size="24px" color="#9E9E9E" />
              <p>Nenhum ranking por time disponível.</p>
            </div>
          </div>

          <div
            v-show="activePlayerTab === 'technical'"
            class="player-stats-tab-panel player-stats-tab-panel--technical"
            role="tabpanel"
          >
            <div class="section-title-wrapper tab-section-header">
              <h4 class="section-title">Visão Técnica dos Treinos</h4>
              <div class="section-actions">
                <va-button
                  :icon="
                    fundamentalsViewMode === 'chart' ? 'visibility' : 'bar_chart'
                  "
                  preset="plain"
                  size="small"
                  class="toggle-view-btn"
                  :title="
                    fundamentalsViewMode === 'chart'
                      ? 'Ver informações detalhadas'
                      : 'Ver gráfico radar'
                  "
                  @click="toggleFundamentalsView"
                />
              </div>
            </div>
            <div
              v-if="
                playerData.topFundamentals && playerData.topFundamentals.length > 0
              "
            >
              <div
                v-if="fundamentalsViewMode === 'chart'"
                class="radar-chart-container"
              >
                <Radar :data="getRadarChartData()" :options="radarChartOptions" />
              </div>
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
                        <span class="stat-value">{{ fundamental.totalA }}</span>
                      </div>
                      <div class="stat-badge stat-badge-b">
                        <span class="stat-label">B</span>
                        <span class="stat-value">{{ fundamental.totalB }}</span>
                      </div>
                      <div class="stat-badge stat-badge-c">
                        <span class="stat-label">C</span>
                        <span class="stat-value">{{ fundamental.totalC }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-fundamentals">
              <va-icon name="info" size="24px" color="#9E9E9E" />
              <p>Nenhum fundamental treinado ainda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import moment from "moment";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam.vue";
import PLAYER_INDIVIDUAL_ANALYSIS from "~/graphql/dashboard/query/playerIndividualAnalysis.graphql";
import TRAININGS from "~/graphql/training/query/trainings.graphql";
import { Radar } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export default {
  name: "ZPlayerStatsView",
  components: {
    ZTeam,
    Radar,
  },
  props: {
    playerId: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ["loaded"],
  data() {
    return {
      playerData: null,
      loadingData: false,
      errorMessage: null,
      fundamentalsViewMode: "chart",
      profileBookmarked: false,
      activePlayerTab: "overview",
      lastTrainings: [],
      lastTrainingsLoading: false,
      lastTrainingsError: null,
    };
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
              label(context) {
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
    scoutFeedbackCards() {
      return this.playerData?.scoutFeedbackByFundamental || [];
    },
    scoutFeedbackRows() {
      const cards = this.scoutFeedbackCards;
      const rows = [];
      for (let i = 0; i < cards.length; i += 3) {
        rows.push(cards.slice(i, i + 3));
      }
      return rows;
    },
    scoutGeneralObservations() {
      return this.playerData?.scoutGeneralObservations || [];
    },
  },
  watch: {
    playerId: {
      immediate: true,
      handler(id) {
        this.profileBookmarked = false;
        this.activePlayerTab = "overview";
        if (id != null && id !== "") {
          this.loadPlayerStats();
        } else {
          this.playerData = null;
          this.errorMessage = null;
          this.lastTrainings = [];
          this.lastTrainingsError = null;
        }
      },
    },
  },
  methods: {
    async loadPlayerStats() {
      if (this.playerId == null || this.playerId === "") return;

      this.loadingData = true;
      this.errorMessage = null;
      this.playerData = null;
      this.lastTrainings = [];
      this.lastTrainingsError = null;

      try {
        const query = gql`
          ${PLAYER_INDIVIDUAL_ANALYSIS}
        `;

        const variables = {
          playerId: String(this.playerId),
        };

        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;

        if (!apolloClient) {
          throw new Error("Cliente Apollo não encontrado");
        }

        const result = await apolloClient.query({
          query,
          variables,
          fetchPolicy: "network-only",
        });

        this.loadingData = false;

        if (result?.data?.playerIndividualAnalysis) {
          this.playerData = result.data.playerIndividualAnalysis;
          this.$emit("loaded", this.playerData);
          this.loadLastTrainings();
        } else {
          this.errorMessage = "Nenhum dado encontrado para este jogador.";
        }
      } catch (error) {
        this.loadingData = false;
        this.errorMessage =
          error.message || "Erro ao carregar estatísticas do jogador.";
        console.error("Erro ao carregar estatísticas:", error);
      }
    },
    async loadLastTrainings() {
      if (this.playerId == null || this.playerId === "") return;

      this.lastTrainingsLoading = true;
      this.lastTrainingsError = null;

      try {
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          throw new Error("Cliente Apollo não encontrado");
        }

        const trainingsQuery = gql`
          ${TRAININGS}
        `;

        const result = await apolloClient.query({
          query: trainingsQuery,
          variables: {
            page: 1,
            first: 40,
            filter: {
              teamsIds: [],
              playersIds: [Number(this.playerId)],
              search: "%%",
            },
            orderBy: "dateStart",
            sortedBy: "desc",
          },
          fetchPolicy: "network-only",
        });

        const raw = result?.data?.trainings?.data || [];
        const ts = Date.now();
        const past = raw
          .filter((row) => {
            const start = row?.dateStart ? new Date(row.dateStart).getTime() : 0;
            return start <= ts + 60_000;
          })
          .slice(0, 8);

        this.lastTrainings = past;
      } catch (e) {
        console.warn("ZPlayerStatsView loadLastTrainings:", e);
        this.lastTrainingsError = "Não foi possível carregar os últimos treinos.";
        this.lastTrainings = [];
      } finally {
        this.lastTrainingsLoading = false;
      }
    },
    getTrainingParticipationKey(training) {
      const info = this.getTrainingParticipationInfo(training);
      return info.key;
    },
    getTrainingParticipationLabel(training) {
      const info = this.getTrainingParticipationInfo(training);
      return info.label;
    },
    getTrainingParticipationInfo(training) {
      const trainingStatus = String(training?.status || "").toUpperCase();
      if (trainingStatus === "CANCELLED") {
        return { key: "cancelado", label: "CANCELADO" };
      }

      const pid = String(this.playerId);
      const list = Array.isArray(training?.confirmationsTraining)
        ? training.confirmationsTraining
        : [];
      const conf = list.find((c) => String(c.playerId) === pid);
      if (!conf) {
        return { key: "pendente", label: "PENDENTE" };
      }

      const cs = String(conf.status || "PENDING").toUpperCase();
      if (cs === "CONFIRMED") {
        return { key: "confirmado", label: "CONFIRMADO" };
      }
      if (cs === "REJECTED") {
        return { key: "cancelado", label: "CANCELADO" };
      }
      return { key: "pendente", label: "PENDENTE" };
    },
    formatLastTrainingMonth(iso) {
      if (!iso) return "—";
      try {
        return new Intl.DateTimeFormat("pt-BR", { month: "short" })
          .format(new Date(iso))
          .replace(".", "");
      } catch {
        return "—";
      }
    },
    formatLastTrainingDayNum(iso) {
      if (!iso) return "—";
      return moment(iso).format("D");
    },
    formatLastTrainingTimeRange(t) {
      if (!t?.dateStart) return "";
      const a = moment(t.dateStart).format("HH:mm");
      if (t.dateEnd) {
        const b = moment(t.dateEnd).format("HH:mm");
        return `${a} – ${b}`;
      }
      return a;
    },
    lastTrainingTeamName(t) {
      return t?.team?.name || "";
    },
    goTrainingDetails(id) {
      if (id == null) return;
      this.$router.push(`/trainings/details/${id}`);
    },
    goTeamStats(teamId) {
      if (teamId == null) return;
      this.$router.push(`/teams/stats/${teamId}`);
    },
    teamInitial(team) {
      const n = (team?.name || "T").trim();
      return n.charAt(0).toUpperCase();
    },
    relatedTeamAvatarRingClass(pct) {
      const p = Number(pct) || 0;
      if (p >= 80) return "related-team-card__avatar--high";
      if (p >= 50) return "related-team-card__avatar--mid";
      return "related-team-card__avatar--low";
    },
    relatedTeamRoleLine(tr) {
      const parts = [];
      const cat = tr?.team?.teamCategory?.name?.trim();
      const lvl = tr?.team?.teamLevel?.name?.trim();
      if (cat) parts.push(cat);
      if (lvl) parts.push(lvl);
      if (parts.length) return parts.join(" · ").toUpperCase();
      const pos = this.playerData?.player?.positions?.[0]?.name;
      if (pos) return String(pos).toUpperCase();
      return "ELENCO";
    },
    relatedTeamGaugeStyle(pct) {
      const p = Math.min(100, Math.max(0, Math.round(Number(pct) || 0)));
      let color = "#ef4444";
      if (p >= 80) color = "#22c55e";
      else if (p >= 50) color = "#3b82f6";
      return {
        background: `conic-gradient(${color} ${p}%, #e8ecf1 ${p}% 100%)`,
      };
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    formatScoutCardDate(iso) {
      if (!iso) {
        return "—";
      }
      return moment(iso).format("DD/MM/YYYY HH:mm");
    },
    playerNameInitial(player) {
      const nameToUse = player?.displayName || player?.name || "?";
      return String(nameToUse).charAt(0).toUpperCase();
    },
    showPresenceVerified() {
      return (this.playerData?.presencePercentage ?? 0) >= 60;
    },
    getTopFundamentalName() {
      const list = this.playerData?.topFundamentals;
      if (!list?.length) return null;
      const sorted = [...list].sort(
        (a, b) => (b.grandTotal || 0) - (a.grandTotal || 0)
      );
      return sorted[0]?.fundamental?.name || null;
    },
    getTopFundamentalShort() {
      const name = this.getTopFundamentalName();
      if (!name) return "—";
      const max = 20;
      return name.length > max ? `${name.slice(0, max - 1)}…` : name;
    },
    getPercentage(part, total) {
      if (total === 0) return 0;
      return (part / total) * 100;
    },
    getTeamRankingCardClass(index) {
      const classes = ["team-card-orange", "team-card-blue", "team-card-black"];
      return classes[index % classes.length];
    },
    getTeamRankingBorderClass(index) {
      const classes = ["border-orange", "border-blue", "border-black"];
      return classes[index % classes.length];
    },
    getTeamRankingBadgeClass(index) {
      const classes = ["badge-orange", "badge-blue", "badge-black"];
      return classes[index % classes.length];
    },
    getRankBadgeClass(index, rank) {
      const baseClasses = ["rank-orange", "rank-blue", "rank-black"];
      const baseClass = baseClasses[index % baseClasses.length];

      if (rank === 1) {
        return `${baseClass} rank-gold`;
      } else if (rank === 2) {
        return `${baseClass} rank-silver`;
      } else if (rank === 3) {
        return `${baseClass} rank-bronze`;
      }

      return baseClass;
    },
    toggleFundamentalsView() {
      this.fundamentalsViewMode =
        this.fundamentalsViewMode === "chart" ? "info" : "chart";
    },
    getAllFundamentals() {
      return [
        { id: 1, name: "Saque" },
        { id: 2, name: "Recepção" },
        { id: 3, name: "Ataque" },
        { id: 4, name: "Bloqueio" },
        { id: 5, name: "Defesa" },
        { id: 6, name: "Levantamento" },
      ];
    },
    getRadarChartData() {
      if (!this.playerData?.topFundamentals) {
        return {
          labels: [],
          datasets: [],
        };
      }

      const allFundamentals = this.getAllFundamentals();

      const fundamentalsMap = {};
      this.playerData.topFundamentals.forEach((f) => {
        fundamentalsMap[f.fundamental.name] = f;
      });

      const labels = allFundamentals.map((f) => f.name);
      const data = allFundamentals.map((fundamental) => {
        const trained = fundamentalsMap[fundamental.name];
        if (!trained || trained.grandTotal === 0) {
          return 0;
        }

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

.player-stats-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.player-profile-card {
  position: relative;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8ecf1;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.06),
    0 4px 14px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.player-profile-card:hover {
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.player-stats-tabs-card {
  position: relative;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8ecf1;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.06),
    0 4px 14px rgba(15, 23, 42, 0.04);
  overflow: hidden;
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

.player-profile-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  padding-right: 56px;
}

.player-profile-avatar {
  flex-shrink: 0;
  border-radius: 10px !important;
  font-size: 22px !important;
  font-weight: 700 !important;
  background: linear-gradient(145deg, #ff4e1b 0%, #e03d12 100%) !important;
  color: #fff !important;
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
  margin-bottom: 8px;
}

.player-profile-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
  line-height: 1.2;
  flex-shrink: 0;
}

.player-profile-verified {
  flex-shrink: 0;
}

.player-profile-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.player-profile-tags .position-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: none;
}

.player-profile-tags .position-tag--0 {
  background: #e0f2fe;
  color: #0369a1;
}

.player-profile-tags .position-tag--1 {
  background: #dcfce7;
  color: #15803d;
}

.player-profile-tags .position-tag--2 {
  background: #ffedd5;
  color: #c2410c;
}

.player-profile-tags .position-tag--muted {
  background: #f1f5f9;
  color: #64748b;
}

.player-profile-email {
  margin: 0 0 12px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.45;
  word-break: break-word;
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

.player-stats-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0;
  padding: 0 4px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafbfc;
}

.player-stats-tab {
  position: relative;
  padding: 14px 16px 12px;
  margin: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: color 0.15s ease;
}

.player-stats-tab:hover {
  color: #334155;
}

.player-stats-tab:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: -2px;
}

.player-stats-tab--active {
  color: #0b1e3a;
  font-weight: 600;
}

.player-stats-tab--active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #ff4e1b;
  border-radius: 2px 2px 0 0;
}

.player-stats-tab-panels {
  padding: 20px 20px 22px;
  background: #fff;
  min-height: 100px;
}

.player-stats-tab-panel {
  padding: 0 4px;
}

.player-stats-tab-panel--overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-two-col {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.overview-col {
  min-width: 0;
}

.last-trainings--in-overview {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.related-teams__header {
  margin-bottom: 14px;
}

.related-teams__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.related-teams__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.related-teams__subtitle {
  margin: 6px 0 0 28px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.35;
}

.related-teams__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  background: #fafbfc;
}

.related-teams__empty p {
  margin: 0;
}

.related-teams__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.related-team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 18px 14px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  border: 1px solid #eef0f3;
  cursor: pointer;
  font-family: inherit;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.related-team-card:hover {
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.1);
  border-color: rgba(255, 78, 27, 0.25);
  transform: translateY(-2px);
}

.related-team-card:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.related-team-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(145deg, #ff4e1b 0%, #d63a0f 100%);
  margin-bottom: 12px;
}

.related-team-card__avatar--high {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.9);
}

.related-team-card__avatar--mid {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.85);
}

.related-team-card__avatar--low {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.85);
}

.related-team-card__player-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.25;
  margin-bottom: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-team-card__role {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #9ca3af;
  text-transform: uppercase;
  margin-bottom: 8px;
  line-height: 1.3;
  max-width: 100%;
}

.related-team-card__team-line {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 14px;
  line-height: 1.35;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-team-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px solid #f0f2f5;
}

.related-team-card__stat-block {
  text-align: left;
  flex: 1;
  min-width: 0;
}

.related-team-card__pct {
  font-size: 22px;
  font-weight: 800;
  color: #0b1e3a;
  line-height: 1;
}

.related-team-card__stat-label {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  font-weight: 500;
}

.related-team-card__stat-sub {
  font-size: 10px;
  color: #cbd5e1;
  margin-top: 2px;
}

.related-team-card__gauge {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.related-team-card__gauge-inner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: #0b1e3a;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.last-trainings {
  margin-top: 4px;
  padding-top: 18px;
  border-top: 1px solid #f0f2f5;
}

.last-trainings__header {
  margin-bottom: 14px;
}

.last-trainings__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.last-trainings__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.last-trainings__subtitle {
  margin: 6px 0 0 28px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.35;
}

.last-trainings__state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 12px;
  color: #6b7280;
  font-size: 13px;
}

.last-trainings__state--error {
  color: #dc3545;
  flex-direction: column;
  text-align: center;
}

.last-trainings__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.last-trainings__empty p {
  margin: 0;
}

.last-trainings__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(48vh, 340px);
  overflow-y: auto;
}

.last-trainings__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
  background: #fafbfc;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.last-trainings__item:hover {
  background: #fff8f5;
  border-color: rgba(255, 78, 27, 0.25);
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.08);
}

.last-trainings__item:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.last-trainings__calendar {
  flex-shrink: 0;
  width: 48px;
  height: 52px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
}

.last-trainings__month {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #ff4e1b;
  letter-spacing: 0.02em;
}

.last-trainings__day {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.last-trainings__main {
  flex: 1;
  min-width: 0;
}

.last-trainings__name {
  font-size: 14px;
  font-weight: 600;
  color: #0b1e3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-trainings__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}

.last-trainings__time {
  font-weight: 500;
}

.last-trainings__team {
  color: #9ca3af;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-trainings__badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 6px 8px;
  border-radius: 8px;
  line-height: 1;
  text-align: center;
  max-width: 104px;
}

.last-trainings__badge--confirmado {
  color: #15803d;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.last-trainings__badge--cancelado {
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.last-trainings__badge--pendente {
  color: #92400e;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.player-stats-tab-panel--technical .radar-chart-container {
  height: 360px;
  padding: 12px 8px;
}

.tab-section-header {
  margin-bottom: 16px;
}

.tab-panel-placeholder {
  margin: 0;
  padding: 8px 0 4px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.55;
}

.empty-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  gap: 10px;
  color: #9e9e9e;
  font-size: 14px;
  text-align: center;
}

.empty-tab p {
  margin: 0;
}

.player-stats-tab-panel--feedbacks {
  padding: 0 2px;
}

.feedbacks-two-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 24px;
  align-items: start;
}

.feedbacks-column-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #0b1e3a;
}

.feedbacks-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 28px 16px;
  color: #64748b;
  font-size: 13px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
}

.feedbacks-empty p {
  margin: 0;
  max-width: 280px;
  line-height: 1.45;
}

.feedback-scout-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feedback-scout-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.scout-feedback-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-height: 100%;
  transition: box-shadow 0.2s ease;
}

.scout-feedback-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.scout-feedback-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.scout-feedback-card__training-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.scout-feedback-card__training-name {
  font-size: 13px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.3;
}

.scout-feedback-card__training-date {
  font-size: 12px;
  color: #64748b;
}

.scout-feedback-card__scout-label {
  flex-shrink: 0;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: #ff4e1b;
  max-width: 42%;
  line-height: 1.3;
}

.scout-feedback-card__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

.scout-feedback-card__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 2px 0;
}

.scout-feedback-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.scout-feedback-card__author {
  font-weight: 600;
  color: #0b1e3a;
}

.scout-feedback-card__team {
  color: #64748b;
}

.general-observations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: min(70vh, 560px);
  overflow-y: auto;
  padding-right: 4px;
}

.general-observation-card {
  padding: 14px;
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.general-observation-card__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.general-observation-card__training-name {
  font-size: 13px;
  font-weight: 700;
  color: #0b1e3a;
}

.general-observation-card__training-date {
  font-size: 12px;
  color: #64748b;
}

.general-observation-card__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

.general-observation-card__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 10px 0;
}

.general-observation-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.general-observation-card__author {
  font-weight: 600;
  color: #0b1e3a;
}

.general-observation-card__team {
  color: #64748b;
}

@media (max-width: 1100px) {
  .feedbacks-two-columns {
    grid-template-columns: 1fr;
  }

  .general-observations-list {
    max-height: none;
  }

  .feedback-scout-row {
    grid-template-columns: 1fr;
  }
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title-wrapper .section-title {
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
  color: #ff4e1b !important;
  background: rgba(255, 78, 27, 0.1) !important;
}

.radar-chart-container {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.fundamentals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fundamental-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
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
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
}

.fundamental-total {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.fundamental-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fundamental-bars {
  display: flex;
  height: 20px;
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
  gap: 10px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.stat-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
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
  font-size: 12px;
  line-height: 1;
  display: inline-block;
}

.stat-badge .stat-value {
  font-weight: 600;
  font-size: 12px;
  line-height: 1;
  display: inline-block;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 16px 0;
}

.empty-fundamentals {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  gap: 12px;
  color: #9e9e9e;
  font-size: 14px;
}

.team-rankings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.team-ranking-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.team-ranking-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.border-orange {
  background: #ff4e1b;
}

.border-blue {
  background: #1976d2;
}

.border-black {
  background: #0b1e3a;
}

.team-ranking-content {
  padding: 16px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.team-ranking-header :deep(.team-container) {
  margin: 0;
  gap: 8px;
}

.team-ranking-header :deep(.team-name) {
  font-size: 14px;
  font-weight: 600;
}

.team-ranking-header :deep(.info-text) {
  font-size: 11px;
}

.team-ranking-badge {
  font-size: 14px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
}

.badge-orange {
  background: rgba(255, 78, 27, 0.1);
  color: #ff4e1b;
}

.badge-blue {
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}

.badge-black {
  background: rgba(11, 30, 58, 0.1);
  color: #0b1e3a;
}

.player-ranking-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.rank-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.rank-orange {
  background: #ff4e1b;
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

.rank-number {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: white;
}

.trophy-icon-small {
  color: rgb(143, 108, 38);
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3));
}

.ranking-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.ranking-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #0b1e3a;
  font-weight: 600;
}

@media (max-width: 768px) {
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

  .player-stats-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .player-stats-tab {
    flex-shrink: 0;
    padding-left: 14px;
    padding-right: 14px;
  }

  .player-stats-tab-panels {
    padding: 16px 12px 18px;
  }

  .radar-chart-container {
    height: 280px;
    padding: 12px;
  }

  .player-stats-tab-panel--technical .radar-chart-container {
    height: 260px;
  }

  .overview-two-col {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .overview-col--trainings .last-trainings--in-overview {
    padding-top: 18px;
    border-top: 1px solid #f0f2f5;
  }

  .related-teams__grid {
    grid-template-columns: 1fr;
  }
}
</style>
