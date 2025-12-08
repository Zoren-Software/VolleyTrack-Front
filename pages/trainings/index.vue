<template>
  <div class="list-page-container">
    <ZDatatablesTraining />
  </div>
</template>

<script>
import ZDatatablesTraining from "~/components/organisms/Datatables/Trainings/ZDatatablesTrainings.vue";

export default {
  components: {
    ZDatatablesTraining,
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Treinos",
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
