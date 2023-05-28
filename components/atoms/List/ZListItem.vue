<template>
  <va-list-item
    :color="color"
    :active-class="activeClass"
    :append="append"
    :disabled="disabled"
    :exact="exact"
    :exact-active-class="exactActiveClass"
    :href="href"
    :replace="replace"
    :tag="tag"
  >
    <slot name="default"/>
  </va-list-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      color: {
        type: String,
        default: 'primary',
      },
      activeClass: {
        type: String,
        default: '',
      },
      append: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      exact: {
        type: Boolean,
        default: false,
      },
      exactActiveClass: {
        type: String,
        default: '',
      },
      href: {
        type: String,
      },
      replace: {
        type: Boolean,
        default: false,
      },
      tag: {
        type: String,
        default: 'div',
      },
    }
});
</script>