<template>
  <div style="height: 53rem;">
    <va-sidebar :hoverable="toggle" color="background-primary">
      <ZSidebarItem
        v-for="item in titles"
        :key="item.title"
        :title="item.title"
        :link="item.link"
        :icon="item.icon"
        :isActive="item.active"
      />
    </va-sidebar>
  </div>
</template>

<script>
import ZSidebarItem from '~/components/atoms/Sidebar/ZSidebarItem'

export default {
  components: {
    ZSidebarItem
  },
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