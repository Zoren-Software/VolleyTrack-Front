<template>
  <div class="list-page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">
            <span class="page-title-text">Notificações</span>
            <span
              class="page-title-badge"
              :title="`${notificationsTotal} notificações`"
            >
              {{ notificationsTotal }}
            </span>
          </h1>
          <p class="page-subtitle">Gerencie todas as suas notificações</p>
        </div>
      </div>
    </div>

    <ZDatatablesNotifications @update:total="notificationsTotal = $event" />
  </div>
</template>

<script>
import ZDatatablesNotifications from "~/components/organisms/Datatables/Notifications/ZDatatablesNotifications.vue";

export default {
  components: {
    ZDatatablesNotifications,
  },
  data() {
    return {
      notificationsTotal: 0,
    };
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
  max-width: 940px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.page-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-title-text {
  display: inline-block;
}

.page-title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff4e1b 0%, #e04218 100%);
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.35);
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
