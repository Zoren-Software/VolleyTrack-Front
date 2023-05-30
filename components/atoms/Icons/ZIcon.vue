<template>
  <va-icon
    :color="color"
    :class="class"
    :flip="inputFlip"
    :name="name"
    :rotation="inputRotation"
    :size="size"
    :spin="spin"
    :tag="tag"
  >
    <slot />
  </va-icon>
</template>

<script>

export default {
  props: {
    class: {
      type: String,
      default: "",
    },
    color: {
      type: String,
    },
    inputFlip: {
      type: String,
      default: "off",
    },
    name: {
      type: String,
      required: true,
    },
    inputRotation: {
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
      flip: this.inputFlip,
      rotation: this.inputRotation,
      isRotation: true,
    };
  },

  watch: {
    inputFlip(newVal) {
      this.flip = newVal;
    },
    flip(newVal) {
      if (this.inputFlip !== newVal) {
        this.$emit('update:inputFlip', newVal);
      }
    },
    inputRotation(newVal) {
      this.rotation = newVal;
    },
    rotation(newVal) {
      if (this.inputRotation !== newVal) {
        this.$emit('update:inputRotation', newVal);
      }
    },
    isRotation(value) {
      if (!value) {
        this.rotation = undefined;
      }
    },
  },
}
</script>