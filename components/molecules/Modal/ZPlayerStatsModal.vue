<template>
  <ZModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="`Estatísticas de ${playerData?.player?.displayName || playerData?.player?.name || 'Jogador'}`"
    :ok-text="'Fechar'"
    @ok="closeModal"
    @cancel="closeModal"
    size="large"
  >
    <div v-if="loading" class="loading-container">
      <va-progress-circle indeterminate size="small" />
      <span class="loading-text">Carregando estatísticas...</span>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <va-icon name="error" size="48px" color="danger" />
      <p class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-else-if="playerData" class="player-stats-modal">
      <!-- Header do Jogador -->
      <div class="player-header-section">
        <ZUser :data="playerData.player" show-position />
      </div>

      <!-- Estatísticas Principais -->
      <div class="main-stats-section">
        <div class="stat-card presence-card">
          <div class="stat-icon">
            <va-icon name="check_circle" size="32px" color="#28a745" />
          </div>
          <div class="stat-content">
            <div class="stat-value presence-value">
              {{ formatPercentage(playerData.presencePercentage ?? 0) }}
            </div>
            <div class="stat-label">Presença</div>
            <div class="stat-description">
              Percentual de presença nos treinos finalizados
            </div>
          </div>
        </div>

        <div class="stat-card trainings-card">
          <div class="stat-icon">
            <va-icon name="fitness_center" size="32px" color="#e9742b" />
          </div>
          <div class="stat-content">
            <div class="stat-value trainings-value">
              {{ playerData.presencesCount || 0 }} / {{ playerData.trainingsCount || 0 }} / {{ playerData.pendingTrainingsCount || 0 }}
            </div>
            <div class="stat-label">
              Treinos
              <va-popover
                placement="top"
                trigger="hover"
                class="info-popover-wrapper"
              >
                <va-icon
                  name="info"
                  size="14px"
                  color="#6c757d"
                  class="info-icon"
                />
                <template #title>Informação</template>
                <template #body>
                  <p class="info-popover-text">
                    Presenças / Treinos Finalizados / Treinos Agendados
                  </p>
                </template>
              </va-popover>
            </div>
            <div class="stat-description">
              Total de treinos: {{ playerData.totalTrainingsCount || 0 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Posições -->
      <div class="positions-section">
        <h4 class="section-title">Posição</h4>
        <div class="positions-tags">
          <span
            v-for="(position, idx) in playerData.player.positions || []"
            :key="position?.id || idx"
            class="position-tag"
          >
            {{ position?.name }}
          </span>
          <span
            v-if="!playerData.player.positions || playerData.player.positions.length === 0"
            class="position-tag empty"
          >
            Sem posição
          </span>
        </div>
      </div>

      <!-- Fundamentos Mais Treinados -->
      <div class="fundamentals-section">
        <div class="fundamentals-title-wrapper">
          <h4 class="section-title">Fundamentos Mais Treinados</h4>
          <span class="top3-badge">TOP 3</span>
        </div>
        <div v-if="playerData.topFundamentals && playerData.topFundamentals.length > 0" class="fundamentals-list">
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
                  <span class="stat-value">{{
                    fundamental.totalA
                  }}</span>
                </div>
                <div class="stat-badge stat-badge-b">
                  <span class="stat-label">B</span>
                  <span class="stat-value">{{
                    fundamental.totalB
                  }}</span>
                </div>
                <div class="stat-badge stat-badge-c">
                  <span class="stat-label">C</span>
                  <span class="stat-value">{{
                    fundamental.totalC
                  }}</span>
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
  </ZModal>
</template>

<script>
import { gql } from "@apollo/client/core";
import { useQuery } from "@vue/apollo-composable";
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser.vue";
import PLAYER_INDIVIDUAL_ANALYSIS from "~/graphql/dashboard/query/playerIndividualAnalysis.graphql";

export default {
  name: "ZPlayerStatsModal",
  components: {
    ZModal,
    ZUser,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    playerId: {
      type: [String, Number],
      required: false,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      playerData: null,
      loadingData: false,
      errorMessage: null,
    };
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.playerId) {
        this.loadPlayerStats();
      } else {
        this.playerData = null;
        this.errorMessage = null;
      }
    },
    playerId() {
      if (this.modelValue && this.playerId) {
        this.loadPlayerStats();
      }
    },
  },
  mounted() {
    if (this.modelValue && this.playerId) {
      this.loadPlayerStats();
    }
  },
  computed: {
    loading() {
      return this.loadingData;
    },
  },
  methods: {
    async loadPlayerStats() {
      if (!this.playerId) return;

      this.loadingData = true;
      this.errorMessage = null;
      this.playerData = null;

      try {
        const query = gql`
          ${PLAYER_INDIVIDUAL_ANALYSIS}
        `;

        const variables = {
          playerId: String(this.playerId),
        };

        // Usar useAsyncQuery do Nuxt que executa a query de forma assíncrona
        const { data } = await useAsyncQuery(query, variables);

        this.loadingData = false;

        if (data?.value?.playerIndividualAnalysis) {
          this.playerData = data.value.playerIndividualAnalysis;
        } else {
          this.errorMessage = "Nenhum dado encontrado para este jogador.";
        }
      } catch (error) {
        this.loadingData = false;
        this.errorMessage = error.message || "Erro ao carregar estatísticas do jogador.";
        console.error("Erro ao carregar estatísticas:", error);
      }
    },
    closeModal() {
      this.$emit("update:modelValue", false);
    },
    formatPercentage(value) {
      return `${Math.round(value)}%`;
    },
    getPercentage(part, total) {
      if (total === 0) return 0;
      return (part / total) * 100;
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

.player-stats-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.player-header-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.main-stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.presence-value {
  color: #28a745;
}

.trainings-value {
  color: #e9742b;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.stat-description {
  font-size: 12px;
  color: #9e9e9e;
  line-height: 1.4;
}

.info-icon {
  cursor: help;
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: #e9742b;
}

.info-popover-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: white;
}

.positions-section,
.fundamentals-section {
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 16px 0;
}

.positions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.position-tag {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background-color: #fff4ec;
  border: 1px solid #e9742b;
  color: #e9742b;
}

.position-tag.empty {
  background-color: #f5f5f5;
  border-color: #9e9e9e;
  color: #9e9e9e;
}

.fundamentals-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.top3-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #e9742b;
  color: white;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
}

.fundamental-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.empty-fundamentals {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #9e9e9e;
  font-size: 14px;
}

@media (max-width: 768px) {
  .main-stats-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 28px;
  }
}
</style>

