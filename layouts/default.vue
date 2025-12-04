<template>
  <va-card color="background-border" class="pb-3" style="height: 100%">
    <ZNavBar
      :minimized="minimized"
      @toggle-minimize="valueToggle"
      @menu-settings-minimize="onMenuSettingsMinimize"
    />

    <div class="row align-content-start">
      <!-- Coluna lateral esquerda -->
      <div
        :class="['flex', 'flex-col', minimized ? 'xs1 sm1 md1 lg1 xl1' : 'xs2']"
      >
        <div class="item">
          <ZSidebar :toggle="minimized" />
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div
        :class="[
          'flex',
          'flex-col',
          minimized ? 'xs11 sm11 md11 lg11 xl11' : 'xs10',
        ]"
      >
        <div class="item margin-menu">
          <NuxtPage />
        </div>
      </div>
    </div>

    <!-- Sidebar flutuante à direita -->
    <ZSidebarSettings v-model="enabledSettings" />

    <!-- Modal de erro de limite de plano -->
    <PlanLimitErrorModal
      v-model="isModalOpen"
      :error-data="errorData"
      @upgrade-clicked="onUpgradeClicked"
    />
  </va-card>
</template>

<script>
import ZSidebar from "~/components/molecules/Sidebar/ZSidebar";
import ZSidebarSettings from "~/components/molecules/Sidebar/ZSidebarSettings";
import ZNavBar from "~/components/organisms/NavBar/ZNavBar";
import PlanLimitErrorModal from "~/components/PlanLimitErrorModal.vue";
import { usePlanLimitError } from "~/composables/usePlanLimitError";

export default {
  components: {
    ZSidebar,
    ZNavBar,
    ZSidebarSettings,
    PlanLimitErrorModal,
  },
  setup() {
    const { isModalOpen, errorData } = usePlanLimitError();
    return {
      isModalOpen,
      errorData,
    };
  },
  data() {
    return {
      minimized: false,
      enabledSettings: false,
      minimizedSettings: false, // ✅ adiciona isso aqui
    };
  },
  methods: {
    valueToggle(value) {
      this.minimized = value;
    },
    onMenuSettingsMinimize() {
      this.enabledSettings = !this.enabledSettings;
    },
    handleMenuItemClick(item) {
      if (item.action) {
        item.action.call(this);
      } else if (item.to) {
        this.$router.push(item.to);
      }
    },
    onUpgradeClicked() {
      console.log("🚀 Redirecionando para página de upgrade de planos");
    },
  },
};
</script>

<style scoped>
.margin-menu {
  margin-top: 6rem;
}
.settings-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 999;
}
</style>
