<template>
  <va-button
    v-bind="$attrs"
    
  >
    <slot name="default"/>
  </va-button>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>