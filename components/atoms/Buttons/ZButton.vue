<template>
  <va-button
    :block="true"
    :disabled="disabled"
    color="primary"
  >
    <slot></slot>
  </va-button>
</template>

<script>
  export default {
    props: {
      block: {
        type: Boolean,
        default: false,
      },
      color: {
        type: String,
        default: 'primary',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      textButton: {
        type: String,
        default: 'Button',
      },
    }
  }
</script>