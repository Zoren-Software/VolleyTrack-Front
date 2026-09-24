<template>
  <span
    v-if="show"
    class="lgpd-import-badge"
    title="Registro criado por importação de dados (LGPD), não pelo cadastro normal do clube"
  >
    Importado
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  importedAt: {
    type: [String, Number, Date],
    default: null,
  },
});

const show = computed(() => props.importedAt != null && props.importedAt !== "");
</script>

<style scoped>
.lgpd-import-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #1e40af;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  vertical-align: middle;
  white-space: nowrap;
}
</style>
