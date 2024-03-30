<template>
  <va-navbar-item 
    :class="class"
  >
    <slot />
  </va-navbar-item>
</template>

<script>

export default {
  props: {
    class: {
      type: String,
      default: '',
    },
  },
}
</script>