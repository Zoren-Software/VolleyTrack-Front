<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">
          <div class="logo-circle">
            <span class="logo-icon">🏐</span>
          </div>
          <span class="system-name">VolleyTrack</span>
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
      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.title"
          :to="item.link"
          :class="['sidebar-link', { active: isRouteActive(item.link) }]"
        >
          <va-icon :name="item.icon" size="20px" class="sidebar-link-icon" />
          <span class="sidebar-link-text">{{ item.title }}</span>
        </NuxtLink>
        <div
          class="dropdown sidebar-dropdown"
          ref="dropdownRef"
          @click.stop="toggleDropdown"
        >
          <span
            class="sidebar-link dropdown-toggle"
            :class="{ active: isSettingsRouteActive() }"
          >
            <va-icon name="settings" size="20px" class="sidebar-link-icon" />
            <span class="sidebar-link-text">Configurações</span>
          </span>
          <div v-if="dropdownOpen" class="dropdown-menu" @click.stop>
            <NuxtLink
              to="/account"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <va-icon
                name="manage_accounts"
                size="18px"
                class="dropdown-item-icon"
              />
              <span>Minha conta</span>
            </NuxtLink>
            <a
              href="#"
              class="dropdown-item"
              @click.prevent="openNotificationSettings"
            >
              <va-icon
                name="notifications_active"
                size="18px"
                class="dropdown-item-icon"
              />
              <span>Configuração de Notificações</span>
            </a>
            <NuxtLink
              to="/settings/devices"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <va-icon name="devices" size="18px" class="dropdown-item-icon" />
              <span>Dispositivos</span>
            </NuxtLink>
            <NuxtLink
              to="/settings/audit"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <va-icon name="history" size="18px" class="dropdown-item-icon" />
              <span>Auditoria</span>
            </NuxtLink>
            <NuxtLink
              to="/settings/privacy"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <va-icon
                name="privacy_tip"
                size="18px"
                class="dropdown-item-icon"
              />
              <span>Exclusão de conta</span>
            </NuxtLink>
          </div>
        </div>
        <button
          type="button"
          class="sidebar-link sidebar-link--logout"
          @click="logout"
        >
          <va-icon name="logout" size="20px" class="sidebar-link-icon" />
          <span class="sidebar-link-text">Sair</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <ZLegalLinks variant="dark" class="sidebar-legal-links" />
        <span class="sidebar-version">v{{ appVersion }}</span>
      </div>
    </aside>
    <div class="main-area">
      <div class="top-bar">
        <nav class="top-bar-breadcrumbs" aria-label="Navegação em trilha">
          <ol class="breadcrumb-list">
            <li
              v-for="(crumb, idx) in breadcrumbs"
              :key="`${idx}-${crumb.to}`"
              class="breadcrumb-item"
            >
              <NuxtLink
                v-if="idx < breadcrumbs.length - 1"
                :to="crumb.to"
                class="breadcrumb-link"
              >
                {{ crumb.label }}
              </NuxtLink>
              <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
              <span
                v-if="idx < breadcrumbs.length - 1"
                class="breadcrumb-sep"
                aria-hidden="true"
                >{{ ">" }}</span
              >
            </li>
          </ol>
        </nav>
        <div class="top-bar-right">
          <ZTopBarLanguageSwitcher />
          <div class="notification-wrapper">
            <va-button-dropdown
              color="background-primary"
              hide-icon
              placement="bottom-end"
              stick-to-edges
            >
              <template #label>
                <span class="notification-trigger">
                  <va-badge
                    v-if="totalNotifications > 0"
                    overlap
                    color="danger"
                    :text="
                      totalNotifications > 99
                        ? '99+'
                        : String(totalNotifications)
                    "
                    class="notification-badge"
                  >
                    <va-icon
                      name="notifications_none"
                      size="22px"
                      class="notification-icon"
                    />
                  </va-badge>
                  <va-icon
                    v-else
                    name="notifications_none"
                    size="22px"
                    class="notification-icon"
                  />
                </span>
              </template>
              <ZListItemsNotification
                @updateTotalNotifications="totalNotificationsChange"
                @oneLessNotification="oneLessNotification"
              />
            </va-button-dropdown>
          </div>
          <div class="top-bar-user" aria-label="Usuário logado">
            <va-avatar v-if="user.id" class="user-avatar user-avatar--static">
              {{ firstLatter }}
            </va-avatar>
            <va-icon v-else name="account_circle" class="user-icon" />
            <div class="user-menu-text">
              <span class="user-menu-name">{{ userDisplayName }}</span>
              <span class="user-menu-role">{{ userRolesLabel }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="content-wrapper">
        <NuxtPage />
      </div>
    </div>
    <ZTermsAcceptanceModal />
  </div>
</template>

<script>
import ZTopBarLanguageSwitcher from "~/components/molecules/NavBar/ZTopBarLanguageSwitcher.vue";
import ZListItemsNotification from "~/components/organisms/List/Notification/ZListItemsNotification.vue";
import ZListItemsUser from "~/components/molecules/List/ZListItemsUser.vue";
import ZLegalLinks from "~/components/organisms/Footer/ZLegalLinks.vue";
import ZTermsAcceptanceModal from "~/components/organisms/Modal/ZTermsAcceptanceModal.vue";
import { useTermsAcceptance } from "~/composables/useTermsAcceptance";
import NOTIFICATIONSTOTAL from "~/graphql/notification/query/notificationsTotal.graphql";
import ME from "~/graphql/user/query/me.graphql";
import { getActivePlan } from "~/services/stripeCheckoutService.js";
import { version as appVersion } from "~/package.json";

export default {
  components: {
    ZTopBarLanguageSwitcher,
    ZListItemsNotification,
    ZListItemsUser,
    ZLegalLinks,
    ZTermsAcceptanceModal,
  },
  data() {
    return {
      navItems: [
        { title: "Início", link: "/", icon: "home" },
        { title: "Jogadores", link: "/players", icon: "people" },
        { title: "Times", link: "/teams", icon: "groups" },
        { title: "Treinos", link: "/trainings", icon: "fitness_center" },
        { title: "Pagamentos", link: "/payment", icon: "payments" },
      ],
      dropdownOpen: false,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      totalNotifications: 0,
      paginatorInfo: {},
      user: {
        id: null,
        name: "Usuário",
        roles: [],
      },
      activePlanData: null,
      appVersion,
    };
  },
  computed: {
    firstLatter() {
      return this.user.name?.charAt(0)?.toUpperCase() || "U";
    },
    userDisplayName() {
      const n = this.user?.name?.trim();
      return n || "Usuário";
    },
    userRolesLabel() {
      const roles = this.user?.roles;
      if (!Array.isArray(roles) || roles.length === 0) {
        return "Sem função definida";
      }
      const names = roles.map((r) => r?.name).filter(Boolean);
      return names.length ? names.join(" • ") : "Sem função definida";
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
          "✅ activePlanIcon retornando: card_giftcard (detectado pelo nome)",
        );
        return "card_giftcard";
      }
      if (productName.includes("pro")) {
        console.log("✅ activePlanIcon retornando: star (detectado pelo nome)");
        return "star";
      }
      if (productName.includes("clubes") || productName.includes("clube")) {
        console.log(
          "✅ activePlanIcon retornando: emoji_events (detectado pelo nome)",
        );
        return "emoji_events";
      }
      if (
        productName.includes("vitalício") ||
        productName.includes("lifetime")
      ) {
        console.log(
          "✅ activePlanIcon retornando: diamond (detectado pelo nome)",
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
      if (planType === "trial") return "#FF4E1B";
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
    breadcrumbs() {
      const path = this.$route?.path || "/";
      const items = [{ label: "Home", to: "/" }];

      if (path === "/" || path === "") {
        return items;
      }

      const labelMap = {
        players: "Jogadores",
        teams: "Times",
        trainings: "Treinos",
        payment: "Pagamentos",
        settings: "Configurações",
        notifications: "Notificações",
        billing: "Faturamentos",
        account: "Conta",
        scout: "Scout",
        "active-plan": "Plano ativo",
        "tenant-deleted": "Conta removida",
        "payment-test": "Teste de pagamento",
        login: "Entrar",
        create: "Novo",
        edit: "Editar",
        success: "Sucesso",
        cancel: "Cancelamento",
        swap: "Troca de plano",
        "set-password": "Definir senha",
      };

      const isIdSegment = (s) =>
        /^\d+$/.test(s) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          s,
        );

      const formatFallback = (s) =>
        s.length
          ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")
          : s;

      const parts = path.split("/").filter(Boolean);
      let i = 0;

      while (i < parts.length) {
        const seg = parts[i];

        if (
          seg === "edit" &&
          i + 1 < parts.length &&
          isIdSegment(parts[i + 1])
        ) {
          items.push({
            label: labelMap.edit,
            to: path.split("?")[0],
          });
          i += 2;
          continue;
        }

        if (seg === "create") {
          const subpath = `/${parts.slice(0, i + 1).join("/")}`;
          items.push({
            label: labelMap.create,
            to: subpath,
          });
          i += 1;
          continue;
        }

        if (isIdSegment(seg)) {
          i += 1;
          continue;
        }

        const subpath = `/${parts.slice(0, i + 1).join("/")}`;
        items.push({
          label: labelMap[seg] || formatFallback(seg),
          to: subpath,
        });
        i += 1;
      }

      return items;
    },
    breadcrumbs() {
      const path = this.$route?.path || "/";
      const items = [{ label: "Home", to: "/" }];

      if (path === "/" || path === "") {
        return items;
      }

      const labelMap = {
        players: "Jogadores",
        teams: "Times",
        trainings: "Treinos",
        payment: "Pagamentos",
        settings: "Configurações",
        notifications: "Notificações",
        billing: "Faturamentos",
        account: "Conta",
        scout: "Scout",
        "active-plan": "Plano ativo",
        "tenant-deleted": "Conta removida",
        "payment-test": "Teste de pagamento",
        login: "Entrar",
        create: "Novo",
        edit: "Editar",
        success: "Sucesso",
        cancel: "Cancelamento",
        swap: "Troca de plano",
        "set-password": "Definir senha",
      };

      const isIdSegment = (s) =>
        /^\d+$/.test(s) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          s,
        );

      const formatFallback = (s) =>
        s.length
          ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")
          : s;

      const parts = path.split("/").filter(Boolean);
      let i = 0;

      while (i < parts.length) {
        const seg = parts[i];

        if (
          seg === "edit" &&
          i + 1 < parts.length &&
          isIdSegment(parts[i + 1])
        ) {
          items.push({
            label: labelMap.edit,
            to: path.split("?")[0],
          });
          i += 2;
          continue;
        }

        if (seg === "create") {
          const subpath = `/${parts.slice(0, i + 1).join("/")}`;
          items.push({
            label: labelMap.create,
            to: subpath,
          });
          i += 1;
          continue;
        }

        if (isIdSegment(seg)) {
          i += 1;
          continue;
        }

        const subpath = `/${parts.slice(0, i + 1).join("/")}`;
        items.push({
          label: labelMap[seg] || formatFallback(seg),
          to: subpath,
        });
        i += 1;
      }

      return items;
    },
  },
  watch: {
    $route() {
      this.closeMobileSidebar();
    },
  },
  mounted() {
    this.notificationsTotal();
    this.getUser();
    this.loadActivePlan();
    // Fechar dropdown ao clicar fora
    document.addEventListener("click", this.handleClickOutside);
    // Restaurar estado colapsado da sidebar
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) this.sidebarCollapsed = saved === "true";
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    isRouteActive(link) {
      const currentPath = this.$route.path;

      // Se for exatamente a rota do menu, está ativo
      if (currentPath === link) {
        return true;
      }

      // Para a rota "/" (Início), só ativa se for exatamente "/"
      if (link === "/") {
        return false;
      }

      // Verificar rotas relacionadas (create e edit)
      if (link === "/players") {
        return (
          currentPath.startsWith("/players/create") ||
          currentPath.startsWith("/players/edit")
        );
      }

      if (link === "/teams") {
        return (
          currentPath.startsWith("/teams/create") ||
          currentPath.startsWith("/teams/edit")
        );
      }

      if (link === "/trainings") {
        return (
          currentPath.startsWith("/trainings/create") ||
          currentPath.startsWith("/trainings/edit")
        );
      }

      if (link === "/payment") {
        return currentPath.startsWith("/payment/");
      }

      return false;
    },
    isSettingsRouteActive() {
      const currentPath = this.$route.path;
      return (
        currentPath === "/settings" ||
        currentPath === "/settings/notifications" ||
        currentPath === "/settings/devices" ||
        currentPath === "/settings/audit" ||
        currentPath === "/settings/privacy"
      );
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    openDropdown() {
      this.dropdownOpen = true;
    },
    closeDropdown() {
      this.dropdownOpen = false;
    },
    handleClickOutside(event) {
      if (
        this.$refs.dropdownRef &&
        !this.$refs.dropdownRef.contains(event.target)
      ) {
        this.closeDropdown();
      }
    },
    onUpgradeClicked() {
      console.log("🚀 Redirecionando para página de upgrade de planos");
    },
    openNotificationSettings() {
      this.$router.push("/settings/notifications");
      this.dropdownOpen = false; // Fechar o dropdown ao navegar
    },
    logout() {
      const { onLogout } = useApollo();
      onLogout();
      localStorage.removeItem("user");
      localStorage.removeItem("userToken");
      this.closeDropdown();
      this.$router.push("/login");
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
      const token =
        localStorage.getItem("userToken") ||
        localStorage.getItem("apollo:default.token");

      if (token) {
        try {
          const query = gql`
            ${ME}
          `;
          const {
            data: { value },
          } = await useAsyncQuery(query, {});

          if (value?.me) {
            this.user = {
              ...this.user,
              ...value.me,
              roles: value.me.roles || [],
            };
            localStorage.setItem("user", JSON.stringify(this.user));
            useTermsAcceptance().syncFromUser(value.me);
            return;
          }
        } catch (e) {
          console.warn("Layout getUser: erro ao carregar me", e);
        }
      }

      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.user = {
            id: null,
            name: "Usuário",
            roles: [],
            ...parsed,
            roles: Array.isArray(parsed?.roles) ? parsed.roles : [],
          };
        } catch {
          /* ignore */
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
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem("sidebarCollapsed", String(this.sidebarCollapsed));
    },
    toggleMobileSidebar() {
      this.sidebarMobileOpen = !this.sidebarMobileOpen;
    },
    closeMobileSidebar() {
      this.sidebarMobileOpen = false;
    },
  },
};
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #0b1e3a;
  border-right: 1px solid #1e3a5f;
  padding: 20px 16px;
  box-sizing: border-box;
  z-index: 999;
  overflow: hidden;
}

