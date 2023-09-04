<template>
  <ZNavBarItem class="logo">
    <va-icon name="sports_volleyball" />
    <span class="ml-2">VoleiClub</span>
  </ZNavBarItem>
</template>

<script>
import ZNavBarItem from "~/components/atoms/NavBar/ZNavBarItem";

export default {
  components: {
    ZNavBarItem,
  },
};
</script>

<style>
.logo {
  font-weight: 600;
  font-size: 1.5rem;
}
</style>
