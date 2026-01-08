<template>
  <div v-if="data" class="team-container">
    <div class="avatar-wrapper">
      <va-avatar v-if="data.id" class="team-avatar">{{
        firstLetter
      }}</va-avatar>
      <va-icon v-else name="sports_volleyball" />
    </div>
    <div class="team-info">
      <div class="team-name-wrapper">
        <span class="team-name"
          ><b>{{ data.name }}</b></span
        >
      </div>
      <template v-if="showCategoryAndLevel">
        <div v-if="data.teamCategory" class="info-item">
          <span class="info-text">
            {{ data.teamCategory.name }}
          </span>
        </div>
        <div v-if="data.teamLevel" class="info-item">
          <span class="info-text">
            {{ data.teamLevel.name }}
          </span>
        </div>
      </template>
      <div v-if="data.technician" class="flex items-center mt-1">
        <va-icon size="small" name="person" color="secondary" class="mr-1" />
        <span class="secondary-text">Técnico: {{ data.technician }}</span>
      </div>
      <div v-if="data.assistant" class="flex items-center mt-1">
        <va-icon
          size="small"
          name="person_outline"
          color="secondary"
          class="mr-1"
        />
        <span class="secondary-text">Auxiliar: {{ data.assistant }}</span>
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
    showCategoryAndLevel: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    firstLetter() {
      return this.data.name.charAt(0).toUpperCase();
    },
  },
};
</script>

<style scoped>
.team-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  margin-bottom: 4px;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
  padding-top: 2px;
}

.team-avatar {
  flex-shrink: 0;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.team-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.team-avatar :deep(.va-avatar__content) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.team-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.team-name-wrapper {
  margin-bottom: 2px;
}

.team-name {
  color: #0b1e3a;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.info-item {
  margin-bottom: -3px;
}

.info-text {
  color: #6c757d;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.2px;
}

.secondary-text {
  color: #6c757d;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}
</style>
