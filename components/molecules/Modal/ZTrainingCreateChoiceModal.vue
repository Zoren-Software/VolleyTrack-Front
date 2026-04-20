<template>
  <VaModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    size="small"
    close-button
    hide-default-actions
    class="training-create-choice-modal"
  >
    <template #header>
      <h5 class="modal-title">Cadastrar treino</h5>
    </template>

    <p class="modal-lead">
      Escolha como deseja cadastrar. Você pode criar um treino avulso ou gerar
      vários treinos no calendário.
    </p>

    <div class="choice-options">
      <button type="button" class="choice-card choice-card--primary" @click="onSingle">
        <va-icon name="event" class="choice-icon" />
        <div class="choice-text">
          <span class="choice-title">Novo treino</span>
          <span class="choice-desc">
            Um treino com data, horário e detalhes definidos na hora.
          </span>
        </div>
      </button>

      <button type="button" class="choice-card choice-card--secondary" @click="onScheduled">
        <va-icon name="event_repeat" class="choice-icon" />
        <div class="choice-text">
          <span class="choice-title">Treinos programados</span>
          <span class="choice-desc">
            Período, dias da semana e horários para criar vários treinos de uma
            vez.
          </span>
        </div>
      </button>
    </div>
  </VaModal>
</template>

<script>
export default {
  name: "ZTrainingCreateChoiceModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "select-single", "select-scheduled"],
  methods: {
    onSingle() {
      this.$emit("update:modelValue", false);
      this.$emit("select-single");
    },
    onScheduled() {
      this.$emit("update:modelValue", false);
      this.$emit("select-scheduled");
    },
  },
};
</script>

<style scoped>
.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0b1e3a;
}

.modal-lead {
  margin: 0 0 1.25rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #4b5563;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  text-align: left;
  gap: 12px;
  width: 100%;
  padding: 16px 18px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease,
    background-color 0.15s ease;
  font: inherit;
}

.choice-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 14px rgba(11, 30, 58, 0.08);
}

.choice-card:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.choice-card--primary:hover {
  border-color: rgba(255, 78, 27, 0.45);
  background: #fff8f5;
}

.choice-card--secondary:hover {
  border-color: rgba(107, 114, 128, 0.5);
  background: #f9fafb;
}

.choice-icon {
  flex-shrink: 0;
  font-size: 26px;
  line-height: 1;
  margin-top: 2px;
  color: #6b7280;
}

.choice-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.choice-card--primary .choice-icon {
  color: #ff4e1b;
}

.choice-title {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  line-height: 1.3;
}

.choice-desc {
  font-size: 0.875rem;
  line-height: 1.45;
  color: #6b7280;
}
</style>
