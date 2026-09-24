<template>
  <ZModal
    :model-value="modelValue"
    title="Importação concluída"
    ok-text="Entendi"
    :hide-close-button="true"
    @update:model-value="emit('update:modelValue', $event)"
    @ok="close"
    @cancel="close"
  >
    <div class="import-result">
      <div class="import-result__hero">
        <div class="import-result__icon" aria-hidden="true">
          <va-icon name="check_circle" size="32px" color="#16a34a" />
        </div>
        <p class="import-result__message">
          {{ message }}
        </p>
      </div>

      <section v-if="sectionItems.length > 0" class="import-result__section">
        <h4 class="import-result__heading">
          <va-icon name="inventory_2" size="18px" color="#2563eb" />
          O que foi importado
        </h4>
        <ul class="import-result__list">
          <li
            v-for="item in sectionItems"
            :key="item.key"
            class="import-result__chip"
          >
            <va-icon :name="item.icon" size="16px" :color="item.color" />
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>

      <section v-if="warnings.length > 0" class="import-result__warnings">
        <h4 class="import-result__heading import-result__heading--warn">
          <va-icon name="info" size="18px" color="#b45309" />
          Avisos
        </h4>
        <ul class="import-result__warn-list">
          <li v-for="(warning, index) in warnings" :key="index">
            {{ warning }}
          </li>
        </ul>
      </section>
    </div>
  </ZModal>
</template>

<script setup>
import ZModal from "~/components/atoms/Modal/ZModal.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Seus dados foram importados com sucesso neste clube.",
  },
  importedSections: {
    type: Array,
    default: () => [],
  },
  warnings: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const SECTION_META = {
  profile: {
    label: "Perfil e dados pessoais",
    icon: "person",
    color: "#2563eb",
  },
  teams_positions: {
    label: "Equipes e posições",
    icon: "groups",
    color: "#7c3aed",
  },
  sport_records: {
    label: "Treinos, confirmações e avaliações",
    icon: "sports_volleyball",
    color: "#ea580c",
  },
  sport_history: {
    label: "Histórico esportivo (cópia de referência)",
    icon: "history",
    color: "#0891b2",
  },
};

const sectionItems = computed(() => {
  const sections = Array.isArray(props.importedSections)
    ? props.importedSections
    : [];

  return sections
    .filter((key) => typeof key === "string" && key !== "")
    .map((key) => {
      const meta = SECTION_META[key];

      return {
        key,
        label: meta?.label ?? key,
        icon: meta?.icon ?? "check",
        color: meta?.color ?? "#16a34a",
      };
    });
});

const close = () => {
  emit("update:modelValue", false);
};
</script>

<style scoped>
.import-result {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-result__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 8px 4px 4px;
}

.import-result__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #dcfce7;
  border: 2px solid #bbf7d0;
}

.import-result__message {
  margin: 0;
  max-width: 360px;
  font-size: 15px;
  line-height: 1.55;
  color: #374151;
  font-weight: 500;
}

.import-result__section,
.import-result__warnings {
  border-radius: 12px;
  padding: 14px 16px;
}

.import-result__section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.import-result__warnings {
  background: #fffbeb;
  border: 1px solid #fde68a;
}

.import-result__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #1e40af;
}

.import-result__heading--warn {
  color: #b45309;
}

.import-result__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.import-result__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  line-height: 1.3;
}

.import-result__warn-list {
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.import-result__warn-list li {
  position: relative;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.5;
  color: #78350f;
}

.import-result__warn-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  transform: translateY(-50%);
}
</style>
