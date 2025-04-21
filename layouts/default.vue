<template>
  <va-card color="background-border" class="pb-3" style="height: 100%">
    <ZNavBar
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
  </va-card>
</template>

<script>
import ZSidebar from "~/components/molecules/Sidebar/ZSidebar";
import ZSidebarSettings from "~/components/molecules/Sidebar/ZSidebarSettings";
import ZNavBar from "~/components/organisms/NavBar/ZNavBar";

export default {
  components: {
    ZSidebar,
    ZNavBar,
    ZSidebarSettings,
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
