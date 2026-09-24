<template>
  <div class="user-wrapper">
    <div class="user-avatar-wrapper">
      <va-avatar v-if="data.id" class="user-avatar user-avatar--initial">{{
        firstLetter
      }}</va-avatar>
      <va-icon v-else name="account_circle" class="user-icon" />
    </div>
    <div class="user-info-wrapper">
      <div class="user-name">
        {{ data.name }}
      </div>
      <div v-if="data.email" class="user-detail">
        <va-icon
          name="email"
          size="small"
          color="#6b7280"
          class="detail-icon"
        />
        <span class="detail-text">{{ data.email }}</span>
      </div>
      <div v-if="positionsLine" class="user-detail">
        <va-icon
          name="trip_origin"
          size="small"
          color="#6b7280"
          class="detail-icon"
        />
        <span class="detail-text">{{ positionsLine }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    firstLetter() {
      return this.data.name.charAt(0).toUpperCase();
    },
    positionsLine() {
      const list = this.data.positions;
      if (!Array.isArray(list) || list.length === 0) {
        return "";
      }
      return list
        .map((p) => p?.name)
        .filter(Boolean)
        .join(" • ");
    },
  },
};
</script>

<style scoped>
.user-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.user-avatar-wrapper {
  flex-shrink: 0;
  width: 40px;
  min-width: 40px;
  height: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar--initial {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  max-width: 40px !important;
  max-height: 40px !important;
  flex-shrink: 0;
  aspect-ratio: 1;
  border-radius: 50% !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  background: #ff4e1b !important;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 14px;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden;
}

.user-avatar--initial :deep(.va-avatar__content) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50% !important;
  background: transparent !important;
  color: #ffffff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.user-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  flex-shrink: 0;
  color: #6b7280;
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
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.35;
  min-width: 0;
}

.detail-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.detail-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

@media (max-width: 768px) {
  .user-wrapper {
    gap: 8px;
  }

  .user-avatar-wrapper {
    width: 36px;
    min-width: 36px;
    height: 36px;
    min-height: 36px;
  }

  .user-avatar--initial {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    max-width: 36px !important;
    max-height: 36px !important;
    font-size: 13px;
  }

  .user-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }

  .user-name {
    font-size: 13px;
  }

  .user-detail {
    font-size: 11px;
  }
}
</style>
