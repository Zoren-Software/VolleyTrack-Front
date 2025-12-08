<template>
  <div class="list-page-container">
    <ZDatatablesPlayers />
  </div>
</template>

<script>
import ZDatatablesPlayers from "~/components/organisms/Datatables/Players/ZDatatablesPlayers.vue";

export default {
  components: {
    ZDatatablesPlayers,
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Jogadores",
});
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}
</style>
