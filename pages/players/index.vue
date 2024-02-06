<template>
  <ZDatatablesPlayers />
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
