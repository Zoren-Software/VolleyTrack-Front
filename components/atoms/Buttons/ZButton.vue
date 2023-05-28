<template>
  <va-button
    :block="true"
    :disabled="disabled"
    :preset="preset"
    :gradient="gradient"
    :color="color"
    :text-color="textColor"
    :size="size"
    :rounded="rounded"
    :border-color="borderColor"
    :icon="icon"
    :icon-right="iconRight"
    :loading="loading"
  >
    <slot />
  </va-button>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      block: {
        type: Boolean,
        default: false,
      },
      color: {
        type: String,
        default: 'primary',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      preset: {
        type: String,
        default: 'white',
      },
      gradient: {
        type: Boolean,
        default: false,
      },
      textColor: {
        type: String,
        default: '#ffffff',
      },
      size: {
        type: String,
        default: 'medium',
      },
      rounded: {
        type: Boolean,
        default: false,
      },
      borderColor: {
        type: String,
        default: '#ffffff',
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
    }
});
</script>