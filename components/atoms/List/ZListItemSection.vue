<template>
  <va-list-item-section
    :avatar="avatar"
    :icon="icon"
  >
    <slot name="default"/>
  </va-list-item-section>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      avatar: {
        type: Boolean,
        default: false,
      },
      icon: {
        type: Boolean,
        default: false,
      },
      
    }
});
</script>