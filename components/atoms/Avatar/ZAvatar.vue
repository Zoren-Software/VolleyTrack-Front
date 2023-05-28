<template>
  <va-avatar
    :alt="alt"
    :class="class"
    :color="color"
    :fallback-icon="fallbackIcon"
    :fallback-render="fallbackRender"
    :fallback-src="fallbackSrc"
    :fallback-text="fallbackText"
    :font-size="fontSize"
    :icon="icon"
    :loading="loading"
    :size="size"
    :src="src"
    :square="square"
  >
    <slot name="default"/>
  </va-avatar>

</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    alt: {
      type: String,
      default: '',
    },
    class: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '',
    },
    fallbackIcon: {
      type: String,
    },
    fallbackRender: {
      type: String,
    },
    fallbackSrc: {
      type: String,
    },
    fallbackText: {
      type: String,
    },
    fontSize: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'primary',
    },
    size: {
      type: String,
      default: 'medium',
    },
    square: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  }
});
</script>