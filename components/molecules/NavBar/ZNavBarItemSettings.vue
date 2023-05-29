<template>
  <ZNavBar>
    <ZButton color="background-primary" icon="settings" to="/settings"/>
  </ZNavBar>
</template>

<script>
  import ZButton from "~/components/atoms/Buttons/ZButton";

  export default {
    components: {
      ZButton,
    },
  };
</script>

