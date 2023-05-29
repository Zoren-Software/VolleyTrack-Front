<template>
  <va-icon
    :color="color"
    :class="class"
    :flip="flip"
    :name="name"
    :rotation="rotation"
    :size="size"
    :spin="spin"
    :tag="tag"
  >
    <slot />
  </va-icon>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({

  props: {
    class: {
      type: String,
      default: "mr-3",
    },
    color: {
      type: String,
    },
    flip: {
      type: String,
      default: "off",
    },
    name: {
      type: String,
      required: true,
    },
    rotation: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
    },
    spin: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: "i",
    },
  },

  data() {
    const flipOptions = [
      { label: "off", value: "off" },
      { label: "horizontal", value: "horizontal" },
      { label: "vertical", value: "vertical" },
      { label: "both", value: "both" },
    ];

    return {
      flipOptions,
      flip: flipOptions[0].value,
      rotation: 0,
      isRotation: true,
    };
  },

  watch: {
    isRotation(value) {
      if (!value) {
        this.rotation = undefined;
      }
    },
  },
});
</script>