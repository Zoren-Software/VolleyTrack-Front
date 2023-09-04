<template>
  <va-button
    v-if="includeActionEditList"
    preset="plain"
    icon="edit"
    @click="actEdit(this.id)"
  />
  <va-button
    v-if="includeActionDeleteList"
    preset="plain"
    icon="delete"
    color="danger"
    class="ml-3"
    @click="actionDelete(this.id)"
  />
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