.sidebar-brand {
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 28px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #e8eef7;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  min-width: 0;
}

.sidebar-link-text {
  min-width: 0;
}

.sidebar-link-icon {
  flex-shrink: 0;
  color: rgba(232, 238, 247, 0.88) !important;
  transition: color 0.15s ease;
}

.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.sidebar-link:hover .sidebar-link-icon {
  color: #ffffff !important;
}

.sidebar-link.active {
  background-color: rgba(255, 78, 27, 0.18);
  color: #ff8c42;
}

.sidebar-link.active .sidebar-link-icon {
  color: #ff8c42 !important;
}

.sidebar-link.dropdown-toggle {
  cursor: pointer;
  user-select: none;
}

button.sidebar-link {
  width: 100%;
  border: none;
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.sidebar-link--logout {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  color: #fca5a5;
}

.sidebar-link--logout .sidebar-link-icon {
  color: #fca5a5 !important;
}

.sidebar-link--logout:hover {
  background-color: rgba(220, 38, 38, 0.2);
  color: #fecaca;
}

.sidebar-link--logout:hover .sidebar-link-icon {
  color: #fecaca !important;
}

.sidebar-dropdown {
  position: relative;
  width: 100%;
}

.sidebar-dropdown .dropdown-menu {
  left: 0;
  right: 0;
  width: 100%;
  min-width: unset;
}

.main-area {
  flex: 1;
  min-width: 0;
  margin-left: 260px;
  width: calc(100% - 260px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sidebar-is-collapsed .sidebar {
  width: 64px;
}

.sidebar-is-collapsed .main-area {
  margin-left: 64px;
  width: calc(100% - 64px);
}

.top-bar {
  background-color: #ffffff;
  min-height: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 16px;
  border-bottom: 1px solid #e5e7eb;
  overflow: visible;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  z-index: 999;
  flex-shrink: 0;
}

.top-bar-breadcrumbs {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  line-height: 1.3;
  min-width: 0;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.breadcrumb-link:hover {
  color: #ff4e1b;
}

.breadcrumb-current {
  color: #0b1e3a;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.breadcrumb-sep {
  color: #d1d5db;
  margin: 0 8px;
  font-weight: 500;
  user-select: none;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  line-height: 1.3;
  min-width: 0;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.breadcrumb-link:hover {
  color: #ff4e1b;
}

.breadcrumb-current {
  color: #0b1e3a;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.breadcrumb-sep {
  color: #d1d5db;
  margin: 0 8px;
  font-weight: 500;
  user-select: none;
}

.logo {
  display: flex;
  align-items: center;
  position: relative;
}

.logo-circle {
  background-color: #ff4e1b;
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 10px;
}

.plan-icon-logo {
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  visibility: visible !important;
  opacity: 1;
  max-width: 40px;
  overflow: hidden;
  transition:
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
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

.dropdown {
  position: relative;
  z-index: 10001;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 10002 !important;
  min-width: 200px;
  pointer-events: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #333333;
  text-decoration: none;
  font-size: 14px;
}

.dropdown-item-icon {
  flex-shrink: 0;
  color: #6b7280 !important;
  transition: color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f6f7f9;
  color: #ff4e1b;
}

.dropdown-item:hover .dropdown-item-icon {
  color: #ff4e1b !important;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.notification-wrapper {
  position: relative;
  z-index: 1001;
  overflow: visible;
}

.notification-wrapper :deep(.va-button-dropdown) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  --va-background-color: transparent !important;
  z-index: 1001;
}

.notification-wrapper :deep(.va-button-dropdown__anchor) {
  --va-background-color: transparent !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 44px;
}

.notification-wrapper :deep(.va-dropdown__content-wrapper) {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  margin-top: 8px;
  min-width: min(320px, calc(100vw - 24px));
  max-width: min(420px, calc(100vw - 24px));
  max-height: none;
  overflow: visible;
  padding: 0;
  z-index: 10002 !important;
}

.notification-wrapper :deep(.va-dropdown__content) {
  padding: 0 !important;
  overflow: visible !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  background: transparent !important;
}

.notification-trigger {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  padding: 2px;
  flex-shrink: 0;
  line-height: 0;
  position: relative;
  cursor: pointer;
}

.notification-badge {
  line-height: 0 !important;
}

.notification-wrapper :deep(.notification-trigger .va-badge) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 0 !important;
}

.notification-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #6b7280 !important;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  --va-background-color: transparent !important;
  background: transparent !important;
  line-height: 1 !important;
}

.notification-icon:hover {
  color: #4b5563 !important;
}

.notification-wrapper :deep(.va-button-dropdown__label) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  --va-background-color: transparent !important;
  background: transparent !important;
  line-height: 0 !important;
  min-height: 44px;
}

.top-bar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: min(260px, 32vw);
  text-align: left;
}

.user-menu-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  max-width: min(220px, 28vw);
}

