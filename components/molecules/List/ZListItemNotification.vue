<template>
  <div
    class="notification-item"
    role="button"
    tabindex="0"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <template v-if="training">
      <div class="notification-nc notification-nc--embedded">
        <span class="notification-nc__tag notification-nc__tag--neutral"
          >Notificação</span
        >
        <div class="notification-nc__title">{{ trainingTitle }}</div>
        <div
          v-if="trainingDateLine"
          class="notification-nc__row notification-nc__row--date"
        >
          <va-icon name="event_available" size="14px" color="#64748b" class="notification-nc__ico" />
          <span>{{ trainingDateLine }}</span>
        </div>
        <div v-if="teamName" class="notification-nc__row notification-nc__row--team">
          <va-icon name="groups" size="14px" color="#64748b" class="notification-nc__ico" />
          <span>{{ teamName }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="notification-item__text">
        <p class="notification-item__eyebrow">Aviso</p>
        <p class="notification-item__title">{{ title }}</p>
        <p v-if="description" class="notification-item__desc">{{ description }}</p>
        <p v-if="formatCreatedAt" class="notification-item__received">
          Recebida em {{ formatCreatedAt }}
        </p>
      </div>
      <div
        class="notification-item__badge notification-item__badge--neutral"
        aria-hidden="true"
      >
        <va-icon name="notifications" size="18px" color="#ffffff" />
      </div>
    </template>
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
    training() {
      return this.parsed.training || null;
    },
    trainingTitle() {
      return this.training?.name || this.title;
    },
    teamName() {
      return this.training?.team?.name || "";
    },
    trainingDateLine() {
      if (!this.training?.date_start) return "";
      const date = new Date(this.training.date_start);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
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
      if (this.training?.id) {
        this.$router.push(`/trainings/edit/${this.training.id}`);
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
  padding: 8px 4px 8px 0;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
}

.notification-item:focus-visible {
  box-shadow: 0 0 0 2px #fdba74;
}

.notification-nc--embedded {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 2px 0;
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

.notification-nc__tag--neutral {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
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
