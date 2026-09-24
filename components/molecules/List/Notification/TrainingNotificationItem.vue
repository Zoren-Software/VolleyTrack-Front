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
      <p class="notification-item__eyebrow">Treino</p>
      <p class="notification-item__title">{{ parsedData.training?.name || "Treino" }}</p>
      <p v-if="formattedDate" class="notification-item__meta">{{ formattedDate }}</p>
      <p v-if="parsedData.training?.description" class="notification-item__desc">
        {{ parsedData.training.description }}
      </p>
      <p v-if="formatCreatedAt" class="notification-item__received">
        Recebida em {{ formatCreatedAt }}
      </p>
    </div>
    <div class="notification-item__badge notification-item__badge--primary" aria-hidden="true">
      <va-icon name="fitness_center" size="18px" color="#ffffff" />
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

.notification-item__eyebrow {
  margin: 0 0 2px 0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.notification-item__title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-item__meta {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #64748b;
}

.notification-item__desc {
  margin: 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.notification-item__badge--primary {
  background: linear-gradient(145deg, #ff7a45, #ff4e1b);
  box-shadow: 0 2px 6px rgba(255, 78, 27, 0.4);
}
</style>
