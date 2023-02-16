<template>
  <div style="height: 54rem;">
    <va-sidebar hoverable >
      <va-sidebar-item
        v-for="item in items"
        :key="item.title"
        :active="item.active"
      >
        <va-sidebar-item-content>
          <va-icon :name="item.icon" />
          <va-sidebar-item-title>
            {{ item.title }}
          </va-sidebar-item-title>
        </va-sidebar-item-content>
      </va-sidebar-item>
    </va-sidebar>
  </div>
</template>

<script>
export default {
  data () {
    return {
      items: [
        { title: 'Home', icon: 'dashboard', active: this.getNameRoute() === 'index' },
        { title: 'Treinos', icon: 'fitness_center', active: this.getNameRoute() === 'trainings' },
        { title: 'Times', icon: 'group', active: this.getNameRoute() === 'teams' },
        { title: 'Jogadores', icon: 'person', active: this.getNameRoute() === 'players' },
      ],
    }
  },

  methods: {
    getNameRoute () {
      return this.$route.name
    },
  },
}
</script>