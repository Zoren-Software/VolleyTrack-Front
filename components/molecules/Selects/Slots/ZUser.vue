<template>
  <div class="user-wrapper">
    <div class="user-avatar-wrapper">
      <va-avatar v-if="data.id" class="user-avatar">{{
        firstLatter
      }}</va-avatar>
      <va-icon v-else name="account_circle" class="user-icon" />
    </div>
    <div class="user-info-wrapper">
      <div class="user-name">
        <b>{{ data.name }}</b>
      </div>
      <div v-if="data.position" class="user-detail">
        <va-icon
          size="small"
          name="trip_origin"
          color="secondary"
          class="detail-icon"
        />
        <span>{{ data.position }}</span>
      </div>
      <div v-if="data.information?.phone" class="user-detail">
        <va-icon
          size="small"
          name="phone"
          color="secondary"
          class="detail-icon"
        />
        <span>{{ formattedPhone }}</span>
      </div>
      <div class="user-detail email-container">
        <va-icon
          size="small"
          name="email"
          color="secondary"
          class="detail-icon email-icon"
        />
        <span class="email-text">{{ data.email }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPhoneOnType } from "~/utils/formatting/formatHelper";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    firstLatter() {
      return this.data.name.charAt(0).toUpperCase();
    },
    formattedPhone() {
      return this.formatPhone(this.data.information?.phone);
    },
  },
  methods: {
    removeNonNumericCharacters(value) {
      return value.replace(/\D/g, "");
    },
    formatPhone(value) {
      const onlyNumbers = this.removeNonNumericCharacters(value);
      return formatPhoneOnType(onlyNumbers);
    },
  },
};
</script>

<style scoped>
.user-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.user-avatar-wrapper {
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  border: 2px solid white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: #e9742b !important;
  color: white !important;
}

.user-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  background: #e9742b !important;
  color: white !important;
}

.user-icon {
  width: 40px;
  height: 40px;
  color: #6c757d;
}

.user-info-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #0b1e3a;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
  min-width: 0;
}

.detail-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.email-container {
  width: 100%;
  min-width: 0;
}

.email-icon {
  flex-shrink: 0;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

@media (max-width: 768px) {
  .user-wrapper {
    gap: 8px;
  }

  .user-avatar,
  .user-icon {
    width: 32px;
    height: 32px;
  }

  .user-name {
    font-size: 13px;
  }

  .user-detail {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .user-wrapper {
    gap: 6px;
  }

  .user-avatar,
  .user-icon {
    width: 28px;
    height: 28px;
  }

  .user-name {
    font-size: 12px;
  }

  .user-detail {
    font-size: 10px;
    gap: 4px;
  }

  .detail-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
