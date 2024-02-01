<template>
  <va-list-item class="no-style-link hover pb-3">
    <va-list-item-section>
      <va-list-item-label>{{ parsedData.training.name }}</va-list-item-label>
      <va-list-item-label caption class="notification-item-list">
        {{ parsedData.training.description }}
      </va-list-item-label>
    </va-list-item-section>
    <va-list-item-section icon>
      <va-icon name="visibility" color="primary" />
    </va-list-item-section>
  </va-list-item>
</template>

<script>
export default {
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  computed: {
    parsedData() {
      try {
        return JSON.parse(this.notification.data);
      } catch (e) {
        console.error("Erro ao analisar os dados da notificação:", e);
        return {}; // Retorna um objeto vazio em caso de erro
      }
    },
  },
};
</script>

<style scoped>
.notification-item-list {
  display: inline-block; /* Ou block, conforme necessário */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* Ajuste conforme necessário */
}
</style>
