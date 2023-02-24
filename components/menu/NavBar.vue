<template>
  <va-navbar color="primary" class="mb-1">
    <template #left>
      <va-navbar-item class="logo">
        <va-icon @click="toggleMinimize" class="ml-2" :name="minimized ? `menu` : `menu_open`" />
      </va-navbar-item>
      <va-navbar-item class="logo">
        <va-icon name="sports_volleyball" />
        <span class="ml-2">VoleiClub</span>
      </va-navbar-item>
    </template>
    <template #center>
      <h4 class="va-h4">{{ activeTitle }}</h4>
    </template>
    <template #right>
      <va-navbar-item>Dashboard</va-navbar-item>
      <va-navbar-item>Reports</va-navbar-item>
      <va-navbar-item>
        <va-badge overlap>
          <template #text>
            <va-icon size="12px" /> 5+
          </template>
          <va-icon name="account_circle" />
        </va-badge>
      </va-navbar-item>
      <va-navbar-item>
        <va-icon name="settings" />
      </va-navbar-item>
    </template>
  </va-navbar>
</template>

<script>
export default{
  data () {
    return {
      minimized: false,
      titles: [
        { title: 'Home', link: '/', active: false },
        { title: 'Treinos', link: '/trainings', active: false },
        { title: 'Times', link: '/teams', active: false },
        { title: 'Jogadores', link: '/players', active: false },
      ],
    }
  },

  methods: {
    toggleMinimize() {
      this.minimized = !this.minimized
      this.$emit('toggleMinimize', this.minimized)
    },
  },

  watch: {
    $route() {
      this.computedTitles;
    },
  },

  created() {
    this.computedTitles;
  },

  computed: {
    activeTitle() {
      return this.titles.find((title) => title.active).title;
    },
    computedTitles() {
      return this.titles.map((title) => {
        title.active = this.$route.path === title.link;
        return title
      });
    },
  },
}
</script>

<style scoped>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}
</style>