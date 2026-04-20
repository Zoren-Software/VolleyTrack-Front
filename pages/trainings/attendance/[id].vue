<template>
  <div class="attendance-page">
    <div class="page-header">
      <h1 class="title">Lista de Presença</h1>
      <p class="subtitle">
        Métricas de intenção, presença real e confirmações do treino
      </p>
    </div>

    <ZTrainingAttendanceView :training-id="trainingIdParam" />

    <div class="page-actions">
      <va-button color="secondary" @click="goToTrainings">Voltar</va-button>
      <va-button preset="secondary" @click="goToDetails">Detalhes</va-button>
      <va-button color="primary" @click="goToEdit">Editar treino</va-button>
    </div>
  </div>
</template>

<script>
import ZTrainingAttendanceView from "~/components/organisms/Training/ZTrainingAttendanceView.vue";

export default {
  components: {
    ZTrainingAttendanceView,
  },
  computed: {
    trainingIdParam() {
      return this.$route.params.id;
    },
  },
  methods: {
    goToTrainings() {
      this.$router.push("/trainings");
    },
    goToDetails() {
      this.$router.push(`/trainings/details/${this.$route.params.id}`);
    },
    goToEdit() {
      this.$router.push(`/trainings/edit/${this.$route.params.id}`);
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Lista de Presença",
});
</script>

<style scoped>
.attendance-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.title {
  font-size: 30px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .page-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .page-actions :deep(.va-button) {
    width: 100%;
  }
}
</style>
