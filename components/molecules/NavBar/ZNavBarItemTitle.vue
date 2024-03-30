<template>
  <ZNavBarItem class="mr-5">
    <h4 class="va-h4">
      {{ title }}
    </h4>
  </ZNavBarItem>
</template>

<script>
import ZNavBarItem from "~/components/atoms/NavBar/ZNavBarItem";

export default {
  components: {
    ZNavBarItem,
  },
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
