<template>
  <div class="notification-nc" role="button" tabindex="0" @click="redirect">
    <span class="notification-nc__tag notification-nc__tag--training">Treino</span>
    <div class="notification-nc__title">
      {{ parsedData.training?.name || "Treino" }}
    </div>
    <div v-if="formattedDate" class="notification-nc__row notification-nc__row--date">
      <va-icon name="event_available" size="14px" color="#64748b" class="notification-nc__ico" />
      <span>{{ formattedDate }}</span>
    </div>
    <div v-if="teamName" class="notification-nc__row notification-nc__row--team">
      <va-icon name="groups" size="14px" color="#64748b" class="notification-nc__ico" />
      <span>{{ teamName }}</span>
    </div>
    <div
      v-if="parsedData.training?.description"
      class="notification-nc__desc"
    >
      {{ parsedData.training.description }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  emits: ["readNotification"],
  computed: {
    parsedData() {
      try {
        return JSON.parse(this.notification.data);
      } catch (e) {
        console.error("Erro ao analisar os dados da notificação:", e);
        return {};
      }
    },
    formattedDate() {
      const t = this.parsedData.training;
      if (!t?.date_start) return "";
      const date = new Date(t.date_start);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    },
    teamName() {
      return this.parsedData.training?.team?.name || "";
    },
  },
  methods: {
    redirect() {
      if (this.parsedData.training?.id) {
        this.$router.push(`/trainings/edit/${this.parsedData.training.id}`);
      }
      this.$emit("readNotification", this.notification.id);
    },
  },
};
</script>

<style scoped>
.notification-nc {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 2px 0;
  cursor: pointer;
  text-align: left;
  max-width: 440px;
}

.notification-nc__tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
}

.notification-nc__tag--training {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.notification-nc__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
  line-height: 1.2;
}

.notification-nc__row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 1.25;
}

.notification-nc__row--date {
  margin-top: 0;
  color: #64748b;
}

.notification-nc__row--team {
  margin-top: 1px;
  font-weight: 500;
  color: #475569;
}

.notification-nc__ico {
  flex-shrink: 0;
}

.notification-nc__desc {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
