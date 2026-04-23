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
      <div class="login-version">v{{ appVersion }}</div>
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
import { version as appVersion } from "~/package.json";

export default {
  data() {
    return {
      appVersion,
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

.login-version {
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 50%;
  text-align: center;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.25);
  pointer-events: none;
  user-select: none;
}
</style>
