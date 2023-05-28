<template>
  <va-badge
    :class="class"
    :color="color"
    :dot="dot"
    :multi-line="multiLine"
    :overlap="overlap"
    :placement="placement"
    :text="text"
    :text-color="textColor"
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
    color: {
      type: String,
      default: 'danger',
    },
    dot: {
      type: Boolean,
      default: false,
    },
    multiLine: {
      type: Boolean,
      default: false,
    },
    overlap: {
      type: Boolean,
      default: false,
    },
    placement: {
      type: String,
      default: 'top-end',
    },
    text: {
      type: String,
      default: '',
    },
    textColor: {
      type: String,
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