<template>
  <div class="list-page-container player-stats-page">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">
          Estatísticas
          <template v-if="playerDisplayName">
            de
            <span class="page-title-accent">{{ playerDisplayName }}</span>
          </template>
        </h1>
        <p class="page-subtitle">
          Presença, treinos e visão técnica nos treinos finalizados
        </p>
      </div>
    </div>

    <ZPlayerStatsView :player-id="playerId" @loaded="onStatsLoaded" />

    <div class="action-buttons">
      <va-button
        preset="secondary"
        class="back-button"
        @click="$router.push('/players')"
      >
        <va-icon name="arrow_back" class="button-icon" />
        <span>Voltar</span>
      </va-button>
    </div>
  </div>
</template>

<script>
import ZPlayerStatsView from "~/components/organisms/Player/ZPlayerStatsView.vue";

export default {
  components: {
    ZPlayerStatsView,
  },
  data() {
    return {
      playerDisplayName: "",
    };
  },
  computed: {
    playerId() {
      return this.$route.params.id;
    },
  },
  watch: {
    playerId: {
      immediate: true,
      handler() {
        this.playerDisplayName = "";
      },
    },
  },
  methods: {
    onStatsLoaded(data) {
      const p = data?.player;
      this.playerDisplayName = p?.displayName || p?.name || "";
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Estatísticas do jogador",
});
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
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
