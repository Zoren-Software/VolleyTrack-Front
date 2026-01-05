<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Treinos</h1>
          <p class="page-subtitle">Gerencie todos os treinos do seu sistema</p>
        </div>
        <div class="header-buttons">
          <va-button
            color="#6B7280"
            class="bulk-create-button"
            @click="showBulkCreateModal = true"
          >
            <va-icon name="event_repeat" class="button-icon" />
            <span class="button-text">Cadastrar Treinos Futuros</span>
          </va-button>
          <va-button
            color="#E9742B"
            class="new-item-button"
            @click="addTraining"
          >
            <va-icon name="add" class="button-icon" />
            <span class="button-text">Novo Treino</span>
          </va-button>
        </div>
      </div>
    </div>

    <!-- Datatable Component -->
    <ZDatatablesTraining />

    <!-- Modal de Cadastro em Massa -->
    <ZTrainingBulkCreateModal
      v-model="showBulkCreateModal"
      @success="handleBulkCreateSuccess"
    />
  </div>
</template>

<script>
import ZDatatablesTraining from "~/components/organisms/Datatables/Trainings/ZDatatablesTrainings.vue";
import ZTrainingBulkCreateModal from "~/components/molecules/Modal/ZTrainingBulkCreateModal.vue";

export default {
  components: {
    ZDatatablesTraining,
    ZTrainingBulkCreateModal,
  },
  data() {
    return {
      showBulkCreateModal: false,
    };
  },
  methods: {
    addTraining() {
      this.$router.push("/trainings/create");
    },
    handleBulkCreateSuccess() {
      // Recarregar a listagem de treinos
      this.$nextTick(() => {
        // O componente ZDatatablesTraining deve recarregar automaticamente
        // ou podemos emitir um evento se necessário
        window.location.reload();
      });
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Treinos",
});
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.header-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.bulk-create-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #6b7280 !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.bulk-create-button:hover {
  background-color: #4b5563 !important;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
  transform: translateY(-1px);
}

.bulk-create-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(107, 114, 128, 0.3);
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

.new-item-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #e9742b !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.new-item-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.4);
  transform: translateY(-1px);
}

.new-item-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.3);
}

.button-icon {
  font-size: 20px;
  color: white;
}

.button-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .header-buttons {
    width: 100%;
    flex-direction: column;
  }

  .new-item-button,
  .bulk-create-button {
    width: 100%;
  }
}
</style>
