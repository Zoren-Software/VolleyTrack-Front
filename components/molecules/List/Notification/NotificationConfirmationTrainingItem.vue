<template>
  <va-list-item class="no-style-link hover pb-3">
    <va-list-item-section>
      <va-list-item-label class="text-center">
        {{ parsedData.message }}
      </va-list-item-label>
      <va-list-item-label>{{ parsedData.training.name }}</va-list-item-label>
      <va-list-item-label caption class="data-hora-treino">
        {{ formattedDate }}
      </va-list-item-label>
      <va-list-item-label caption class="data-hora-treino">
        <ZUser :data="parsedData.userAction" showEmail showConfirmTraining />
      </va-list-item-label>
    </va-list-item-section>
    <va-list-item-section icon>
      <va-icon name="visibility" color="primary" />
    </va-list-item-section>
  </va-list-item>
</template>

<script>
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";

export default {
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  components: {
    ZUser,
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
    formattedDate() {
      if (!this.parsedData.training || !this.parsedData.training.date_start) {
        return "";
      }
      const date = new Date(this.parsedData.training.date_start);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
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
