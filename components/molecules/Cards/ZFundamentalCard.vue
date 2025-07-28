<template>
  <ZCard title="" class="fundamental-card" color="backgroundPrimary">
    <div class="fundamental-content">
      <!-- Ícone e Nome -->
      <div class="fundamental-header">
        <va-icon :name="fundamental.icon" size="large" color="primary" />
        <h3 class="fundamental-title">{{ fundamental.name }}</h3>
      </div>

      <!-- Botões A, B, C com Contadores -->
      <div class="evaluation-buttons">
        <div class="button-group">
          <ZButton
            color="success"
            size="small"
            @click="incrementCounter('a')"
            class="evaluation-button"
          >
            A +
          </ZButton>
          <div class="counter">
            <span class="counter-value">{{ evaluation.a }}</span>
            <ZButton
              color="danger"
              size="small"
              @click="decrementCounter('a')"
              :disabled="evaluation.a <= 0"
              class="counter-button"
            >
              -
            </ZButton>
          </div>
        </div>

        <div class="button-group">
          <ZButton
            color="warning"
            size="small"
            @click="incrementCounter('b')"
            class="evaluation-button"
          >
            B +
          </ZButton>
          <div class="counter">
            <span class="counter-value">{{ evaluation.b }}</span>
            <ZButton
              color="danger"
              size="small"
              @click="decrementCounter('b')"
              :disabled="evaluation.b <= 0"
              class="counter-button"
            >
              -
            </ZButton>
          </div>
        </div>

        <div class="button-group">
          <ZButton
            color="danger"
            size="small"
            @click="incrementCounter('c')"
            class="evaluation-button"
          >
            C +
          </ZButton>
          <div class="counter">
            <span class="counter-value">{{ evaluation.c }}</span>
            <ZButton
              color="danger"
              size="small"
              @click="decrementCounter('c')"
              :disabled="evaluation.c <= 0"
              class="counter-button"
            >
              -
            </ZButton>
          </div>
        </div>
      </div>

      <!-- Legenda -->
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color legend-a"></div>
          <span class="legend-text">{{ fundamental.legend.a }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-color legend-b"></div>
          <span class="legend-text">{{ fundamental.legend.b }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-color legend-c"></div>
          <span class="legend-text">{{ fundamental.legend.c }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="total-section">
        <span class="total-label">Total:</span>
        <span class="total-value">{{ totalEvaluations }}</span>
      </div>

      <!-- Feedback do Fundamental -->
      <div class="feedback-section">
        <va-textarea
          v-model="fundamentalFeedback"
          placeholder="Feedback específico para este fundamento..."
          :rows="2"
          class="feedback-textarea"
          @input="updateFeedback"
        />
      </div>
    </div>
  </ZCard>
</template>

<script setup>
import { computed, ref } from "vue";
import ZCard from "~/components/atoms/Cards/ZCard.vue";
import ZButton from "~/components/atoms/Buttons/ZButton.vue";

// Props
const props = defineProps({
  fundamental: {
    type: Object,
    required: true,
  },
  evaluation: {
    type: Object,
    default: () => ({ a: 0, b: 0, c: 0 }),
  },
  feedback: {
    type: String,
    default: "",
  },
});

// Emits
const emit = defineEmits(["update-evaluation", "update-feedback"]);

// Computed
const totalEvaluations = computed(() => {
  return props.evaluation.a + props.evaluation.b + props.evaluation.c;
});

// Reactive data
const fundamentalFeedback = ref(props.feedback);

// Methods
const incrementCounter = (type) => {
  const newValue = props.evaluation[type] + 1;
  emit("update-evaluation", props.fundamental.id, type, newValue);
};

const decrementCounter = (type) => {
  const newValue = Math.max(0, props.evaluation[type] - 1);
  emit("update-evaluation", props.fundamental.id, type, newValue);
};

const updateFeedback = () => {
  emit("update-feedback", props.fundamental.id, fundamentalFeedback.value);
};
</script>

<style scoped>
.fundamental-card {
  height: 100%;
}

.fundamental-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fundamental-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.fundamental-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.evaluation-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.evaluation-button {
  min-width: 60px;
  height: 40px;
  font-weight: 600;
  font-size: 1.125rem;
}

.counter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  min-width: 20px;
  text-align: center;
}

.counter-button {
  min-width: 24px;
  height: 24px;
  padding: 0;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-a {
  background-color: #4caf50;
}

.legend-b {
  background-color: #ff9800;
}

.legend-c {
  background-color: #f44336;
}

.legend-text {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.total-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.total-label {
  font-weight: 500;
  color: #333;
}

.total-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2196f3;
}

.feedback-section {
  margin-top: 12px;
}

.feedback-title {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.feedback-textarea {
  width: 100%;
  font-size: 0.875rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .evaluation-buttons {
    gap: 12px;
  }

  .evaluation-button {
    min-width: 50px;
    height: 36px;
    font-size: 1rem;
  }

  .legend-text {
    font-size: 0.8rem;
  }
}
</style>
