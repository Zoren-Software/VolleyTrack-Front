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
          <ZUser :data="player" />
        </div>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="main-content" v-if="selectedPlayer">
      <!-- Cabeçalho do Jogador -->
      <div class="player-header">
        <ZUser :data="selectedPlayer" />
      </div>

      <!-- Cards dos Fundamentos -->
      <div class="fundamentals-grid">
        <ZFundamentalCard
          v-for="fundamental in fundamentals"
          :key="fundamental.id"
          :fundamental="fundamental"
          :evaluation="getEvaluation(fundamental.id)"
          :feedback="
            fundamentalFeedbacks[selectedPlayer.id]?.[fundamental.id] || ''
          "
          @update-evaluation="updateEvaluation"
          @update-feedback="updateFundamentalFeedback"
        />
      </div>

      <!-- Observações Técnicas -->
      <div class="observations-section">
        <h3 class="section-title">Observações Técnicas Gerais</h3>
        <va-textarea
          v-model="observations"
          placeholder="Digite suas observações técnicas sobre o jogador..."
          :rows="4"
          class="observations-textarea"
          @input="updateObservations"
        />
      </div>

      <!-- Feedback -->
      <div class="feedback-section">
        <h3 class="section-title">Feedback</h3>
        <va-textarea
          v-model="feedback"
          placeholder="Digite seu feedback sobre o desempenho do jogador..."
          :rows="4"
          class="feedback-textarea"
          @input="updateFeedback"
        />
      </div>

      <!-- Resumo da Avaliação -->
      <div class="summary-section">
        <ZEvaluationSummary :evaluations="currentPlayerEvaluations" />
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import ZButton from "~/components/atoms/Buttons/ZButton.vue";
import ZFundamentalCard from "~/components/molecules/Cards/ZFundamentalCard.vue";
import ZEvaluationSummary from "~/components/molecules/Cards/ZEvaluationSummary.vue";
import ZUser from "~/components/molecules/Selects/Slots/ZUser.vue";
import TRAINING from "~/graphql/training/query/training.graphql";
import SCOUTFUNDAMENTALTRAININGEDIT from "~/graphql/training/mutation/scoutFundamentalTrainingEdit.graphql";
import { showSuccessToast } from "~/utils/sweetAlert2/swalHelper.js";

