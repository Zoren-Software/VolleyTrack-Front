<template>
  <div class="notifications-listing">
    <!-- Filter Card -->
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
        <div class="actions-section">
          <va-button
            color="#E9742B"
            class="search-button"
            @click="getNotifications({ fetchPolicy: 'network-only' })"
          >
            <va-icon name="search" class="button-icon" />
            <span class="button-text">Pesquisar</span>
          </va-button>
          <va-button
            color="danger"
            class="read-all-button"
            @click="readAllNotifications"
          >
            <va-icon name="done_all" class="button-icon" />
            <span class="button-text">Ler Todas</span>
          </va-button>
        </div>
      </div>
    </va-card>

    <!-- DataTable -->
    <ZDatatableGeneric
      :buttonActionAdd="false"
      buttonActionDelete
      includeActionsColumn
      :includeActionDeleteList="!readSearch"
      selectable
      :items="items"
      :columns="columns"
      :loading="loading"
      :paginatorInfo="paginatorInfo"
      :filter="false"
      :optionSearch="false"
      textButtonDelete="Ler"
      @search="searchNotification"
      @actionSearch="getNotifications({ fetchPolicy: 'network-only' })"
      @actionClear="clearSearch"
      @delete="readNotification"
      @deletes="readNotifications"
      @update:currentPageActive="updateCurrentPageActive"
    >
      <!-- CELL -->
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
            :showCancelTraining="
              rowKey.type ===
              'App\\Notifications\\Training\\CancelTrainingNotification'
            "
          />
        </div>
      </template>
    </ZDatatableGeneric>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <va-card class="summary-card">
        <div class="summary-content">
          <div class="summary-icon">
            <va-icon name="notifications" size="large" color="#E9742B" />
          </div>
          <div class="summary-number">{{ paginatorInfo.total || 0 }}</div>
          <div class="summary-label">Total de Notificações</div>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import NOTIFICATIONS from "~/graphql/notification/query/notifications.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import NOTIFICATIONREAD from "~/graphql/notification/mutation/notificationsRead.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import ZTrainingNotification from "~/components/molecules/Datatable/Slots/ZTrainingNotification";
import ZNotificationConfirmationTraining from "~/components/molecules/Datatable/Slots/ZNotificationConfirmationTraining";
import ZNotificationCancelTraining from "~/components/molecules/Datatable/Slots/ZNotificationCancelTraining";
import ZListItemNotification from "~/components/molecules/List/ZListItemNotification";
import ZButton from "~/components/atoms/Buttons/ZButton";
import NOTIFICATIONSTOTAL from "~/graphql/notification/query/notificationsTotal.graphql";

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZTrainingNotification,
    ZNotificationConfirmationTraining,
    ZNotificationCancelTraining,
    ZListItemNotification,
    ZButton,
  },

  mounted() {
    this.getNotifications({ fetchPolicy: "network-only" });
  },

  data() {
    let loading = false;

    const columns = [
      { key: "id", name: "id", sortable: true },
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
    ];

    return {
      read: false,
      readSearch: false,
      items: [],
      loading,
      columns,
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      },
      variablesGetNotifications: {
        page: 1,
        filter: {
          search: "%%",
          positionsIds: [],
          teamsIds: [],
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
    };
  },

  methods: {
    parseData(rowKeyData) {
      try {
        return JSON.parse(rowKeyData);
      } catch (error) {
        console.error("Erro ao converter dados para JSON", error);
        // Retorne um valor padrão ou lide com o erro conforme necessário
        return {};
      }
    },

    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },

    async readAllNotifications() {
      try {
        this.loading = true;

        const query = gql`
          ${NOTIFICATIONREAD}
        `;

        const variables = {
          markAllAsRead: true,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Notificação(ões) lida(s) com sucesso!", () => {
          this.items = [];
        });
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item[0];
          });

          this.errorFields = Object.keys(this.errors);

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao ler todas as notificações!", footer);
        } else {
          confirmError("Ocorreu um erro ao ler todas as notificações!");
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

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Notificação(ões) lida(s) com sucesso!", () => {
          this.items = this.items.filter((item) => !ids.includes(item.id));
        });

        this.getNotifications({ fetchPolicy: "network-only" });
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item[0];
          });

          this.errorFields = Object.keys(this.errors);

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao ler a notificação!", footer);
        } else {
          confirmError("Ocorreu um erro ao ler a notificação!");
        }
      }
      this.loading = false;
    },

    async readNotification(id) {
      await this.readItems([id]);
    },

    async readNotifications(items) {
      await this.readItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetNotifications.page = page;
      this.getNotifications({ fetchPolicy: "network-only" });
    },

    searchNotification(search) {
      this.variablesGetNotifications.filter.search = `%${search}%`;
    },

    clearSearch() {
      this.variablesGetNotifications.filter = {
        search: "%%",
      };
      this.read = false;
      this.getNotifications({ fetchPolicy: "network-only" });
    },

    handleFilterChange() {
      this.variablesGetNotifications.page = 1;
      this.getNotifications({ fetchPolicy: "network-only" });
    },

    getNotificationComponent(type) {
      if (type === "App\\Notifications\\Training\\TrainingNotification") {
        return ZTrainingNotification;
      } else if (
        type ===
        "App\\Notifications\\Training\\ConfirmationTrainingNotification"
      ) {
        return ZNotificationConfirmationTraining;
      } else if ("App\\Notifications\\Training\\CancelTrainingNotification") {
        return ZNotificationCancelTraining;
      }
      // Aqui você pode adicionar mais condições para outros tipos de notificações
      return ZListItemNotification; // Componente padrão para notificações desconhecidas
    },

    getNotifications(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${NOTIFICATIONS}
      `;

      this.readSearch = this.read;

      const consult = {
        read: this.read,
        first: 10,
        page: this.variablesGetNotifications.page,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
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
  gap: 20px;
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

.actions-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.search-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #e9742b !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.search-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.4);
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.3);
}

.search-button .button-icon {
  font-size: 18px;
  color: #ffffff;
}

.search-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.read-all-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #dc3545 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.read-all-button:hover {
  background-color: #c82333 !important;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  transform: translateY(-1px);
}

.read-all-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
}

.read-all-button .button-icon {
  font-size: 18px;
  color: #ffffff;
}

.read-all-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  margin-bottom: 8px;
}

.summary-number {
  font-size: 36px;
  font-weight: 700;
  color: #0b1e3a;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
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

  .actions-section {
    width: 100%;
    justify-content: stretch;
  }

  .read-all-button {
    width: 100%;
  }
}
</style>
