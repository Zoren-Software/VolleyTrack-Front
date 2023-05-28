<template>
  <va-popover 
    :message="message"
    :color="color"
    :class="class"
    :placement="placement"
    :icon="icon"
    :title="title"
    :trigger="trigger"
  >
    <slot />
  </va-popover>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    message: {
      type: String,
      default: "Popover!",
    },
    color: {
      type: String,
      default: "default",
    },
    class: {
      type: String,
      default: "",
    },
    placement: {
      type: String,
      default: "top",
    },
    icon: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    trigger: {
      type: String,
      default: "hover",
    },
    // NOTE - Ainda existem as opções avançadas de se passar como parâmetro: 
    // title, body para o popover e ter o mesmo efeito de conteúdo personalizado.
  },
});
</script>