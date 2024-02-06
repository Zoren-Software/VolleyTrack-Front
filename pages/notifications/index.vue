<template>
  <ZDatatablesNotifications />
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
