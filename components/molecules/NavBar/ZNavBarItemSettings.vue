<template>
  <ZButton :color="color()" icon="settings" to="/settings"/>
</template>

<script>

  import ZButton from "~/components/atoms/Buttons/ZButton";

  export default {
    components: {
      ZButton,
    },
    methods: {
      color() {
        return this.$route.path === "/settings" ? "primary" : "background-primary";
      },
    }
  };
</script>

