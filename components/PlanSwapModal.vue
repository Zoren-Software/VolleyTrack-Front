<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h2>🔄 Trocar Plano</h2>
        <button @click="close" class="close-btn">×</button>
      </div>

      <!-- Preview da Troca -->
      <div v-if="previewData" class="preview-section">
        <!-- Comparação de Planos -->
        <div class="plan-comparison">
          <div class="plan-card current">
            <div class="plan-icon">📋</div>
            <h3>Plano Atual</h3>
            <p class="plan-name">{{ previewData.current_plan.name }}</p>
            <p class="plan-price">
              {{ formatCurrency(previewData.current_plan.amount) }}/mês
            </p>
          </div>

          <div class="arrow">
            <div class="arrow-icon">→</div>
            <div class="swap-type" :class="getSwapTypeClass()">
              {{ getSwapTypeText() }}
            </div>
          </div>

          <div class="plan-card new">
            <div class="plan-icon">🚀</div>
            <h3>Novo Plano</h3>
            <p class="plan-name">{{ previewData.new_plan.name }}</p>
            <p class="plan-price">
              {{ formatCurrency(previewData.new_plan.amount) }}/mês
            </p>
          </div>
        </div>

        <!-- Detalhes da Troca -->
        <div class="proration-details">
          <h3>💰 Detalhes da Troca</h3>

          <div class="proration-info">
            <div class="info-item">
              <span class="label">Valor do novo plano:</span>
              <span class="value">{{
                formatCurrency(previewData.new_plan.amount)
              }}</span>
            </div>

            <div class="info-item">
              <span class="label">Data da próxima cobrança:</span>
              <span class="value">{{
                formatDate(previewData.swap_summary.next_billing_date)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando informações do plano...</p>
      </div>

      <!-- Erro -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button @click="retry" class="retry-btn">Tentar Novamente</button>
      </div>

      <!-- Ações -->
      <div class="modal-actions">
        <button @click="close" class="btn-cancel">Cancelar</button>
        <button
          @click="confirmSwap"
          class="btn-confirm"
          :disabled="loading || !previewData || swapping"
        >
          <span v-if="swapping" class="loading-content">
            <span class="spinner-small"></span>
            Processando...
          </span>
          <span v-else>Confirmar Troca</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import planSwapService from "~/services/planSwapService";

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  customerId: {
    type: Number,
    required: true,
  },
  newPriceId: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close", "swap-success"]);

// Estado
const previewData = ref(null);
const loading = ref(false);
const swapping = ref(false);
const error = ref(null);

// Computed
const getSwapTypeClass = () => {
  if (!previewData.value) return "";

  const currentAmount = previewData.value.current_plan.amount;
  const newAmount = previewData.value.new_plan.amount;

  if (newAmount > currentAmount) return "upgrade";
  if (newAmount < currentAmount) return "downgrade";
  return "same";
};

const getSwapTypeText = () => {
  if (!previewData.value) return "";

  const currentAmount = previewData.value.current_plan.amount;
  const newAmount = previewData.value.new_plan.amount;

  if (newAmount > currentAmount) return "Upgrade";
  if (newAmount < currentAmount) return "Downgrade";
  return "Troca";
};

// Watchers
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      loadPreview();
    } else {
      resetState();
    }
  }
);

// Métodos
const loadPreview = async () => {
  loading.value = true;
  error.value = null;

  try {
    console.log("🔍 Carregando preview da troca:", {
      customerId: props.customerId,
      newPriceId: props.newPriceId,
    });

    const response = await planSwapService.previewPlanSwap(
      props.customerId,
      props.newPriceId
    );

    if (response.success) {
      previewData.value = response.data;
      console.log("✅ Preview carregado com sucesso:", response.data);
    } else {
      error.value = response.error || "Erro ao calcular preview da troca";
      console.error("❌ Erro no preview:", response.error);
    }
  } catch (err) {
    error.value = "Erro ao calcular preview da troca";
    console.error("❌ Erro ao carregar preview:", err);
  } finally {
    loading.value = false;
  }
};

const confirmSwap = async () => {
  swapping.value = true;
  error.value = null;

  try {
    console.log("🔄 Confirmando troca de plano:", {
      customerId: props.customerId,
      newPriceId: props.newPriceId,
    });

    const response = await planSwapService.swapPlan(
      props.customerId,
      props.newPriceId
    );

    if (response.success) {
      console.log("✅ Troca executada com sucesso:", response.data);
      emit("swap-success", response.data);
      close();
    } else {
      error.value = response.error || "Erro ao trocar plano";
      console.error("❌ Erro na troca:", response.error);
    }
  } catch (err) {
    error.value = "Erro ao trocar plano";
    console.error("❌ Erro ao confirmar troca:", err);
  } finally {
    swapping.value = false;
  }
};

const retry = () => {
  loadPreview();
};

const close = () => {
  emit("close");
};

const resetState = () => {
  previewData.value = null;
  error.value = null;
  loading.value = false;
  swapping.value = false;
};

const formatCurrency = (amountInCents) => {
  return planSwapService.formatCurrency(amountInCents);
};

const formatDate = (dateString) => {
  return planSwapService.formatDate(dateString);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.plan-comparison {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0;
  padding: 0 24px;
}

.plan-card {
  flex: 1;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.plan-card.current {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #e2e8f0;
}

.plan-card.new {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
}

.plan-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.plan-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.plan-name {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #6b7280;
}

.plan-price {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16px;
}

.arrow-icon {
  font-size: 2rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.swap-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.swap-type.upgrade {
  background: #dcfce7;
  color: #166534;
}

.swap-type.downgrade {
  background: #fef3c7;
  color: #92400e;
}

.swap-type.same {
  background: #e5e7eb;
  color: #374151;
}

.proration-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin: 24px;
  border: 1px solid #e2e8f0;
}

.proration-details h3 {
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.proration-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-item .label {
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item .value {
  font-weight: 600;
  color: #1f2937;
}

.calculation-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.breakdown-item {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.breakdown-item.credit {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.breakdown-item.charge {
  background: #fef2f2;
  border-color: #fecaca;
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.breakdown-header .icon {
  font-size: 1.25rem;
}

.breakdown-header .title {
  font-weight: 600;
  color: #374151;
}

.breakdown-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.daily-rate {
  font-size: 0.875rem;
  color: #6b7280;
}

.amount {
  font-weight: 700;
  font-size: 1.1rem;
}

.breakdown-item.credit .amount {
  color: #16a34a;
}

.breakdown-item.charge .amount {
  color: #dc2626;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  margin-top: 16px;
}

.total-label {
  font-size: 1.1rem;
  font-weight: 600;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.next-billing {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f0f9ff;
  border-radius: 8px;
  margin: 0 24px 24px 24px;
  border: 1px solid #bae6fd;
}

.next-billing-icon {
  font-size: 1.5rem;
}

.next-billing-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.next-billing-info .label {
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 500;
}

.next-billing-info .date {
  font-weight: 600;
  color: #0c4a6e;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-message {
  margin: 0 0 20px 0;
  color: #dc2626;
  font-size: 1rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.btn-confirm:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .plan-comparison {
    flex-direction: column;
    gap: 16px;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .proration-info {
    grid-template-columns: 1fr;
  }

  .breakdown-details {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .total-amount {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
