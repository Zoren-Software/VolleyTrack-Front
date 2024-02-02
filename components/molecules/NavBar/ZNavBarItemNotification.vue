<template>
  <ZNavBarItem>
    <va-navbar-item>
      <va-button-dropdown :color="color()" hide-icon>
        <template #label>
          <va-badge
            overlap
            :color="totalNotifications > 0 ? 'danger' : 'primary'"
          >
            <template #text>
              <va-icon size="12px" /> {{ totalNotifications }}
            </template>
            <va-icon name="notifications" />
          </va-badge>
        </template>
        <ZListItemsNotification
          @updateTotalNotifications="totalNotificationsChange"
        />
      </va-button-dropdown>
    </va-navbar-item>
  </ZNavBarItem>
</template>

<script>
import ZNavBarItem from "~/components/atoms/NavBar/ZNavBarItem";
import ZButtonDropdown from "~/components/atoms/Buttons/ZButtonDropdown";
import ZBadge from "~/components/atoms/Badges/ZBadge";
import ZIcon from "~/components/atoms/Icons/ZIcon";
import ZListItemsNotification from "~/components/organisms/List/Notification/ZListItemsNotification";
import NOTIFICATIONSTOTAL from "~/graphql/notification/query/notificationsTotal.graphql";

export default {
  data() {
    return {
      totalNotifications: 0,
      paginatorInfo: {},
    };
  },
  components: {
    ZNavBarItem,
    ZButtonDropdown,
    ZBadge,
    ZIcon,
    ZListItemsNotification,
  },
  mounted() {
    this.fetchNotifications();
  },
  methods: {
    color() {
      return this.$route.path === "/notifications"
        ? "primary"
        : "background-primary";
    },
    totalNotificationsChange(value) {
      if (value > 99) {
        this.totalNotifications = "99+";
      } else {
        this.totalNotifications = value;
      }
    },
    fetchNotifications() {
      const query = gql`
        ${NOTIFICATIONSTOTAL}
      `;

      const consult = {
        page: 1,
        first: 5,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.notifications?.paginatorInfo) {
          this.paginatorInfo = result.data.notifications.paginatorInfo;
          this.totalNotificationsChange(this.paginatorInfo.total);
        }
      });

      if (value) {
        if (value?.notifications?.paginatorInfo) {
          this.paginatorInfo = value.notifications.paginatorInfo;
          this.totalNotificationsChange(this.paginatorInfo.total);
        }
      }
    },
  },
};
</script>
