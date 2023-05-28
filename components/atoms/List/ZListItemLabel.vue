<template>
  <va-list-item-label
    :caption="caption"
    :lines="lines"
  >
    <slot name="default"/>
  </va-list-item-label>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      caption: {
        type: Boolean,
        default: false,
      },
      lines: {
        type: Number,
        default: 1,
      },
    }
});
</script>