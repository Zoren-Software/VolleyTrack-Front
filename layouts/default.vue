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
        <NuxtLink v-for="item in navItems" :key="item.title" :to="item.link" :class="['nav-link', { active: item.active }]">
          {{ item.title }}
        </NuxtLink>
      </nav>
    </div>
    <div class="top-bar-right">
      <div class="notification-icon">
        <span class="notification-dot"></span>
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
        { title: "Início", link: "/", active: false },
        { title: "Dashboard", link: "/dashboard", active: false },
        { title: "Jogadores", link: "/players", active: false },
        { title: "Times", link: "/teams", active: false },
        { title: "Treinos", link: "/trainings", active: false },
        { title: "Configurações", link: "/settings", active: false },
      ],
    };
  },
  watch: {
    $route() {
      this.updateActiveLinks();
    },
  },
  created() {
    this.updateActiveLinks();
  },
  methods: {
    updateActiveLinks() {
      this.navItems.forEach((item) => {
        item.active = this.$route.path.startsWith(item.link);
      });
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
}

.nav-link {
  color: #FFFFFF;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.nav-link.active {
  color: #E9742B;
}

.nav-link:hover {
  color: #B0C4DE;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-icon {
  position: relative;
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
