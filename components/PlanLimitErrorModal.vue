<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <div class="icon-container">
            <div class="icon-wrapper">
              <span class="icon">⚠️</span>
              <div class="pulse-ring"></div>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <h2 class="modal-title">{{ title }}</h2>
          <p class="modal-message">{{ message }}</p>

          <div class="info-box">
            <div class="info-item">
              <span class="info-label">Seu plano atual:</span>
              <span class="info-value">{{ planInfo }}</span>
            </div>
            <div v-if="limitInfo" class="info-item">
              <span class="info-label">{{ limitType }}:</span>
              <span class="info-value">{{ limitInfo }}</span>
            </div>
          </div>

          <div class="options-box">
            <p class="options-title">Para continuar, você tem duas opções:</p>
            <div class="options-list">
              <div class="option-item">
                <span class="option-icon">🗑️</span>
                <span class="option-text">
                  <strong>Remover registros</strong> para se enquadrar no limite do seu plano atual
                </span>
              </div>
              <div class="option-item">
                <span class="option-icon">⬆️</span>
                <span class="option-text">
                  <strong>Fazer upgrade</strong> para um plano que suporte sua quantidade atual
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="close">
            Fechar
          </button>
          <button class="btn-upgrade" @click="goToUpgrade">
            <span class="btn-text">Fazer Upgrade</span>
            <span class="btn-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4L10 16M10 4L6 8M10 4L14 8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <div class="sparkle sparkle-1"></div>
            <div class="sparkle sparkle-2"></div>
            <div class="sparkle sparkle-3"></div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  errorData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'upgrade-clicked']);

const router = useRouter();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const title = computed(() => {
  if (props.errorData.type === 'users') {
    return 'Limite de Usuários Atingido';
  } else if (props.errorData.type === 'teams') {
    return 'Limite de Times Atingido';
  }
  return 'Limite do Plano Atingido';
});

const message = computed(() => {
  return props.errorData.message || 'Você atingiu o limite do seu plano atual.';
});

const planInfo = computed(() => {
  return props.errorData.planName || 'Plano Atual';
});

const limitType = computed(() => {
  if (props.errorData.type === 'users') {
    return 'Limite de usuários';
  } else if (props.errorData.type === 'teams') {
    return 'Limite de times';
  }
  return 'Limite';
});

const limitInfo = computed(() => {
  const current = props.errorData.current;
  const max = props.errorData.max;
  
  if (current !== undefined && max !== undefined) {
    return `${current}/${max}`;
  }
  return null;
});

const close = () => {
  isOpen.value = false;
};

const goToUpgrade = () => {
  emit('upgrade-clicked');
  close();
  router.push('/payment');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
}

.modal-header {
  padding: 40px 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 48px;
  z-index: 2;
  position: relative;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.modal-body {
  padding: 40px;
  text-align: center;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.modal-message {
  font-size: 16px;
  color: #718096;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.info-box {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid #e2e8f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 12px;
}

.info-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #2d3748;
  font-weight: 700;
}

.options-box {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.options-title {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 16px 0;
  text-align: left;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.option-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.option-text {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
  text-align: left;
}

.option-text strong {
  color: #2d3748;
  font-weight: 600;
}

.modal-footer {
  padding: 24px 40px 40px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-secondary,
.btn-upgrade {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

.btn-upgrade {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-upgrade:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
}

.btn-upgrade:active {
  transform: translateY(-1px);
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-icon {
  display: flex;
  align-items: center;
  animation: floatUp 1.5s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

@keyframes floatUp {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
  pointer-events: none;
}

.sparkle-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.sparkle-2 {
  top: 50%;
  right: 20%;
  animation-delay: 0.5s;
}

.sparkle-3 {
  bottom: 20%;
  left: 40%;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    margin: 20px;
    border-radius: 20px;
  }

  .modal-body,
  .modal-header {
    padding: 30px 24px;
  }

  .modal-footer {
    padding: 20px 24px 30px;
    flex-direction: column;
  }

  .btn-secondary,
  .btn-upgrade {
    width: 100%;
  }

  .modal-title {
    font-size: 24px;
  }
}
</style>

