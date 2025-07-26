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
          <span class="nav-link dropdown-toggle">
            Configurações
          </span>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <NuxtLink to="/settings" class="dropdown-item">Configuração de Conta</NuxtLink>
            <NuxtLink to="/settings/notifications" class="dropdown-item">Configuração de Notificações</NuxtLink>
          </div>
        </div>
      </nav>
    </div>
    <div class="top-bar-right">
      <div class="notification-icon" @click="toggleNotifications">
        <span class="notification-dot" v-if="hasUnreadNotifications"></span>
        <va-icon name="notifications" />
      </div>
      <va-avatar class="user-avatar" />
    </div>
  </div>
  <div class="content-wrapper">
    <NuxtPage />
  </div>
</template>

<script>
export default {
  data() {
    return {
      navItems: [
        { title: "Início", link: "/" },
        { title: "Dashboard", link: "/dashboard" },
        { title: "Jogadores", link: "/players" },
        { title: "Times", link: "/teams" },
        { title: "Treinos", link: "/trainings" },
      ],
      dropdownOpen: false,
      hasUnreadNotifications: true, // Simula notificações não lidas
    };
  },
  methods: {
    openDropdown() {
      this.dropdownOpen = true;
    },
    closeDropdown() {
      this.dropdownOpen = false;
    },
    toggleNotifications() {
      // Lógica para abrir ou fechar o menu de notificações
      console.log("Abrir notificações");
    },
  },
};
</script>

<style scoped>
.top-bar {
  background-color: #0B1E3A;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #C0C0C0;
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
  background-color: #E9742B;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  color: #FFFFFF;
  font-size: 16px;
}

.system-name {
  color: #FFFFFF;
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
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.nav-link.active {
  color: #E9742B; /* Cor laranja para a rota ativa */
}

.nav-link:hover {
  color: #B0C4DE;
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

.notification-icon {
  position: relative;
  cursor: pointer;
}

.notification-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: #E9742B;
  border-radius: 50%;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border: 1px solid #2C2C2C;
}
.content-wrapper {
  margin-top: 60px;
  padding: 20px;
}
</style>
