<template>
  <ZButton :color="color()" icon="settings" @click="toggleSidebar()" />
</template>

<script>
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  emits: ["menuSettingsMinimize"],
  components: {
    ZButton,
  },
  methods: {
    color() {
      return this.$route.path === "/settings"
        ? "primary"
        : "background-primary";
    },
    toggleSidebar() {
      this.$emit("menuSettingsMinimize");
    },
  },
};
</script>
