<template>
  <div class="team-essential-root team-essential-stack">
    <h2 class="section-title">Informações Essenciais</h2>
    <ZTextInput
      id="name"
      :model-value="form.name ?? ''"
      name="name"
      label="Nome do Time"
      placeholder="Ex: Águias de Ouro"
      :error="errorFields.includes('name')"
      :error-messages="errors.name || []"
      @update:model-value="$emit('update:name', $event)"
    />
    <div class="field-block">
      <span class="field-label-upper">Categoria</span>
      <div v-if="categoriesLoading" class="inline-loading">
        <va-progress-circle indeterminate size="small" />
        <span>Carregando...</span>
      </div>
      <div
        v-else-if="!categoryOptions.length"
        class="inline-loading"
      >
        Nenhuma categoria disponível.
      </div>
      <div v-else class="category-radio-list" role="radiogroup" aria-label="Categoria">
        <label
          v-for="cat in categoryOptions"
          :key="cat.id"
          :class="[
            'category-radio-card',
            {
              'category-radio-card--selected': form.teamCategory?.value === cat.id,
              'category-radio-card--error': errorFields.includes('teamCategory'),
            },
          ]"
        >
          <input
            type="radio"
            class="category-radio-input"
            name="team-category-field"
            :checked="form.teamCategory?.value === cat.id"
            @change="$emit('select-category', cat)"
          />
          <span class="category-radio-label">{{ cat.name }}</span>
        </label>
      </div>
      <div
        v-if="errorFields.includes('teamCategory') && errors.teamCategory?.length"
        class="field-error"
      >
        {{ (errors.teamCategory || []).join(" ") }}
      </div>
    </div>
    <div class="field-block">
      <span class="field-label-upper">Nível</span>
      <div v-if="levelsLoading" class="inline-loading">
        <va-progress-circle indeterminate size="small" />
        <span>Carregando...</span>
      </div>
      <div
        v-else-if="!sortedLevels.length"
        class="inline-loading"
      >
        Nenhum nível disponível.
      </div>
      <div v-else class="level-grid" role="radiogroup" aria-label="Nível do time">
        <button
          v-for="level in sortedLevels"
          :key="level.id"
          type="button"
          :class="[
            'level-card',
            {
              'level-card--selected': form.teamLevel?.value === level.id,
              'level-card--error': errorFields.includes('teamLevel'),
            },
          ]"
          @click="$emit('select-level', level)"
        >
          <va-icon
            class="level-card-icon"
            :name="levelIconName(level.name)"
            :color="form.teamLevel?.value === level.id ? '#FF4E1B' : '#9CA3AF'"
            size="22px"
          />
          <span class="level-card-title">{{ level.name }}</span>
        </button>
      </div>
      <div
        v-if="errorFields.includes('teamLevel') && errors.teamLevel?.length"
        class="field-error"
      >
        {{ (errors.teamLevel || []).join(" ") }}
      </div>
    </div>
  </div>
</template>

<script>
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";

export default {
  name: "ZTeamFormEssentialFields",
  components: { ZTextInput },
  props: {
    form: {
      type: Object,
      required: true,
    },
    categoryOptions: {
      type: Array,
      default: () => [],
    },
    sortedLevels: {
      type: Array,
      default: () => [],
    },
    categoriesLoading: {
      type: Boolean,
      default: false,
    },
    levelsLoading: {
      type: Boolean,
      default: false,
    },
    errorFields: {
      type: Array,
      default: () => [],
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["select-category", "select-level", "update:name"],
  methods: {
    levelIconName(name) {
      const n = String(name || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (n.includes("bronze")) return "military_tech";
      if (n.includes("prata")) return "military_tech";
      if (n.includes("ouro")) return "emoji_events";
      if (n.includes("outro")) return "more_horiz";
      if (n.includes("elite")) return "stars";
      return "emoji_events";
    },
  },
};
</script>

<style scoped>
.team-essential-stack {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.team-essential-root :deep(.va-input-wrapper) {
  margin-bottom: 0 !important;
}

.team-essential-root :deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  color: #6b7280 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
}

.team-essential-root :deep(.va-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  letter-spacing: inherit !important;
  text-transform: inherit !important;
  color: inherit !important;
}

/* Texto digitado: mesmo tamanho/peso das opções de categoria e nível */
.team-essential-root :deep(.va-input-wrapper input),
.team-essential-root :deep(.va-input-wrapper textarea) {
  font-size: 14px !important;
  font-weight: 500 !important;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: #ff4e1b;
  border-radius: 2px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-label-upper {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
}

.inline-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.category-radio-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

.category-radio-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.category-radio-card:hover {
  border-color: #ffe3d1;
  background: #fffdfb;
}

.category-radio-card--selected {
  border-color: #ff4e1b;
  background: #fff4ec;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.category-radio-card--error {
  border-color: #e53e3e;
}

.category-radio-input {
  width: 16px;
  height: 16px;
  accent-color: #ff4e1b;
  cursor: pointer;
  flex-shrink: 0;
}

.category-radio-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  color: #6b7280;
}

.level-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.level-card {
  flex: 1 1 120px;
  min-width: 110px;
  max-width: 160px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 12px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  background: #f9fafb;
  text-align: left;
  font: inherit;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
}

.level-card:hover {
  border-color: #ffe3d1;
  background: #fffdfb;
}

.level-card--selected {
  background: #fff4ec;
  border-color: #ff4e1b;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.level-card--error {
  border-color: #e53e3e;
  background: #fef2f2;
}

.level-card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-card-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  color: #6b7280;
}

.level-card--selected .level-card-title {
  color: #111827;
}

.field-error {
  font-size: 12px;
  color: #e53e3e;
  margin-top: 4px;
}
</style>
