<template>
  <va-navbar color="primary" shape class="mb-1">
    <template #left>
      <va-navbar-item class="logo">
        <va-icon class="ml-2" name="menu" />
      </va-navbar-item>
      <va-navbar-item class="logo">
        <va-icon name="sports_volleyball" />
        <span>VoleiClub</span>
      </va-navbar-item>
    </template>
    <template #right>
      <va-navbar-item>Dashboard</va-navbar-item>
      <va-navbar-item>Reports</va-navbar-item>
      <va-navbar-item>Users</va-navbar-item>
      <va-navbar-item>
        <va-icon name="account_circle" />
      </va-navbar-item>
    </template>
  </va-navbar>
</template>

<script>
export default{
  data () {
    return {
      minimized:false
    }
  },
}
</script>

<style scoped>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}
</style>