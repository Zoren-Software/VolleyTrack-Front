<template>
  <div class="relation-container">
    <div class="filter-wrapper">
      <slot name="filter" />
      <ZButton
        v-if="!disableRelation && hasSelection"
        class="relation-button"
        color="primary"
        icon="add"
        size="medium"
        @click="add"
      >
        Relacionar
      </ZButton>
    </div>
    <slot name="list" />
  </div>
</template>

<script>
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  props: {
    disableRelation: {
      type: Boolean,
      default: false,
    },
    hasSelection: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ZButton,
  },
  emits: ["add"],
  methods: {
    add() {
      this.$emit("add");
    },
  },
};
</script>

<style scoped>
.relation-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-wrapper > :first-child {
  flex: 1;
  min-width: 200px;
}

.relation-button {
  flex-shrink: 0;
  white-space: nowrap;
  margin: 0 !important;
}

/* Ajuste para garantir que o botão fique alinhado com o input */
.filter-wrapper :deep(.va-input-wrapper) {
  flex: 1;
  margin-bottom: 0;
}

/* Ajuste para alinhar o botão com a altura do input */
.filter-wrapper :deep(.va-select) {
  margin-bottom: 0;
}

/* Ajustar tamanho do ícone do botão */
.relation-button :deep(.va-icon) {
  font-size: 14px !important;
  width: 14px !important;
  height: 14px !important;
}

/* Responsivo: em telas menores, botão vai para baixo */
@media (max-width: 768px) {
  .filter-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-wrapper > :first-child {
    width: 100%;
  }

  .relation-button {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
