<template>
  <va-card color="background-border" class="pb-3" style="height: 100%">
    <ZNavBar @toggle-minimize="valueToggle" />
    <div class="row align-content-start">
      <div
        :class="['flex', 'flex-col', minimized ? 'xs1 sm1 md1 lg1 xl1' : 'xs2']"
      >
        <div class="item">
          <ZSidebar :toggle="minimized" />
        </div>
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          minimized ? 'xs11 sm11 md11 lg11 xl11' : 'xs10',
        ]"
      >
        <div class="item">
          <NuxtPage />
        </div>
      </div>
    </div>
  </va-card>
</template>
<script>
import ZSidebar from "~/components/molecules/Sidebar/ZSidebar";
import ZNavBar from "~/components/organisms/NavBar/ZNavBar";

export default {
  components: {
    ZSidebar,
    ZNavBar,
  },
  data() {
    return {
      minimized: false,
    };
  },
  methods: {
    valueToggle(value) {
      this.minimized = value;
    },
  },
};
</script>