.user-menu-name {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.25;
  color: #0b1e3a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.user-menu-role {
  font-size: 11px;
  line-height: 1.3;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  width: 100%;
  word-break: break-word;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border: 2px solid white !important;
  transition: all 0.2s ease;
  background: #ff4e1b !important;
  color: white !important;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --va-size-computed: 32px !important;
}

.user-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  background: #ff4e1b !important;
  color: white !important;
  --va-size-computed: 40px !important;
  width: 32px !important;
  height: 32px !important;
}

.user-avatar--static {
  cursor: default;
}

.user-icon {
  font-size: 32px;
  color: #0b1e3a;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .layout-container {
    flex-direction: column;
  }

  .sidebar {
    position: sticky;
    top: 0;
    left: auto;
    bottom: auto;
    width: 100%;
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .sidebar-nav {
    overflow-y: visible;
  }

  .main-area {
    margin-left: 0;
    width: 100%;
  }
}

.sidebar-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* ── Sidebar Colapsada ── */
.sidebar--collapsed {
  width: 64px;
  padding: 20px 8px;
}

.sidebar--collapsed .system-name {
  max-width: 0;
  opacity: 0;
  margin-left: 0;
}

.sidebar--collapsed .plan-icon-logo {
  max-width: 0;
  opacity: 0;
}

