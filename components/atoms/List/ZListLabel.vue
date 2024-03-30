<template>
  <va-list-label
    :color="color"
  >
    <slot name="default"/>
  </va-list-label>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      color: {
        type: String,
        default: 'primary',
      },
    }
});
</script>