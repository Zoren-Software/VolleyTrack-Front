<template>
  <div class="technical-scout">
    <!-- Sidebar - Lista de Jogadores -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Jogadores</h2>
      </div>
      <div class="players-list">
        <div
          v-for="player in players"
          :key="player.id"
          class="player-item mr-3"
          :class="{ 'player-selected': selectedPlayer?.id === player.id }"
          @click="selectPlayer(player)"
        >
          <ZAvatar
            :src="player.avatar"
            :fallback-text="getInitials(player.name)"
            size="medium"
            class="player-avatar"
          />
          <div class="player-info">
            <span class="player-name">{{ player.name }}</span>
            <span class="player-position">{{ player.position }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="main-content" v-if="selectedPlayer">
      <!-- Cabeçalho do Jogador -->
      <div class="player-header">
        <ZAvatar
          :src="selectedPlayer.avatar"
          :fallback-text="getInitials(selectedPlayer.name)"
          size="large"
          class="header-avatar"
        />
        <div class="header-info">
          <h1 class="player-name">{{ selectedPlayer.name }}</h1>
          <span class="player-position">{{ selectedPlayer.position }}</span>
        </div>
      </div>

      <!-- Cards dos Fundamentos -->
      <div class="fundamentals-grid">
        <ZFundamentalCard
          v-for="fundamental in fundamentals"
          :key="fundamental.id"
          :fundamental="fundamental"
          :evaluation="getEvaluation(fundamental.id)"
          @update-evaluation="updateEvaluation"
        />
      </div>

      <!-- Resumo da Avaliação -->
      <div class="summary-section">
        <ZEvaluationSummary :evaluations="currentPlayerEvaluations" />
      </div>

      <!-- Observações Técnicas -->
      <div class="observations-section">
        <h3 class="section-title">Observações Técnicas</h3>
        <va-textarea
          v-model="observations"
          placeholder="Digite suas observações técnicas sobre o jogador..."
          :rows="4"
          class="observations-textarea"
        />
      </div>

      <!-- Botão Salvar -->
      <div class="save-section">
        <ZButton
          color="success"
          size="large"
          @click="saveEvaluation"
          :loading="saving"
        >
          <template #default>
            <va-icon name="save" class="mr-2" />
            Salvar Avaliação
          </template>
        </ZButton>
      </div>
    </div>

    <!-- Estado vazio quando nenhum jogador está selecionado -->
    <div class="empty-state" v-else>
      <div class="empty-content">
        <va-icon name="users" size="large" color="primary" />
        <h2>Selecione um Jogador</h2>
        <p>Escolha um jogador da lista para começar a avaliação técnica</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ZAvatar from "~/components/atoms/Avatar/ZAvatar.vue";
import ZButton from "~/components/atoms/Buttons/ZButton.vue";
import ZFundamentalCard from "~/components/molecules/Cards/ZFundamentalCard.vue";
import ZEvaluationSummary from "~/components/molecules/Cards/ZEvaluationSummary.vue";

// Props
const props = defineProps({
  initialPlayers: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["save-evaluation"]);

// Reactive data
const selectedPlayer = ref(null);
const observations = ref("");
const saving = ref(false);

// Dados dos jogadores
const players = ref([
  {
    id: 1,
    name: "Maicon Cerutti",
    position: "Levantador",
    avatar: "",
  },
  {
    id: 2,
    name: "Lucas Almeida",
    position: "Ponteiro",
    avatar: "",
  },
  {
    id: 3,
    name: "Ana Paula",
    position: "Central",
    avatar: "",
  },
  {
    id: 4,
    name: "Juliana Prado",
    position: "Oposto",
    avatar: "",
  },
]);

// Dados dos fundamentos
const fundamentals = ref([
  {
    id: "saque",
    name: "Saque",
    icon: "sports_handball",
    legend: {
      a: "Ponto direto",
      b: "Saque regular (adversário fez passe)",
      c: "Erro no saque (rede ou fora)",
    },
  },
  {
    id: "recepcao",
    name: "Recepção",
    icon: "scuba_diving",
    legend: {
      a: "Passe perfeito.",
      b: "Passe regular (fora do centro)",
      c: "Passe ruim",
    },
  },
  {
    id: "ataque",
    name: "Ataque",
    icon: "electric_bolt",
    legend: {
      a: "Ponto direto",
      b: "Ataque regular (adversário defendeu)",
      c: "Erro no ataque (fora, rede, bloqueio)",
    },
  },
  {
    id: "bloqueio",
    name: "Bloqueio",
    icon: "do_not_touch",
    legend: {
      a: "Ponto direto",
      b: "Bloqueio regular (bola seguiu)",
      c: "Erro no bloqueio (ponto contra)",
    },
  },
  {
    id: "defesa",
    name: "Defesa",
    icon: "shield",
    legend: {
      a: "Passe perfeito",
      b: "Defesa razoável",
      c: "Passe ruim (ponto perdido)",
    },
  },
  {
    id: "levantamento",
    name: "Levantamento",
    icon: "sign_language",
    legend: {
      a: "Ideal, sem bloqueio",
      b: "Previsível, com bloqueio",
      c: "Erro no levantamento (impreciso)",
    },
  },
]);

// Avaliações por jogador e fundamento
const evaluations = ref({});

// Methods
const selectPlayer = (player) => {
  selectedPlayer.value = player;
  observations.value = "";
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getEvaluation = (fundamentalId) => {
  if (!selectedPlayer.value) return { a: 0, b: 0, c: 0 };

  const key = `${selectedPlayer.value.id}-${fundamentalId}`;
  return evaluations.value[key] || { a: 0, b: 0, c: 0 };
};

const updateEvaluation = (fundamentalId, type, value) => {
  if (!selectedPlayer.value) return;

  const key = `${selectedPlayer.value.id}-${fundamentalId}`;
  if (!evaluations.value[key]) {
    evaluations.value[key] = { a: 0, b: 0, c: 0 };
  }

  evaluations.value[key][type] = Math.max(0, value);
};

const getCurrentPlayerEvaluations = () => {
  if (!selectedPlayer.value) return {};

  const playerEvaluations = {};
  fundamentals.value.forEach((fundamental) => {
    const key = `${selectedPlayer.value.id}-${fundamental.id}`;
    playerEvaluations[fundamental.id] = evaluations.value[key] || {
      a: 0,
      b: 0,
      c: 0,
    };
  });

  return playerEvaluations;
};

const currentPlayerEvaluations = computed(() => {
  return getCurrentPlayerEvaluations();
});

const saveEvaluation = async () => {
  if (!selectedPlayer.value) return;

  saving.value = true;

  try {
    const evaluationData = {
      playerId: selectedPlayer.value.id,
      playerName: selectedPlayer.value.name,
      evaluations: {},
      observations: observations.value,
      timestamp: new Date().toISOString(),
    };

    // Coletar todas as avaliações do jogador
    fundamentals.value.forEach((fundamental) => {
      const key = `${selectedPlayer.value.id}-${fundamental.id}`;
      evaluationData.evaluations[fundamental.id] = evaluations.value[key] || {
        a: 0,
        b: 0,
        c: 0,
      };
    });

    emit("save-evaluation", evaluationData);

    // Limpar observações após salvar
    observations.value = "";
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.technical-scout {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 300px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.players-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.player-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.player-item:hover {
  background-color: #f8f9fa;
}

.player-selected {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.player-avatar {
  margin-right: 12px;
}

.player-info {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.player-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.player-position {
  font-size: 0.875rem;
  color: #666;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.player-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-avatar {
  margin-right: 20px;
}

.header-info .player-name {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 4px;
  padding-left: 10px;
}

.header-info .player-position {
  font-size: 1.125rem;
  color: #666;
  padding-left: 10px;
}

.fundamentals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.summary-section {
  margin-bottom: 24px;
}

.observations-section {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.observations-textarea {
  width: 100%;
}

.save-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.empty-content {
  text-align: center;
  color: #666;
}

.empty-content h2 {
  margin: 16px 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-content p {
  margin: 0;
  font-size: 1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .technical-scout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }

  .fundamentals-grid {
    grid-template-columns: 1fr;
  }

  .player-header {
    flex-direction: column;
    text-align: center;
  }

  .header-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
