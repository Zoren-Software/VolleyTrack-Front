<template>
  <div class="action-menu">
    <va-popover
      placement="bottom-end"
      trigger="click"
      class="action-menu-popover"
      content-class="z-datatable-actions-popover-wrapper"
    >
      <va-button
        preset="plain"
        icon="more_vert"
        size="small"
        class="action-menu-trigger"
        :aria-label="`Abrir ações do registro ${id}`"
        @click.stop
      />

      <template #body>
        <div class="action-menu-panel" @click.stop>
          <button
            v-if="includeActionStatsList"
            type="button"
            class="action-menu-item"
            @click="emitStats(id)"
          >
            <va-icon name="visibility" size="16px" color="#6b7280" />
            <span>Ver estatísticas</span>
          </button>

          <button
            v-if="includeActionDetailsList"
            type="button"
            class="action-menu-item"
            @click="actionDetails(id)"
          >
            <va-icon name="visibility" size="16px" color="#6b7280" />
            <span>Detalhes</span>
          </button>

          <button
            v-if="includeActionAttendanceList"
            type="button"
            class="action-menu-item"
            @click="emitAttendanceList(id)"
          >
            <va-icon name="checklist" size="16px" color="#6b7280" />
            <span>Lista de Presença</span>
          </button>

          <button
            v-if="includeActionTechnicalAnalysis"
            type="button"
            class="action-menu-item"
            @click="emitTechnicalAnalysis(id)"
          >
            <va-icon name="analytics" size="16px" color="#6b7280" />
            <span>Análise Técnica</span>
          </button>

          <button
            v-if="includeActionEditList"
            type="button"
            class="action-menu-item"
            @click="actEdit(id)"
          >
            <va-icon name="edit" size="16px" color="#6b7280" />
            <span>Editar</span>
          </button>

          <button
            v-if="includeActionFinalize"
            type="button"
            class="action-menu-item"
            @click="emitFinalize(id)"
          >
            <va-icon name="task_alt" size="16px" color="#6b7280" />
            <span>Finalizar</span>
          </button>

          <button
            v-if="includeActionCancelTraining"
            type="button"
            class="action-menu-item"
            @click="emitCancelTraining(id)"
          >
            <va-icon name="block" size="16px" color="#6b7280" />
            <span>Cancelar</span>
          </button>

          <button
            v-if="includeActionReactivate"
            type="button"
            class="action-menu-item"
            @click="emitReactivate(id)"
          >
            <va-icon name="restart_alt" size="16px" color="#6b7280" />
            <span>Reativar</span>
          </button>

          <button
            v-if="includeActionDeleteList"
            type="button"
            class="action-menu-item"
            @click="actionDelete(id)"
          >
            <va-icon name="delete" size="16px" color="#6b7280" />
            <span>Excluir</span>
          </button>
        </div>
      </template>
    </va-popover>
  </div>
</template>

<script>
import { confirmDeleteSingle } from "~/utils/sweetAlert2/swalHelper";

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    includeActionStatsList: {
      type: Boolean,
      default: false,
    },
    includeActionDetailsList: {
      type: Boolean,
      default: false,
    },
    includeActionEditList: {
      type: Boolean,
      default: false,
    },
    includeActionDeleteList: {
      type: Boolean,
      default: false,
    },
    includeActionFinalize: {
      type: Boolean,
      default: false,
    },
    includeActionCancelTraining: {
      type: Boolean,
      default: false,
    },
    includeActionReactivate: {
      type: Boolean,
      default: false,
    },
    includeActionAttendanceList: {
      type: Boolean,
      default: false,
    },
    includeActionTechnicalAnalysis: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "stats",
    "details",
    "edit",
    "delete",
    "finalize",
    "cancelTraining",
    "reactivate",
    "attendanceList",
    "technicalAnalysis",
  ],
  methods: {
    emitStats(id) {
      this.$emit("stats", id);
    },
    emitAttendanceList(id) {
      this.$emit("attendanceList", id);
    },
    emitTechnicalAnalysis(id) {
      this.$emit("technicalAnalysis", id);
    },
    emitFinalize(id) {
      this.$emit("finalize", id);
    },
    emitCancelTraining(id) {
      this.$emit("cancelTraining", id);
    },
    emitReactivate(id) {
      this.$emit("reactivate", id);
    },
    actionDetails(id) {
      this.$emit("details", id);
    },
    actEdit(id) {
      this.$emit("edit", id);
    },
    actionDelete(id) {
      confirmDeleteSingle(
        () => {
          this.$emit("delete", id);
        },
        () => {
          // Você pode adicionar qualquer lógica adicional para o caso de cancelamento aqui
        }
      );
    },
  },
};
</script>

<style scoped>
.action-menu {
  display: inline-flex;
  align-items: center;
}

.action-menu-trigger {
  min-width: 36px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  padding: 0;
  color: #71717a !important;
  background-color: #f4f4f5 !important;
  border: 1px solid #e4e4e7 !important;
  box-shadow: none !important;
}

.action-menu-trigger:hover {
  background-color: #e9e9ec !important;
  border-color: #d4d4d8 !important;
  color: #52525b !important;
}

.action-menu-trigger:focus-visible {
  outline: 2px solid #a1a1aa;
  outline-offset: 2px;
}

.action-menu-trigger :deep(.va-icon) {
  color: #71717a !important;
  font-size: 20px !important;
}

.action-menu-panel {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.action-menu-item {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  color: #111827;
  cursor: pointer;
  text-align: left;
}

.action-menu-item:hover {
  background: #f3f4f6;
}

.action-menu-item span {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}
</style>

<!-- Popover teletransporta o conteúdo: o fundo escuro vem do estilo padrão de .va-popover__content (color ~#1b1a1f). -->
<style scoped>
:global(.z-datatable-actions-popover-wrapper) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:global(.z-datatable-actions-popover-wrapper .va-popover__content) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  color: inherit !important;
}
</style>
