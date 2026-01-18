<template>
  <div class="action-buttons">
  <va-button
    v-if="includeActionEditList"
    icon="edit"
      color="#1976d2"
      size="small"
      class="action-btn action-btn-edit"
    @click="actEdit(this.id)"
  />
  <va-button
    v-if="includeActionDeleteList"
    icon="delete"
      color="#d32f2f"
      size="small"
      class="action-btn action-btn-delete"
    @click="actionDelete(this.id)"
  />
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
    includeActionEditList: {
      type: Boolean,
      default: false,
    },
    includeActionDeleteList: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["edit", "delete"],
  methods: {
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
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  min-width: 32px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  padding: 0;
}

.action-btn-edit {
  background-color: #1976d2;
  color: white;
}

.action-btn-edit:hover {
  background-color: #1565c0;
}

.action-btn-delete {
  background-color: #d32f2f;
  color: white;
}

.action-btn-delete:hover {
  background-color: #c62828;
}
</style>
