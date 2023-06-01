<template>
  <va-list 
    :class="class"
    :fit="fit"
  >
    <slot name="default"/>
  </va-list>
</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    class: {
      type: String,
      default: '',
    },
    fit: {
      type: Boolean,
      default: false,
    },
  }
});
</script>