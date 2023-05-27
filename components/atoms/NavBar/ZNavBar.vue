<template>
  <va-navbar 
    :color="color"
    :class="class"
    :style="style"
    :shape="shape"
  >
    <slot name="left"></slot>
    <slot name="default"></slot>
    <slot name="right"></slot>
  </va-navbar>
</template>

<script setup>

import { defineComponent } from "vue";

const props = defineComponent({
  color: {
    type: String,
    default: "background-primary",
  },
  class: {
    type: String,
    default: "",
  },
  style: {
    type: String,
    default: "",
  },
  shape: {
    type: String,
    default: "rounded",
  },
});

</script>