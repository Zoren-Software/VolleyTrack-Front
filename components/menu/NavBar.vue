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
      <h4 class="va-h4">{{titleActive()}}</h4>
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
        { title: 'Home', active: this.getNameRoute() === 'index' },
        { title: 'Treinos', active: this.getNameRoute() === 'trainings' },
        { title: 'Times', active: this.getNameRoute() === 'teams' },
        { title: 'Jogadores', active: this.getNameRoute() === 'players' },
      ],
    }
  },

  methods: {
    toggleMinimize() {
      this.minimized = !this.minimized
      this.$emit('toggleMinimize', this.minimized)
    },
    titleActive() {
      return this.titles.find(title => title.active).title
    },
    getNameRoute () {
      return this.$route.name
    },
  }
}
</script>

<style scoped>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}
</style>