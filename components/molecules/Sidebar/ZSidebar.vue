<template>
  <div class="sidebar-custom">
    <va-sidebar :minimized="toggle" color="background-primary">
      <ZSidebarItem
        v-for="item in computedTitles"
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
import ZSidebarItem from "~/components/atoms/Sidebar/ZSidebarItem";

export default {
  components: {
    ZSidebarItem,
  },
  props: {
    toggle: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      titles: [
        {
          title: "Home",
          link: "/",
          icon: "dashboard",
        },
        {
          title: "Treinos",
          link: "/trainings",
          icon: "fitness_center",
        },
        {
          title: "Times",
          link: "/teams",
          icon: "group",
        },
        {
          title: "Jogadores",
          link: "/players",
          icon: "person",
        },
      ],
    };
  },
  computed: {
    computedTitles() {
      // Retorna um novo array sem mutar o original
      return this.titles.map((title) => ({
        ...title,
        active: this.$route.path === title.link,
      }));
    },
  },
};
</script>

<style scoped>
.sidebar-custom {
  height: 100%;
  position: fixed;
  margin-top: 5.2rem;
}
</style>
