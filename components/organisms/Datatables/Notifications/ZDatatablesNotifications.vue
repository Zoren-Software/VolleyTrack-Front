<template>
  <div class="notifications-listing">
    <va-card class="filter-card">
      <div class="filter-content">
        <div class="filters-section">
          <div class="filter-item">
            <label class="filter-label">Status</label>
            <div class="switch-wrapper">
              <va-switch
                v-model="read"
                true-inner-label="Lidas"
                false-inner-label="Não lidas"
                @update:model-value="handleFilterChange"
              />
            </div>
          </div>
        </div>
      </div>
    </va-card>

    <ZDatatableGeneric
      :buttonActionAdd="false"
      includeActionsColumn
      disableActionDelete
      selectable
      bulk-read-via-selection-badge
      :items="items"
      :columns="columns"
      :loading="loading"
      :paginatorInfo="paginatorInfo"
      :filter="false"
      :optionSearch="false"
      @reads="readNotifications"
      @update:currentPageActive="updateCurrentPageActive"
    >
      <template #cell(notification)="{ rowKey }">
        <component
          :is="getNotificationComponent(rowKey.type)"
          :notification="rowKey"
        />
      </template>
      <template #cell(userAction)="{ rowKey }">
        <div v-if="parseData(rowKey.data).userAction">
          <ZUser
            :data="parseData(rowKey.data).userAction"
            showEmail
            :showConfirmTraining="
              rowKey.type ===
              'App\\Notifications\\Training\\ConfirmationTrainingNotification'
            "
          />
        </div>
      </template>
      <template #cell(actions)="{ rowKey }">
        <div class="notification-table-actions">
          <va-button
            v-if="!rowKey.readAt"
            preset="plain"
            class="notification-table-actions__icon notification-table-actions__icon--read"
            aria-label="Marcar como lida"
            title="Marcar como lida"
            @click.stop="readNotification(rowKey.id)"
          >
            <va-icon name="check_circle" size="22px" color="#16a34a" />
          </va-button>
          <va-button
            preset="plain"
            class="notification-table-actions__icon"
            aria-label="Excluir notificação"
            title="Excluir notificação"
            @click.stop="confirmRemoveNotification(rowKey.id)"
          >
            <va-icon name="delete" size="22px" color="#dc3545" />
          </va-button>
        </div>
      </template>
    </ZDatatableGeneric>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import NOTIFICATIONS from "~/graphql/notification/query/notifications.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import NOTIFICATIONREAD from "~/graphql/notification/mutation/notificationsRead.graphql";
