<template>
  <div style="height: 53rem;">
    <va-sidebar :hoverable="toggle" >
      <va-sidebar-item
        v-for="item in items"
        :key="item.title"
        :active="item.active"
      >
        <NuxtLink :to="item.link" >
          <va-sidebar-item-content>
            <va-icon :name="item.icon" />
            <va-sidebar-item-title>
              {{ item.title }}
            </va-sidebar-item-title>
          </va-sidebar-item-content>
        </NuxtLink>
      </va-sidebar-item>
      <!-- Colocar o número da versão do projeto alinhado no final da página -->
      <p
        style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.8rem; color: #999;"
      >
        {{ version }}
      </p>
    </va-sidebar>
  </div>
</template>

<script>
import packageJSON from '/package.json';

export default {
  props: {
    toggle: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      items: [
        { title: 'Home', link:'/', icon: 'dashboard', active: this.getNameRoute() === 'index' },
        { title: 'Treinos', link:'trainings', icon: 'fitness_center', active: this.getNameRoute() === 'trainings' },
        { title: 'Times', link:'teams', icon: 'group', active: this.getNameRoute() === 'teams' },
        { title: 'Jogadores', link:'players', icon: 'person', active: this.getNameRoute() === 'players' },
      ],
      version: this.version()
    }
  },

  methods: {
    getNameRoute () {
      return this.$route.name
    },
    version () {
      return packageJSON.version
    }
  },
}
</script>