.sidebar--collapsed .sidebar-link {
  justify-content: center;
  gap: 0;
  padding: 10px;
}

.sidebar--collapsed .sidebar-link-text {
  max-width: 0;
  opacity: 0;
}

.sidebar--collapsed .sidebar-brand {
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.sidebar--collapsed .logo {
  justify-content: center;
  width: 100%;
}

.sidebar--collapsed .sidebar-nav {
  margin-top: 0px;
}

/* ── Rodapé da Sidebar ── */
.sidebar-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0 4px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-legal-links {
  max-width: 100%;
  overflow: hidden;
  opacity: 1;
  transition:
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar--collapsed .sidebar-legal-links {
  display: none;
}

.sidebar-version {
  font-size: 12px;
  color: rgba(232, 238, 247, 0.3);
  white-space: nowrap;
  overflow: hidden;
  max-width: 120px;
  opacity: 1;
  transition:
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar--collapsed .sidebar-version {
  max-width: 0;
  opacity: 0;
}

/* ── Mobile Hamburger (só visível em mobile) ── */
.mobile-hamburger {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #0b1e3a;
  padding: 4px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.mobile-hamburger:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

/* ── Backdrop ── */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.25s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* ── Responsividade Mobile (<768px) ── */
@media (max-width: 768px) {
  .sidebar {
    position: sticky;
    top: 0;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #1e3a5f;
    padding: 14px 16px;
    overflow: visible;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 16px;
    gap: 6px 8px;
    overflow-y: visible;
  }

  .sidebar-link {
    padding: 8px 10px;
    font-size: 14px;
  }

  .sidebar-dropdown {
    width: auto;
    min-width: min(100%, 200px);
  }

  .sidebar-dropdown .dropdown-menu {
    width: max-content;
    min-width: 200px;
  }

  .sidebar-link--logout {
    margin-top: 8px;
    flex-basis: 100%;
    width: 100%;
  }
}
</style>

<style>
/* Estilo global para evitar overflow horizontal */
body,
html {
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}
</style>

<style>
/* Transições modernas de página */
.page-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
  filter: blur(2px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(1.01);
  filter: blur(1px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}
</style>
