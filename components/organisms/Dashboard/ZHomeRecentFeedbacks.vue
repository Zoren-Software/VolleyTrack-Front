<template>
  <div class="recent-feedbacks">
    <div class="recent-feedbacks__header">
      <div class="recent-feedbacks__title-row">
        <va-icon name="chat" size="22px" color="#FF4E1B" />
        <h2 class="recent-feedbacks__title">Últimos feedbacks</h2>
      </div>
      <p class="recent-feedbacks__subtitle">
        Textos de feedback vinculados ao treino e ao jogador
      </p>
    </div>

    <div v-if="loading" class="recent-feedbacks__state">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando…</span>
    </div>

    <div
      v-else-if="errorMessage"
      class="recent-feedbacks__state recent-feedbacks__state--error"
    >
      <va-icon name="error_outline" size="20px" color="#dc3545" />
      <span>{{ errorMessage }}</span>
    </div>

    <div v-else-if="!items.length" class="recent-feedbacks__empty">
      <va-icon name="forum" size="36px" color="#c5c5c5" />
      <p>Nenhum feedback registrado ainda.</p>
      <p class="recent-feedbacks__empty-hint">
        Os feedbacks são salvos no scout técnico de cada treino finalizado.
      </p>
      <va-button
        preset="plain"
        size="small"
        class="recent-feedbacks__link-btn"
        @click="goTrainings"
      >
        Ver treinos
      </va-button>
    </div>

    <ul v-else class="feedback-list">
      <li
        v-for="row in items"
        :key="row.scoutId"
        class="feedback-item"
        role="button"
        tabindex="0"
        @click="goDetails(row.trainingId)"
        @keydown.enter="goDetails(row.trainingId)"
      >
        <div class="feedback-item__training">
          <va-icon name="sports_volleyball" size="18px" color="#FF4E1B" />
          <div class="feedback-item__training-text">
            <span class="feedback-item__training-name">{{
              row.trainingName || "Treino"
            }}</span>
            <span class="feedback-item__training-meta">
              {{ formatTrainingWhen(row.trainingDate) }}
              <template v-if="row.teamName">
                · {{ row.teamName }}
              </template>
            </span>
          </div>
        </div>
        <div class="feedback-item__player">
          <va-icon name="person" size="16px" color="#6b7280" />
          <span>{{ row.playerName || "Jogador" }}</span>
        </div>
        <p class="feedback-item__body">{{ row.feedback }}</p>
        <div class="feedback-item__footer">
          <span class="feedback-item__updated">Atualizado {{ formatUpdated(row.updatedAt) }}</span>
          <va-icon name="chevron_right" size="18px" class="feedback-item__chev" />
        </div>
      </li>
    </ul>

    <div v-if="items.length" class="recent-feedbacks__footer">
      <va-button preset="plain" size="small" class="see-all-btn" @click="goTrainings">
        Ver treinos
        <va-icon name="arrow_forward" size="16px" />
      </va-button>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import moment from "moment";
import TRAININGS from "~/graphql/training/query/trainings.graphql";

const MAX_TRAININGS = 35;
const MAX_ITEMS = 8;

export default {
  name: "ZHomeRecentFeedbacks",
  data() {
    return {
      loading: true,
      items: [],
      errorMessage: null,
    };
  },
  mounted() {
    this.loadRecent();
  },
  methods: {
    async loadRecent() {
      this.loading = true;
      this.errorMessage = null;
      this.items = [];

      try {
        const query = gql`
          ${TRAININGS}
        `;

        const consult = {
          page: 1,
          first: MAX_TRAININGS,
          filter: {
            teamsIds: [],
            playersIds: [],
            search: "%%",
            status: "FINISHED",
          },
          orderBy: "dateStart",
          sortedBy: "desc",
        };

        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          this.errorMessage = "Não foi possível conectar ao servidor.";
          this.loading = false;
          return;
        }

        const result = await apolloClient.query({
          query,
          variables: consult,
          fetchPolicy: "network-only",
        });

        const raw = result?.data?.trainings?.data || [];
        const flat = [];

        for (const t of raw) {
          const scouts = t.scoutFundamentalsTraining || [];
          for (const s of scouts) {
            const fb = (s.feedback || "").trim();
            if (!fb) continue;
            const player = s.player || {};
            flat.push({
              scoutId: s.id,
              trainingId: t.id,
              trainingName: t.name,
              trainingDate: t.dateStart,
              teamName: t.team?.name || "",
              playerName: player.displayName || player.name || "",
              feedback: fb,
              updatedAt: s.updatedAt || t.updatedAt,
            });
          }
        }

        flat.sort((a, b) => {
          const ta = new Date(a.updatedAt || 0).getTime();
          const tb = new Date(b.updatedAt || 0).getTime();
          return tb - ta;
        });

        this.items = flat.slice(0, MAX_ITEMS);
      } catch (e) {
        console.warn("ZHomeRecentFeedbacks:", e);
        this.errorMessage = "Erro ao carregar feedbacks.";
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    formatTrainingWhen(iso) {
      if (!iso) return "";
      return moment(iso).format("DD/MM/YYYY · HH:mm");
    },
    formatUpdated(iso) {
      if (!iso) return "";
      const d = moment(iso);
      const now = moment();
      if (d.isSame(now, "day")) {
        return `hoje às ${d.format("HH:mm")}`;
      }
      if (d.isSame(now.clone().subtract(1, "day"), "day")) {
        return `ontem às ${d.format("HH:mm")}`;
      }
      return d.format("DD/MM/YYYY HH:mm");
    },
    goDetails(id) {
      if (id == null) return;
      this.$router.push(`/trainings/details/${id}`);
    },
    goTrainings() {
      this.$router.push("/trainings");
    },
  },
};
</script>

<style scoped>
.recent-feedbacks {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 18px 16px 14px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.recent-feedbacks__header {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.recent-feedbacks__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recent-feedbacks__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.recent-feedbacks__subtitle {
  margin: 6px 0 0 30px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

.recent-feedbacks__state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 12px;
  color: #6b7280;
  font-size: 13px;
  flex: 1;
}

.recent-feedbacks__state--error {
  color: #dc3545;
  flex-direction: column;
  text-align: center;
}

.recent-feedbacks__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.recent-feedbacks__empty p {
  margin: 0;
}

.recent-feedbacks__empty-hint {
  font-size: 11px !important;
  line-height: 1.45;
  max-width: 260px;
}

.recent-feedbacks__link-btn {
  color: #ff4e1b !important;
  margin-top: 4px;
}

.feedback-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  max-height: min(48vh, 340px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feedback-item {
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
  background: #fafbfc;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  text-align: left;
}

.feedback-item:hover {
  background: #fff8f5;
  border-color: rgba(255, 78, 27, 0.22);
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.07);
}

.feedback-item:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.feedback-item__training {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.feedback-item__training-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feedback-item__training-name {
  font-size: 13px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.25;
}

.feedback-item__training-meta {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.3;
}

.feedback-item__player {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.feedback-item__body {
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.45;
  color: #4b5563;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feedback-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.feedback-item__updated {
  font-size: 10px;
  color: #9ca3af;
  text-transform: lowercase;
}

.feedback-item__chev {
  flex-shrink: 0;
  color: #c5c5c5;
}

.recent-feedbacks__footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: center;
}

.see-all-btn {
  color: #ff4e1b !important;
  font-weight: 600 !important;
}

.see-all-btn :deep(.va-button__content) {
  gap: 6px;
}
</style>
