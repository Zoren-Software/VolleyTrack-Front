<template>
  <div class="list-page-container">
    <ZDatatablesNotifications />
  </div>
</template>

<script>
import ZDatatablesNotifications from "~/components/organisms/Datatables/Notifications/ZDatatablesNotifications.vue";

export default {
  components: {
    ZDatatablesNotifications,
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Notificações",
});
</script>

<style scoped>
.list-page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
</style>
