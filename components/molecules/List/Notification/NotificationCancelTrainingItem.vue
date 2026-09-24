<template>
  <div
    class="notification-item"
    role="button"
    tabindex="0"
    @click="redirect"
    @keydown.enter.prevent="redirect"
    @keydown.space.prevent="redirect"
  >
    <div class="notification-item__text">
      <span class="notification-item__tag">Treino cancelado</span>
      <p v-if="parsedData.training?.name" class="notification-item__line">
        {{ parsedData.training.name }}
      </p>
      <div v-if="formattedDate" class="notification-item__meta-row notification-item__meta-row--date">
        <va-icon
          name="calendar_today"
          size="14px"
          color="#64748b"
          class="notification-item__meta-icon"
        />
        <span>{{ formattedDate }}</span>
      </div>
      <div v-if="teamName" class="notification-item__meta-row notification-item__meta-row--team">
        <va-icon
          name="groups"
          size="14px"
          color="#64748b"
          class="notification-item__meta-icon"
        />
        <span>{{ teamName }}</span>
      </div>
      <p v-if="formatCreatedAt" class="notification-item__received">
        Recebida em {{ formatCreatedAt }}
      </p>
    </div>
    <div
      class="notification-item__badge notification-item__badge--neutral"
      title="Treino cancelado"
      aria-hidden="true"
    >
      <va-icon name="event_busy" size="18px" color="#64748b" />
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
    formatCreatedAt() {
      if (!this.notification.createdAt) return "";
      const d = new Date(this.notification.createdAt);
      return d.toLocaleString("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    },
    teamName() {
      return this.parsedData.training?.team?.name || "";
    },
  },
  methods: {
    redirect() {
      const id = this.parsedData.training?.id;
      if (id != null) {
        this.$router.push(`/trainings/edit/${id}`);
      }
      this.$emit("readNotification", this.notification.id);
    },
  },
};
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 4px 14px 0;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
}

.notification-item:focus-visible {
  box-shadow: 0 0 0 2px #fdba74;
}

.notification-item__text {
  flex: 1;
  min-width: 0;
}

.notification-item__tag {
  display: inline-block;
  margin: 0 0 6px 0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.notification-item__line {
  margin: 0 0 6px 0;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.notification-item__meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.35;
  color: #64748b;
}

.notification-item__meta-row--date {
  margin: 0 0 2px 0;
}

.notification-item__meta-row--team {
  margin: 0 0 4px 0;
  color: #475569;
}

.notification-item__meta-icon {
  flex-shrink: 0;
}

.notification-item__received {
  margin: 6px 0 0 0;
  font-size: 11px;
  color: #94a3b8;
}

.notification-item__badge {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.notification-item__badge--neutral {
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  box-shadow: none;
}
</style>
