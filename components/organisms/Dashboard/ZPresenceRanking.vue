<template>
  <section class="presence-ranking-section" aria-label="Rankings de presenca e faltas">
    <div class="section-header">
      <div class="section-title-wrapper">
        <va-icon name="leaderboard" size="24px" color="#FF4E1B" />
        <div>
          <h2 class="section-title">Rankings de frequencia</h2>
          <p class="section-subtitle">
            Rankings simulados com total e percentual de presenca e faltas nos treinos.
          </p>
        </div>
      </div>
    </div>

    <div class="ranking-grid">
      <section class="ranking-card" aria-label="Top 5 jogadores mais presentes">
        <div class="ranking-card__header">
          <div>
            <h3 class="ranking-card__title">Top 5 jogadores mais presentes</h3>
            <p class="ranking-card__subtitle">Total de presencas e percentual de presenca.</p>
          </div>
        </div>

        <div class="ranking-list">
          <article
            v-for="player in presenceRankingItems"
            :key="`presence-${player.id}`"
            class="ranking-row"
          >
            <div class="ranking-row__left">
              <div class="ranking-position-wrap">
                <span class="ranking-position">{{ player.rank }}.</span>
              </div>

              <va-avatar size="44px" class="ranking-avatar">
                {{ getInitial(player.name) }}
              </va-avatar>

              <div class="ranking-player">
                <div class="ranking-player__name-row">
                  <h3 class="ranking-player__name">{{ player.name }}</h3>
                  <va-icon
                    v-if="player.rank <= 3"
                    name="workspace_premium"
                    class="ranking-medal"
                    :class="`ranking-medal--${player.rank}`"
                    aria-hidden="true"
                    size="18px"
                  />
                </div>
                <p class="ranking-player__team">{{ player.team }}</p>
              </div>
            </div>

            <div class="ranking-row__metrics ranking-row__metrics--two-cols">
              <div class="ranking-metric">
                <span class="ranking-metric__label">Presencas</span>
                <span class="ranking-metric__value">{{ player.totalPresences }}</span>
              </div>
              <div class="ranking-metric">
                <span class="ranking-metric__label">Presenca %</span>
                <span class="ranking-metric__value ranking-metric__value--accent">
                  {{ formatPercentage(player.presencePercentage) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="ranking-card" aria-label="Top 5 jogadores mais faltosos">
        <div class="ranking-card__header">
          <div>
            <h3 class="ranking-card__title">Top 5 jogadores mais faltosos</h3>
            <p class="ranking-card__subtitle">Total de faltas e percentual de ausencias.</p>
          </div>
        </div>

        <div class="ranking-list">
          <article
            v-for="player in absenceRankingItems"
            :key="`absence-${player.id}`"
            class="ranking-row"
          >
            <div class="ranking-row__left">
              <div class="ranking-position-wrap">
                <span class="ranking-position">{{ player.rank }}.</span>
              </div>

              <va-avatar size="44px" class="ranking-avatar">
                {{ getInitial(player.name) }}
              </va-avatar>

              <div class="ranking-player">
                <div class="ranking-player__name-row">
                  <h3 class="ranking-player__name">{{ player.name }}</h3>
                  <va-icon
                    v-if="player.rank <= 3"
                    name="workspace_premium"
                    class="ranking-medal"
                    :class="`ranking-medal--${player.rank}`"
                    aria-hidden="true"
                    size="18px"
                  />
                </div>
                <p class="ranking-player__team">{{ player.team }}</p>
              </div>
            </div>

            <div class="ranking-row__metrics ranking-row__metrics--two-cols">
              <div class="ranking-metric">
                <span class="ranking-metric__label">Faltas</span>
                <span class="ranking-metric__value">{{ player.totalAbsences }}</span>
              </div>
              <div class="ranking-metric">
                <span class="ranking-metric__label">Ausencia %</span>
                <span class="ranking-metric__value ranking-metric__value--danger">
                  {{ formatPercentage(player.absencePercentage) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
export default {
  name: "ZPresenceRanking",
  data() {
    return {
      presenceRankingItems: [
        {
          id: 1,
          rank: 1,
          name: "Ana Beatriz",
          team: "Sub-17 Feminino",
          totalPresences: 23,
          totalTrainings: 24,
          totalAbsences: 1,
          presencePercentage: 95.8,
        },
        {
          id: 2,
          rank: 2,
          name: "Lucas Ferreira",
          team: "Adulto Masculino",
          totalPresences: 22,
          totalTrainings: 24,
          totalAbsences: 2,
          presencePercentage: 91.7,
        },
        {
          id: 3,
          rank: 3,
          name: "Mariana Silva",
          team: "Sub-15 Feminino",
          totalPresences: 21,
          totalTrainings: 23,
          totalAbsences: 2,
          presencePercentage: 91.3,
        },
        {
          id: 4,
          rank: 4,
          name: "Carlos Henrique",
          team: "Adulto Masculino",
          totalPresences: 20,
          totalTrainings: 22,
          totalAbsences: 2,
          presencePercentage: 90.9,
        },
        {
          id: 5,
          rank: 5,
          name: "Julia Martins",
          team: "Sub-17 Feminino",
          totalPresences: 19,
          totalTrainings: 21,
          totalAbsences: 2,
          presencePercentage: 90.5,
        },
      ],
      absenceRankingItems: [
        {
          id: 11,
          rank: 1,
          name: "Pedro Lima",
          team: "Sub-17 Masculino",
          totalAbsences: 8,
          absencePercentage: 33.3,
        },
        {
          id: 12,
          rank: 2,
          name: "Camila Rocha",
          team: "Sub-15 Feminino",
          totalAbsences: 7,
          absencePercentage: 31.8,
        },
        {
          id: 13,
          rank: 3,
          name: "Rafael Souza",
          team: "Adulto Masculino",
          totalAbsences: 7,
          absencePercentage: 29.2,
        },
        {
          id: 14,
          rank: 4,
          name: "Bianca Melo",
          team: "Sub-17 Feminino",
          totalAbsences: 6,
          absencePercentage: 28.6,
        },
        {
          id: 15,
          rank: 5,
          name: "Diego Martins",
          team: "Adulto Masculino",
          totalAbsences: 6,
          absencePercentage: 27.3,
        },
      ],
    };
  },
  methods: {
    getInitial(name) {
      if (!name) return "?";
      return name.trim().charAt(0).toUpperCase() || "?";
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
  },
};
</script>

<style scoped>
.presence-ranking-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 24px;
  border: 1px solid #eef0f3;
}

.section-header {
  margin-bottom: 18px;
}

.section-title-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0b1e3a;
}

.section-subtitle {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
}

.ranking-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.ranking-card {
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 16px;
  padding: 16px;
}

.ranking-card__header {
  margin-bottom: 14px;
}

.ranking-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0b1e3a;
}

.ranking-card__subtitle {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.4;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  padding: 10px 14px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.ranking-row:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 78, 27, 0.22);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.ranking-row__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ranking-position-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 34px;
  flex-shrink: 0;
}

.ranking-position {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  font-size: 14px;
  font-weight: 700;
  color: #94a3b8;
  flex-shrink: 0;
}

.ranking-medal {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.12));
}

