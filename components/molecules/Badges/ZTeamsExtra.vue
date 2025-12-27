<template>
  <div class="teams-extra-container">
    <va-popover
      placement="top"
      trigger="hover"
      :disabled="!hasExtraTeams"
      class="teams-popover"
    >
      <div class="teams-extra-badge">
        <span class="badge-text">+ {{ extraTeamsCount }}</span>
      </div>
      <template #title>Outros Times</template>
      <template #body>
        <div class="teams-list">
          <div
            v-for="(team, index) in extraTeams"
            :key="team?.id || index"
            class="team-item"
          >
            <div class="team-name">{{ team?.name || "-" }}</div>
            <div v-if="team?.teamCategory || team?.teamLevel" class="team-meta">
              <span v-if="team?.teamCategory" class="team-category">
                {{ team.teamCategory.name }}
              </span>
              <span
                v-if="team?.teamCategory && team?.teamLevel"
                class="team-separator"
              >
                ,
              </span>
              <span v-if="team?.teamLevel" class="team-level">
                {{ team.teamLevel.name }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </va-popover>
  </div>
</template>

<script>
export default {
  name: "ZTeamsExtra",
  props: {
    teams: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    extraTeams() {
      // Retorna todos os times exceto o primeiro
      if (!Array.isArray(this.teams) || this.teams.length <= 1) {
        return [];
      }
      return this.teams.slice(1);
    },
    extraTeamsCount() {
      return this.extraTeams.length;
    },
    hasExtraTeams() {
      return this.extraTeamsCount > 0;
    },
  },
};
</script>

<style scoped>
.teams-extra-container {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.teams-extra-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  background: linear-gradient(135deg, #e9742b 0%, #d6652a 100%);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.teams-extra-badge:hover {
  background: linear-gradient(135deg, #d6652a 0%, #c55a24 100%);
  box-shadow: 0 4px 10px rgba(233, 116, 43, 0.35);
  transform: translateY(-1px);
}

.badge-text {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 250px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.team-item {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #e9742b;
  transition: all 0.2s ease;
}

.team-item:hover {
  background: #f0f0f0;
  transform: translateX(2px);
}

.team-name {
  font-size: 13px;
  font-weight: 600;
  color: #0b1e3a;
  margin-bottom: 4px;
}

.team-meta {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.4;
}

.team-category,
.team-level {
  color: #6c757d;
}

.team-separator {
  margin: 0 4px;
  color: #9e9e9e;
}

/* Scrollbar personalizada para a lista */
.teams-list::-webkit-scrollbar {
  width: 6px;
}

.teams-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.teams-list::-webkit-scrollbar-thumb {
  background: #e9742b;
  border-radius: 10px;
}

.teams-list::-webkit-scrollbar-thumb:hover {
  background: #d6652a;
}
</style>

