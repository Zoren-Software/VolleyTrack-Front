<template>
  <va-card color="background-border">
    <ZNavBar @toggle-minimize="valueToggle" />
    <div class="row align-content-start">
      <div :class="`flex flex-col ` + minimized ? `xs3` : ``">
        <div class="item">
          <ZSidebar :toggle="minimized" />
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

import ZSidebar from '~/components/molecules/Sidebar/ZSidebar'
import ZNavBar from '~/components/organisms/NavBar/ZNavBar'


export default {
  components: {
    ZSidebar,
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