.ranking-medal--1 {
  color: #d4af37;
}

.ranking-medal--2 {
  color: #c0c7d1;
}

.ranking-medal--3 {
  color: #cd7f32;
}

.ranking-avatar {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  background: #ff4e1b !important;
  color: #ffffff !important;
  font-weight: 700;
  flex-shrink: 0;
}

.ranking-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  background: #ff4e1b !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.ranking-avatar :deep(.va-avatar__content) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 0 0 1px 0 !important;
  font-size: 12px !important;
  line-height: 1 !important;
}

.ranking-player {
  min-width: 0;
}

.ranking-player__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ranking-player__name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-player__team {
  margin: 1px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.ranking-row__metrics {
  display: grid;
  flex-shrink: 0;
}

.ranking-row__metrics--two-cols {
  grid-template-columns: repeat(2, minmax(88px, 1fr));
  gap: 8px;
}

.ranking-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef0f3;
}

.ranking-metric__label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.ranking-metric__value {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.ranking-metric__value--accent {
  color: #ff4e1b;
}

.ranking-metric__value--danger {
  color: #dc3545;
}

@media (max-width: 1024px) {
  .ranking-grid {
    grid-template-columns: 1fr;
  }

  .ranking-row {
    flex-direction: column;
    align-items: stretch;
  }

  .ranking-row__metrics {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .presence-ranking-section {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .ranking-row {
    padding: 10px 12px;
  }

  .ranking-row__left {
    gap: 10px;
  }

  .ranking-position {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 12px;
  }

  .ranking-avatar {
    width: 38px !important;
    height: 38px !important;
  }

  .ranking-row__metrics--two-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .ranking-metric {
    min-height: 56px;
  }

  .ranking-metric__value {
    font-size: 16px;
  }
}
</style>
