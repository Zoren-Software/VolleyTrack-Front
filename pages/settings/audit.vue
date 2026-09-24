<template>
  <div class="list-page-container">
    <!-- Page Header -->
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

    <!-- Datatable Component -->
    <ZDatatablesActivityLogs @details="abrirDetalhes" />

    <!-- Modal de detalhes JSON -->
    <ZModal
      v-model="modalAberto"
      title="Detalhes do registro"
      ok-text="Fechar"
      cancel-text=""
      size="large"
      @ok="modalAberto = false"
    >
      <div v-if="logSelecionado" class="modal-content">
        <div class="modal-meta">
          <div class="modal-meta-row">
            <span class="meta-label">Categoria:</span>
            <span
              :class="['log-badge', getBadgeClass(logSelecionado.logName)]"
              >{{ logSelecionado.logName }}</span
            >
          </div>
          <div class="modal-meta-row">
            <span class="meta-label">Evento:</span>
            <span>{{ logSelecionado.description }}</span>
          </div>
          <div v-if="logSelecionado.causer" class="modal-meta-row">
            <span class="meta-label">Causador:</span>
            <span>{{ logSelecionado.causer.name }}</span>
          </div>
          <div class="modal-meta-row">
            <span class="meta-label">Data/Hora:</span>
            <span>{{ formatDate(logSelecionado.createdAt) }}</span>
          </div>
        </div>

        <div class="json-section">
          <p class="json-label">Dados da alteração:</p>
          <pre class="json-block">{{
            formatJSON(logSelecionado.properties)
          }}</pre>
        </div>
      </div>
    </ZModal>
  </div>
</template>

<script>
import ZDatatablesActivityLogs from "~/components/organisms/Datatables/ActivityLogs/ZDatatablesActivityLogs.vue";

export default {
  name: "AuditPage",
  components: {
    ZDatatablesActivityLogs,
  },
  data() {
    return {
      modalAberto: false,
      logSelecionado: null,
    };
  },
  methods: {
    abrirDetalhes(log) {
      this.logSelecionado = log;
      this.modalAberto = true;
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    },
    getBadgeClass(logName) {
      const map = {
        auth: "badge-auth",
        teams: "badge-teams",
        users: "badge-users",
        trainings: "badge-trainings",
      };
      return map[logName] || "badge-default";
    },
    formatJSON(properties) {
      if (!properties) return "{}";
      try {
        const obj =
          typeof properties === "string" ? JSON.parse(properties) : properties;
        return JSON.stringify(obj, null, 2);
      } catch {
        return String(properties);
      }
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Auditoria",
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
}

/* ─── Modal ─── */
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.modal-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.meta-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 90px;
}

.log-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-auth {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-teams {
  background: #d1fae5;
  color: #065f46;
}
.badge-users {
  background: #ede9fe;
  color: #6d28d9;
}
.badge-trainings {
  background: #fef3c7;
  color: #92400e;
}
.badge-default {
  background: #f3f4f6;
  color: #6b7280;
}

.json-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.json-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.json-block {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  font-family: "Fira Code", "Cascadia Code", monospace;
  overflow-x: auto;
  white-space: pre;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}
</style>
