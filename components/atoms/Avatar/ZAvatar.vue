<template>
  <va-avatar 
    :class="class"
    :src="src"
    :fallback="fallback"
    :icon="icon"
    :color="color"
    :size="size"
    :square="square"
    :loading="loading"
  >
    <slot name="default"/>
  </va-avatar>
</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      class: {
        type: String,
        default: '',
      },
      src: {
        type: String,
        default: '',
      },
      fallback: {
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