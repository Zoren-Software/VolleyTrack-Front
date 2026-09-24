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
      <!-- Categoria -->
      <template #cell(logName)="{ rowKey }">
        <span :class="['log-badge', getBadgeClass(rowKey.logName)]">
          {{ rowKey.logName }}
        </span>
      </template>

      <!-- Tipo de registro -->
      <template #cell(subjectType)="{ rowKey }">
        <span
          :class="[
            'subject-type',
            {
              'log-badge badge-auth':
                !rowKey.subjectType && rowKey.logName === 'auth',
            },
          ]"
        >
          {{ formatSubjectType(rowKey.subjectType, rowKey.logName) }}
        </span>
      </template>

      <!-- Localização -->
      <template #cell(location)="{ rowKey }">
        <span class="location-cell">
          <va-icon
            v-if="getLocation(rowKey.properties)"
            name="location_on"
            size="14px"
            color="#9ca3af"
            class="location-icon"
          />
          {{ getLocation(rowKey.properties) || "Não disponível" }}
        </span>
      </template>

      <!-- Causador -->
      <template #cell(causer)="{ rowKey }">
        <span>{{ rowKey.causer?.name || "-" }}</span>
      </template>

      <!-- Data/Hora -->
      <template #cell(createdAt)="{ rowKey }">
        <span class="date-cell">{{ formatDate(rowKey.createdAt) }}</span>
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
                  @click="$emit('details', rowKey)"
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
  </div>
</template>

<script>
import { defineComponent } from "vue";
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
  },

  emits: ["details"],

  created() {
    this.getLogs();
  },

  data() {
    const columns = [
      {
        key: "createdAt",
        name: "createdAt",
        label: "DATA/HORA",
        sortable: false,
      },
      { key: "logName", name: "logName", label: "CATEGORIA", sortable: false },
      {
        key: "description",
        name: "description",
        label: "EVENTO",
        sortable: false,
      },
      {
        key: "subjectType",
        name: "subjectType",
        label: "TIPO DE REGISTRO",
        sortable: false,
      },
      {
        key: "location",
        name: "location",
        label: "LOCALIZAÇÃO",
        sortable: false,
      },
      { key: "causer", name: "causer", label: "CAUSADOR", sortable: false },
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
    };
  },

  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      });
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
        users: "badge-users",
        trainings: "badge-trainings",
      };
      return map[logName] || "badge-default";
    },
    hasProperties(properties) {
      if (!properties) return false;
      try {
        const obj =
          typeof properties === "string" ? JSON.parse(properties) : properties;
        return obj && Object.keys(obj).length > 0;
      } catch {
        return false;
      }
    },
    getLocation(properties) {
      if (!properties) return null;
      try {
        const obj =
          typeof properties === "string" ? JSON.parse(properties) : properties;
        return obj?.location ?? null;
      } catch {
        return null;
      }
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
