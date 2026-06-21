<template>
  <div class="activity-logs-listing">
    <!-- Filtro de categoria -->
    <va-card class="filter-card">
      <div class="filter-content">
        <div class="filter-item">
          <label class="filter-label">Categoria</label>
          <va-select
            v-model="selectedLogName"
            :options="logNameOptions"
            :text-by="'label'"
            placeholder="Todos"
            style="min-width: 220px"
          />
        </div>
        <div class="filter-actions">
          <va-button
            class="search-button"
            :class="{ 'search-button--active': selectedLogName?.value }"
            @click="handleFilter"
          >
            <va-icon name="search" class="button-icon" />
            <span class="button-text">Filtrar</span>
          </va-button>
          <va-button
            v-if="selectedLogName?.value"
            preset="secondary"
            class="clear-button"
            @click="clearFilter"
          >
            <va-icon name="close" class="button-icon" />
            <span class="button-text">Limpar</span>
          </va-button>
        </div>
      </div>
    </va-card>

    <!-- DataTable -->
    <ZDatatableGeneric
      :buttonActionAdd="false"
      includeActionsColumn
      :items="items"
      :columns="columns"
      :loading="loading"
      :paginatorInfo="paginatorInfo"
      :filter="false"
      disable-action-delete
      @update:currentPageActive="updateCurrentPageActive"
    >
      <template #cell(createdAt)="{ rowKey }">
        <div class="date-cell-stack">
          <span class="date-cell-date">{{ formatDateOnly(rowKey.createdAt) }}</span>
          <span class="date-cell-time">{{ formatTimeOnly(rowKey.createdAt) }}</span>
        </div>
      </template>

      <template #cell(activity)="{ rowKey }">
        <div class="activity-cell">
          <p class="activity-cell-title">
            {{ formatActivityTitle(rowKey) }}
          </p>
          <div class="activity-cell-meta">
            <span :class="['log-badge', getBadgeClass(rowKey.logName)]">
              {{ formatLogNameLabel(rowKey.logName) }}
            </span>
            <span v-if="formatSubjectTypeLabel(rowKey)" class="activity-cell-subject">
              {{ formatSubjectTypeLabel(rowKey) }}
            </span>
          </div>
        </div>
      </template>

      <template #cell(responsible)="{ rowKey }">
        <div class="responsible-cell">
          <div class="responsible-cell-user">
            <va-icon name="person" size="14px" color="#9ca3af" />
            <span>{{ rowKey.causer?.name || "—" }}</span>
          </div>
          <div
            v-if="getLocation(rowKey.properties)"
            class="responsible-cell-location"
          >
            <va-icon name="location_on" size="14px" color="#9ca3af" />
            <span>{{ getLocation(rowKey.properties) }}</span>
          </div>
        </div>
      </template>

      <!-- Ações -->
      <template #cell(actions)="{ rowKey }">
        <div v-if="hasProperties(rowKey.properties)" class="action-menu">
          <va-popover
            placement="bottom-end"
            trigger="click"
            class="action-menu-popover"
            content-class="z-audit-actions-popover"
          >
            <va-button
              preset="plain"
              icon="more_vert"
              size="small"
              class="action-menu-trigger"
              @click.stop
            />
            <template #body>
              <div class="action-menu-panel" @click.stop>
                <button
                  type="button"
                  class="action-menu-item"
                  @click="openDetails(rowKey)"
                >
                  <va-icon name="data_object" size="16px" color="#6b7280" />
                  <span>Ver alterações</span>
                </button>
              </div>
            </template>
          </va-popover>
        </div>
        <span v-else class="no-details">-</span>
      </template>
    </ZDatatableGeneric>

    <ZModal
      v-model="detailsModalOpen"
      title="Alterações do registro"
      ok-text="Fechar"
      cancel-text=""
      @ok="closeDetails"
    >
      <div v-if="selectedLog" class="audit-details-modal">
        <div class="audit-details-meta">
          <div class="audit-details-meta-row">
            <span class="audit-details-label">Categoria</span>
            <span :class="['log-badge', getBadgeClass(selectedLog.logName)]">
              {{ selectedLog.logName }}
            </span>
          </div>
          <div class="audit-details-meta-row">
            <span class="audit-details-label">Evento</span>
            <span>{{ selectedLog.description }}</span>
          </div>
          <div v-if="selectedLog.causer" class="audit-details-meta-row">
            <span class="audit-details-label">Causador</span>
            <span>{{ selectedLog.causer.name }}</span>
          </div>
          <div class="audit-details-meta-row">
            <span class="audit-details-label">Data/Hora</span>
            <span>{{ formatDate(selectedLog.createdAt) }}</span>
          </div>
        </div>

        <div v-if="changeRows.length" class="audit-details-section">
          <h3 class="audit-details-section-title">Campos alterados</h3>
          <div class="audit-changes-table-wrap">
            <table class="audit-changes-table">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Antes</th>
                  <th>Depois</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in changeRows" :key="row.field">
                  <td>{{ formatFieldLabel(row.field) }}</td>
                  <td>{{ row.before }}</td>
                  <td>{{ row.after }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="extraProperties.length" class="audit-details-section">
          <h3 class="audit-details-section-title">Informações adicionais</h3>
          <dl class="audit-extra-props">
            <div
              v-for="item in extraProperties"
              :key="item.key"
              class="audit-extra-props-row"
            >
              <dt>{{ formatFieldLabel(item.key) }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="!changeRows.length && !extraProperties.length" class="audit-details-section">
          <h3 class="audit-details-section-title">Dados registrados</h3>
          <pre class="audit-json-block">{{ formattedPropertiesJson }}</pre>
        </div>

        <details v-else class="audit-json-details">
          <summary>Ver JSON completo</summary>
          <pre class="audit-json-block">{{ formattedPropertiesJson }}</pre>
        </details>
      </div>
    </ZModal>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ZModal from "~/components/atoms/Modal/ZModal.vue";
import ACTIVITYLOGS from "~/graphql/audit/query/activityLogs.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";

const LOG_NAME_OPTIONS = [
  { label: "Autenticação", value: "auth" },
  { label: "Equipes", value: "teams" },
  { label: "Usuários", value: "users" },
  { label: "Treinos", value: "trainings" },
];

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZModal,
  },

  data() {
    const columns = [
      {
        key: "createdAt",
        name: "createdAt",
        label: "DATA/HORA",
        sortable: false,
      },
      {
        key: "activity",
        name: "activity",
        label: "ATIVIDADE",
        sortable: false,
      },
      {
        key: "responsible",
        name: "responsible",
        label: "RESPONSÁVEL",
        sortable: false,
      },
    ];

    return {
      items: [],
      loading: false,
      columns,
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
        firstItem: 0,
      },
      page: 1,
      selectedLogName: null,
      logNameOptions: LOG_NAME_OPTIONS,
      detailsModalOpen: false,
      selectedLog: null,
    };
  },

  computed: {
    parsedProperties() {
      return this.parseProperties(this.selectedLog?.properties);
    },
    changeRows() {
      const obj = this.parsedProperties;
      if (!obj?.attributes || !obj?.old) {
        return [];
      }

      const keys = new Set([
        ...Object.keys(obj.attributes),
        ...Object.keys(obj.old),
      ]);

      return [...keys].map((field) => ({
        field,
        before: this.formatPropertyValue(obj.old[field]),
        after: this.formatPropertyValue(obj.attributes[field]),
      }));
    },
    extraProperties() {
      const obj = this.parsedProperties;
      if (!obj) {
        return [];
      }

      return Object.entries(obj)
        .filter(([key]) => !["attributes", "old"].includes(key))
        .map(([key, value]) => ({
          key,
          value: this.formatPropertyValue(value),
        }));
    },
    formattedPropertiesJson() {
      if (!this.parsedProperties) {
        return "{}";
      }
      return JSON.stringify(this.parsedProperties, null, 2);
    },
  },

  created() {
    this.getLogs();
  },

  methods: {
    openDetails(log) {
      this.selectedLog = log;
      this.detailsModalOpen = true;
    },
    closeDetails() {
      this.detailsModalOpen = false;
      this.selectedLog = null;
    },
    parseProperties(properties) {
      if (!properties) {
        return null;
      }
      try {
        return typeof properties === "string"
          ? JSON.parse(properties)
          : properties;
      } catch {
        return null;
      }
    },
    formatPropertyValue(value) {
      if (value === null || value === undefined || value === "") {
        return "—";
      }
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return String(value);
    },
    formatFieldLabel(field) {
      const labels = {
        name: "Nome",
        email: "E-mail",
        phone: "Telefone",
        cpf: "CPF",
        rg: "RG",
        birthDate: "Data de nascimento",
        nickname: "Apelido",
        showNickname: "Exibir apelido",
        ip_address: "Endereço IP",
        device_name: "Dispositivo",
        location: "Localização",
        description: "Descrição",
        dateStart: "Início",
        dateEnd: "Fim",
      };
      return labels[field] || field;
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    },
    formatDateOnly(dateStr) {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    formatTimeOnly(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatLogNameLabel(logName) {
      const labels = {
        auth: "Autenticação",
        users: "Usuários",
        teams: "Equipes",
        trainings: "Treinos",
        positions_users: "Posições",
        teams_users: "Times",
        notification_settings: "Notificações",
      };
      return labels[logName] || logName || "—";
    },
    formatSubjectTypeLabel(row) {
      const raw = this.formatSubjectType(row.subjectType, row.logName);
      if (!raw || raw === "-") {
        return row.logName === "auth" ? "Sessão" : "";
      }

      const labels = {
        User: "Usuário",
        Team: "Time",
        Training: "Treino",
        PositionsUsers: "Posição do jogador",
        TeamsUsers: "Vínculo com time",
        Position: "Posição",
        NotificationSetting: "Preferência de notificação",
        Auth: "Sessão",
      };
      return labels[raw] || raw;
    },
    formatActivityTitle(row) {
      const subject = this.formatSubjectTypeLabel(row);
      const event = row.event || row.description || "";
      const eventLabels = {
        created: "Criação",
        updated: "Atualização",
        deleted: "Exclusão",
        login: "Login",
        logout: "Logout",
      };
      const action = eventLabels[event] || event || "Alteração";

      if (row.logName === "auth") {
        if (action === "Login") return "Login realizado";
        if (action === "Logout") return "Logout realizado";
        return `Autenticação · ${action}`;
      }

      if (subject) {
        return `${action} de ${subject.toLowerCase()}`;
      }

      return `${action} · ${this.formatLogNameLabel(row.logName)}`;
    },
    formatSubjectType(subjectType, logName) {
      if (!subjectType) {
        return logName === "auth" ? "Auth" : "-";
      }
      return subjectType.split("\\").pop();
    },
    getBadgeClass(logName) {
      const map = {
        auth: "badge-auth",
        teams: "badge-teams",
        teams_users: "badge-teams",
        users: "badge-users",
        trainings: "badge-trainings",
        positions_users: "badge-users",
        notification_settings: "badge-default",
      };
      return map[logName] || "badge-default";
    },
    hasProperties(properties) {
      if (!properties) return false;
      const obj = this.parseProperties(properties);
      return Boolean(obj && Object.keys(obj).length > 0);
    },
    getLocation(properties) {
      if (!properties) return null;
      const obj = this.parseProperties(properties);
      return obj?.location ?? null;
    },
    handleFilter() {
      this.page = 1;
      this.getLogs({ fetchPolicy: "network-only" });
    },
    clearFilter() {
      this.selectedLogName = null;
      this.page = 1;
      this.getLogs({ fetchPolicy: "network-only" });
    },
    updateCurrentPageActive(page) {
      this.page = page;
      this.getLogs();
    },
    getLogs(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${ACTIVITYLOGS}
      `;

      const variables = {
        page: this.page,
        first: 20,
        logName: this.selectedLogName?.value ?? null,
      };

      const { onResult } = useQuery(query, variables, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "network-only",
      });

      onResult((result) => {
        this.loading = false;
        if (result?.data?.activityLogs) {
          const data = result.data.activityLogs;
          this.paginatorInfo = data.paginatorInfo
            ? {
                currentPage: data.paginatorInfo.currentPage,
                lastPage: data.paginatorInfo.lastPage,
                perPage: data.paginatorInfo.perPage,
                total: data.paginatorInfo.total,
                firstItem: data.paginatorInfo.total > 0 ? 1 : 0,
              }
            : this.paginatorInfo;
          this.items = data.data || [];
        } else {
          this.items = [];
        }
      });
    },
  },
});
</script>

<style scoped>
.activity-logs-listing {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  padding: 16px 20px;
}

.filter-content {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.search-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #6b7280 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(75, 85, 99, 0.25);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.search-button.search-button--active {
  background-color: #ff4e1b !important;
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.3);
}

.search-button:hover {
  background-color: #4b5563 !important;
  box-shadow: 0 4px 10px rgba(75, 85, 99, 0.35);
  transform: translateY(-1px);
}

.search-button.search-button--active:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(255, 78, 27, 0.4);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(75, 85, 99, 0.3);
}

.search-button.search-button--active:active {
  box-shadow: 0 2px 6px rgba(255, 78, 27, 0.3);
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

.subject-type {
  font-size: 13px;
  color: #6b7280;
}

.date-cell-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 88px;
}

.date-cell-date {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.date-cell-time {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.activity-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.activity-cell-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.35;
}

.activity-cell-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.activity-cell-subject {
  font-size: 12px;
  color: #6b7280;
}

.activity-cell-subject::before {
  content: "·";
  margin-right: 8px;
  color: #d1d5db;
}

.responsible-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.responsible-cell-user,
.responsible-cell-location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #374151;
  line-height: 1.35;
}

.responsible-cell-location {
  color: #6b7280;
  font-size: 12px;
}

.date-cell {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

.location-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.location-icon {
  flex-shrink: 0;
}

.no-details {
  color: #d1d5db;
  font-size: 13px;
}

/* ─── Action menu (matches ZDataTableActions) ─── */
.action-menu {
  display: inline-flex;
  align-items: center;
}

.action-menu-trigger {
  min-width: 36px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  padding: 0;
  color: #71717a !important;
  background-color: #f4f4f5 !important;
  border: 1px solid #e4e4e7 !important;
  box-shadow: none !important;
}

.action-menu-trigger:hover {
  background-color: #e9e9ec !important;
  border-color: #d4d4d8 !important;
}

.action-menu-trigger :deep(.va-icon) {
  color: #71717a !important;
  font-size: 20px !important;
}

.action-menu-panel {
  display: flex;
  flex-direction: column;
  min-width: 180px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.action-menu-item {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  color: #111827;
  cursor: pointer;
  text-align: left;
}

.action-menu-item:hover {
  background: #f3f4f6;
}

.action-menu-item span {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.audit-details-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.audit-details-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.audit-details-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #111827;
}

.audit-details-label {
  min-width: 90px;
  font-weight: 600;
  color: #6b7280;
}

.audit-details-section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.audit-changes-table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.audit-changes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.audit-changes-table th,
.audit-changes-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.audit-changes-table th {
  background: #f9fafb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7280;
}

.audit-changes-table tbody tr:last-child td {
  border-bottom: none;
}

.audit-changes-table td:first-child {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.audit-changes-table td:nth-child(2) {
  color: #9ca3af;
}

.audit-changes-table td:nth-child(3) {
  color: #111827;
  font-weight: 500;
}

.audit-extra-props {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.audit-extra-props-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 13px;
}

.audit-extra-props-row dt {
  margin: 0;
  font-weight: 600;
  color: #6b7280;
}

.audit-extra-props-row dd {
  margin: 0;
  color: #111827;
  text-align: right;
  word-break: break-word;
}

.audit-json-details {
  font-size: 13px;
  color: #374151;
}

.audit-json-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
}

.audit-json-block {
  margin: 10px 0 0;
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  font-family: "Fira Code", "Cascadia Code", monospace;
  overflow: auto;
  white-space: pre;
  max-height: 280px;
}
</style>

<style>
.z-audit-actions-popover {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.z-audit-actions-popover .va-popover__content {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  color: inherit !important;
}
</style>
