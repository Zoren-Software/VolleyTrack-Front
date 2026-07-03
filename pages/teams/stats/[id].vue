<template>
  <ZListPageContainer class="team-stats-page">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">
          Estatísticas
          <template v-if="teamDisplayName">
            de
            <span class="page-title-accent">{{ teamDisplayName }}</span>
          </template>
        </h1>
        <p class="page-subtitle">
          Presença, treinos e visão técnica dos jogadores nos treinos finalizados
        </p>
      </div>
    </div>

    <ZTeamStatsView :team-id="teamId" @loaded="onStatsLoaded" />

    <div class="action-buttons">
      <va-button
        preset="secondary"
        class="back-button"
        @click="$router.push('/teams')"
      >
        <va-icon name="arrow_back" class="button-icon" />
        <span>Voltar</span>
      </va-button>
    </div>
  </ZListPageContainer>
</template>

<script>
import ZTeamStatsView from "~/components/organisms/Team/ZTeamStatsView.vue";

export default {
  components: {
    ZTeamStatsView,
  },
  data() {
    return {
      teamDisplayName: "",
    };
  },
  computed: {
    teamId() {
      return this.$route.params.id;
    },
  },
  watch: {
    teamId: {
      immediate: true,
      handler() {
        this.teamDisplayName = "";
      },
    },
  },
  methods: {
    onStatsLoaded(data) {
      const t = data?.team;
      this.teamDisplayName = t?.name || "";
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Estatísticas do time",
});
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 0;
}

.header-text {
  width: 100%;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-title-accent {
  color: #ff4e1b;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 24px;
}

.back-button {
  border-radius: 8px;
}

.button-icon {
  margin-right: 6px;
}
</style>
