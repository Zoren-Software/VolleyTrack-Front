<template>
  <ZListPageContainer>
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Jogadores</h1>
          <p class="page-subtitle">Gerencie todos os atletas do seu sistema</p>
        </div>
        <va-button color="#FF4E1B" class="new-player-button" @click="addPlayer">
          <va-icon name="add" class="button-icon" />
          <span class="button-text">Novo Jogador</span>
        </va-button>
      </div>
    </div>

    <!-- Datatable Component -->
  <ZDatatablesPlayers
    :includeActionEditList="canEditPlayer()"
    :includeActionDeleteList="canEditPlayer()"
  />
  </ZListPageContainer>
</template>

<script>
import ZDatatablesPlayers from "~/components/organisms/Datatables/Players/ZDatatablesPlayers.vue";

export default {
  components: {
    ZDatatablesPlayers,
  },
  methods: {
    addPlayer() {
      this.$router.push("/players/create");
    },
  },
};
</script>

<script setup>
const { canEditPlayer } = usePermission()

useHead({
  titleTemplate: "Jogadores",
});
</script>

<style scoped>
.page-header {
  margin-bottom: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.new-player-button {
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #FF4E1B !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.new-player-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(255, 78, 27, 0.4);
  transform: translateY(-1px);
}

.new-player-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(255, 78, 27, 0.3);
}

.button-icon {
  font-size: 18px;
  color: white;
}

.button-text {
  font-size: 13px;
  font-weight: 500;
  color: white;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .new-player-button {
    width: 100%;
  }
}
</style>
