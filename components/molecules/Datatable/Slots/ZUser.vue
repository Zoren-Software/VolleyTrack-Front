<template>
  <div v-if="data" class="user-cell">
    <va-avatar v-if="data.id" class="user-avatar" size="medium">
      {{ firstLatter }}
    </va-avatar>
    <va-icon v-else name="account_circle" class="user-icon" />
    <div class="user-info">
      <div class="user-name">{{ data.name }}</div>
      <div v-if="data.information?.phone || showEmail" class="user-details">
        <div v-if="data.information?.phone" class="user-detail-item">
          <va-icon name="phone" size="small" class="detail-icon" />
          <span>{{ formattedPhone }}</span>
        </div>
        <div v-if="showEmail" class="user-detail-item">
          <va-icon name="email" size="small" class="detail-icon" />
          <span>{{ data.email }}</span>
        </div>
      </div>
      <div v-if="showCreatedAt" class="user-detail-item">
        <va-icon name="event" size="small" class="detail-icon" />
        <span>Criado em: {{ formattedCreatedAt }}</span>
      </div>
      <div v-if="showUpdatedAt" class="user-detail-item">
        <va-icon name="event" size="small" class="detail-icon" />
        <span>Atualizado em: {{ formattedUpdatedAt }}</span>
      </div>
      <div v-if="showConfirmTraining" class="user-status">
        <va-icon name="checked" size="small" color="success" />
        <span class="status-text success">Confirmado</span>
      </div>
      <div v-if="showCancelTraining" class="user-status">
        <va-icon name="close" size="small" color="danger" />
        <span class="status-text danger">Cancelado</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPhoneOnType } from "~/utils/formatting/formatHelper";
import moment from "moment";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    showEmail: {
      type: Boolean,
      required: false,
      default: false,
    },
    createdAt: {
      type: String,
      required: false,
    },
    updatedAt: {
      type: String,
      required: false,
    },
    showCreatedAt: {
      type: Boolean,
      required: false,
      default: false,
    },
    showUpdatedAt: {
      type: Boolean,
      required: false,
      default: false,
    },
    showConfirmTraining: {
      type: Boolean,
      required: false,
      default: false,
    },
    showCancelTraining: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    firstLatter() {
      return this.data.name.charAt(0).toUpperCase() ?? "";
    },
    formattedPhone() {
      return this.formatPhone(this.data.information?.phone);
    },
    formattedCreatedAt() {
      return this.createdAt ? this.formatDate(this.createdAt) : "";
    },
    formattedUpdatedAt() {
      return this.updatedAt ? this.formatDate(this.updatedAt) : "";
    },
  },
  methods: {
    //formatar datas usando o moment
    formatDate(value) {
      return moment(value).format("DD/MM/YYYY HH:mm");
    },
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
.user-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}

.user-avatar {
  flex-shrink: 0;
  width: 40px;
  /* height: 40px; */
}

.user-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  color: #6c757d;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #0b1e3a;
  line-height: 1.4;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.detail-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.status-text.success {
  color: #28a745;
}

.status-text.danger {
  color: #dc3545;
}

@media (max-width: 768px) {
  .user-cell {
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

  .user-detail-item {
    font-size: 11px;
  }
}
</style>
