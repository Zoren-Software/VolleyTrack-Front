<template>
  <va-card color="background-element">
    <ZNavBar @toggle-minimize="valueToggle" />
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

import SideBar from '~/components/menu/SideBar'
import ZNavBar from '~/components/organisms/NavBar/ZNavBar'


export default {
  components: {
    SideBar,
    ZNavBar
  },
  data () {
    return {
      minimized: false
    }
  },
  methods: {
    valueToggle(value) {
      this.minimized = value
    },
  }
}
</script>