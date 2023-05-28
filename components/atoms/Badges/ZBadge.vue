<template>
  <va-badge
    :class="class"
    :text="text"
    :color="color"
    :placement="placement"
    :dot="dot"
    :overlap="overlap"
    :transparent="transparent"
    :visible-empty="visibleEmpty"

  >
    <slot name="default"/>
  </va-badge>
</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      class: {
        type: String,
        default: '',
      },
      text: {
        type: String,
        default: '',
      },
      color: {
        type: String,
        default: 'danger',
      },
      placement: {
        type: String,
        default: 'top-end',
      },
      dot: {
        type: Boolean,
        default: false,
      },
      overlap: {
        type: Boolean,
        default: false,
      },
      transparent: {
        type: Boolean,
        default: false,
      },
      visibleEmpty: {
        type: Boolean,
        default: false,
      },
    }
});
</script>