<template>
  <div class="upcoming-events">
    <div class="upcoming-events__header">
      <div class="upcoming-events__title-row">
        <va-icon name="event_available" size="22px" color="#FF4E1B" />
        <h2 class="upcoming-events__title">Próximos eventos</h2>
      </div>
      <p class="upcoming-events__subtitle">Seus próximos treinos agendados</p>
    </div>

    <div v-if="loading" class="upcoming-events__state">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando…</span>
    </div>

    <div v-else-if="errorMessage" class="upcoming-events__state upcoming-events__state--error">
      <va-icon name="error_outline" size="20px" color="#dc3545" />
      <span>{{ errorMessage }}</span>
    </div>

    <div v-else-if="!items.length" class="upcoming-events__empty">
      <va-icon name="event_busy" size="36px" color="#c5c5c5" />
      <p>Nenhum treino agendado à frente.</p>
      <va-button
        v-if="showSeeAll"
        preset="plain"
        size="small"
        class="upcoming-events__link-btn"
        @click="goTrainings"
      >
        Ver treinos
      </va-button>
    </div>

    <template v-else>
      <ul class="upcoming-list">
      <li
        v-for="t in items"
        :key="t.id"
        class="upcoming-item"
        role="button"
        tabindex="0"
        @click="goDetails(t.id)"
        @keydown.enter="goDetails(t.id)"
      >
        <div class="upcoming-item__calendar">
          <span class="upcoming-item__month">{{ formatMonth(t.dateStart) }}</span>
          <span class="upcoming-item__day">{{ formatDayNum(t.dateStart) }}</span>
        </div>
        <div class="upcoming-item__main">
          <div class="upcoming-item__name">{{ t.name || "Treino" }}</div>
          <div class="upcoming-item__meta">
            <span class="upcoming-item__time">{{ formatTimeRange(t) }}</span>
            <span v-if="teamName(t)" class="upcoming-item__team">{{
              teamName(t)
            }}</span>
          </div>
        </div>
        <va-icon name="chevron_right" size="20px" class="upcoming-item__chev" />
      </li>
      </ul>
    </template>

    <div v-if="items.length && showSeeAll" class="upcoming-events__footer">
      <va-button preset="plain" size="small" class="see-all-btn" @click="goTrainings">
        Ver todos os treinos
        <va-icon name="arrow_forward" size="16px" />
      </va-button>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import moment from "moment";
import TRAININGS from "~/graphql/training/query/trainings.graphql";

const UPCOMING_LIMIT = 8;

export default {
  name: "ZHomeUpcomingTrainings",
  emits: ["summary-change"],
  data() {
    return {
      loading: true,
      items: [],
      errorMessage: null,
      cancelledThisWeek: 2,
      finalizedThisWeek: 4,
    };
  },
  computed: {
    showSeeAll() {
      return true;
    },
    upcomingThisWeek() {
      const startOfWeek = moment().startOf("isoWeek");
      const endOfWeek = moment().endOf("isoWeek");

      return this.items.filter((item) => {
        if (!item?.dateStart) return false;
        const trainingDate = moment(item.dateStart);
        return trainingDate.isBetween(startOfWeek, endOfWeek, undefined, "[]");
      }).length;
    },
  },
  mounted() {
    this.loadUpcoming();
  },
  methods: {
    async loadUpcoming() {
      this.loading = true;
      this.errorMessage = null;
      this.items = [];

      try {
        const query = gql`
          ${TRAININGS}
        `;

        const now = moment().format("YYYY-MM-DD HH:mm:ss");

        const consult = {
          page: 1,
          first: 24,
          filter: {
            teamsIds: [],
            playersIds: [],
            search: "%%",
            dateStart: now,
          },
          orderBy: "dateStart",
          sortedBy: "asc",
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
        const ts = Date.now();
        const upcoming = raw
          .filter((row) => {
            const st = String(row?.status || "").toUpperCase();
            if (st === "FINISHED" || st === "CANCELLED") return false;
            const start = row?.dateStart ? new Date(row.dateStart).getTime() : 0;
            return start >= ts - 60_000;
          })
          .sort((a, b) => {
            const ta = new Date(a.dateStart).getTime();
            const tb = new Date(b.dateStart).getTime();
            return ta - tb;
          })
          .slice(0, UPCOMING_LIMIT);

        this.items = upcoming;
        this.emitSummary();
      } catch (e) {
        console.warn("ZHomeUpcomingTrainings:", e);
        this.errorMessage = "Erro ao carregar treinos.";
        this.items = [];
        this.emitSummary();
      } finally {
        this.loading = false;
      }
    },
    formatMonth(iso) {
      if (!iso) return "—";
      try {
        return new Intl.DateTimeFormat("pt-BR", { month: "short" })
          .format(new Date(iso))
          .replace(".", "");
      } catch {
        return "—";
      }
    },
    formatDayNum(iso) {
      if (!iso) return "—";
      return moment(iso).format("D");
    },
    formatTimeRange(t) {
      if (!t?.dateStart) return "";
      const a = moment(t.dateStart).format("HH:mm");
      if (t.dateEnd) {
        const b = moment(t.dateEnd).format("HH:mm");
        return `${a} – ${b}`;
      }
      return a;
    },
    teamName(t) {
      return t?.team?.name || "";
    },
    goDetails(id) {
      if (id == null) return;
      this.$router.push(`/trainings/details/${id}`);
    },
    goTrainings() {
      this.$router.push("/trainings");
    },
    emitSummary() {
      this.$emit("summary-change", {
        upcomingThisWeek: this.upcomingThisWeek,
        cancelledThisWeek: this.cancelledThisWeek,
        finalizedThisWeek: this.finalizedThisWeek,
      });
    },
  },
};
</script>

<style scoped>
.upcoming-events {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef0f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 18px 16px 14px;
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.upcoming-events__header {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.upcoming-events__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upcoming-events__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.upcoming-events__subtitle {
  margin: 6px 0 0 30px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.35;
}

.upcoming-events__state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 12px;
  color: #6b7280;
  font-size: 13px;
  flex: 1;
}

.upcoming-events__state--error {
  color: #dc3545;
  flex-direction: column;
  text-align: center;
}

.upcoming-events__empty {
  flex: 1;
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

.upcoming-events__empty p {
  margin: 0;
}

.upcoming-events__link-btn {
  color: #ff4e1b !important;
  margin-top: 4px;
}

.upcoming-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  max-height: min(52vh, 360px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upcoming-item {
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

.upcoming-item:hover {
  background: #fff8f5;
  border-color: rgba(255, 78, 27, 0.25);
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.08);
}

.upcoming-item:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.upcoming-item__calendar {
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

.upcoming-item__month {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #ff4e1b;
  letter-spacing: 0.02em;
}

.upcoming-item__day {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.upcoming-item__main {
  flex: 1;
  min-width: 0;
}

.upcoming-item__name {
  font-size: 14px;
  font-weight: 600;
  color: #0b1e3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upcoming-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}

.upcoming-item__time {
  font-weight: 500;
}

.upcoming-item__team {
  color: #9ca3af;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upcoming-item__chev {
  flex-shrink: 0;
  color: #c5c5c5;
}

.upcoming-events__footer {
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
