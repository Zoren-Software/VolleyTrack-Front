<template>
  <div
    class="notification-item"
    role="button"
    tabindex="0"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <div class="notification-item__text">
      <p class="notification-item__eyebrow">Aviso</p>
      <p class="notification-item__title">{{ title }}</p>
      <p v-if="description" class="notification-item__desc">{{ description }}</p>
      <p v-if="formatCreatedAt" class="notification-item__received">
        Recebida em {{ formatCreatedAt }}
      </p>
    </div>
    <div class="notification-item__badge notification-item__badge--neutral" aria-hidden="true">
      <va-icon name="notifications" size="18px" color="#ffffff" />
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
    parsed() {
      try {
        return JSON.parse(this.notification.data || "{}");
      } catch {
        return {};
      }
    },
    title() {
      return (
        this.parsed.title ||
        this.parsed.message ||
        this.parsed.subject ||
        "Notificação"
      );
    },
    description() {
      return (
        this.parsed.description ||
        this.parsed.body ||
        this.parsed.text ||
        ""
      );
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
    onActivate() {
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
}

.notification-item__desc {
  margin: 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
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

.notification-item__badge--neutral {
  background: linear-gradient(145deg, #64748b, #475569);
  box-shadow: 0 2px 6px rgba(71, 85, 105, 0.35);
}
</style>
