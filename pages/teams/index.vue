<template>
  <ZDatatablesTeams />
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
