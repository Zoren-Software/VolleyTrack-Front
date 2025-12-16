<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div class="logo">
        <div class="logo-circle">
          <span class="logo-icon">🏐</span>
        </div>
        <span class="system-name">VolleyTrack</span>
      </div>
    </div>
    <div class="top-bar-center">
      <nav class="nav-links">
        <NuxtLink
          v-for="item in navItems"
          :key="item.title"
          :to="item.link"
          :class="['nav-link', { active: $route.path === item.link }]"
        >
          {{ item.title }}
        </NuxtLink>
        <div
          class="dropdown"
          @mouseover="openDropdown"
          @mouseleave="closeDropdown"
        >
          <span class="nav-link dropdown-toggle"> Configurações </span>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <NuxtLink to="/settings" class="dropdown-item"
              >Configuração de Conta</NuxtLink
            >
            <a
              href="#"
              class="dropdown-item"
              @click.prevent="openNotificationSettings"
              >Configuração de Notificações</a
            >
          </div>
        </div>
      </nav>
    </div>
    <div class="top-bar-right">
      <div class="notification-wrapper">
        <va-button-dropdown color="background-primary" hide-icon>
          <template #label>
            <va-badge
              v-if="totalNotifications > 0"
              overlap
              color="danger"
              :text="
                totalNotifications > 99 ? '99+' : String(totalNotifications)
              "
            >
              <va-icon name="notifications" class="notification-icon" />
            </va-badge>
            <va-icon v-else name="notifications" class="notification-icon" />
          </template>
          <ZListItemsNotification
            @updateTotalNotifications="totalNotificationsChange"
            @oneLessNotification="oneLessNotification"
          />
        </va-button-dropdown>
      </div>
      <div class="user-menu-wrapper">
        <va-button-dropdown color="background-primary" hide-icon>
          <template #label>
            <va-avatar v-if="user.id" class="user-avatar">
              {{ firstLatter }}
            </va-avatar>
            <va-icon v-else name="account_circle" class="user-icon" />
          </template>
          <ZListItemsUser />
        </va-button-dropdown>
      </div>
    </div>
  </div>
  <div class="content-wrapper">
    <NuxtPage />
  </div>
  <ZNotificationSettingsForm v-model="openNotificationModal" />
</template>

<script>
import ZNotificationSettingsForm from "~/components/organisms/Settings/ZNotificationSettingsForm.vue";
import ZListItemsNotification from "~/components/organisms/List/Notification/ZListItemsNotification.vue";
import ZListItemsUser from "~/components/molecules/List/ZListItemsUser.vue";
import NOTIFICATIONSTOTAL from "~/graphql/notification/query/notificationsTotal.graphql";
import ME from "~/graphql/user/query/me.graphql";

export default {
  components: {
    ZNotificationSettingsForm,
    ZListItemsNotification,
    ZListItemsUser,
  },
  data() {
    return {
      navItems: [
        { title: "Início", link: "/" },
        { title: "Jogadores", link: "/players" },
        { title: "Times", link: "/teams" },
        { title: "Treinos", link: "/trainings" },
        { title: "Pagamentos", link: "/payment" },
      ],
      dropdownOpen: false,
      openNotificationModal: false,
      totalNotifications: 0,
      paginatorInfo: {},
      user: {
        id: null,
        name: "Usuário",
      },
    };
  },
  computed: {
    firstLatter() {
      return this.user.name?.charAt(0)?.toUpperCase() || "U";
    },
  },
  mounted() {
    this.notificationsTotal();
    this.getUser();
  },
  methods: {
    openDropdown() {
      this.dropdownOpen = true;
    },
    closeDropdown() {
      this.dropdownOpen = false;
    },
    onUpgradeClicked() {
      console.log("🚀 Redirecionando para página de upgrade de planos");
    },
    openNotificationSettings() {
      this.openNotificationModal = true;
      this.dropdownOpen = false; // Fechar o dropdown ao abrir o modal
    },
    totalNotificationsChange(value) {
      if (value > 99) {
        this.totalNotifications = 99;
      } else {
        this.totalNotifications = value;
      }
    },
    oneLessNotification() {
      if (this.totalNotifications > 0) {
        this.totalNotificationsChange(this.totalNotifications - 1);
      }
    },
    notificationsTotal() {
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
    async getUser() {
      if (localStorage.getItem("user")) {
        this.user = await JSON.parse(localStorage.getItem("user"));
      } else {
        const query = gql`
          ${ME}
        `;
        const {
          data: { value },
        } = await useAsyncQuery(query, {});

        if (value?.me) {
          this.user = value.me;
          localStorage.setItem("user", JSON.stringify(this.user));
        }
      }
    },
  },
};
</script>

<style scoped>
.top-bar {
  background-color: #0b1e3a;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #c0c0c0;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-circle {
  background-color: #e9742b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  color: #ffffff;
  font-size: 16px;
}

.system-name {
  color: #ffffff;
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: 8px;
}

.top-bar-center {
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: 16px;
  position: relative;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.nav-link.active {
  color: #e9742b; /* Cor laranja para a rota ativa */
}

.nav-link:hover {
  color: #b0c4de;
}

.nav-link.dropdown-toggle {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 10;
  white-space: nowrap; /* Evita quebra de texto */
}

.dropdown-item {
  display: block;
  padding: 10px 12px;
  color: #333333;
  text-decoration: none;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f6f7f9;
  color: #e9742b;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-wrapper {
  position: relative;
}

.notification-wrapper :deep(.va-button-dropdown) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  --va-background-color: transparent !important;
}

.notification-wrapper :deep(.va-button-dropdown__anchor) {
  --va-background-color: transparent !important;
  background: transparent !important;
}

.notification-wrapper :deep(.va-button-dropdown__content) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  min-width: 350px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
}

.notification-icon {
  font-size: 24px !important;
  color: #e9742b !important;
  cursor: pointer;
  transition: color 0.2s ease;
  --va-background-color: transparent !important;
  background: transparent !important;
}

.notification-icon:hover {
  color: #ff8c42 !important;
  --va-background-color: transparent !important;
  background: transparent !important;
}

.notification-wrapper :deep(.va-button-dropdown__label) {
  --va-background-color: transparent !important;
  background: transparent !important;
}

.user-menu-wrapper {
  position: relative;
}

.user-menu-wrapper :deep(.va-button-dropdown) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  --va-background-color: transparent !important;
}

.user-menu-wrapper :deep(.va-button-dropdown__content) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  min-width: 200px;
  max-width: 250px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid #e9742b;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #e9742b 0%, #ff6b35 100%);
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.user-avatar:hover {
  border-color: #ff8c42;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
}

.user-icon {
  font-size: 40px;
  color: #ffffff;
  cursor: pointer;
}
.content-wrapper {
  padding: 20px;
}
</style>
