<template>
  <div style="height: 53rem;">
    <va-sidebar :hoverable="toggle" color="background-primary">
      <va-sidebar-item
        v-for="item in titles"
        :key="item.title"
        :active="item.active"
      >
        <NuxtLink 
          :to="item.link"
          class="no-style-link"
        >
          <va-sidebar-item-content>
            <va-icon :name="item.icon" />
            <va-sidebar-item-title>
              {{ item.title }}
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </NuxtLink>
      </va-sidebar-item>
    </va-sidebar>
  </div>
</template>

<script>

export default {
  props: {
    toggle: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      titles: [
        { title: 'Home', link:'/', icon: 'dashboard', active: false },
        { title: 'Treinos', link:'/trainings', icon: 'fitness_center', active: false },
        { title: 'Times', link:'/teams', icon: 'group', active: false },
        { title: 'Jogadores', link:'/players', icon: 'person', active: false },
      ],
    }
  },

  computed: {
    activeTitle() {
      return this.titles.find((title) => title.active).active;
    },
    computedTitles() {
      return this.titles.map((title) => {
        title.active = this.$route.path === title.link;
        return title
      });
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
}
</script>

<style>
.no-style-link {
  color: inherit;
  text-decoration: none;
}
</style>
