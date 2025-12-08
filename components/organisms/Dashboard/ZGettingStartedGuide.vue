<template>
  <div class="getting-started-guide">
    <div class="welcome-section">
      <h1 class="welcome-title">
        Bem-vindo ao <span class="highlight">VolleyTrack</span>!
      </h1>
      <p class="welcome-subtitle">
        Comece a gerenciar suas equipes de vôlei em minutos.
        <br />
        <strong
          >Quanto mais você configurar, mais completo será o acompanhamento da
          sua equipe!</strong
        >
      </p>
    </div>

    <div class="progress-section">
      <h2 class="progress-title">Progresso da Configuração</h2>
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ progress }}% concluído</p>
    </div>

    <div class="steps-section">
      <div
        class="step-card"
        :class="{ completed: steps.registerPlayers.completed }"
      >
        <div class="step-icon">
          <va-icon
            name="check"
            color="#28A745"
            v-if="steps.registerPlayers.completed"
          />
          <va-icon name="person-add" color="#E9742B" v-else />
        </div>
        <div class="step-content">
          <h3 class="step-title">Registrar Jogadores</h3>
          <p class="step-description">Adicione os jogadores da sua equipe.</p>
        </div>
        <div
          v-if="steps.registerPlayers.completed"
          class="status-tag status-completed"
        >
          ✓ Concluído
        </div>
        <va-button v-else color="orange" @click="navigateTo('/players')">
          Adicionar
        </va-button>
      </div>

      <div
        class="step-card"
        :class="{ completed: steps.registerTeams.completed }"
      >
        <div class="step-icon">
          <va-icon
            name="check"
            color="#28A745"
            v-if="steps.registerTeams.completed"
          />
          <va-icon name="group" color="#E9742B" v-else />
        </div>
        <div class="step-content">
          <h3 class="step-title">Registrar Times</h3>
          <p class="step-description">Organize seus times.</p>
        </div>
        <div
          v-if="steps.registerTeams.completed"
          class="status-tag status-completed"
        >
          ✓ Concluído
        </div>
        <va-button v-else color="orange" @click="navigateTo('/teams')">
          Adicionar
        </va-button>
      </div>

      <div
        class="step-card"
        :class="{ completed: steps.registerTrainings.completed }"
      >
        <div class="step-icon">
          <va-icon
            name="check"
            color="#28A745"
            v-if="steps.registerTrainings.completed"
          />
          <va-icon name="schedule" color="#6C757D" v-else />
        </div>
        <div class="step-content">
          <h3 class="step-title">Registrar Treinos</h3>
          <p class="step-description">Planeje e registre os treinos.</p>
        </div>
        <div
          v-if="steps.registerTrainings.completed"
          class="status-tag status-completed"
        >
          ✓ Concluído
        </div>
        <va-button
          v-else
          :color="steps.registerTeams.completed ? 'orange' : 'secondary'"
          :disabled="!steps.registerTeams.completed"
          @click="navigateTo('/trainings')"
        >
          Adicionar
        </va-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      progress: 33, // Progresso da configuração
      steps: {
        registerPlayers: { completed: true },
        registerTeams: { completed: false },
        registerTrainings: { completed: false },
      },
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.getting-started-guide {
  background-color: #f8f9fa; /* Mantém a mesma cor de fundo */
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-section {
  margin-bottom: 40px;
  max-width: 800px;
}

.welcome-title {
  font-size: 32px;
  font-weight: bold;
  color: #0b1e3a;
}

.highlight {
  color: #e9742b;
}

.welcome-subtitle {
  font-size: 18px;
  color: #6c757d;
}

.progress-section {
  margin-bottom: 40px;
  max-width: 600px;
  width: 100%;
}

.progress-title {
  font-size: 20px;
  font-weight: bold;
  color: #0b1e3a;
}

.progress-bar {
  background-color: #e9ecef;
  border-radius: 8px;
  height: 12px;
  margin: 10px auto;
  width: 100%;
  position: relative;
}

.progress-bar-fill {
  background-color: #e9742b;
  height: 100%;
  border-radius: 8px;
}

.progress-text {
  font-size: 16px;
  color: #6c757d;
}

.steps-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  width: 100%;
}

.step-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-card.completed {
  border-left: 4px solid #28a745;
}

.step-icon {
  flex-shrink: 0;
  margin-right: 20px;
}

.step-content {
  flex-grow: 1;
  text-align: left;
}

.step-title {
  font-size: 18px;
  font-weight: bold;
  color: #0b1e3a;
}

.step-description {
  font-size: 14px;
  color: #6c757d;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
}

.status-completed {
  background-color: #e8f8f1;
  color: #28a745;
}
</style>
