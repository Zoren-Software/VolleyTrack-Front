<template>
  <div class="list-page-container">
    <ZDatatablesTeams />
  </div>
</template>

<script>
import ZDatatablesTeams from "~/components/organisms/Datatables/Teams/ZDatatablesTeams.vue";

export default {
  components: {
    ZDatatablesTeams,
  },
};
</script>
<script setup>
useHead({
  titleTemplate: "Times",
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
