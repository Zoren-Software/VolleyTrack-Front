<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div class="logo">
        <div class="logo-circle">
          <span class="logo-icon">🏐</span>
        </div>
        <span class="system-name">VolleyTrack</span>
        <!-- Ícone do Plano Ativo -->
        <div v-if="activePlanIcon" class="plan-icon-logo">
          <div class="plan-icon-wrapper">
            <va-icon
              :name="activePlanIcon"
              :color="activePlanColor"
              class="plan-icon-menu"
            />
            <div class="plan-tooltip-custom">
              <div class="plan-tooltip-title">
                <va-icon
                  :name="activePlanIcon"
                  :color="activePlanColor"
                  size="16px"
                />
                <span>{{ activePlanName }}</span>
              </div>
              <div class="plan-tooltip-content">
                <p class="plan-tooltip-message">Plano ativo da sua conta</p>
              </div>
            </div>
          </div>
        </div>
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
</template>

<script>
import ZListItemsNotification from "~/components/organisms/List/Notification/ZListItemsNotification.vue";
import ZListItemsUser from "~/components/molecules/List/ZListItemsUser.vue";
import NOTIFICATIONSTOTAL from "~/graphql/notification/query/notificationsTotal.graphql";
import ME from "~/graphql/user/query/me.graphql";
import { getActivePlan } from "~/services/stripeCheckoutService.js";

export default {
  components: {
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
      totalNotifications: 0,
      paginatorInfo: {},
      user: {
        id: null,
        name: "Usuário",
      },
      activePlanData: null,
    };
  },
  computed: {
    firstLatter() {
      return this.user.name?.charAt(0)?.toUpperCase() || "U";
    },
    activePlanIcon() {
      if (!this.activePlanData) {
        console.log("🔍 activePlanIcon: activePlanData é null");
        return null;
      }

      console.log("🔍 activePlanIcon - activePlanData:", this.activePlanData);

      // Verificar se tem produto
      const product = this.activePlanData.product;
      if (!product) {
        console.log("🔍 activePlanIcon: product não encontrado");
        return null;
      }

      console.log("🔍 activePlanIcon - product:", product);

      // Normalizar metadata
      let metadata = {};
      if (product.metadata) {
        if (typeof product.metadata === "string") {
          try {
            metadata = JSON.parse(product.metadata || "{}");
          } catch (e) {
            console.warn("Erro ao fazer parse de metadata:", e);
            metadata = {};
          }
        } else {
          metadata = product.metadata;
        }
      }

      console.log("🔍 activePlanIcon - metadata:", metadata);

      // Tentar obter plan_type de várias fontes
      const planType =
        metadata.plan_type ||
        this.activePlanData.plan_type ||
        (product.name && product.name.toLowerCase().includes("trial")
          ? "trial"
          : null) ||
        (product.name && product.name.toLowerCase().includes("pro")
          ? "pro"
          : null) ||
        (product.name && product.name.toLowerCase().includes("clubes")
          ? "clubes"
          : null) ||
        ((product.name && product.name.toLowerCase().includes("vitalício")) ||
        product.name.toLowerCase().includes("lifetime")
          ? "lifetime"
          : null);

      console.log("🔍 activePlanIcon - planType detectado:", planType);

      // Determinar ícone baseado no tipo de plano
      if (planType === "trial") {
        console.log("✅ activePlanIcon retornando: card_giftcard");
        return "card_giftcard";
      }
      if (planType === "pro") {
        console.log("✅ activePlanIcon retornando: star");
        return "star";
      }
      if (planType === "clubes") {
        console.log("✅ activePlanIcon retornando: emoji_events");
        return "emoji_events";
      }
      if (
        planType === "lifetime" ||
        this.activePlanData.plan_type === "one_time_payment"
      ) {
        console.log("✅ activePlanIcon retornando: diamond");
        return "diamond";
      }

      // Fallback: tentar detectar pelo nome do produto
      const productName = (product.name || "").toLowerCase();
      if (productName.includes("trial")) {
        console.log(
          "✅ activePlanIcon retornando: card_giftcard (detectado pelo nome)"
        );
        return "card_giftcard";
      }
      if (productName.includes("pro")) {
        console.log("✅ activePlanIcon retornando: star (detectado pelo nome)");
        return "star";
      }
      if (productName.includes("clubes") || productName.includes("clube")) {
        console.log(
          "✅ activePlanIcon retornando: emoji_events (detectado pelo nome)"
        );
        return "emoji_events";
      }
      if (
        productName.includes("vitalício") ||
        productName.includes("lifetime")
      ) {
        console.log(
          "✅ activePlanIcon retornando: diamond (detectado pelo nome)"
        );
        return "diamond";
      }

      console.log("⚠️ activePlanIcon: nenhum tipo de plano detectado");
      return null;
    },
    activePlanColor() {
      if (!this.activePlanData || !this.activePlanData.product) {
        return "#6b7280";
      }

      // Normalizar metadata
      const metadata = this.activePlanData.product.metadata || {};
      const planType =
        typeof metadata === "string"
          ? JSON.parse(metadata || "{}").plan_type
          : metadata.plan_type;

      // Determinar cor baseado no tipo de plano
      if (planType === "trial") return "#e9742b";
      if (planType === "pro") return "#3b82f6";
      if (planType === "clubes") return "#10b981";
      if (
        planType === "lifetime" ||
        this.activePlanData.plan_type === "one_time_payment"
      )
        return "#2563eb";

      return "#6b7280";
    },
    activePlanName() {
      if (!this.activePlanData || !this.activePlanData.product) {
        return "Sem plano ativo";
      }

      return this.activePlanData.product.name || "Plano Ativo";
    },
  },
  mounted() {
    this.notificationsTotal();
    this.getUser();
    this.loadActivePlan();
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
      this.$router.push("/notifications/settings");
      this.dropdownOpen = false; // Fechar o dropdown ao navegar
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
    async loadActivePlan() {
      try {
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("apollo:default.token");
        if (!token) {
          console.log("⚠️ Token não encontrado para carregar plano ativo");
          return;
        }

        const tenantId = localStorage.getItem("tenant_id") || "default";
        console.log("🔍 Carregando plano ativo - tenantId:", tenantId);

        const result = await getActivePlan(token, tenantId);
        console.log("🔍 Resultado do getActivePlan:", result);

        if (result.success && result.data) {
          this.activePlanData = result.data;
          console.log("✅ Plano ativo carregado no menu:", result.data);
          console.log("🔍 activePlanIcon será:", this.activePlanIcon);
        } else {
          console.log("⚠️ Plano ativo não encontrado ou erro:", result);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar plano ativo no menu:", error);
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
  gap: 12px;
  position: relative;
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
  margin-left: 0;
}

.plan-icon-logo {
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  visibility: visible !important;
  opacity: 1 !important;
}

.plan-icon-wrapper {
  position: relative;
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  visibility: visible !important;
  opacity: 1 !important;
}

.plan-icon-menu {
  font-size: 24px !important;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.plan-icon-menu:hover {
  transform: scale(1.1);
}

/* Tooltip customizado com CSS puro */
.plan-tooltip-custom {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 1000;
}

.plan-tooltip-custom::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: white;
}

.plan-icon-wrapper:hover .plan-tooltip-custom {
  opacity: 1;
  visibility: visible;
}

/* Tooltip do Plano */
.plan-tooltip-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.plan-tooltip-content {
  padding-top: 4px;
}

.plan-tooltip-message {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
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
