<template>
  <ZListPageContainer>
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Auditoria</h1>
          <p class="page-subtitle">
            Registro de atividades da conta: logins, logouts e alterações de
            dados
          </p>
        </div>
      </div>
    </div>

    <ZDatatablesActivityLogs />
  </ZListPageContainer>
</template>

<script>
import ZDatatablesActivityLogs from "~/components/organisms/Datatables/ActivityLogs/ZDatatablesActivityLogs.vue";

export default {
  name: "AuditPage",
  components: {
    ZDatatablesActivityLogs,
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Auditoria",
});
</script>

<style scoped>
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
}
</style>
