<template>
   <va-card color="background-element" >
    <NavBar />
    <div class="row align-content-start">
      <div class="flex flex-col xs2">
        <div class="item">
          <SideBar />
        </div>
      </div>
      <div class="flex flex-col xs10">
        <div class="item">
          <NuxtPage />
        </div>
      </div>
    </div>
  </va-card>
</template>

<script>

import SideBar from '~/components/menu/SideBar.vue'
import NavBar from '~/components/menu/NavBar.vue'

export default {
  components: {
    SideBar,
    NavBar
  }
}
</script>