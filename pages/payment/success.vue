<template>
  <div class="payment-success-page">
    <div class="container">
      <div class="success-card">
        <div class="success-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#10b981"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1>Assinatura Confirmada!</h1>
        <p class="success-message">
          Parabéns! Sua assinatura foi ativada com sucesso. Agora você tem
          acesso a todos os recursos do plano escolhido.
        </p>

        <div class="subscription-details">
          <h3>Detalhes da Assinatura</h3>
          <div class="detail-item">
            <span class="label">Status:</span>
            <span class="value success">Ativa</span>
          </div>
          <div class="detail-item">
            <span class="label">Data de Ativação:</span>
            <span class="value">{{ currentDate }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Próxima Cobrança:</span>
            <span class="value">{{ nextBillingDate }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <NuxtLink to="/" class="btn btn-primary">
            Ir para o Dashboard
          </NuxtLink>
          <NuxtLink to="/settings" class="btn btn-secondary">
            Configurações
          </NuxtLink>
        </div>

        <div class="help-section">
          <p>Precisa de ajuda? Entre em contato conosco:</p>
          <div class="contact-info">
            <span>📧 support@volleytrack.com</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Estado da aplicação
const currentDate = ref("");
const nextBillingDate = ref("");

// Função para formatar data
const formatDate = (date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Função para calcular próxima cobrança (30 dias)
const calculateNextBilling = () => {
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return next;
};

onMounted(() => {
  // Definir data atual
  currentDate.value = formatDate(new Date());

  // Calcular próxima cobrança
  nextBillingDate.value = formatDate(calculateNextBilling());

  // Log de sucesso
  console.log("Página de sucesso carregada");
});
</script>

<style scoped>
.payment-success-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.success-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon svg {
  filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
}

h1 {
  color: #10b981;
  margin-bottom: 15px;
  font-size: 2.5rem;
  font-weight: 700;
}

.success-message {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.subscription-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: left;
}

.subscription-details h3 {
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.3rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
}

.detail-item .value {
  font-weight: 600;
  color: #333;
}

.detail-item .value.success {
  color: #10b981;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #333;
}

.help-section {
  border-top: 1px solid #e9ecef;
  padding-top: 25px;
}

.help-section p {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.contact-info span {
  color: #667eea;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .success-card {
    padding: 30px 20px;
  }

  h1 {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
