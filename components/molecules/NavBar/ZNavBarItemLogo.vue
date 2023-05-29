<template>
  <ZNavBarItem class="logo">
    <ZIcon
      class="ml-2"
      :name="minimized ? `menu` : `menu_open`"
      @click="toggleMinimize"
    />
  </ZNavBarItem>
</template>

<script>
import ZIcon from '~/components/atoms/Icons/ZIcon';
import ZNavBarItem from '~/components/atoms/NavBar/ZNavBarItem';

export default {
  components: { ZNavBarItem, ZIcon },
  props: {
    minimized: {
      type: Boolean,
      default: false
    },
  },
  emits: ["toggleMinimize"],
  methods: {
    toggleMinimize() {
      this.$emit("toggleMinimize");
    }
  },
}
</script>

<style scoped>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}
</style>