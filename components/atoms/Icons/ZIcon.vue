<template>
  <div>
    <va-icon
      :class="class"
      :name="name"
      :size="large"
      :color="color"
      :rotation="rotation"
      :flip="flip"
      :spin="spin"
      :tag="tag"
    >
      <slot />
    </va-icon>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({

  props: {
    name: {
      type: String,
      required: true,
      default: "thumb_up",
    },
    large: {
      type: String,
      default: "medium",
    },
    color: {
      type: String,
      default: "primary",
    },
    rotation: {
      type: Number,
      default: 0,
    },
    flip: {
      type: String,
      default: "off",
    },
    class: {
      type: String,
      default: "mr-3",
    },
    size: {
      type: String,
      default: "large",
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