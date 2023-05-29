<template>
  <va-button
    :active-class="activeClass"
    :append="append"
    :background-opacity="backgroundOpacity"
    :block="block"
    :border-color="borderColor"
    :color="color"
    :disabled="disabled"
    :gradient="gradient"
    :hover-behavior="hoverBehavior"
    :hover-mask-color="hoverMaskColor"
    :hover-opacity="hoverOpacity"
    :href="href"
    :icon="icon"
    :icon-right="iconRight"
    :loading="loading"
    :plain="plain"
    :preset="preset"
    :pressed-behavior="pressedBehavior"
    :pressed-mask-color="pressedMaskColor"
    :pressed-opacity="pressedOpacity"
    :rounded="rounded"
    :size="size"
    :tag="tag"
    :target="target"
    :text-color="textColor"
    :text-opacity="textOpacity"
    :type="type"
  >
    <slot name="default"/>
  </va-button>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    activeClass: {
      type: String,
    },
    append: {
      type: Boolean,
    },
    backgroundOpacity: {
      type: Number,
      default: 1,
    },
    block: {
      type: Boolean,
      default: false,
    },
    borderColor: {
      type: String,
    },
    color: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    gradient: {
      type: Boolean,
      default: false,
    },
    hoverBehavior: {
      type: String,
      default: 'mask',
    },
    hoverMaskColor: {
      type: String,
      default: 'textInverted',
    },
    hoverOpacity: {
      type: Number,
      default: 0.15,
    },
    href: {
      type: String,
    },
    icon: {
      type: String,
      default: '',
    },
    iconRight: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    plain: {
      type: Boolean,
      default: false,
    },
    preset: {
      type: String,
      default: 'white',
    },
    pressedBehavior: {
      type: String,
      default: 'mask',
    },
    pressedMaskColor: {
      type: String,
    },
    pressedOpacity: {
      type: Number,
      default: 0.13,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'medium',
    },
    tag: {
      type: String,
      default: 'button',
    },
    target: {
      type: String,
    },
    textColor: {
      type: String,
    },
    textOpacity: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      default: 'button',
    },
  }
});
</script>