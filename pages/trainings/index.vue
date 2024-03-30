<template>
  <ZDatatablesTraining />
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
