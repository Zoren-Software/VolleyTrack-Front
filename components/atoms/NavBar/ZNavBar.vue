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


<script>
  export default {
    props: {
      class: {
        type: String,
        default: '',
      },
      color: {
        type: String,
        default: 'primary',
      },
      style: {
        type: String,
        default: '',
      },
      shape: {
        type: String,
        default: 'rounded',
      },
    },
  };
</script>
