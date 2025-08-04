<template>
  <!-- Aqui continha uma classe d-flex se algum layout quebrar deve ser reposto por parâmetros -->
  <div class="align-items-center justify-content-between">
    <slot name="filter" />
    <!-- <ZButton
      v-if="!disableRelation"
      class="mb-3 ml-2 custom-button"
      color="primary"
      icon="add"
      icon-right
      @click="add"
    >
      Relacionar
    </ZButton> -->
  </div>
  <slot name="list" />
</template>

<script>
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  props: {
    disableRelation: {
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
.custom-button {
  padding: 0 !important;
}
</style>
