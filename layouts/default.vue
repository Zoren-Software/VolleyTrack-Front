<template>
  <va-card color="background-element">
    <NavBar @toggle-minimize="valueTogle" />
    <div class="row align-content-start">
      <div :class="`flex flex-col ` + minimized ? `xs3` : ``">
        <div class="item">
          <SideBar :toggle="minimized" />
        </div>
      </div>
      <div :class="`flex flex-col ` + minimized ? `xs9` : `xs12`">
        <div class="item">
          <NuxtPage />
        </div>
      </div>
    </div>
  </va-card>
</template>

<script>

import SideBar from '~/components/menu/SideBar.vue'
import NavBar from '~/components/organisms/NavBar/NavBar'


export default {
  components: {
    SideBar,
    NavBar
  },
  data () {
    return {
      minimized: false
    }
  },
  methods: {
    valueTogle(value) {
      this.minimized = value
    },
  }
}
</script>