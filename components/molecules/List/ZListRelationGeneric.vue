<template>
  <div class="d-flex align-items-center justify-content-between">
    <slot name="filter" />
    <ZButton
      class="mb-3 ml-2"
      color="primary"
      icon="add"
      icon-right
      @click="add"
    >
      Relacionar
    </ZButton>
  </div>
  <slot name="list" />
</template>

<script>
import ZButton from "~/components/atoms/Buttons/ZButton";
export default {
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
