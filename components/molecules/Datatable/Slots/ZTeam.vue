<template>
  <div v-if="data" :class="['row', 'justify-start', 'mt-2']">
    <div class="flex flex-col">
      <div :class="['item', showCategoryAndLevel ? 'mt-2' : '']">
        <va-avatar
          v-if="data.id"
          :class="showCategoryAndLevel ? 'mr-6' : 'mr-3'"
          >{{ firstLetter }}</va-avatar
        >
        <va-icon v-else name="sports_volleyball" />
      </div>
    </div>
    <div class="flex flex-col">
      <div class="item">
        <div :class="showCategoryAndLevel ? 'pl-2' : ''">
          <div class="flex gap-1" :class="showCategoryAndLevel ? 'mb-1' : ''">
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
            <va-icon
              size="small"
              name="person"
              color="secondary"
              class="mr-1"
            />
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
