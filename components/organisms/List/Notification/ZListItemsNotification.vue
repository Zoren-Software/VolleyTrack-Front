<template>
  <div class="notification-dropdown-card">
    <header class="notification-dropdown-header">
      <h2 class="notification-dropdown-title">Notificações</h2>
      <NuxtLink
        to="/settings/notifications"
        class="notification-settings-trigger"
        aria-label="Configurações de notificação"
        @click.stop
      >
        <va-icon name="settings" size="22px" color="#475569" />
      </NuxtLink>
    </header>

    <div class="notification-dropdown-body">
      <p v-if="items.length === 0" class="notification-empty">
        Nenhuma notificação até o momento
      </p>
      <div v-else class="notification-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="notification-row"
          :class="{ 'notification-row--unread': !item.readAt }"
        >
          <span
            class="notification-row__dot"
            :class="{ 'notification-row__dot--read': item.readAt }"
            aria-hidden="true"
          />
          <div class="notification-row__content">
            <component
              :is="getNotificationComponent(item.type)"
              :notification="item"
              @readNotification="readNotificationClear"
            />
          </div>
        </div>
      </div>
    </div>

    <footer class="notification-dropdown-footer">
      <div class="notification-footer-actions">
        <button
          type="button"
          class="notification-footer-link"
          :disabled="items.length === 0 || markAllLoading"
          @click="markAllAsRead"
        >
          <va-icon name="done_all" size="18px" class="notification-footer-link__icon" />
          <span>Marcar todas como lidas</span>
        </button>
        <span class="notification-footer-sep" aria-hidden="true" />
        <button
          type="button"
          class="notification-footer-link"
          @click="goToNotifications"
        >
          Ver todas as notificações
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import ZListItemNotification from "~/components/molecules/List/ZListItemNotification";
import TrainingNotificationItem from "~/components/molecules/List/Notification/TrainingNotificationItem";
import NotificationConfirmationTrainingItem from "~/components/molecules/List/Notification/NotificationConfirmationTrainingItem";
import NotificationCancelTrainingItem from "~/components/molecules/List/Notification/NotificationCancelTrainingItem";
import NOTIFICATIONS from "~/graphql/notification/query/notifications.graphql";
import NOTIFICATIONSREAD from "~/graphql/notification/mutation/notificationsRead.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  mounted() {
    this.getNotifications({});
  },
  components: {
    ZListItemNotification,
    TrainingNotificationItem,
    NotificationConfirmationTrainingItem,
    NotificationCancelTrainingItem,
  },
  data() {
    return {
      loading: false,
      markAllLoading: false,
      items: [],
      errors: this.errorsDefault(),
      paginatorInfo: {},
    };
  },
  emits: ["updateTotalNotifications", "oneLessNotification"],

  methods: {
    getNotificationComponent(type) {
      if (type === "App\\Notifications\\Training\\TrainingNotification") {
        return TrainingNotificationItem;
      } else if (
        type ===
        "App\\Notifications\\Training\\ConfirmationTrainingNotification"
      ) {
        return NotificationConfirmationTrainingItem;
      } else if (
        type === "App\\Notifications\\Training\\CancelTrainingNotification"
      ) {
        return NotificationCancelTrainingItem;
      }
      return ZListItemNotification;
    },
    async getNotifications(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${NOTIFICATIONS}
      `;

      const consult = {
        page: 1,
        first: 5,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first",
      });

      await onResult((result) => {
        const list = result?.data?.notifications?.data;
        const paginator = result?.data?.notifications?.paginatorInfo;
        if (Array.isArray(list)) {
          this.paginatorInfo = paginator || {};
          this.items = list;
          this.$emit(
            "updateTotalNotifications",
            paginator?.total ?? list.length,
          );
        }
      });

      if (value?.notifications?.data != null) {
        const list = value.notifications.data;
        this.paginatorInfo = value.notifications.paginatorInfo || {};
        this.items = Array.isArray(list) ? list : [];
        this.$emit(
          "updateTotalNotifications",
          value.notifications.paginatorInfo?.total ?? this.items.length,
        );
      }
      this.loading = false;
    },

    async clear(options = {}) {
      this.items = [];

      const query = gql`
        ${NOTIFICATIONSREAD}
      `;

      const variables = options;

      const { mutate } = await useMutation(query, { variables });

      const { data } = await mutate();

      confirmSuccess(data.notificationsRead.message, () => {
        this.errors = this.errorsDefault();
      });

      await this.getNotifications({ fetchPolicy: "network-only" });
    },

    async markAllAsRead() {
      if (this.items.length === 0) return;
      try {
        this.markAllLoading = true;
        const query = gql`
          ${NOTIFICATIONSREAD}
        `;
        const { mutate } = await useMutation(query, {
          variables: { markAllAsRead: true },
        });
        const { data } = await mutate();
        confirmSuccess(
          data?.notificationsRead?.message || "Notificações marcadas como lidas.",
          () => {
            this.errors = this.errorsDefault();
          },
        );
        await this.getNotifications({ fetchPolicy: "network-only" });
      } catch (error) {
        console.error(error);
        confirmError("Não foi possível marcar todas como lidas.");
      } finally {
        this.markAllLoading = false;
      }
    },

    async readNotificationClear(id) {
      await this.clear({ id: [id] });
      this.$emit("oneLessNotification", true);
    },

    errorsDefault() {
      return {};
    },
    goToNotifications() {
      this.$router.push("/notifications");
    },
  },
};
</script>

<style scoped>
.notification-dropdown-card {
  min-width: 320px;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.notification-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-dropdown-header .notification-settings-trigger {
  margin-left: auto;
}

.notification-dropdown-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.notification-settings-trigger {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
  text-decoration: none;
  color: inherit;
  box-sizing: border-box;
}

.notification-settings-trigger:hover {
  background: #f1f5f9;
}

.notification-dropdown-body {
  max-height: 340px;
  overflow-y: auto;
}

.notification-empty {
  margin: 0;
  padding: 24px 16px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 0 12px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s ease;
}

.notification-row:last-child {
  border-bottom: none;
}

.notification-row:hover {
  background: #f8fafc;
}

.notification-row__dot {
  width: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 18px;
}

.notification-row__dot::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.notification-row__dot--read::before {
  background: transparent;
}

.notification-row__content {
  flex: 1;
  min-width: 0;
}

.notification-dropdown-footer {
  padding: 12px 16px 14px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.notification-footer-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.notification-footer-sep {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
}

.notification-footer-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 4px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #ff4e1b;
  cursor: pointer;
  text-align: left;
  border-radius: 4px;
  transition: opacity 0.15s ease;
}

.notification-footer-link:hover:not(:disabled) {
  text-decoration: underline;
}

.notification-footer-link:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  text-decoration: none;
}

.notification-footer-link__icon {
  flex-shrink: 0;
  color: #ff4e1b !important;
}

@media (max-width: 380px) {
  .notification-footer-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .notification-footer-sep {
    display: none;
  }
}
</style>
