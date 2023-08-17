<template>
  <ZButton v-if="buttonActionAdd" color="primary" class="mr-3" @click="add"
    >Adicionar</ZButton
  >
  <ZButton
    v-if="buttonActionDelete"
    color="danger"
    :disabled="!(selectedItemsEmitted.length > 1)"
    @click="actionDelete"
    >Deletar</ZButton
  >
</template>

<script>
import ZButton from "~/components/atoms/Buttons/ZButton";
import { confirmDeleteMultiple } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZButton,
  },
  emits: ["add", "delete"],
  props: {
    buttonActionAdd: {
      type: Boolean,
      default: false,
    },
    buttonActionDelete: {
      type: Boolean,
      default: false,
    },
    selectedItemsEmitted: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    add() {
      this.$emit("add");
    },
    actionDelete() {
      const itemsDelete = this.selectedItemsEmitted.map((item) => item.id);
      const totalItems = this.selectedItemsEmitted.length;

      confirmDeleteMultiple(
        totalItems,
        () => {
          this.$emit("delete", itemsDelete);
        },
        () => {
          // Você pode adicionar qualquer lógica adicional para o caso de cancelamento aqui
        }
      );
    },
  },
};
</script>
