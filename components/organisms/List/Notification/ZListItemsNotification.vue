<template>
  <va-list id="notification-dropdown">
    <va-list-label> Notificações </va-list-label>
    <component
      v-for="item in items"
      :is="getNotificationComponent(item.type)"
      :key="item.id"
      :notification="item"
    />
  </va-list>
  <div class="mt-3 mb-3">
    <va-divider />
  </div>
  <va-button to="/notifications" size="small" class="mr-6 mb-2 mr-5">
    Ver todas as notificações
  </va-button>
  <va-button size="small" class="mr-6 mb-2" @click="clear()">
    Limpar
  </va-button>
</template>

<script>
import ZListItemNotification from "~/components/molecules/List/ZListItemNotification";
import TrainingNotificationItem from "~/components/molecules/List/Notification/TrainingNotificationItem";
import NotificationConfirmationTrainingItem from "~/components/molecules/List/Notification/NotificationConfirmationTrainingItem";
import NOTIFICATIONS from "~/graphql/notification/query/notifications.graphql";
import NOTIFICATIONS_READ_LIMIT from "~/graphql/notification/mutation/notificationsRead.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  mounted() {
    this.getNotifications();
  },
  components: {
    ZListItemNotification,
    TrainingNotificationItem,
    NotificationConfirmationTrainingItem,
  },
  data() {
    return {
      loading: false,
      items: [],
      errors: this.errorsDefault(),
    };
  },
  emits: ["updateTotalNotifications"],

  methods: {
    getNotificationComponent(type) {
      if (type === "App\\Notifications\\Training\\TrainingNotification") {
        return TrainingNotificationItem;
      } else if (
        type ===
        "App\\Notifications\\Training\\NotificationConfirmationTrainingNotification"
      ) {
        return NotificationConfirmationTrainingItem;
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

      const consult = {
        page: 1,
        first: 5,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando especificado, senão 'cache-first'
      });

      onResult((result) => {
        if (result?.data?.notifications?.data.length > 0) {
          this.paginatorInfo = result.data.notifications.paginatorInfo;
          this.items = result.data.notifications.data;
          this.$emit("updateTotalNotifications", this.paginatorInfo.total);
        }
      });

      if (value) {
        if (value?.notifications?.data.length > 0) {
          this.paginatorInfo = value.notifications.paginatorInfo;
          this.items = value.notifications.data;
          console.log(value.notifications);
          this.$emit("updateTotalNotifications", this.paginatorInfo.total);
        }
      }
      this.loading = false;
    },

    async clear() {
      this.items = [];

      const query = gql`
        ${NOTIFICATIONS_READ_LIMIT}
      `;

      const variables = {
        recentToDeleteCount: 5,
        markAllAsRead: false,
      };

      const { mutate } = await useMutation(query, { variables });

      const { data } = await mutate();

      confirmSuccess(data.notificationsRead.message, () => {
        this.errors = this.errorsDefault();
      });

      this.getNotifications({ fetchPolicy: "network-only" });
    },

    errorsDefault() {
      return {};
    },
  },
};
</script>
