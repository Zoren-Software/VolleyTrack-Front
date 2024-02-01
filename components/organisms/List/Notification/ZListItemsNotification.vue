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
  <va-button size="small" class="mr-6 mb-2"> Limpar </va-button>
</template>

<script>
import ZListItemNotification from "~/components/molecules/List/ZListItemNotification";
import TrainingNotificationItem from "~/components/molecules/List/Notification/TrainingNotificationItem";
import NOTIFICATIONS from "~/graphql/notification/query/notifications.graphql";

export default {
  mounted() {
    this.getNotifications();
  },
  components: {
    ZListItemNotification,
    TrainingNotificationItem,
  },
  data() {
    return {
      loading: false,
      items: [],
    };
  },
  emits: ["updateTotalNotifications"],

  methods: {
    getNotificationComponent(type) {
      if (type === "App\\Notifications\\Training\\TrainingNotification") {
        return TrainingNotificationItem;
      }
      // Aqui você pode adicionar mais condições para outros tipos de notificações
      return ZListItemNotification; // Componente padrão para notificações desconhecidas
    },
    getNotifications() {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${NOTIFICATIONS}
      `;

      const consult = {
        page: 1,
        perPage: 5,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

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
  },
};
</script>
