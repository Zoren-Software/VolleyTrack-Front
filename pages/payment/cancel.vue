<template>
  <div class="payment-cancel-page">
    <div class="container">
      <div class="cancel-card">
        <div class="cancel-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#ef4444"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1>Pagamento Cancelado</h1>
        <p class="cancel-message">
          O processo de assinatura foi cancelado. Não se preocupe, você não foi
          cobrado.
        </p>

        <div class="info-section">
          <h3>O que aconteceu?</h3>
          <ul>
            <li>Você cancelou o processo de pagamento</li>
            <li>Nenhuma cobrança foi realizada</li>
            <li>Sua conta permanece no plano atual</li>
            <li>Você pode tentar novamente a qualquer momento</li>
          </ul>
        </div>

        <div class="action-buttons">
          <NuxtLink to="/payment2" class="btn btn-primary">
            Tentar Novamente
          </NuxtLink>
          <NuxtLink to="/" class="btn btn-secondary">
            Voltar ao Dashboard
          </NuxtLink>
        </div>

        <div class="help-section">
          <p>Precisa de ajuda ou tem dúvidas?</p>
          <div class="contact-info">
            <span>📧 support@volleytrack.com</span>
          </div>
          <p class="help-text">
            Nossa equipe está sempre pronta para ajudar você a escolher o plano
            ideal!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  console.log("Página de cancelamento carregada");
});
</script>

<style scoped>
.payment-cancel-page {
  padding: 40px 20px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.cancel-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.cancel-icon {
  margin-bottom: 20px;
}

.cancel-icon svg {
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
}

h1 {
  color: #ef4444;
  margin-bottom: 15px;
  font-size: 2.5rem;
  font-weight: 700;
}

.cancel-message {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.info-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: left;
}

.info-section h3 {
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.3rem;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 10px 0;
  color: #555;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  padding-left: 25px;
}

.info-section li:last-child {
  border-bottom: none;
}

.info-section li::before {
  content: "•";
  color: #ef4444;
  font-weight: bold;
  font-size: 1.5rem;
  position: absolute;
  left: 0;
  top: 8px;
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

.help-text {
  font-style: italic;
  color: #888;
  margin-top: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 15px;
}

.contact-info span {
  color: #667eea;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .cancel-card {
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
}
</style>
