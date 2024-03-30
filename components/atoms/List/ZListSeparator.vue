<template>
  <va-list-separator
    :fit="fit"
    :spaced="spaced"
  >
    <slot name="default"/>
  </va-list-separator>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      fit: {
        type: Boolean,
        default: false,
      },
      spaced: {
        type: Boolean,
        default: false,
      },

    }
});
</script>