// Props
const props = defineProps({
  initialPlayers: {
    type: Array,
    default: () => [],
  },
  trainingId: {
    type: String,
    required: false,
  },
  isInsideTrainingForm: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["save-evaluation"]);

// Reactive data
const selectedPlayer = ref(null);
const observations = ref("");
const feedback = ref("");
const saving = ref(false);
const currentScoutId = ref(null);
const data = ref({});
const playerObservations = ref({}); // Armazenar observações por jogador
const playerFeedback = ref({}); // Armazenar feedback por jogador
const fundamentalFeedbacks = ref({}); // Armazenar feedbacks dos fundamentais por jogador
const feedbackDebounceTimers = ref({}); // Timers para debounce dos feedbacks
const generalFieldsDebounceTimers = ref({}); // Timers para debounce dos campos gerais
const evaluationDebounceTimers = ref({}); // Timers para debounce das avaliações

const getTraining = (fetchPolicyOptions = {}) => {
  if (!props.trainingId) return;

  const query = gql`
    ${TRAINING}
  `;

  const consult = {
    id: props.trainingId,
  };

  const {
    result: { value },
  } = useQuery(query, consult);

  const { onResult } = useQuery(query, consult, {
    fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first",
  });

  onResult((result) => {
    if (result?.data?.training) {
      // Armazenar dados completos do treino
      data.value = result.data.training;

      // Transformar confirmationsTraining em players
      const trainingPlayers =
        result.data.training.confirmationsTraining?.map((confirmation) => ({
          id: confirmation.player.id,
          name: confirmation.player.name,
          email: confirmation.player.email,
          position: confirmation.player.positions?.[0]?.name || "N/A",
        })) || [];

      players.value = trainingPlayers;

      // Carregar dados de scout salvos
      if (result.data.training.scoutFundamentalsTraining) {
        loadSavedScoutData(result.data.training.scoutFundamentalsTraining);
      }
    }
  });

  if (value) {
    if (value?.training) {
      // Armazenar dados completos do treino
      data.value = value.training;

      const trainingPlayers =
        value.training.confirmationsTraining?.map((confirmation) => ({
          id: confirmation.player.id,
          name: confirmation.player.name,
          email: confirmation.player.email,
          position: confirmation.player.positions?.[0]?.name || "N/A",
        })) || [];

      players.value = trainingPlayers;

      // Carregar dados de scout salvos
      if (value.training.scoutFundamentalsTraining) {
        loadSavedScoutData(value.training.scoutFundamentalsTraining);
      }
    }
  }
};

// Função para carregar dados de scout salvos
const loadSavedScoutData = (scoutData) => {
  scoutData.forEach((scout) => {
    const playerId = scout.playerId;

    // Mapear os dados de scout para o formato esperado pelos componentes
    const playerEvaluations = {
      saque: {
        a: scout.scoutsServe?.[0]?.total_a || 0,
        b: scout.scoutsServe?.[0]?.total_b || 0,
        c: scout.scoutsServe?.[0]?.total_c || 0,
      },
      recepcao: {
        a: scout.scoutsReception?.[0]?.total_a || 0,
        b: scout.scoutsReception?.[0]?.total_b || 0,
        c: scout.scoutsReception?.[0]?.total_c || 0,
      },
      ataque: {
        a: scout.scoutsAttack?.[0]?.total_a || 0,
        b: scout.scoutsAttack?.[0]?.total_b || 0,
        c: scout.scoutsAttack?.[0]?.total_c || 0,
      },
      bloqueio: {
        a: scout.scoutsBlock?.[0]?.total_a || 0,
        b: scout.scoutsBlock?.[0]?.total_b || 0,
        c: scout.scoutsBlock?.[0]?.total_c || 0,
      },
      defesa: {
        a: scout.scoutsDefense?.[0]?.total_a || 0,
        b: scout.scoutsDefense?.[0]?.total_b || 0,
        c: scout.scoutsDefense?.[0]?.total_c || 0,
      },
      levantamento: {
        a: scout.scoutsSetAssist?.[0]?.total_a || 0,
        b: scout.scoutsSetAssist?.[0]?.total_b || 0,
        c: scout.scoutsSetAssist?.[0]?.total_c || 0,
      },
    };

    // Salvar as avaliações no estado local
    fundamentals.value.forEach((fundamental) => {
      const key = `${playerId}-${fundamental.id}`;
      evaluations.value[key] = playerEvaluations[fundamental.id];
    });

    // Armazenar o ID do scout para o jogador selecionado
    if (
      selectedPlayer.value &&
      parseInt(selectedPlayer.value.id) === parseInt(playerId)
    ) {
      currentScoutId.value = scout.id;
    }

    // Carregar observações e feedback salvos
    if (
      scout.technicalSpecificObservations !== null &&
      scout.technicalSpecificObservations !== undefined
    ) {
      playerObservations.value[playerId] = scout.technicalSpecificObservations;
    }
    if (scout.feedback !== null && scout.feedback !== undefined) {
      playerFeedback.value[playerId] = scout.feedback;
    }

    // Se o jogador selecionado for o mesmo que está sendo carregado, atualizar os campos
    if (
      selectedPlayer.value &&
      parseInt(selectedPlayer.value.id) === parseInt(playerId)
    ) {
      observations.value = playerObservations.value[playerId] || "";
      feedback.value = playerFeedback.value[playerId] || "";
    }
  });
};

// Chamar getTraining quando o componente for montado
onMounted(() => {
  getTraining({ fetchPolicy: "network-only" });

  // Adicionar listener para salvar dados quando o usuário sair da página
  window.addEventListener("beforeunload", handleBeforeUnload);
});

// Handler para salvar dados antes de sair da página
const handleBeforeUnload = async (event) => {
  if (selectedPlayer.value) {
    playerObservations.value[selectedPlayer.value.id] = observations.value;
    playerFeedback.value[selectedPlayer.value.id] = feedback.value;
    fundamentalFeedbacks.value[selectedPlayer.value.id] = {
      ...fundamentalFeedbacks.value[selectedPlayer.value.id],
    };

    // Forçar salvamento síncrono (sem notificação)
    try {
      await saveScoutEvaluation(false);
    } catch (error) {
      console.error("Erro ao salvar antes de sair:", error);
    }
  }
};

// Cleanup dos timers quando o componente for desmontado
onUnmounted(async () => {
  // Remover listener do beforeunload
  window.removeEventListener("beforeunload", handleBeforeUnload);

  // Salvar dados do jogador atual antes de desmontar
  if (selectedPlayer.value) {
    playerObservations.value[selectedPlayer.value.id] = observations.value;
    playerFeedback.value[selectedPlayer.value.id] = feedback.value;
    fundamentalFeedbacks.value[selectedPlayer.value.id] = {
      ...fundamentalFeedbacks.value[selectedPlayer.value.id],
    };

    // Forçar salvamento final (sem notificação)
    await saveScoutEvaluation(false);
  }

  // Limpar todos os timers
  Object.values(feedbackDebounceTimers.value).forEach((timer) => {
    clearTimeout(timer);
  });
  feedbackDebounceTimers.value = {};

  Object.values(generalFieldsDebounceTimers.value).forEach((timer) => {
    clearTimeout(timer);
  });
  generalFieldsDebounceTimers.value = {};

  Object.values(evaluationDebounceTimers.value).forEach((timer) => {
    clearTimeout(timer);
  });
  evaluationDebounceTimers.value = {};
});

// defineExpose será movido para o final do script

// Dados dos jogadores
const players = ref([]);

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
const selectPlayer = async (player) => {
  // Se há um jogador selecionado atualmente, salvar seus dados imediatamente
  if (selectedPlayer.value) {
    // Salvar observações e feedback do jogador anterior
    playerObservations.value[selectedPlayer.value.id] = observations.value;
    playerFeedback.value[selectedPlayer.value.id] = feedback.value;
    fundamentalFeedbacks.value[selectedPlayer.value.id] = {
      ...fundamentalFeedbacks.value[selectedPlayer.value.id],
    };

    // Forçar salvamento imediato do jogador anterior (sem notificação)
    await saveScoutEvaluation(false);
  }

  // Limpar todos os timers de debounce antes de trocar de jogador
  Object.values(feedbackDebounceTimers.value).forEach((timer) => {
    clearTimeout(timer);
  });
  feedbackDebounceTimers.value = {};

  // Limpar todos os timers dos campos gerais
  Object.values(generalFieldsDebounceTimers.value).forEach((timer) => {
    clearTimeout(timer);
  });
  generalFieldsDebounceTimers.value = {};

  // Limpar todos os timers das avaliações
  Object.values(evaluationDebounceTimers.value).forEach((timer) => {
    clearTimeout(timer);
  });
  evaluationDebounceTimers.value = {};

  // Trocar para o novo jogador
  selectedPlayer.value = player;

  // Carregar observações e feedback do jogador selecionado
  observations.value = playerObservations.value[player.id] || "";
  feedback.value = playerFeedback.value[player.id] || "";

  // Carregar feedbacks dos fundamentais do jogador selecionado
  if (!fundamentalFeedbacks.value[player.id]) {
    fundamentalFeedbacks.value[player.id] = {};
  }

  // Buscar o ID do scout para o jogador selecionado
  if (props.trainingId && data.value?.scoutFundamentalsTraining) {
    const playerScout = data.value.scoutFundamentalsTraining.find(
      (scout) => parseInt(scout.playerId) === parseInt(player.id)
    );
    currentScoutId.value = playerScout?.id || null;
  }
};

const getEvaluation = (fundamentalId) => {
  if (!selectedPlayer.value) return { a: 0, b: 0, c: 0 };

  const key = `${selectedPlayer.value.id}-${fundamentalId}`;
  const evaluation = evaluations.value[key];

  // Retorna os dados salvos ou valores padrão
  return evaluation || { a: 0, b: 0, c: 0 };
};

const updateEvaluation = async (fundamentalId, type, value) => {
  if (!selectedPlayer.value) return;

  const key = `${selectedPlayer.value.id}-${fundamentalId}`;
  if (!evaluations.value[key]) {
    evaluations.value[key] = { a: 0, b: 0, c: 0 };
  }

  evaluations.value[key][type] = Math.max(0, value);

  // Criar chave única para o timer
  const timerKey = `${selectedPlayer.value.id}-${fundamentalId}`;

  // Limpar timer anterior se existir
  if (evaluationDebounceTimers.value[timerKey]) {
    clearTimeout(evaluationDebounceTimers.value[timerKey]);
  }

  // Criar novo timer com delay de 5 segundos
  evaluationDebounceTimers.value[timerKey] = setTimeout(async () => {
    // Salvar automaticamente após o delay
    await saveScoutEvaluation();
    // Mostrar notificação de sucesso
    showSuccessToast(
      "Pontuação salva automaticamente!",
      `Avaliações do ${
        fundamentals.value.find((f) => f.id === fundamentalId)?.name
      } foram salvas com sucesso.`
    );
    // Limpar o timer após executar
    delete evaluationDebounceTimers.value[timerKey];
  }, 5000);
};

const updateFundamentalFeedback = async (fundamentalId, feedback) => {
  if (!selectedPlayer.value) return;

  if (!fundamentalFeedbacks.value[selectedPlayer.value.id]) {
    fundamentalFeedbacks.value[selectedPlayer.value.id] = {};
  }
  fundamentalFeedbacks.value[selectedPlayer.value.id][fundamentalId] = feedback;

  // Criar chave única para o timer
  const timerKey = `${selectedPlayer.value.id}-${fundamentalId}`;

  // Limpar timer anterior se existir
  if (feedbackDebounceTimers.value[timerKey]) {
    clearTimeout(feedbackDebounceTimers.value[timerKey]);
  }

  // Criar novo timer com delay de 5 segundos
  feedbackDebounceTimers.value[timerKey] = setTimeout(async () => {
    // Salvar automaticamente após o delay
    await saveScoutEvaluation();
    // Mostrar notificação de sucesso
    showSuccessToast(
      "Feedback salvo automaticamente!",
      "Informações do fundamento foram salvas com sucesso."
    );
    // Limpar o timer após executar
    delete feedbackDebounceTimers.value[timerKey];
  }, 5000);
};

const updateObservations = async () => {
  if (!selectedPlayer.value) return;

  // Salvar observações no estado local
  playerObservations.value[selectedPlayer.value.id] = observations.value;

  // Criar chave única para o timer
  const timerKey = `${selectedPlayer.value.id}-observations`;

  // Limpar timer anterior se existir
  if (generalFieldsDebounceTimers.value[timerKey]) {
    clearTimeout(generalFieldsDebounceTimers.value[timerKey]);
  }

  // Criar novo timer com delay de 5 segundos
  generalFieldsDebounceTimers.value[timerKey] = setTimeout(async () => {
    // Salvar automaticamente após o delay
    await saveScoutEvaluation();
    // Mostrar notificação de sucesso
    showSuccessToast(
      "Observações salvas automaticamente!",
      "Observações técnicas gerais foram salvas com sucesso."
    );
    // Limpar o timer após executar
    delete generalFieldsDebounceTimers.value[timerKey];
  }, 5000);
};

const updateFeedback = async () => {
  if (!selectedPlayer.value) return;

  // Salvar feedback no estado local
  playerFeedback.value[selectedPlayer.value.id] = feedback.value;

  // Criar chave única para o timer
  const timerKey = `${selectedPlayer.value.id}-feedback`;

  // Limpar timer anterior se existir
  if (generalFieldsDebounceTimers.value[timerKey]) {
    clearTimeout(generalFieldsDebounceTimers.value[timerKey]);
  }

  // Criar novo timer com delay de 5 segundos
  generalFieldsDebounceTimers.value[timerKey] = setTimeout(async () => {
    // Salvar automaticamente após o delay
    await saveScoutEvaluation();
    // Mostrar notificação de sucesso
    showSuccessToast(
      "Feedback salvo automaticamente!",
      "Feedback geral foi salvo com sucesso."
    );
    // Limpar o timer após executar
    delete generalFieldsDebounceTimers.value[timerKey];
  }, 5000);
};

// Método para forçar o save de todos os scouts pendentes
const forceSaveAllScouts = async () => {
  console.log(
    "DEBUG - forceSaveAllScouts: Iniciando save forçado de todos os scouts"
  );

  // Salvar dados do jogador atual antes de processar todos
  if (selectedPlayer.value) {
    playerObservations.value[selectedPlayer.value.id] = observations.value;
    playerFeedback.value[selectedPlayer.value.id] = feedback.value;
    fundamentalFeedbacks.value[selectedPlayer.value.id] = {
      ...fundamentalFeedbacks.value[selectedPlayer.value.id],
    };
  }

  // Limpar todos os timers pendentes
  Object.keys(generalFieldsDebounceTimers.value).forEach((key) => {
    if (generalFieldsDebounceTimers.value[key]) {
      clearTimeout(generalFieldsDebounceTimers.value[key]);
      delete generalFieldsDebounceTimers.value[key];
    }
  });

  // Salvar o jogador atual imediatamente
  if (selectedPlayer.value) {
    await saveScoutEvaluation(true);
  }

  console.log("DEBUG - forceSaveAllScouts: Save forçado concluído");
};

const saveScoutEvaluation = async (showNotification = true) => {
  if (!selectedPlayer.value || !props.trainingId) return;

  console.log(
    "DEBUG - saveScoutEvaluation: Iniciando save para jogador:",
    selectedPlayer.value.id
  );
  console.log(
    "DEBUG - saveScoutEvaluation: Observações atuais:",
    observations.value
  );
  console.log("DEBUG - saveScoutEvaluation: Feedback atual:", feedback.value);

  try {
    const query = gql`
      ${SCOUTFUNDAMENTALTRAININGEDIT}
    `;

    // Salvar observações e feedback do jogador atual
    playerObservations.value[selectedPlayer.value.id] = observations.value;
    playerFeedback.value[selectedPlayer.value.id] = feedback.value;

    // Salvar feedbacks dos fundamentais do jogador atual
    if (!fundamentalFeedbacks.value[selectedPlayer.value.id]) {
      fundamentalFeedbacks.value[selectedPlayer.value.id] = {};
    }

    // Obter todas as avaliações do jogador selecionado
    const playerEvaluations = {};
    fundamentals.value.forEach((fundamental) => {
      const key = `${selectedPlayer.value.id}-${fundamental.id}`;
      playerEvaluations[fundamental.id] = evaluations.value[key] || {
        a: 0,
        b: 0,
        c: 0,
      };
    });

    // Verificar se já existe um scout para este jogador
    const existingScout = data.value?.scoutFundamentalsTraining?.find(
      (scout) => parseInt(scout.playerId) === parseInt(selectedPlayer.value.id)
    );

    // Se não existe scout, não podemos editar - os dados devem existir automaticamente
    if (!existingScout) {
      return;
    }

    const variables = {
      id: existingScout.id, // Usar o ID real do scout existente
      playerId: parseInt(selectedPlayer.value.id),
      trainingId: parseInt(props.trainingId),
      positionId: parseInt(existingScout.player.positions[0]?.id) || 1, // Usar o positionId do jogador
      technicalSpecificObservations: String(
        playerObservations.value[selectedPlayer.value.id] || ""
      ),
      feedback: String(playerFeedback.value[selectedPlayer.value.id] || ""),
      attackTotalA: playerEvaluations.ataque.a,
      attackTotalB: playerEvaluations.ataque.b,
      attackTotalC: playerEvaluations.ataque.c,
      attackFeedback: String(
        fundamentalFeedbacks.value[selectedPlayer.value.id]?.ataque || ""
      ),
      blockTotalA: playerEvaluations.bloqueio.a,
      blockTotalB: playerEvaluations.bloqueio.b,
      blockTotalC: playerEvaluations.bloqueio.c,
      blockFeedback: String(
        fundamentalFeedbacks.value[selectedPlayer.value.id]?.bloqueio || ""
      ),
      defenseTotalA: playerEvaluations.defesa.a,
      defenseTotalB: playerEvaluations.defesa.b,
      defenseTotalC: playerEvaluations.defesa.c,
      defenseFeedback: String(
        fundamentalFeedbacks.value[selectedPlayer.value.id]?.defesa || ""
      ),
      receptionTotalA: playerEvaluations.recepcao.a,
      receptionTotalB: playerEvaluations.recepcao.b,
      receptionTotalC: playerEvaluations.recepcao.c,
      receptionFeedback: String(
        fundamentalFeedbacks.value[selectedPlayer.value.id]?.recepcao || ""
      ),
      serveTotalA: playerEvaluations.saque.a,
      serveTotalB: playerEvaluations.saque.b,
      serveTotalC: playerEvaluations.saque.c,
      serveFeedback: String(
        fundamentalFeedbacks.value[selectedPlayer.value.id]?.saque || ""
      ),
      setAssistTotalA: playerEvaluations.levantamento.a,
      setAssistTotalB: playerEvaluations.levantamento.b,
      setAssistTotalC: playerEvaluations.levantamento.c,
      setAssistFeedback: String(
        fundamentalFeedbacks.value[selectedPlayer.value.id]?.levantamento || ""
      ),
    };

    //console.log("Variáveis para mutation:", variables);

    const { mutate } = await useMutation(query, { variables });

    const { data: resultData } = await mutate();

    // Scout salvo com sucesso
    if (showNotification) {
      showSuccessToast(
        "Scout salvo com sucesso!",
        "Dados do jogador foram salvos automaticamente."
      );
    }
  } catch (error) {
    console.error("Erro ao salvar scout:", error);
  }
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

    // Preparar dados no formato da API
    const apiData = {
      trainingId: props.trainingId,
      playerId: selectedPlayer.value.id,
      scoutsServe: [evaluationData.evaluations.saque],
      scoutsReception: [evaluationData.evaluations.recepcao],
      scoutsAttack: [evaluationData.evaluations.ataque],
      scoutsBlock: [evaluationData.evaluations.bloqueio],
      scoutsDefense: [evaluationData.evaluations.defesa],
      scoutsSetAssist: [evaluationData.evaluations.levantamento],
    };

    emit("save-evaluation", { ...evaluationData, apiData });

    // Limpar observações após salvar
    observations.value = "";
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
  } finally {
    saving.value = false;
  }
};

// Expor métodos para uso externo
defineExpose({
  forceSaveAllScouts,
});
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

.feedback-section {
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

.feedback-textarea {
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
