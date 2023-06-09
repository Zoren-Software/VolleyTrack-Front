<template>
  <span v-if="data">{{ formatCpf(data) }}</span>
</template>

<script>
export default {
  props: {
    data: {
      type: String,
      required: false
    },
  },
  methods: {
    formatCpf(cpf) {
      cpf = cpf.replace(/\D/g, ""); // remove todos os caracteres que não são dígitos
      cpf = cpf.padStart(11, "0"); // preenche com zeros à esquerda até que a string tenha tamanho 11
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
  },
}
</script>