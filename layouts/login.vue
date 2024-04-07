<template>
  <div class="row custom-width">
    <div class="flex flex-col xs6 md6">
      <div class="item">
        <div class="row justify-center">
          <div class="flex flex-col">
            <div class="row">
              <div class="flex items-center margin-custom-top">
                <NuxtPage />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col md6 vuestic-hide-on-xs">
      <va-carousel
        :arrows="false"
        :indicators="false"
        :items="items"
        stateful
        autoscroll
        :autoscrollInterval="30000"
        style="height: 100vh"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        "/images/balls/ball-1.jpg",
        "/images/balls/ball-2.jpg",
        "/images/balls/ball-3.jpg",
        "/images/balls/ball-4.jpg",
        "/images/balls/ball-5.jpg",
        "/images/balls/ball-6.jpg",
        "/images/balls/ball-7.jpg",
        "/images/balls/ball-8.jpg",
        "/images/balls/ball-9.jpg",
      ],
    };
  },
};
</script>

<style scope>
.margin-custom-top {
  margin-top: 80%;
}

.custom-width {
  min-width: 54rem !important;
}
</style>