import NOTIFICATIONDELETE from "~/graphql/notification/mutation/notificationsDelete.graphql";
import { confirmSuccess, confirmError, confirmDeleteSingle } from "~/utils/sweetAlert2/swalHelper";
import ZTrainingNotification from "~/components/molecules/Datatable/Slots/ZTrainingNotification";
import ZNotificationConfirmationTraining from "~/components/molecules/Datatable/Slots/ZNotificationConfirmationTraining";
import ZNotificationCancelTraining from "~/components/molecules/Datatable/Slots/ZNotificationCancelTraining";
import ZListItemNotification from "~/components/molecules/List/ZListItemNotification";

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZTrainingNotification,
    ZNotificationConfirmationTraining,
    ZNotificationCancelTraining,
    ZListItemNotification,
  },

  emits: ["update:total"],

  mounted() {
    this.getNotifications({ fetchPolicy: "network-only" });
  },

  data() {
    return {
      read: false,
      items: [],
      loading: false,
      columns: [
        {
          key: "notification",
          name: "notification",
          label: "Notificações",
          sortable: true,
        },
        {
          key: "userAction",
          name: "userAction",
          label: "Usuário",
          sortable: true,
        },
      ],
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      },
      variablesGetNotifications: {
        page: 1,
      },
    };
  },

  computed: {
    hasSearchFilterCriteria() {
      return this.read === true;
    },
  },

  methods: {
    parseData(rowKeyData) {
      try {
        return JSON.parse(rowKeyData);
      } catch {
        return {};
      }
    },

    emitTotal() {
      this.$emit("update:total", Number(this.paginatorInfo?.total) || 0);
    },

    getNotificationComponent(type) {
      if (type === "App\\Notifications\\Training\\TrainingNotification") {
        return ZTrainingNotification;
      }
      if (
        type === "App\\Notifications\\Training\\ConfirmationTrainingNotification"
      ) {
        return ZNotificationConfirmationTraining;
      }
      if (
        type === "App\\Notifications\\Training\\CancelTrainingNotification"
      ) {
        return ZNotificationCancelTraining;
      }
      return ZListItemNotification;
    },

    confirmRemoveNotification(id) {
      confirmDeleteSingle(() => {
        this.deleteNotifications([id]);
      });
    },

    async deleteNotifications(ids) {
      try {
        this.loading = true;
        const query = gql`
          ${NOTIFICATIONDELETE}
        `;
        const variables = { id: ids };
        const { mutate } = await useMutation(query, { variables });
        await mutate();
        confirmSuccess("Notificação excluída com sucesso!", () => {});
        await this.getNotifications({ fetchPolicy: "network-only" });
      } catch (error) {
        console.error(error);
        if (error.graphQLErrors?.[0]?.extensions?.validation) {
          const errors = error.graphQLErrors[0].extensions.validation;
          const errorMessages = Object.values(errors).map((x) => x[0]);
          confirmError(
            "Não foi possível excluir a notificação.",
            errorMessages.join("<br>"),
          );
        } else {
          confirmError("Não foi possível excluir a notificação.");
        }
      }
      this.loading = false;
    },

    async readItems(ids) {
      try {
        this.loading = true;
        const query = gql`
          ${NOTIFICATIONREAD}
        `;
        const variables = { id: ids };
        const { mutate } = await useMutation(query, { variables });
        await mutate();
        confirmSuccess("Notificação(ões) lida(s) com sucesso!", () => {});
        await this.getNotifications({ fetchPolicy: "network-only" });
      } catch (error) {
        console.error(error);
        if (error.graphQLErrors?.[0]?.extensions?.validation) {
          const errors = error.graphQLErrors[0].extensions.validation;
          const errorMessages = Object.values(errors).map((x) => x[0]);
          confirmError(
            "Ocorreu um erro ao ler a notificação!",
            errorMessages.join("<br>"),
          );
        } else {
          confirmError("Ocorreu um erro ao ler a notificação!");
        }
      }
      this.loading = false;
    },

    async readNotification(id) {
      await this.readItems([id]);
    },

    async readNotifications(ids) {
      await this.readItems(ids);
    },

    updateCurrentPageActive(page) {
      this.variablesGetNotifications.page = page;
      this.getNotifications({ fetchPolicy: "network-only" });
    },

    handleFilterChange() {
      this.variablesGetNotifications.page = 1;
      this.getNotifications({ fetchPolicy: "network-only" });
    },

    getNotifications(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${NOTIFICATIONS}
      `;

      const consult = {
        read: this.read,
        first: 10,
        page: this.variablesGetNotifications.page,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first",
      });

      onResult((result) => {
        if (result?.data?.notifications) {
          this.paginatorInfo = result.data.notifications.paginatorInfo || {
            currentPage: 1,
            lastPage: 1,
            total: 0,
            firstItem: 0,
            lastItem: 0,
            perPage: 10,
          };
          this.items = result.data.notifications.data || [];
        } else {
          this.paginatorInfo = {
            currentPage: 1,
            lastPage: 1,
            total: 0,
            firstItem: 0,
            lastItem: 0,
            perPage: 10,
          };
          this.items = [];
        }
        this.emitTotal();
      });

      if (value) {
        if (value?.notifications) {
          this.paginatorInfo = value.notifications.paginatorInfo || {
            currentPage: 1,
            lastPage: 1,
            total: 0,
            firstItem: 0,
            lastItem: 0,
            perPage: 10,
          };
          this.items = value.notifications.data || [];
        } else {
          this.paginatorInfo = {
            currentPage: 1,
            lastPage: 1,
            total: 0,
            firstItem: 0,
            lastItem: 0,
            perPage: 10,
          };
          this.items = [];
        }
        this.emitTotal();
      }
      this.loading = false;
    },
  },
});
</script>

<style scoped>
.notifications-listing {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-section {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  flex: 1;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b1e3a;
  margin-bottom: 8px;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.notification-table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.notification-table-actions__icon {
  min-width: 40px;
  min-height: 40px;
  padding: 8px !important;
  border-radius: 10px !important;
}

.notification-table-actions__icon:hover {
  background: rgba(15, 23, 42, 0.06) !important;
}

.notification-table-actions__icon--read:hover {
  background: rgba(22, 163, 74, 0.12) !important;
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-section {
    width: 100%;
  }

  .filter-item {
    width: 100%;
    min-width: unset;
  }

}
</style>
