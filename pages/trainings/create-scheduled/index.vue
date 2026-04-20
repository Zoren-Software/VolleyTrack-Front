<template>
  <div class="create-scheduled-page">
    <div class="page-header">
      <div class="title-row">
        <h1 class="title">Treinos programados</h1>
        <va-popover
          placement="bottom"
          trigger="hover"
          class="scheduled-info-popover"
        >
          <button
            type="button"
            class="scheduled-info-trigger"
            aria-label="Como os treinos programados são gerados"
          >
            <va-icon name="info_outline" size="28px" color="#FF4E1B" />
          </button>
          <template #body>
            <div class="scheduled-popover-body">
              <h3 class="scheduled-popover-title">Geração automática</h3>
              <p class="scheduled-popover-lead">
                Ao cadastrar um período, o sistema cria um treino para cada dia
                selecionado dentro do intervalo.
              </p>
              <ul class="scheduled-popover-list">
                <li>
                  <strong>Nome e descrição</strong> são preenchidos com um padrão
                  inicial e podem ser ajustados depois na edição.
                </li>
                <li>
                  <strong>Fundamentos</strong> são definidos na edição de cada
                  treino, se necessário.
                </li>
              </ul>
            </div>
          </template>
        </va-popover>
      </div>
      <p class="subtitle">
        Defina time, período, dias da semana e horários para gerar vários
        treinos de uma vez.
      </p>
    </div>

    <ZTrainingBulkCreateForm @cancel="goBack" @success="goBack" />
  </div>
</template>

<script>
import ZTrainingBulkCreateForm from "~/components/organisms/Forms/Training/ZTrainingBulkCreateForm.vue";

export default {
  components: {
    ZTrainingBulkCreateForm,
  },
  methods: {
    goBack() {
      this.$router.push("/trainings");
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Treinos programados",
});
</script>

<style scoped>
.create-scheduled-page {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 28px;
}

.title-row {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  color: #0b1e3a;
  margin: 0;
}

.scheduled-info-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: 0;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  line-height: 0;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.scheduled-info-trigger:hover {
  background: rgba(255, 78, 27, 0.1);
}

.scheduled-info-trigger:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.scheduled-popover-body {
  max-width: 320px;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 78, 27, 0.35);
  background: #fff4ec;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.12);
}

.scheduled-popover-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.01em;
}

.scheduled-popover-lead {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

/* Remove o "fundo preto" padrão do popover (conteúdo é teleported). */
:global(.scheduled-info-popover),
:global(.scheduled-info-popover .va-popover__content),
:global(.scheduled-info-popover .va-popover__content-wrapper),
:global(.scheduled-info-popover .va-popover__container),
:global(.scheduled-info-popover .va-popover__popover),
:global(.scheduled-info-popover .va-popover__inner) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}

.scheduled-popover-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  color: #374151;
}

.scheduled-popover-list li {
  margin-bottom: 8px;
}

.scheduled-popover-list li:last-child {
  margin-bottom: 0;
}

.subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}
</style>
