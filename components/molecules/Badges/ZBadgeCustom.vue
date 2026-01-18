<template>
  <div
    class="badge-custom"
    :style="{
      backgroundColor: backgroundColor,
      color: textColor,
    }"
  >
    {{ text }}
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    backgroundColor: {
      type: String,
      default: "#F5F5F5", // Cor padrão de fundo alterada para cinza claro
    },
    textColor: {
      type: String,
      default: "#000000", // Cor padrão do texto
    },
  },
};
</script>

<style scoped>
.badge-custom {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
}
</style>
