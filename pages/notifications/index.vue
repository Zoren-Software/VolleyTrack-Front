<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Notificações</h1>
          <p class="page-subtitle">Gerencie todas as suas notificações</p>
        </div>
      </div>
    </div>

    <!-- Datatable Component -->
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

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }
}
</style>
