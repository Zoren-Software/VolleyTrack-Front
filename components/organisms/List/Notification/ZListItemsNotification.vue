<template>
  <va-list id="notification-dropdown">
    <va-list-label> Notificações </va-list-label>
    <p class="va-text-success va-title va-text-center" v-if="items.length == 0">
      Nenhuma notificação até o momento
    </p>
    <component
      v-for="item in items"
      :is="getNotificationComponent(item.type)"
      :key="item.id"
      :notification="item"
      @readNotification="readNotificationClear"
    />
  </va-list>
  <div class="mt-3 mb-3">
    <va-divider />
  </div>
  <va-button to="/notifications" size="small" class="mr-6 mb-2 mr-5">
    Ver todas as notificações
  </va-button>
  <va-button
    size="small"
    class="mr-6 mb-2"
    @click="
      clear({
        recentToDeleteCount: 5,
        markAllAsRead: false,
      })
    "
  >
    Limpar
  </va-button>
</template>

<script>
import ZListItemNotification from "~/components/molecules/List/ZListItemNotification";
import TrainingNotificationItem from "~/components/molecules/List/Notification/TrainingNotificationItem";
import NotificationConfirmationTrainingItem from "~/components/molecules/List/Notification/NotificationConfirmationTrainingItem";
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
  },
  data() {
    return {
      loading: false,
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
        "App\\Notifications\\Training\\NotificationConfirmationTrainingNotification"
      ) {
        return NotificationConfirmationTrainingItem;
      }
      // Aqui você pode adicionar mais condições para outros tipos de notificações
      return ZListItemNotification; // Componente padrão para notificações desconhecidas
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
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      await onResult((result) => {
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
          this.$emit("updateTotalNotifications", this.paginatorInfo.total);
        }
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

    async readNotificationClear(id) {
      await this.clear({ id });
      console.log("EMITINDO VALOR");
      this.$emit("oneLessNotification", true);
    },

    errorsDefault() {
      return {};
    },
  },
};
</script>
